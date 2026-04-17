"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Complaint {
  id: number;
  order: number;
  vendor: number;
  product_name: string;
  reason: string;
  status: "PENDING" | "RESOLVED";
  strike_issued: boolean;
  created_at: string;
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("ALL");

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API}/api/complaints/`);
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const resolve = async (id: number) => {
    try {
      await fetch(`${API}/api/complaints/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      fetchComplaints();
    } catch {
      alert("Failed to update.");
    }
  };

  const filtered = filter === "ALL" ? complaints : complaints.filter(c => c.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container mx-auto px-6 max-w-4xl pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" /> Complaints
          </h1>
          <button onClick={fetchComplaints} className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {(["ALL", "PENDING", "RESOLVED"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? "bg-primary text-white shadow-md" : "bg-white text-gray-500 border border-gray-100"
              }`}
            >
              {f}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] ${filter === f ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {f === "ALL" ? complaints.length : complaints.filter(c => c.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-primary font-bold animate-pulse py-20">Loading complaints...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No {filter !== "ALL" ? filter.toLowerCase() : ""} complaints.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        c.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                      }`}>
                        {c.status === "PENDING" ? <Clock className="inline h-2.5 w-2.5 mr-1" /> : <CheckCircle className="inline h-2.5 w-2.5 mr-1" />}
                        {c.status}
                      </span>
                      {c.strike_issued && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700">
                          Strike Issued
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(c.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <h3 className="font-black text-gray-900 mb-1">{c.product_name}</h3>
                    <p className="text-sm text-gray-600 font-medium mb-1">{c.reason}</p>
                    <p className="text-xs text-gray-400">Order #{c.order} · Vendor #{c.vendor}</p>
                  </div>
                  {c.status === "PENDING" && (
                    <button
                      onClick={() => resolve(c.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-700 transition-colors flex-shrink-0"
                    >
                      <CheckCircle className="h-4 w-4" /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
