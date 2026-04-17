"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Truck, Calendar, Clock, ArrowRight, Package, CheckCircle, 
  AlertCircle, ShoppingCart, ExternalLink, RefreshCw, ClipboardCheck 
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Batch {
  id: number;
  batch_date: string;
  status: 'OPEN' | 'DISPATCHED' | 'DELIVERED';
  is_express: boolean;
  created_at: string;
  dispatched_at?: string;
  notes?: string;
}

interface TownAssignment {
  town: string;
  coordinator: {
    name: string;
    whatsapp: string;
  } | null;
  assignments: {
    id: number;
    vendor_name: string;
    product_name: string;
    unit: string;
    quantity: number;
    is_absent: boolean;
  }[];
}

export default function AdminDispatchPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [townData, setTownData] = useState<TownAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'today' | 'history'>('today');
  const [dispatching, setDispatching] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchBatches = async () => {
    try {
      const res = await fetch(`${API}/api/admin/batches/`);
      const data = await res.json();
      setBatches(data);
      const open = data.find((b: Batch) => b.status === 'OPEN');
      if (open) {
        setActiveBatch(open);
        fetchAssignments(open.id);
      } else {
        setActiveBatch(null);
        setTownData([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (id: number) => {
    try {
      const res = await fetch(`${API}/api/admin/batches/${id}/assignments/`);
      const data = await res.json();
      setTownData(data.towns);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchBatches(); }, []);

  const createBatch = async (isExpress: boolean) => {
    setCreating(true);
    try {
      const res = await fetch(`${API}/api/admin/batches/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_express: isExpress }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create batch");
        return;
      }
      fetchBatches();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const dispatchBatch = async () => {
    if (!activeBatch) return;
    if (!confirm("Confirm dispatch? This marks the batch as dispatched to Nairobi.")) return;
    setDispatching(true);
    try {
      await fetch(`${API}/api/admin/batches/${activeBatch.id}/dispatch/`, { method: "POST" });
      fetchBatches();
    } catch (err) {
      console.error(err);
    } finally {
      setDispatching(false);
    }
  };

  const getWhatsAppLink = (town: TownAssignment) => {
    if (!town.coordinator?.whatsapp) return "#";
    const text = encodeURIComponent(`Hello ${town.coordinator.name}, here is the Mama Fresh collection list for ${town.town} today:\n\n` + 
      town.assignments.map(a => `- ${a.vendor_name}: ${a.product_name} (${a.quantity}${a.unit})`).join("\n") +
      "\n\nPlease ensure all vendors bring their items by 2pm. Thanks!");
    return `https://wa.me/${town.coordinator.whatsapp}?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container mx-auto px-6 max-w-6xl pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Truck className="h-8 w-8 text-primary" /> Dispatch Operations
            </h1>
            <p className="text-gray-500 font-medium">Manage daily batches and town collections</p>
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
            <button
              onClick={() => setTab('today')}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'today' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Today's Batch
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'history' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Batch History
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-primary font-black">Syncing logistics data...</div>
        ) : tab === 'history' ? (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
             <table className="w-full text-left">
               <thead className="bg-gray-50 border-b border-gray-100">
                 <tr>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-4 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="px-4 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Dispatched At</th>
                    <th className="px-4 py-5"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {batches.map(b => (
                   <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                     <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                           <Calendar className="h-4 w-4" />
                         </div>
                         <span className="font-bold text-gray-900">{new Date(b.batch_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                       </div>
                     </td>
                     <td className="px-4 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          b.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 
                          b.status === 'DISPATCHED' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {b.status}
                        </span>
                     </td>
                     <td className="px-4 py-5">
                       {b.is_express ? (
                         <span className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 italic">
                           ⚡ Express
                         </span>
                       ) : (
                         <span className="text-[10px] font-black text-gray-400 uppercase">Standard</span>
                       )}
                     </td>
                     <td className="px-4 py-5 text-gray-400 font-medium text-xs italic">
                       {b.dispatched_at ? new Date(b.dispatched_at).toLocaleTimeString() : '—'}
                     </td>
                     <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                            {b.status === 'DISPATCHED' && (
                              <Link 
                                href={`/admin/batches/${b.id}/verify`}
                                className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2 border border-emerald-100 shadow-sm"
                              >
                                 <ClipboardCheck className="h-3 w-3" /> Verify
                              </Link>
                            )}
                            <button className="text-primary font-black text-xs hover:underline flex items-center gap-1">
                              View Details <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        ) : !activeBatch ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
            <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
               <Truck className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No active batch today</h2>
            <p className="text-gray-500 font-medium max-w-sm mx-auto mb-10">Start by aggregating today's pending orders into a new processing batch.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <button
                 onClick={() => createBatch(false)}
                 disabled={creating}
                 className="w-full sm:w-auto px-10 py-5 rounded-[2rem] bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50"
               >
                 {creating ? "Processing..." : "Create Standard Batch"}
               </button>
               <button
                 onClick={() => createBatch(true)}
                 disabled={creating}
                 className="w-full sm:w-auto px-10 py-5 rounded-[2rem] border-2 border-red-200 text-red-600 font-black hover:bg-red-50 transition-all text-sm disabled:opacity-50"
               >
                 {creating ? "..." : "⚡ Create Express Batch"}
               </button>
            </div>
            <p className="mt-8 text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
               <Clock className="h-3 w-3" /> Auto-aggregates all PENDING orders
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex items-center gap-6">
                 <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-primary border border-emerald-50">
                    <CheckCircle className="h-8 w-8" />
                 </div>
                 <div>
                   <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-black text-gray-900">Batch #{activeBatch.id}</h2>
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest animate-pulse">Processing</span>
                   </div>
                   <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{new Date(activeBatch.created_at).toLocaleString()}</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="text-right hidden lg:block mr-4 border-r pr-6 border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Impact</p>
                     <p className="text-lg font-black text-gray-900 whitespace-nowrap">{townData.length} Towns • {townData.reduce((acc, t) => acc + t.assignments.length, 0)} Farmers</p>
                  </div>
                  <button
                    onClick={dispatchBatch}
                    disabled={dispatching}
                    className="flex-1 md:flex-none px-8 py-5 rounded-3xl bg-gray-900 text-white font-black shadow-2xl shadow-gray-200 hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {dispatching ? "..." : (
                      <>
                        <Truck className="h-5 w-5" /> Dispatch Entire Batch
                      </>
                    )}
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {townData.map((town, idx) => (
                 <div key={idx} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 pb-6 bg-gray-50/50 flex items-start justify-between border-b border-gray-100">
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <h3 className="text-xl font-black text-gray-900">{town.town}</h3>
                             <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                               {town.assignments.length} SKUs
                             </span>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">Coordinator: <span className="text-gray-900 font-bold">{town.coordinator?.name || 'Unassigned'}</span></p>
                       </div>
                       {town.coordinator?.whatsapp && (
                         <a
                           href={getWhatsAppLink(town)}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="h-12 w-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200 transition-colors shadow-sm"
                         >
                           <ExternalLink className="h-5 w-5" />
                         </a>
                       )}
                    </div>

                    <div className="p-8 flex-1">
                       <div className="space-y-4">
                          {town.assignments.map((asgn, i) => (
                            <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${asgn.is_absent ? 'bg-red-50/30 border-red-100 opacity-60' : 'bg-white border-gray-50 shadow-sm'}`}>
                               <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xs">
                                     {asgn.vendor_name.charAt(0)}
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-gray-900 leading-none mb-1">{asgn.product_name}</p>
                                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{asgn.vendor_name}</p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <p className="text-lg font-black text-gray-900 leading-none mb-1">{asgn.quantity}{asgn.unit}</p>
                                  {asgn.is_absent && (
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Absent</span>
                                  )}
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="p-6 bg-gray-50/30 border-t border-gray-50 text-center">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ready for collection</p>
                    </div>
                 </div>
               ))}
            </div>

            {townData.length === 0 && (
               <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-black text-amber-800 mb-1">Aggregation Complete with Warnings</h4>
                    <p className="text-sm text-amber-700 font-medium">Batch created, but no town-specific assignments were generated. Please check if your products have 'Source Town' metadata assigned.</p>
                  </div>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
