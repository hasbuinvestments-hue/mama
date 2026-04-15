import React from "react";
import Link from "next/link";
import { MapPin, Phone, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                <span className="text-xl font-bold text-white">M</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                MAMA <span className="text-primary">FRESH</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Village-sourced groceries delivered to your door. Zero middlemen. Dignified livelihoods for rural women and youth.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Chuka Market, Tharaka-Nithi County, Kenya</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <a href="https://wa.me/254792705921" className="hover:text-white transition-colors">+254 792 705 921</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/shop" className="hover:text-white transition-colors">Shop All Products</Link></li>
              <li><Link href="/collections" className="hover:text-white transition-colors">Collections</Link></li>
              <li><Link href="/packages" className="hover:text-white transition-colors">Weekly Packages</Link></li>
              <li><Link href="/farmers" className="hover:text-white transition-colors">Meet the Farmers</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Our Mission</Link></li>
            </ul>
          </div>

          {/* Mission */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Our Impact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Direct income to village farmers — no brokers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Reduced food miles, lower carbon footprint</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Empowering rural women &amp; youth in agri-enterprise</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>7+ years of community trust in Chuka</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} Mama Fresh Grocery. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-primary fill-primary" /> for fair trade in Kenya
          </p>
        </div>
      </div>
    </footer>
  );
}
