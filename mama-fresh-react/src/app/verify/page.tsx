"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, User, Leaf, Share2, CheckCircle2, ShoppingBag } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("order_id") || "");
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const res = await fetch(`${API}/api/orders/${orderId}/transparency/`);
      if (!res.ok) throw new Error("Order not found. Check your confirmation message for the Order ID.");
      const data = await res.json();
      setOrderData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("order_id")) {
      handleVerify();
    }
  }, []);

  const handleShare = () => {
    const url = `${window.location.origin}/verify?order_id=${orderId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Impact Verification</h1>
        <p className="text-gray-500 font-medium">Be sure where your food comes from. Enter your Order ID to see your food's journey.</p>
      </div>

      <form onSubmit={handleVerify} className="relative mb-12">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter Order ID (e.g. uuid-xxxx-xxxx)"
          className="w-full px-8 py-5 rounded-[2rem] bg-fresh-bg border-2 border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-bold text-lg text-gray-900 shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !orderId}
          className="absolute right-2 top-2 bottom-2 px-8 rounded-[1.5rem] bg-gray-900 text-white font-black hover:bg-primary transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error && (
        <div className="p-6 rounded-3xl bg-red-50 border border-red-100 text-red-600 text-center font-medium animate-shake">
          {error}
        </div>
      )}

      {orderData && (
        <article className="animate-in fade-in zoom-in duration-500">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-emerald-900/10 overflow-hidden">
            <div className="bg-gray-900 p-8 text-white">
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Impact Report</p>
                  <h2 className="text-2xl font-black italic">Your Food's Journey</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Order Date</p>
                  <p className="font-bold">{orderData.order_date}</p>
                </div>
              </div>
              <div className="flex gap-4">
                 <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    {orderData.total_co2_saved_kg} kg CO₂ saved
                 </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {orderData.items.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 p-6 rounded-3xl bg-fresh-bg/50 border border-emerald-50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="h-12 w-12 text-primary" />
                  </div>
                  <div className="flex-grow relative z-10">
                    <h3 className="text-lg font-black text-gray-900 mb-2">{item.product}</h3>
                    {item.vendor ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-bold">
                          <User className="h-4 w-4 text-primary" />
                          Supplied by {item.vendor.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                          <MapPin className="h-4 w-4" />
                          Town: {item.vendor.source_town}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 font-medium italic">Village aggregate supply</p>
                    )}
                  </div>
                  <div className="text-right relative z-10">
                    <span className="inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                      +{item.co2_saved_kg} kg CO₂
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-6">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                  <p className="text-xl font-black text-gray-900">KES {parseInt(orderData.total_price).toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Discount</p>
                  <p className="text-xl font-black text-primary">KES {parseInt(orderData.discount_applied).toLocaleString()}</p>
               </div>
               <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l sm:pl-6 pt-4 sm:pt-0">
                  <button 
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:border-primary hover:text-primary transition-all"
                  >
                    <Share2 className="h-4 w-4" />
                    {copied ? "Copied Link!" : "Share Report"}
                  </button>
               </div>
            </div>
          </div>
          <p className="mt-8 text-center text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-widest px-8">
            {orderData.verification_note}
          </p>
        </article>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
         <VerifyContent />
      </Suspense>
    </div>
  );
}
