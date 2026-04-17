"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Trees, TrendingDown, Minus } from "lucide-react";

interface FarmerEarning {
  name: string;
  stall: string;
  income: number;
  orders: number;
}

interface AnalyticsData {
  totalRuralIncome: number;
  totalOrders: number;
  foodMilesSaved: number;
  vendorsSupported: number;
  vendorList: { name: string; stall: string; joined: string }[];
  thisMonthOrders: number;
  lastMonthOrders: number;
  momChange: number;
  farmerEarnings: FarmerEarning[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/`)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="min-h-screen flex items-center justify-center p-6 bg-fresh-bg text-primary font-bold">Loading Impact Data...</div>;
  }

  const momPositive = data.momChange > 0;
  const momFlat = data.momChange === 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container mx-auto px-6 max-w-5xl pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Trees className="h-6 w-6 text-primary" />
            Impact Analytics
          </h1>
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Fellowship Tracker</span>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2">Rural Income</p>
            <h3 className="text-2xl font-black text-gray-900">KES {data.totalRuralIncome.toLocaleString()}</h3>
            <p className="mt-1 text-xs text-gray-400">Confirmed orders only</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm">
            <p className="text-amber-600 font-bold text-xs uppercase tracking-widest mb-2">Food Miles Saved</p>
            <h3 className="text-2xl font-black text-gray-900">{data.foodMilesSaved.toLocaleString()} km</h3>
            <p className="mt-1 text-xs text-gray-400">~25 km per order</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
            <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">Total Orders</p>
            <h3 className="text-2xl font-black text-gray-900">{data.totalOrders}</h3>
            <p className="mt-1 text-xs text-gray-400">All time</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 shadow-sm text-white">
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Active Farmers</p>
            <h3 className="text-2xl font-black text-white">{data.vendorsSupported}</h3>
            <p className="mt-1 text-xs text-gray-500">In rotation</p>
          </div>
        </div>

        {/* Month-over-Month */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h3 className="font-black text-gray-900 mb-4">Month-over-Month Orders</h3>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">This Month</p>
              <p className="text-3xl font-black text-gray-900">{data.thisMonthOrders}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Last Month</p>
              <p className="text-3xl font-black text-gray-900">{data.lastMonthOrders}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-lg ${
              momFlat ? 'bg-gray-100 text-gray-500'
              : momPositive ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-50 text-red-600'
            }`}>
              {momFlat ? <Minus className="h-5 w-5" /> : momPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {momFlat ? 'No change' : `${momPositive ? '+' : ''}${data.momChange}%`}
            </div>
          </div>
        </div>

        {/* Per-Farmer Earnings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-50 bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="font-black text-gray-900">Per-Farmer Earnings</h3>
              <p className="text-xs text-gray-500 mt-0.5">From confirmed orders only — direct income attribution</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>

          {data.farmerEarnings.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No confirmed orders yet — earnings will appear here once orders are marked confirmed.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.farmerEarnings.map((farmer, i) => {
                const maxIncome = data.farmerEarnings[0]?.income || 1;
                const pct = Math.round((farmer.income / maxIncome) * 100);
                return (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm flex-shrink-0">
                          {farmer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{farmer.name}</p>
                          <p className="text-xs text-gray-400">{farmer.stall} · {farmer.orders} order{farmer.orders !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <span className="font-black text-gray-900">KES {farmer.income.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Vendor Roster */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-50 bg-gray-50">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Active Vendor Roster
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Round-robin distribution proof for fellowship reporting.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.vendorList.map((v, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-fresh-bg/50 border border-emerald-50">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-black text-primary flex-shrink-0">
                    {v.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{v.name}</p>
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
