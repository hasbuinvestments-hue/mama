"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, Leaf, Trees } from "lucide-react";

interface VendorEquity {
  name: string;
  stall: string;
  joined: string;
}

interface AnalyticsData {
  totalRuralIncome: number;
  totalOrders: number;
  foodMilesSaved: number;
  vendorsSupported: number;
  vendorList: VendorEquity[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch analytics:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return <div className="min-h-screen flex items-center justify-center p-6 bg-fresh-bg text-primary font-bold">Loading Impact Data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 sticky top-0 z-50">
        <div className="container mx-auto px-6 max-w-5xl flex items-center justify-between">
          <div>
            <span className="text-primary font-black uppercase tracking-widest text-xs mb-1 block">Fellowship Tracker</span>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Trees className="h-6 w-6 text-primary" />
              Impact Analytics
            </h1>
          </div>
          <Link href="/admin/orders" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 max-w-5xl pt-12">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="h-24 w-24" />
            </div>
            <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-2">Total Rural Income</p>
            <h3 className="text-4xl font-black text-gray-900">KES {data.totalRuralIncome.toLocaleString()}</h3>
            <p className="mt-4 text-sm text-gray-500 font-medium max-w-xs">Direct capital distributed to village farmers, completely bypassing central market brokers.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-amber-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Leaf className="h-24 w-24" />
            </div>
            <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-2">Food Miles Saved</p>
            <h3 className="text-4xl font-black text-gray-900">{data.foodMilesSaved.toLocaleString()} km</h3>
            <p className="mt-4 text-sm text-gray-500 font-medium max-w-xs">Estimated emissions reduction through optimized direct village-to-urban routing.</p>
          </div>

          <div className="bg-gray-900 rounded-3xl p-8 shadow-sm relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Users className="h-24 w-24 text-white" />
            </div>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">Vendors Supported</p>
            <h3 className="text-4xl font-black text-white">{data.vendorsSupported} Active</h3>
            <p className="mt-4 text-sm text-gray-400 font-medium max-w-xs">Mainly women and youth operating micro-farms or small village stalls.</p>
          </div>
        </div>

        {/* Vendor Equity */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
             <h3 className="font-bold text-gray-900 flex items-center gap-2">
               Active Vendor Roster
             </h3>
             <p className="text-sm text-gray-500 mt-1">Proof of inclusive economic opportunity and round-robin distribution.</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {data.vendorList.map((v, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-fresh-bg/50 border border-emerald-50">
                   <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center font-black text-primary flex-shrink-0">
                     {v.name.charAt(0)}
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-900 text-sm">{v.name}</h4>
                     <p className="text-xs text-gray-500">{v.stall}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
