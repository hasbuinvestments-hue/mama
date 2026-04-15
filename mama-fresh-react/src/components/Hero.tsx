import React from "react";
import Link from "next/link";
import { ArrowRight, Leaf, Truck, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-fresh-bg pt-16 pb-24 sm:pt-24 sm:pb-32">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 pointer-events-none">
        <div className="aspect-square h-[400px] rounded-full bg-primary" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6">
              <Leaf className="h-3 w-3" />
              Direct from the village
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
              Village-sourced groceries, <span className="text-primary italic">dignified livelihoods</span>.
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Mama Fresh connects rural women and youth farmers in Chuka directly to your doorstep — zero brokers, fair prices, and same-day delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
              >
                Shop Full Catalog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/packages"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold border-2 border-gray-100 hover:bg-gray-50 transition-colors"
              >
                View Packages
              </Link>
            </div>

            {/* Features list */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Next-Day Delivery</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Premium Quality</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <Leaf className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Zero Middlemen</span>
              </div>
            </div>
          </div>

          {/* Visual Element (Placeholder for Image) */}
          <div className="mt-16 lg:mt-0 lg:col-span-6">
            <div className="relative aspect-[4/3] rounded-3xl bg-gray-200 overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1743844915173-77338dfce094?auto=format&fit=crop&q=80&w=1200"
                alt="Fresh produce spread"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <p className="text-white font-medium text-sm">"The freshest vegetables I've ever tasted in the city!"</p>
                <p className="text-white/80 text-xs mt-1">— Jane D., Nairobi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
