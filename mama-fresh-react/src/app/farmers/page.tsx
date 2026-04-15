"use client";

import { useEffect, useState } from "react";
import { MapPin, Calendar, ShieldCheck } from "lucide-react";

interface Vendor {
  id: number;
  full_name: string;
  stall_number: string;
  bio: string;
  profile_image: string;
  joined_date: string;
}

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/`)
      .then(res => res.json())
      .then(data => {
        setFarmers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch farmers:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <div className="bg-fresh-bg py-20 border-b border-emerald-50">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <span className="text-primary font-black uppercase tracking-[0.2em] mb-4 block">Inclusive Economic Opportunity</span>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
              Meet the <span className="text-primary italic">Farmers</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              Mama Fresh isn't just a marketplace. We are a direct bridge to rural women and youth, cutting out brokers to ensure dignified livelihoods and fair trade.
            </p>
          </div>
        </div>

        {/* Farmers Grid */}
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            {loading ? (
              <div className="text-center font-bold text-primary animate-pulse py-20">Loading our farmers...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {farmers.map(farmer => (
                  <div key={farmer.id} className="group rounded-[2.5rem] bg-white border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300">
                    <div className="h-64 bg-gray-100 relative overflow-hidden">
                      <img
                        src={farmer.profile_image || "/assets/placeholder.svg"}
                        alt={farmer.full_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.svg"; }}
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-gray-900">{farmer.stall_number}</span>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      <h3 className="text-2xl font-black text-gray-900 mb-2">{farmer.full_name}</h3>
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-6">
                        <ShieldCheck className="h-4 w-4" /> Verified Village Partner
                      </div>
                      
                      <p className="text-gray-500 leading-relaxed text-sm mb-6">
                        {farmer.bio || "A dedicated member of the Mama Fresh farming cooperative, providing fresh, ethical produce to urban homes."}
                      </p>
                      
                      <div className="pt-6 border-t border-gray-50 flex items-center gap-2 text-gray-400 text-sm font-medium">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(farmer.joined_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
  );
}
