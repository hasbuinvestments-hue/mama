"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ClipboardCheck, AlertCircle, CheckCircle, Package, 
  MapPin, User, ArrowLeft, Loader2, Save, Send, Info
} from "lucide-react";

export default function HubVerification() {
  const { id } = useParams();
  const router = useRouter();
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sealing, setSealing] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchBatch = async () => {
    try {
      const res = await fetch(`${API}/api/admin/batches/${id}/`);
      const data = await res.json();
      setBatch(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBatch(); }, [id]);

  const updateAssignment = async (asgn: any, status: string, newQty?: number) => {
    setSaving(asgn.id);
    try {
      const res = await fetch(`${API}/api/admin/assignments/${asgn.id}/hub-verify/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verification_status: status,
          verified_quantity: newQty !== undefined ? newQty : asgn.quantity
        })
      });
      if (res.ok) {
        fetchBatch();
      }
    } catch (err) {
      alert("Failed to update item");
    } finally {
      setSaving(null);
    }
  };

  const sealBatch = async () => {
    if (!confirm("Seal this batch? This will finalize the impact data for all linked orders and notify teams.")) return;
    setSealing(true);
    try {
      const res = await fetch(`${API}/api/admin/batches/${id}/seal/`, { method: "POST" });
      if (res.ok) {
        router.push("/admin/dispatch");
      }
    } catch (err) {
      alert("Failed to seal batch");
    } finally {
      setSealing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-gray-900">Hub Inspection</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Batch #{id} • {new Date(batch.batch_date).toLocaleDateString()}</p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-8">
        
        <div className="bg-blue-900 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-900/10 mb-8 relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                <ClipboardCheck className="h-6 w-6 text-blue-400" /> Verify Batch Arrival
              </h2>
              <p className="text-blue-100 font-medium text-sm leading-relaxed max-w-sm">
                Ensure produce quantity and quality matches the field records. Verified data automatically updates customer impact certificates.
              </p>
           </div>
           <div className="absolute top-0 right-0 h-32 w-32 bg-white/5 rounded-full -mr-10 -mt-10" />
        </div>

        <div className="space-y-6">
          {batch.assignments?.map((asgn: any) => (
            <div key={asgn.id} className={`bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm transition-all ${asgn.verification_status !== 'PENDING' ? 'opacity-70 grayscale-[0.5]' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">{asgn.product_name}</h3>
                    <div className="flex flex-wrap gap-3">
                       <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                          <User className="h-3 w-3 text-primary" /> {asgn.vendor_name}
                       </div>
                       <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <MapPin className="h-3 w-3" /> {asgn.source_town}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expected Qty</p>
                      <p className="text-xl font-black text-gray-900">{asgn.quantity}{asgn.unit}</p>
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 flex flex-wrap items-center gap-4">
                {asgn.verification_status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => updateAssignment(asgn, 'OK')}
                      disabled={saving === asgn.id}
                      className="px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                    >
                      {saving === asgn.id ? <Loader2 className="animate-spin h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                      Confirm OK
                    </button>
                    
                    <div className="flex-1 min-w-[200px] flex gap-2">
                       <input 
                         type="number"
                         step="0.1"
                         placeholder="Actual Qty"
                         className="w-24 px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:outline-none text-sm font-bold"
                         onChange={(e) => asgn._newQty = parseFloat(e.target.value)}
                       />
                       <button
                         onClick={() => updateAssignment(asgn, 'AMENDED', asgn._newQty)}
                         disabled={saving === asgn.id}
                         className="px-6 py-3 rounded-2xl bg-amber-50 text-amber-700 font-black text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all flex items-center gap-2"
                       >
                         Amend Qty
                       </button>
                    </div>
                  </>
                ) : (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                    asgn.verification_status === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {asgn.verification_status === 'OK' ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    Verified: {asgn.verified_quantity}{asgn.unit}
                    <button onClick={() => updateAssignment(asgn, 'PENDING')} className="ml-4 opacity-40 hover:opacity-100 underline decoration-dotted">Edit</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Seal Section */}
        <div className="mt-12 p-10 rounded-[3rem] bg-gray-900 text-white text-center shadow-2xl">
           <Send className="h-10 w-10 text-primary mx-auto mb-6 opacity-20" />
           <h3 className="text-2xl font-black mb-2">Finalize Inspection</h3>
           <p className="text-gray-400 font-medium mb-8 max-w-sm mx-auto">Once sealed, all transparency reports for this batch will be updated with these verified quantities.</p>
           
           <button
             onClick={sealBatch}
             disabled={sealing || loading}
             className="w-full py-6 rounded-[2rem] bg-primary text-white text-xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
           >
             {sealing ? <Loader2 className="animate-spin h-6 w-6" /> : <>Seal & Publish Impact <ClipboardCheck className="h-6 w-6" /></>}
           </button>
        </div>

        <div className="mt-8 flex items-center gap-3 px-8 text-gray-400 italic">
           <Info className="h-4 w-4" />
           <p className="text-[10px] font-medium leading-relaxed uppercase tracking-widest">
             Un-inspected items will be automatically marked as "OK" upon sealing.
           </p>
        </div>
      </main>
    </div>
  );
}
