"use client";

import Link from "next/link";
import { CheckCircle2, Leaf, Zap, Trees, Users2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface MixData { title: string; slug: string; description: string; items: string[] }

export default function AboutPage() {
  const [mixesData, setMixesData] = useState<MixData[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mixes/`)
      .then(r => r.json())
      .then(setMixesData)
      .catch(() => setMixesData([]));
  }, []);

  return (
    <div className="bg-white min-h-screen">
        {/* Hero */}
        <section className="bg-fresh-bg py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              About Mama Fresh
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
              Building a greener, fairer food <br /><span className="text-primary italic">system from the village up.</span>
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed font-medium">
              Mama Fresh is a green grocery venture connecting rural village farmers directly to families — 
              creating dignified livelihoods, reducing food waste, and making fresh produce accessible for everyone.
            </p>
          </div>
        </section>

        {/* Philosophy / Story Grid */}
        <section className="py-24 border-b border-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-primary font-black uppercase tracking-[0.3em] text-sm block mb-4">Our Story</span>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">From village farms to family tables <br />— without the middleman.</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="p-10 rounded-[3rem] bg-fresh-bg border border-emerald-50 hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary shadow-sm mb-6">
                  <XCircleIcon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">The problem we solve</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Rural farmers — most of them women — sell produce at low prices to brokers who then resell at high markups. Families pay more. Farmers earn less.</p>
              </div>
              
              <div className="p-10 rounded-[3rem] bg-emerald-50 border border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-secondary shadow-sm mb-6">
                  <Leaf className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Our approach</h3>
                <p className="text-gray-500 text-sm leading-relaxed">We buy directly from village farmers at fair prices, curate orders based on real household demand, and deliver the same day. No brokers. No long cold chains.</p>
              </div>

              <div className="p-10 rounded-[3rem] bg-fresh-bg border border-emerald-50 hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-accent shadow-sm mb-6">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">The impact</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Farmers earn more per kilogram. Families pay less per meal. And the food they receive is fresher because it travelled fewer kilometres.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Green Economy & Dignity */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center mb-32">
              <div>
                <span className="text-primary font-black uppercase tracking-[0.3em] text-sm block mb-4">Green Economy</span>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-8">A food business built for <span className="text-primary italic">climate resilience.</span></h2>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Reduced food miles</h4>
                      <p className="text-gray-500 text-sm">By sourcing within Chuka and surrounding villages, we dramatically reduce transportation emissions.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Less spoilage, less waste</h4>
                      <p className="text-gray-500 text-sm">Same-day curated ordering means we only move what customers have already requested — cutting post-harvest losses.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Sustainable livelihoods</h4>
                      <p className="text-gray-500 text-sm">Supporting smallholder farmers keeps agricultural land productive and prevents degradation.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600" className="rounded-3xl shadow-lg" alt="Organic farming" />
                <img src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=600" className="rounded-3xl shadow-lg mt-8" alt="Fresh harvest" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
              <div className="order-2 md:order-1 bg-gray-900 p-12 rounded-[3.5rem] text-white">
                <h3 className="text-3xl font-black mb-6">Dignified Livelihoods</h3>
                <p className="text-gray-400 mb-10 leading-relaxed italic">"Behind every bunch of sukuma wiki and every bag of tomatoes is a farmer who woke up early. Mama Fresh exists to make sure that work is valued."</p>
                <div className="space-y-6">
                  {[
                    { icon: <Users2 />, title: "Rural women farmers", desc: "The majority of our suppliers are women growing on small plots." },
                    { icon: <Trees />, title: "Youth in agri-enterprise", desc: "Creating logistics opportunities for young people in Chuka." },
                    { icon: <Zap />, title: "Community trust", desc: "We know our farmers by name and build decade-long relationships." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="text-primary">{item.icon}</div>
                      <div>
                        <h5 className="font-bold">{item.title}</h5>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2">
                <span className="text-primary font-black uppercase tracking-[0.3em] text-sm block mb-4">Social Impact</span>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">Income for those who deserve to <span className="text-primary italic">be seen.</span></h2>
              </div>
            </div>
          </div>
        </section>

        {/* Fresh Mix Ideas */}
        <section className="py-24 bg-fresh-bg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-primary font-black uppercase tracking-[0.3em] text-sm block mb-4">Juice & Smoothie Baskets</span>
              <h2 className="text-4xl font-black text-gray-900">Popular Fresh <span className="text-primary italic">Mixes</span></h2>
              <p className="mt-4 text-gray-500 max-w-xl mx-auto">Inspired by combinations our customers already shop for. Perfect for your custom basket picking.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mixesData.map((mix, i) => (
                <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                  <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                    <img 
                      src={`https://images.unsplash.com/photo-1610970881699-44a55b4cf7f5?auto=format&fit=crop&q=80&w=800&sig=${i}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={mix.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h4 className="text-xl font-black">{mix.title}</h4>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 italic">"{mix.description}"</p>
                    <Link href={`/shop?mix=${mix.slug}`} className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                      Shop These Ingredients <Leaf className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-gray-900 text-white rounded-[4rem] mx-4 mb-24 overflow-hidden relative">
          <div className="container mx-auto px-8 relative z-10">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-extrabold mb-12">The Mama Fresh Quality Promise</h2>
              <div className="space-y-6">
                {[
                  "No long-term cold storage – produce stays in the ground until the day before delivery.",
                  "Direct contact with individual family farms in Chuka and beyond.",
                  "Hand-picked and sorted by our dedicated quality control team.",
                  "Completely transparent pricing with no hidden middleman fees.",
                  "Personalized customer support via WhatsApp – we treat every basket like it's for our own home."
                ].map((promise, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <p className="text-lg text-gray-300 font-medium">{promise}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
  );
}
