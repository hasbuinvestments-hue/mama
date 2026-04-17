"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "MAMA-FRESH-ORDER";
  const name = searchParams.get("name") || "Customer";

  const [mpesaCode, setMpesaCode] = React.useState("");
  const [codeSaved, setCodeSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [referralCode, setReferralCode] = React.useState("");


  const submitMpesaCode = async () => {
    if (!mpesaCode.trim() || orderId === "MAMA-FRESH-ORDER") return;
    setSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mpesa_code: mpesaCode.trim().toUpperCase() }),
      });
      setCodeSaved(true);
    } catch (err) {
      console.error("Failed to save M-Pesa code", err);
    } finally {
      setSaving(false);
    }
  };

  const [orderData, setOrderData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (orderId && orderId !== "MAMA-FRESH-ORDER") {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/`)
        .then(res => res.json())
        .then(data => {
          setOrderData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });

      // Fetch personal referral code
      if (orderData?.customer_phone) {
         fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/referral/?phone=${orderData.customer_phone}`)
           .then(res => res.json())
           .then(d => setReferralCode(d.code))
           .catch(() => {});
      }
    } else {
      setLoading(false);
    }
  }, [orderId, orderData?.customer_phone]);

  return (
    <div className="min-h-screen bg-fresh-bg flex items-center justify-center p-6 py-12">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/10 p-8 md:p-14 text-center border border-white">
        <div className="relative mb-8">
          <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-primary relative z-10">
            <CheckCircle className="h-10 w-10" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 bg-emerald-400/10 rounded-full blur-2xl font-bold" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-3">Order Received!</h1>
        <p className="text-gray-500 font-medium mb-8">
          Thank you, <span className="text-gray-900 font-bold">{name}</span>. Your order <span className="text-primary font-black uppercase tracking-tighter">#{orderId}</span> has been securely saved.
        </p>

        {loading ? (
          <div className="bg-gray-50 rounded-3xl p-8 mb-10 border border-gray-100 flex justify-center text-primary font-bold animate-pulse">
            Assigning village vendors...
          </div>
        ) : orderData && orderData.vendor_assignments?.splits ? (
          <div className="bg-emerald-50/50 rounded-3xl p-6 md:p-8 mb-8 text-left border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xs font-black text-primary uppercase tracking-widest">Farmer-to-Fork Traceability</h3>
               <span className="text-[10px] uppercase font-black tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">Live</span>
            </div>
            <p className="text-sm text-gray-700 font-medium mb-6">
              To ensure fair trade, our system has bypassed central brokers and split your order directly among these village farmers:
            </p>
            
            <div className="space-y-4">
              {orderData.vendor_assignments.splits.map((group: any, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                   <div className="h-10 w-10 rounded-full bg-fresh-bg flex items-center justify-center font-black text-primary flex-shrink-0">
                     {group.vendor.name.charAt(0)}
                   </div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900 text-sm">{group.vendor.name} — {group.vendor.stall}</h4>
                     <p className="text-xs text-gray-500 mb-2">Preparing your order right now.</p>
                     <ul className="space-y-1">
                       {group.items.map((item: any, i: number) => (
                         <li key={i} className="text-xs font-medium text-gray-700 flex items-center gap-2">
                           <span className="h-1 w-1 bg-primary rounded-full" />
                           {item.name} <span className="text-gray-400">×{item.quantity}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-3xl p-8 mb-10 text-left border border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">What happens next?</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-700 font-semibold leading-snug">Our team is splitting your order among village vendors right now.</p>
              </li>
            </ul>
          </div>
        )}

        {/* M-Pesa Payment Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-3xl p-6 mb-4 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-sm">Pay via M-Pesa Pochi la Biashara</h3>
              <p className="text-xs text-gray-500">Complete your order by sending payment</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-green-100 space-y-2 text-sm font-medium text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-400">Send to</span>
              <span className="font-black text-gray-900">0792 705 921</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Account name</span>
              <span className="font-black text-gray-900">Mama Fresh</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <span className="text-gray-400">Amount</span>
              <span className="font-black text-primary text-base">
                KES {orderData ? Number(orderData.total_price).toLocaleString() : "—"}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
              Enter your M-Pesa confirmation code
            </label>
            {codeSaved ? (
              <div className="w-full px-4 py-3 rounded-xl bg-green-100 border-2 border-green-300 text-center font-black text-green-700 tracking-widest text-sm">
                ✓ Code {mpesaCode} saved — admin will verify and dispatch
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mpesaCode}
                  onChange={e => setMpesaCode(e.target.value)}
                  placeholder="e.g. QHX12345Y"
                  maxLength={12}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none text-center font-black text-gray-900 tracking-widest uppercase text-sm placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-300"
                />
                <button
                  onClick={submitMpesaCode}
                  disabled={!mpesaCode.trim() || saving}
                  className="px-4 py-3 rounded-xl bg-green-600 text-white font-black text-sm disabled:opacity-40 hover:bg-green-700 transition-colors"
                >
                  {saving ? "..." : "Submit"}
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2 text-center">
              Check your M-Pesa SMS after paying — the code looks like <span className="font-bold">QHX12345Y</span>
            </p>
          </div>
        </div>

        {referralCode && (
           <div className="mb-8 p-8 bg-gradient-to-br from-gray-900 to-emerald-950 rounded-[3rem] text-white text-left relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Referral Bonus</span>
                 </div>
                 <h3 className="text-xl font-black mb-2">Gift KES 50 to a friend</h3>
                 <p className="text-gray-400 text-sm font-medium mb-6 leading-relaxed">
                    Share your unique code. When they place their first order, they get KES 50 off and <span className="text-white font-bold">you get KES 50 too!</span>
                 </p>
                 
                 <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 font-black text-2xl tracking-[0.3em] text-center text-primary uppercase">
                       {referralCode}
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(referralCode);
                        alert("Referral code copied!");
                      }}
                      className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-gray-900 hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                       <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                    </button>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-primary/20 rounded-full blur-3xl" />
           </div>
        )}

        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:bg-emerald-700 hover:scale-[1.02] transition-all"
          >
             Back to Home <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/orders/history"
            className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold hover:border-primary hover:text-primary transition-all text-sm"
          >
            Track your orders
          </Link>
        </div>

        {orderData && (
          <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-black text-primary">
                {orderData.vendor_assignments?.splits?.length || 1}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1">Farmers Paid</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-500">~25 km</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1">Food Miles Saved</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">0</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1">Middlemen Used</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">Processing...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
