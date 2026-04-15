import { Product } from "@/types";
import { ProductGrid } from "@/components/ProductGrid";
import { ShoppingBag, X } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Shop Full Catalog | Mama Fresh Grocery",
};

interface MixData { title: string; slug: string; description: string; items: string[] }

async function getMixes(): Promise<MixData[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mixes/`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
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

  const [allProducts, mixes] = await Promise.all([getProducts(), getMixes()]);
  const activeMix = mixSlug ? mixes.find((m: MixData) => m.slug === mixSlug) : null;

  const products = activeMix
    ? allProducts.filter(p =>
        activeMix.items.some(item => p.name.toLowerCase() === item.toLowerCase())
      )
    : allProducts;

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
              href="https://wa.me/254792705921"
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
