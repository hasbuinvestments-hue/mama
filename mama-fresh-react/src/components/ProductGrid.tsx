"use client";

import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Star, Leaf, Plus, Search } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  title?: string;
  limit?: number;
  showFilters?: boolean;
}

export function ProductGrid({ products, title, limit, showFilters = false }: ProductGridProps) {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayProducts = limit ? filteredProducts.slice(0, limit) : filteredProducts;

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            {title && <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{title}</h2>}
            <p className="text-gray-600 max-w-2xl">
              Hand-picked from local farms. We ensure every item meets our strict "freshness first" criteria.
            </p>
          </div>

          {showFilters && (
            <div className="flex flex-col gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full md:w-64 pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 border border-transparent focus:border-primary focus:bg-white focus:outline-none text-sm font-medium transition-all"
                />
              </div>
              {/* Category filters */}
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeCategory === cat
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayProducts.map((product) => {
            const hasSale = !!product.salePrice;
            const price = product.salePrice || product.price;

            const isAvailable = product.isAvailable !== false;

            return (
              <article
                key={product.id}
                className={`group relative flex flex-col bg-white rounded-3xl border overflow-hidden transition-all duration-300 ${
                  isAvailable
                    ? "border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50"
                    : "border-gray-100 opacity-60"
                }`}
              >
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {!isAvailable && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-800 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      Out of Stock
                    </span>
                  )}
                  {isAvailable && product.topSeller && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-gray-900 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      <Star className="h-3 w-3 fill-current" />
                      Top Seller
                    </span>
                  )}
                  {isAvailable && hasSale && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-accent text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      Sale
                    </span>
                  )}
                </div>

                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-fresh-bg">
                  <img
                    src={product.imageUrl?.startsWith("http") ? product.imageUrl : `/${product.imageUrl || 'assets/products/placeholder.svg'}`}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1741515043161-e97d05e5cfcc?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                  {product.villageSourced && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm shadow-sm flex items-center gap-1 text-[10px] font-bold text-emerald-800">
                      <Leaf className="h-3 w-3" />
                      Village Sourced
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="mb-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{product.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{product.detail}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-gray-900">{formatCurrency(price)}</span>
                        {hasSale && (
                          <span className="text-sm text-gray-400 line-through font-medium">{formatCurrency(product.price)}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-gray-400 uppercase">Per {product.unit}</span>
                    </div>

                    <button
                      onClick={() => isAvailable && addToCart({ ...product, price })}
                      disabled={!isAvailable}
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-all group/btn ${
                        isAvailable
                          ? "bg-primary text-white shadow-primary/20 hover:bg-emerald-700 active:scale-95"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      }`}
                    >
                      <Plus className="h-6 w-6 group-hover/btn:rotate-90 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
