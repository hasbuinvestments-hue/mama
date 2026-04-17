"use client";

import { useState } from "react";
import { Phone, CheckCircle2, Truck, Package, MapPin, ArrowRight, Loader2, ChevronRight, Check } from "lucide-react";

export default function CourierPortal() {
  const [step, setStep] = useState(1); // 1: Login, 2: Batch List, 3: Batch Detail
  const [phone, setPhone] = useState("");
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null); // Button being clicked
  const [done, setDone] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/courier/batches/?phone=${phone}`);
      const data = await res.json();
      setBatches(data.results || data);
      if (data.length === 0 && !data.results) {
          alert("No active batches assigned to this number");
      } else {
          setStep(2);
      }
    } catch (err) {
      alert("Failed to find batches. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = (batch: any) => {
    setSelectedBatch(batch);
    setStep(3);
  };

  const handleUpdate = async (field: string) => {
    setUpdating(field);
    try {
      const res = await fetch(`${API}/api/admin/batches/${selectedBatch.id}/tracking/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedBatch(updated);
        setDone(field);
        setTimeout(() => setDone(null), 2000);
      }
    } catch (err) {
      alert("Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-amber-100 text-amber-800';
      case 'DISPATCHED': return 'bg-blue-100 text-blue-800';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-primary/30">
      <div className="max-w-md mx-auto min-h-screen flex flex-col p-6">
        
        {/* Step 1: Login */}
        {step === 1 && (
          <div className="flex-grow flex flex-col justify-center animate-in fade-in zoom-in duration-500">
            <div className="mb-10 text-center">
                <div className="h-20 w-20 bg-primary rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-primary/20">
                    <Truck className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-black mb-2 tracking-tight">Courier <span className="text-primary italic">Portal</span></h1>
                <p className="text-gray-400 font-medium">Enter your number to find assigned harvests.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your Phone Number"
                  className="w-full pl-14 pr-6 py-6 rounded-[2rem] bg-gray-800 border-2 border-transparent focus:border-primary focus:outline-none transition-all text-xl font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 rounded-[2rem] bg-primary text-white text-xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Find My Batches <ArrowRight className="h-6 w-6" /></>}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Batch List */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right duration-300">
            <button onClick={() => setStep(1)} className="text-gray-500 font-bold mb-8 flex items-center gap-1">← Logout</button>
            <h2 className="text-3xl font-black mb-6">Assigned <span className="text-primary">Batches</span></h2>
            
            <div className="space-y-4">
              {batches.map((batch) => (
                <div 
                    key={batch.id} 
                    onClick={() => handleDetail(batch)}
                    className="bg-gray-800 rounded-[2.5rem] p-8 border-2 border-transparent active:border-primary active:bg-gray-800/80 transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(batch.status)}`}>
                            {batch.status}
                        </div>
                        <div className="text-gray-600 group-active:text-primary"><ChevronRight className="h-6 w-6" /></div>
                    </div>
                    <h3 className="text-2xl font-black mb-2">{new Date(batch.batch_date).toLocaleDateString()}</h3>
                    <div className="flex gap-6 mt-4 opacity-80">
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <Package className="h-4 w-4 text-primary" />
                            {batch.orders?.length || 0} Orders
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <MapPin className="h-4 w-4 text-primary" />
                            {batch.is_express ? "Express" : "Standard"}
                        </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Batch Detail */}
        {step === 3 && selectedBatch && (
          <div className="animate-in slide-in-from-right duration-300 pb-10">
            <button onClick={() => setStep(2)} className="text-gray-500 font-bold mb-8 flex items-center gap-1">← Back to Batches</button>
            
            <div className="mb-10">
                <h2 className="text-3xl font-black mb-1">Batch #{selectedBatch.id}</h2>
                <p className="text-primary font-bold">{new Date(selectedBatch.batch_date).toLocaleDateString()}</p>
            </div>

            <div className="space-y-6 mb-12">
               {/* Update Buttons */}
               {!selectedBatch.pickup_confirmed_at && (
                   <button 
                     onClick={() => handleUpdate('pickup_confirmed_at')}
                     disabled={!!updating}
                     className="w-full h-24 rounded-3xl bg-emerald-600 text-white font-black text-xl shadow-xl shadow-emerald-900/40 active:scale-95 transition-all flex items-center justify-center gap-4"
                   >
                     {updating === 'pickup_confirmed_at' ? <Loader2 className="animate-spin" /> : (done === 'pickup_confirmed_at' ? <Check className="h-8 w-8" /> : "CONFIRM PICKUP")}
                   </button>
               )}
               
               {selectedBatch.pickup_confirmed_at && !selectedBatch.arrived_nairobi_at && (
                   <button 
                     onClick={() => handleUpdate('arrived_nairobi_at')}
                     disabled={!!updating}
                     className="w-full h-24 rounded-3xl bg-blue-600 text-white font-black text-xl shadow-xl shadow-blue-900/40 active:scale-95 transition-all flex items-center justify-center gap-4"
                   >
                     {updating === 'arrived_nairobi_at' ? <Loader2 className="animate-spin" /> : (done === 'arrived_nairobi_at' ? <Check className="h-8 w-8" /> : "ARRIVED IN NAIROBI")}
                   </button>
               )}

               {selectedBatch.arrived_nairobi_at && selectedBatch.status !== 'DELIVERED' && (
                   <button 
                     onClick={() => handleUpdate('dispatched_to_customers_at')}
                     disabled={!!updating}
                     className="w-full h-24 rounded-3xl bg-fuchsia-600 text-white font-black text-xl shadow-xl shadow-fuchsia-900/40 active:scale-95 transition-all flex items-center justify-center gap-4"
                   >
                     {updating === 'dispatched_to_customers_at' ? <Loader2 className="animate-spin" /> : (done === 'dispatched_to_customers_at' ? <Check className="h-8 w-8" /> : "MARK DELIVERED")}
                   </button>
               )}
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Orders to Deliver</h4>
               {selectedBatch.orders?.map((order: any) => (
                   <div key={order.id} className="p-6 rounded-3xl bg-gray-800/50 border border-gray-700">
                       <div className="font-black text-lg mb-1">{order.customer_name}</div>
                       <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                           <MapPin className="h-4 w-4" />
                           {order.location} ({order.zone})
                       </div>
                   </div>
               ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
