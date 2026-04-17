import { Product } from "@/types";
import { ProductGrid } from "@/components/ProductGrid";
import { ShoppingBag, X, Sprout, Clock, User, Package } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Shop Full Catalog | Mama Fresh Grocery",
};

interface MixData { title: string; slug: string; description: string; items: string[] }
interface HarvestData { 
  id: number; 
  vendor_name: string; 
  product_name: string; 
  date_available: string; 
  expected_qty: string; 
}

async function getMixes(): Promise<MixData[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mixes/`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getHarvests(): Promise<HarvestData[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/harvests/`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    
    // Filter for next 7 days
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return data.filter((h: any) => {
        const hDate = new Date(h.date_available);
        return hDate >= today && hDate <= nextWeek;
    });
  } catch { return []; }
}

async function getConfig() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      category: item.category_name || "Other",
      detail: `${item.name} (${item.unit})`,
      unit: item.unit,
      price: parseFloat(item.price),
      salePrice: item.sale_price ? parseFloat(item.sale_price) : undefined,
      topSeller: item.is_top_seller,
      villageSourced: true,
      imageUrl: item.image_url,
      isAvailable: item.is_available !== false,
    }));
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ mix?: string }>;
}) {
  const params = await searchParams;
  const mixSlug = params.mix;

  const [allProducts, mixes, harvests, config] = await Promise.all([
    getProducts(), 
    getMixes(), 
    getHarvests(), 
    getConfig()
  ]);
  
  const activeMix = mixSlug ? mixes.find((m: MixData) => m.slug === mixSlug) : null;
  const whatsappNumber = config?.brand_phone || "254792705921";

  const products = activeMix
    ? allProducts.filter(p =>
        activeMix.items.some(item => p.name.toLowerCase() === item.toLowerCase())
      )
    : allProducts;

  const calculateDaysReady = (dateStr: string) => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const readyDate = new Date(dateStr);
      readyDate.setHours(0,0,0,0);
      const diff = Math.ceil((readyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 0) return "Ready Today";
      if (diff === 1) return "Ready Tomorrow";
      return `Ready in ${diff} days`;
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-fresh-bg py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-sm font-black text-primary uppercase tracking-[0.2em]">Village-to-Urban</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
            {activeMix ? (
              <>{activeMix.title} <span className="text-primary italic">Mix</span></>
            ) : (
              <>Our Full <span className="text-primary italic">Catalog</span></>
            )}
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl leading-relaxed">
            {activeMix
              ? `Ingredients for the ${activeMix.title} — ${activeMix.description}.`
              : "Browse our entire range of seasonal fruits, organic vegetables, and kitchen staples."}
          </p>

          {activeMix && (
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:border-primary hover:text-primary transition-all"
            >
              <X className="h-4 w-4" />
              Clear filter — show all products
            </Link>
          )}
        </div>
      </div>

      {/* Coming Fresh Highlights */}
      {!activeMix && harvests.length > 0 && (
        <section className="py-12 bg-white container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Sprout className="text-primary h-6 w-6" />
                        Coming <span className="text-primary italic">Fresh</span>
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Direct from the soil. Pre-order your village favorites for next week.</p>
                </div>
                <div className="hidden md:block h-[1px] flex-grow mx-8 bg-gray-100" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {harvests.map((h) => (
                    <div key={h.id} className="bg-fresh-bg border border-emerald-50 rounded-3xl p-6 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Pre-Order</span>
                            <div className="text-primary group-hover:scale-110 transition-transform"><Clock className="h-5 w-5" /></div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{h.product_name}</h3>
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                <Clock className="h-3 w-3" />
                                {calculateDaysReady(h.date_available)}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                <User className="h-3 w-3" />
                                Farmed by {h.vendor_name}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                <Package className="h-3 w-3" />
                                ~{h.expected_qty} available
                            </div>
                        </div>
                        <a 
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'd like to pre-order ${h.product_name} available on ${h.date_available}`)}`}
                            className="block w-full text-center py-3 rounded-xl bg-white border border-emerald-100 text-primary text-xs font-black shadow-sm hover:bg-primary hover:text-white transition-all transform active:scale-95"
                        >
                            Pre-Order on WhatsApp
                        </a>
                    </div>
                ))}
            </div>
        </section>
      )}

      <ProductGrid
        products={products}
        showFilters={!activeMix}
      />

      <section className="py-20 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Don't see something you need?</h2>
            <p className="text-gray-500">
              Our farmers often have seasonal items not listed here. Message us on WhatsApp and we'll check the morning harvest for you.
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all"
            >
              Ask about Seasonal Items
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
