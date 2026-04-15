"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import { LayoutGrid, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

interface Collection {
  id: number;
  title: string;
  description: string;
  product_names: string[];
}

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CollectionsPage() {
  const { addToCart } = useCart();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/collections/`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/products/`).then(r => r.json()).catch(() => []),
    ]).then(([cols, prods]) => {
      setCollections(cols);
      setProducts(prods.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        category: item.category_name || "Other",
        detail: `${item.name} (${item.unit})`,
        unit: item.unit,
        price: parseFloat(item.price),
        salePrice: item.sale_price ? parseFloat(item.sale_price) : undefined,
        topSeller: item.is_top_seller,
        villageSourced: true,
        imageUrl: item.image_url,
      })));
    }).finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="bg-fresh-bg py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <LayoutGrid className="h-4 w-4" />
            Curated Categories
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
            Themed <span className="text-primary italic">Collections</span>
          </h1>
          <p className="max-w-2xl text-lg text-gray-600 leading-relaxed">
            Not sure where to start? Browse our curated collections designed for specific kitchen needs.
            From weekly essentials to office snacks.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-32">
        {loading ? (
          <div className="text-center py-20 text-primary font-bold animate-pulse">Loading collections...</div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium">No collections available yet.</div>
        ) : (
          collections.map((col) => {
            const colProducts = products.filter(p =>
              col.product_names.some(name => name.toLowerCase() === p.name.toLowerCase())
            );

            return (
              <div key={col.id} className="relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                  <div className="max-w-xl">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">{col.title}</h2>
                    <p className="text-gray-500 font-medium">{col.description}</p>
                  </div>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all"
                  >
                    View full shop
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {colProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="group flex flex-col">
                      <div className="aspect-square rounded-3xl bg-gray-50 overflow-hidden border border-gray-100 group-hover:border-primary/20 transition-all relative">
                        <img
                          src={product.imageUrl?.startsWith("http") ? product.imageUrl : `/${product.imageUrl || "assets/placeholder.svg"}`}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/placeholder.svg";
                          }}
                        />
                        <button
                          onClick={() => addToCart(product)}
                          className="absolute bottom-4 right-4 h-10 w-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-bold text-gray-900">{product.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">{product.unit}</p>
                          <p className="font-black text-primary text-sm">{formatCurrency(product.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
