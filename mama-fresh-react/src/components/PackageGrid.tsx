"use client";

import { useState } from "react";
import { Package } from "@/types";
import { useCart } from "@/context/CartContext";
import { MoveRight, CheckCircle2, Package as PackageIcon, ShoppingBasket, X, Info } from "lucide-react";

interface PackageGridProps {
  packages: Package[];
}

export function PackageGrid({ packages }: PackageGridProps) {
  const { addToCart } = useCart();
  const [selectedTiers, setSelectedTiers] = useState<Record<string, number>>({});
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [previewPkg, setPreviewPkg] = useState<{pkg: Package, tierIndex: number} | null>(null);

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  const handleAddToCart = (pkg: Package) => {
    const tierIndex = selectedTiers[pkg.id] ?? 0;
    const tier = pkg.pricing[tierIndex];
    addToCart({
      id: `${pkg.id}-${tierIndex}`,
      name: `${pkg.name} — ${tier.label}`,
      price: tier.price,
      unit: "package",
      category: "Package",
    });
    setAdded(prev => ({ ...prev, [pkg.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [pkg.id]: false })), 2000);
  };

  return (
    <>
      <section className="py-24 bg-fresh-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <PackageIcon className="h-3 w-3" />
            Curated Bundles
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Simplify Your Shopping</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our expertly curated packages take the guesswork out of grocery shopping.
            Perfect for families, events, or group orders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {packages.map((pkg) => {
            const selectedTierIndex = selectedTiers[pkg.id] ?? 0;
            const selectedTier = pkg.pricing[selectedTierIndex];

            return (
              <article
                key={pkg.id}
                className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-200/40 border border-white hover:border-primary/20 transition-all group"
              >
                <div className="relative h-64 overflow-hidden bg-fresh-bg">
                  <img
                    src={pkg.imageUrl || "/assets/placeholder.svg"}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.svg"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <span className="px-3 py-1 rounded-full bg-primary/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                      {pkg.badge}
                    </span>
                    <h3 className="text-2xl font-black text-white mt-2">{pkg.name}</h3>
                  </div>
                </div>

                <div className="p-8 flex-grow flex flex-col">
                  <p className="text-sm text-gray-600 mb-8 leading-relaxed italic">
                    "{pkg.description}"
                  </p>

                  {/* Tier Selector */}
                  <div className="space-y-3 mb-8">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Choose Your Size</h4>
                    {pkg.pricing.map((tier, index) => (
                      <button
                        key={tier.label}
                        onClick={() => setSelectedTiers(prev => ({ ...prev, [pkg.id]: index }))}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                          selectedTierIndex === index
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-gray-100 bg-fresh-bg hover:border-primary/30"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold text-sm ${selectedTierIndex === index ? "text-primary" : "text-gray-900"}`}>
                            {tier.label}
                          </span>
                          <span className={`font-black text-sm ${selectedTierIndex === index ? "text-primary" : "text-gray-700"}`}>
                            {formatCurrency(tier.price)}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">{tier.summary}</p>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 mb-8">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Highlights</h4>
                    {pkg.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setPreviewPkg({ pkg, tierIndex: selectedTierIndex })}
                    className="mb-6 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-colors"
                  >
                    <Info className="h-3 w-3" />
                    Preview {selectedTier.label} Contents
                  </button>

                  <button
                    onClick={() => handleAddToCart(pkg)}
                    className={`mt-auto w-full inline-flex items-center justify-center px-6 py-4 rounded-2xl font-bold transition-all shadow-lg group/btn ${
                      added[pkg.id]
                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                        : "bg-gray-900 text-white hover:bg-primary shadow-gray-900/10 hover:shadow-primary/30"
                    }`}
                  >
                    {added[pkg.id] ? (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" /> Added to Basket
                      </>
                    ) : (
                      <>
                        <ShoppingBasket className="mr-2 h-5 w-5" />
                        Add {selectedTier.label} — {formatCurrency(selectedTier.price)}
                        <MoveRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>

    {/* Preview Modal */}
    {previewPkg && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div 
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
          onClick={() => setPreviewPkg(null)}
        />
        
        <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl shadow-black/20 overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="relative h-48 sm:h-64">
            <img
              src={previewPkg.pkg.imageUrl || "/assets/placeholder.svg"}
              alt={previewPkg.pkg.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.svg"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
            <button 
              onClick={() => setPreviewPkg(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-900 hover:bg-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-6 left-8">
              <h3 className="text-3xl font-black text-gray-900">{previewPkg.pkg.name}</h3>
              <p className="text-primary font-bold">{previewPkg.pkg.pricing[previewPkg.tierIndex].label} Contents</p>
            </div>
          </div>

          <div className="p-8 sm:p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Group items by category */}
              {Object.entries(
                (previewPkg.pkg.pricing[previewPkg.tierIndex].items || []).reduce((acc, item) => {
                  if (!acc[item.category]) acc[item.category] = [];
                  acc[item.category].push(item.name);
                  return acc;
                }, {} as Record<string, string[]>)
              ).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{category}</h4>
                  <ul className="space-y-3">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {(!previewPkg.pkg.pricing[previewPkg.tierIndex].items || previewPkg.pkg.pricing[previewPkg.tierIndex].items?.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500 italic">Detailed item list coming soon. This package includes a fresh balanced mix of essentials.</p>
              </div>
            )}
          </div>

          <div className="p-8 bg-fresh-bg border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Price for this tier</p>
              <p className="text-2xl font-black text-gray-900">{formatCurrency(previewPkg.pkg.pricing[previewPkg.tierIndex].price)}</p>
            </div>
            <button
              onClick={() => {
                handleAddToCart(previewPkg.pkg);
                setPreviewPkg(null);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              <ShoppingBasket className="mr-2 h-5 w-5" />
              Add to Basket
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
