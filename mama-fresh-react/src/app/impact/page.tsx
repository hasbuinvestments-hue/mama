import { Trees, TrendingUp, Leaf, Users, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

async function getImpact() {
  try {
    const res = await fetch(`${API}/api/admin/analytics/`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export const metadata = {
  title: "Our Impact | Mama Fresh",
  description: "Real-time data on how Mama Fresh supports rural farmers and reduces food miles in Chuka, Kenya.",
};

export default async function ImpactPage() {
  const data = await getImpact();

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-fresh-bg">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Leaf className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Impact Data Currently Unavailable</h1>
          <p className="text-gray-600 mb-8">
            We're having trouble reaching our live impact tracker. Please try again in a few minutes as we refresh our data from the farms.
          </p>
          <Link href="/" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const totalIncome = data?.totalRuralIncome ?? 0;
  const totalOrders = data?.totalOrders ?? 0;
  const foodMiles = data?.foodMilesSaved ?? 0;
  const vendorCount = data?.vendorsSupported ?? 0;
  const farmerEarnings: { name: string; stall: string; income: number; orders: number }[] =
    data?.farmerEarnings ?? [];
  const momChange: number = data?.momChange ?? 0;
  const thisMonth: number = data?.thisMonthOrders ?? 0;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gray-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <Trees className="absolute h-96 w-96 -bottom-12 -right-12" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6">
            Live Impact Data
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight max-w-3xl">
            Every order creates a <span className="text-primary italic">measurable impact.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
            Mama Fresh tracks the real economic and environmental impact of every basket sold.
            This page updates in real time as farmers earn and orders are fulfilled.
          </p>
        </div>
      </section>

      {/* Big Stats */}
      <section className="py-16 border-b border-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-8 rounded-3xl bg-fresh-bg border border-emerald-50">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1">
                KES {totalIncome.toLocaleString()}
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Paid to Farmers</p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-fresh-bg border border-emerald-50">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm mb-4">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1">{vendorCount}</div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Farmers</p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-fresh-bg border border-emerald-50">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm mb-4">
                <Leaf className="h-6 w-6" />
              </div>
              <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1">
                {foodMiles.toLocaleString()} km
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Food Miles Saved</p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-fresh-bg border border-emerald-50">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm mb-4">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1">{totalOrders}</div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Orders Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* This month momentum */}
      {thisMonth > 0 && (
        <section className="py-16 bg-white border-b border-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <span className="text-primary font-black uppercase tracking-[0.3em] text-sm block mb-4">Growing Fast</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
              <span className="text-primary">{thisMonth}</span> orders this month alone
              {momChange !== 0 && (
                <span className={`ml-3 text-2xl ${momChange > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {momChange > 0 ? `+${momChange}%` : `${momChange}%`}
                </span>
              )}
            </h2>
            <p className="text-gray-500 text-lg">
              Demand for village-direct groceries is growing every month in Chuka and surrounding areas.
            </p>
          </div>
        </section>
      )}

      {/* Per-farmer breakdown */}
      {farmerEarnings.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-primary font-black uppercase tracking-[0.3em] text-sm block mb-4">Transparent Earnings</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                Income per farmer — <span className="text-primary italic">no broker, no middleman.</span>
              </h2>
              <p className="mt-4 text-gray-500 max-w-xl mx-auto">
                Every farmer in our network earns directly from orders. Here's the breakdown.
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              {farmerEarnings.map((farmer, i) => {
                const maxIncome = farmerEarnings[0]?.income || 1;
                const pct = Math.round((farmer.income / maxIncome) * 100);
                return (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">
                          {farmer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900">{farmer.name}</p>
                          <p className="text-xs text-gray-400">{farmer.stall} · {farmer.orders} order{farmer.orders !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <span className="font-black text-gray-900 text-lg">KES {farmer.income.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Add your order to this impact.</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Every basket you order puts money directly in a farmer's hand in Chuka.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-black hover:bg-emerald-700 transition-all shadow-lg shadow-primary/20"
          >
            Shop Now <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
