"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { Clock, Pause, Play, XCircle, Phone, MapPin, Package } from "lucide-react";

interface Subscription {
  id: number;
  customer_name: string;
  customer_phone: string;
  package_tier: string;
  frequency: string;
  next_delivery_date: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  delivery_zone: number;
  package: number;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchSubs = async () => {
    try {
      const res = await fetch(`${API}/api/admin/subscriptions/`);
      const data = await res.json();
      setSubs(data.results || data); // Handle both paginated and non-paginated
    } catch (err) {
      console.error("Failed to fetch subscriptions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, [API]);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API}/api/admin/subscriptions/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchSubs();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Active <span className="text-primary italic">Subscriptions</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Manage recurring Nyumbani package orders.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Package & Tier</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-fresh-bg/50 transition-colors">
                    <td className="px-6 py-6">
                      <div className="font-bold text-gray-900">{sub.customer_name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <Phone className="h-3 w-3" />
                        {sub.customer_phone}
                      </div>
                    </td>
                    <td className="px-6 py-6 font-medium text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-primary" />
                        {sub.package_tier}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black tracking-widest uppercase mb-1">
                        {sub.frequency}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        Next: {sub.next_delivery_date}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        sub.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        sub.status === 'PAUSED' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {sub.status === 'ACTIVE' ? (
                          <button 
                            onClick={() => updateStatus(sub.id, 'PAUSED')}
                            className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                            title="Pause Subscription"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : sub.status === 'PAUSED' ? (
                          <button 
                            onClick={() => updateStatus(sub.id, 'ACTIVE')}
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Resume Subscription"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        ) : null}
                        {sub.status !== 'CANCELLED' && (
                          <button 
                            onClick={() => updateStatus(sub.id, 'CANCELLED')}
                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Cancel Subscription"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        ) }
                      </div>
                    </td>
                  </tr>
                ))}
                {subs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                      No active subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
