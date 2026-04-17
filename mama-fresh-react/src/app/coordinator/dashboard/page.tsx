"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Phone, CheckCircle, XCircle, LogOut, UserPlus, Calendar,
  ChevronRight, Truck, Info, MessageSquare, Plus,
  X, Check, Loader2, Store, Clock
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Assignment {
  id: number;
  batch: number;
  vendor_name: string;
  vendor_whatsapp: string;
  product_name: string;
  unit: string;
  quantity: number;
  is_absent: boolean;
  whatsapp_sent: boolean;
}

interface Batch {
  id: number;
  batch_date: string;
  is_express: boolean;
  status: string;
  pickup_confirmed_at: string | null;
  arrived_nairobi_at: string | null;
  dispatched_to_customers_at: string | null;
}

interface BatchGroup {
  batch: Batch;
  assignments: Assignment[];
}

export default function CoordinatorDashboard() {
  const [session, setSession] = useState<any>(null);
  const [data, setData] = useState<BatchGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingBatch, setUpdatingBatch] = useState<number | null>(null);
  const [newVendor, setNewVendor] = useState({ name: "", stall: "", whatsapp: "" });

  useEffect(() => {
    const s = localStorage.getItem("coordinator_session");
    if (!s) {
      window.location.href = "/coordinator";
      return;
    }
    const sessionData = JSON.parse(s);
    setSession(sessionData);
    fetchDashboard(sessionData.town, sessionData.pin);
  }, []);

  const fetchDashboard = async (town: string, pin: string) => {
    try {
      const res = await fetch(`${API}/api/coordinator/dashboard/?town=${encodeURIComponent(town)}&pin=${pin}`);
      if (res.status === 401) {
        localStorage.removeItem("coordinator_session");
        window.location.href = "/coordinator";
        return;
      }
      const d = await res.json();
      setData(d.batches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("coordinator_session");
    window.location.href = "/coordinator";
  };

  const toggleAbsent = async (asgn: Assignment, batchId: number, town: string) => {
    const newVal = !asgn.is_absent;
    try {
      await fetch(`${API}/api/admin/assignments/${asgn.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_absent: newVal }),
      });
      // Rebalance
      await fetch(`${API}/api/admin/batches/${batchId}/rebalance/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ town, product_name: asgn.product_name }),
      });
      fetchDashboard(session.town, session.pin);
    } catch (err) {
      console.error(err);
    }
  };

  const markSent = async (id: number) => {
    try {
      await fetch(`${API}/api/admin/assignments/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp_sent: true }),
      });
      fetchDashboard(session.town, session.pin);
    } catch (err) {
      console.error(err);
    }
  };

  const updateBatchTracking = async (batchId: number, field: string) => {
    setUpdatingBatch(batchId);
    try {
      const res = await fetch(`${API}/api/admin/batches/${batchId}/tracking/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field }),
      });
      if (res.ok) {
        fetchDashboard(session.town, session.pin);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingBatch(null);
    }
  };

  const sendWhatsApp = (asgn: Assignment) => {
    const msg = encodeURIComponent(`Hello ${asgn.vendor_name}, Mama Fresh order for today:\n` +
      `Please bring ${asgn.quantity}${asgn.unit} of ${asgn.product_name} to the ${session.town} collection point by 2pm.\n` +
      `Thank you — Mama Fresh Coordinator`);
    window.open(`https://wa.me/${asgn.vendor_whatsapp}?text=${msg}`, '_blank');
    markSent(asgn.id);
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/vendors/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: newVendor.name,
          stall_number: newVendor.stall,
          whatsapp_number: newVendor.whatsapp,
          is_verified: false,
          is_active: true
        }),
      });
      if (res.ok) {
        setNewVendor({ name: "", stall: "", whatsapp: "" });
        setShowAddVendor(false);
        alert("Farmer registered and pending admin approval.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!session || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
         <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
         <p className="font-bold text-gray-500 animate-pulse">Connecting to Hub...</p>
      </div>
    );
  }

  // To simplify grouping in UI
  const groupedData = data.map(group => {
    const byProduct: Record<string, Assignment[]> = {};
    group.assignments.forEach(a => {
      if (!byProduct[a.product_name]) byProduct[a.product_name] = [];
      byProduct[a.product_name].push(a);
    });
    return { ...group, byProduct };
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Store className="h-5 w-5" />
               </div>
               <div>
                  <h1 className="text-lg font-black text-gray-900 leading-none">{session.town}</h1>
                  <p className="text-[10px] uppercase font-black tracking-widest text-primary mt-1">Town Hub</p>
               </div>
            </div>
            <button onClick={logout} className="p-3 bg-red-50 text-red-600 rounded-2xl active:scale-90 transition-transform">
               <LogOut className="h-5 w-5" />
            </button>
         </div>
      </header>

      <main className="px-5 py-8 max-w-lg mx-auto space-y-8">
         {/* Welcome Card */}
         <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
               <h2 className="text-2xl font-black mb-1">Jambo, {session.name.split(' ')[0]}</h2>
               <p className="text-gray-400 font-medium text-sm">You have {data.length} active batches today.</p>
               <button 
                  onClick={() => setShowAddVendor(true)}
                  className="mt-6 flex items-center gap-2 px-5 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl"
               >
                  <UserPlus className="h-4 w-4" /> Register Farmer
               </button>
            </div>
            <div className="absolute top-0 right-0 h-32 w-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl" />
         </div>

         {/* Batches Container */}
         <div className="space-y-10">
            {groupedData.map((group, gIdx) => (
              <div key={gIdx} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-emerald-100 text-primary rounded-xl flex items-center justify-center">
                         <Calendar className="h-4 w-4" />
                      </div>
                      <h3 className="font-black text-gray-900">Batch #{group.batch.id}</h3>
                   </div>
                   {group.batch.is_express && (
                     <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-tighter italic">⚡ Express</span>
                   )}
                </div>

                {Object.entries(group.byProduct).map(([productName, assignments], pIdx) => {
                  const totalQty = assignments.reduce((acc, a) => acc + Number(a.quantity), 0);
                  const unit = assignments[0].unit;
                  
                  return (
                    <div key={pIdx} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                          <h4 className="font-black text-gray-900 text-lg flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-primary" /> {productName}
                          </h4>
                          <span className="font-black text-primary bg-emerald-100 px-3 py-1 rounded-full text-xs">
                             {totalQty.toFixed(1)}{unit} total
                          </span>
                       </div>

                       <div className="divide-y divide-gray-50">
                          {assignments.map((asgn, aIdx) => (
                            <div key={aIdx} className={`p-6 flex items-center justify-between transition-opacity ${asgn.is_absent ? 'bg-gray-50/50 opacity-40' : ''}`}>
                               <div className="flex-1">
                                  <p className="font-black text-gray-900 leading-none mb-1">{asgn.vendor_name}</p>
                                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{asgn.quantity}{asgn.unit}</p>
                               </div>
                               
                               <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleAbsent(asgn, group.batch.id, session.town)}
                                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${asgn.is_absent ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => sendWhatsApp(asgn)}
                                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${asgn.whatsapp_sent ? 'bg-green-500 text-white' : 'bg-primary text-white shadow-lg shadow-primary/30'}`}
                                  >
                                    {asgn.whatsapp_sent ? <Check className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                                  </button>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  );
                })}

                <div className="space-y-3">
                  {!group.batch.pickup_confirmed_at && (
                    <button
                      onClick={() => updateBatchTracking(group.batch.id, 'pickup_confirmed_at')}
                      disabled={updatingBatch === group.batch.id || group.assignments.some(a => !a.whatsapp_sent && !a.is_absent)}
                      className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                    >
                      {updatingBatch === group.batch.id ? <Loader2 className="animate-spin" /> : <Truck className="h-4 w-4" />}
                      CONFIRM PICKUP
                    </button>
                  )}

                  {group.batch.pickup_confirmed_at && !group.batch.arrived_nairobi_at && (
                    <button
                      onClick={() => updateBatchTracking(group.batch.id, 'arrived_nairobi_at')}
                      disabled={updatingBatch === group.batch.id}
                      className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {updatingBatch === group.batch.id ? <Loader2 className="animate-spin" /> : <MapPin className="h-4 w-4" />}
                      ARRIVED IN NAIROBI
                    </button>
                  )}

                  {group.batch.arrived_nairobi_at && group.batch.status !== 'DELIVERED' && (
                    <button
                      onClick={() => updateBatchTracking(group.batch.id, 'dispatched_to_customers_at')}
                      disabled={updatingBatch === group.batch.id}
                      className="w-full py-4 rounded-2xl bg-fuchsia-600 text-white font-black text-sm shadow-lg shadow-fuchsia-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {updatingBatch === group.batch.id ? <Loader2 className="animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      MARK AS DELIVERED
                    </button>
                  )}
                  
                  {group.batch.status === 'DELIVERED' && (
                    <div className="w-full py-4 rounded-2xl bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Batch Delivered
                    </div>
                  )}
                </div>
              </div>
            ))}
         </div>

         {data.length === 0 && (
           <div className="text-center py-20">
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                 <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Resting Time</h3>
              <p className="text-gray-500 font-medium">No active batches for {session.town} right now. Check back later today.</p>
           </div>
         )}
      </main>

      {/* Add Vendor Modal */}
      {showAddVendor && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !submitting && setShowAddVendor(false)} />
           <div className="relative w-full max-w-sm bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-gray-900">Register Farmer</h2>
                 <button onClick={() => setShowAddVendor(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400">
                    <X className="h-5 w-5" />
                 </button>
              </div>

              <form onSubmit={handleAddVendor} className="space-y-4">
                 <input
                   placeholder="Farmer Name"
                   value={newVendor.name}
                   onChange={e => setNewVendor({...newVendor, name: e.target.value})}
                   className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:outline-none font-bold text-gray-900"
                   required
                 />
                 <input
                   placeholder="Stall Number"
                   value={newVendor.stall}
                   onChange={e => setNewVendor({...newVendor, stall: e.target.value})}
                   className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:outline-none font-bold text-gray-900"
                   required
                 />
                 <input
                   placeholder="WhatsApp (254...)"
                   value={newVendor.whatsapp}
                   onChange={e => setNewVendor({...newVendor, whatsapp: e.target.value})}
                   className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:outline-none font-bold text-gray-900"
                   required
                 />
                 
                 <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3 mt-4">
                    <Info className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider leading-relaxed">
                       Admin will verify this farmer before they appear in future rotations.
                    </p>
                 </div>

                 <button
                   type="submit"
                   disabled={submitting}
                   className="w-full py-5 rounded-3xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 mt-4"
                 >
                   {submitting ? "Processing..." : "Submit Registration"}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
