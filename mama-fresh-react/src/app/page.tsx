import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { PackageGrid } from "@/components/PackageGrid";
import { Product, Package, Testimonial } from "@/types";
import { Leaf, Users, ShieldCheck } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

async function getAnalytics() {
  try {
    const res = await fetch(`${API}/api/admin/analytics/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getConfig() {
  try {
    const res = await fetch(`${API}/api/config/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch(`${API}/api/testimonials/`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/api/products/`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
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
      isAvailable: item.is_available !== false,
    }));
  } catch { return []; }
}

async function getPackages(): Promise<Package[]> {
  try {
    const res = await fetch(`${API}/api/packages/`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data
      .filter((p: any) => p.is_active)
      .map((p: any) => ({
        id: String(p.id),
        name: p.name,
        badge: p.badge,
        description: p.description,
        speed: p.speed || "",
        imageUrl: p.image_url || "",
        highlights: p.highlights || [],
        contents: p.contents || [],
        useCases: p.use_cases || [],
        pricing: p.pricing || [],
      }));
  } catch { return []; }
}

export default async function Home() {
  const [analytics, products, packages, config] = await Promise.all([
    getAnalytics(),
    getProducts(),
    getPackages(),
    getConfig(),
  ]);

  const isDown = products.length === 0 && packages.length === 0;

  if (isDown) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-fresh-bg">
        <div className="text-center max-w-lg">
          <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Leaf className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-6 underline decoration-primary/30 decoration-8 underline-offset-4">Back in a moment!</h1>
          <p className="text-lg text-gray-600 mb-10 font-medium">
            We're currently updating our farm inventory to ensure everything you see is freshly harvested. Our village vendors are syncing their stalls.
          </p>
          <a href="https://wa.me/254792705921" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl">
             Chat with us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  const bestSellers = products.filter(p => p.topSeller);

  const impactStats = {
    farmers: analytics ? `${analytics.vendorsSupported}+` : (config?.impact_farmers_override || "40+"),
    families: analytics ? `${analytics.familiesServed}+` : (config?.impact_families_override || "200+"),
    miles: analytics ? analytics.foodMilesSaved : 0,
    location: "Kenya",
  };

  return (
    <div className="bg-white">
      <Hero />

      {/* Impact Strip */}
      <section className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="text-3xl md:text-5xl font-black text-primary mb-2 group-hover:scale-110 transition-transform">
                {impactStats.farmers}
              </div>
              <div className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Village Farmers Supported</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-5xl font-black text-secondary mb-2 group-hover:scale-110 transition-transform">
                {impactStats.families}
              </div>
              <div className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Families Served Monthly</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-5xl font-black text-accent mb-2 group-hover:scale-110 transition-transform">
                {impactStats.miles.toLocaleString()}
              </div>
              <div className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Food Miles Saved</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform">
                {impactStats.location}
              </div>
              <div className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">East Africa Green Economy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Green Mission */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mb-16">
            <span className="text-primary font-black uppercase tracking-[0.3em] text-sm block mb-4">Our Green Mission</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
              A shorter supply chain is a <span className="text-primary italic">greener</span> supply chain.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              Every order placed with Mama Fresh reduces food miles, eliminates unnecessary packaging, and sends money directly back to the farmers who grew your food — most of them women and young people in rural Chuka.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { Icon: Leaf, title: "Direct from farm", desc: "We source produce directly from trusted village farmers, cutting out brokers and reducing the carbon cost of long distribution chains." },
              { Icon: Users, title: "Dignified rural income", desc: "Farmers earn fair prices. Most of our suppliers are rural women and youth who depend on this income to support their households." },
              { Icon: ShieldCheck, title: "Less food waste", desc: "By curating orders to actual demand and delivering within the same day, we reduce spoilage at every stage of the supply chain." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="p-8 rounded-[2.5rem] bg-fresh-bg border border-emerald-50 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <div className="bg-fresh-bg py-20">
        <PackageGrid packages={packages} />
      </div>

      {/* Best Sellers */}
      <ProductGrid products={bestSellers} title="Village-Sourced Favorites" limit={4} />

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-black uppercase tracking-[0.3em] text-sm block mb-4">How It Works</span>
            <h2 className="text-4xl font-black text-gray-900">Simple for you, fair for farmers.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: "01", title: "Build Your Basket", desc: "Choose a package or pick individual items from our fresh catalog." },
              { n: "02", title: "Village Restock", desc: "Our farmers harvest your specific order directly from the village soil." },
              { n: "03", title: "Same-Day Delivery", desc: "Freshness guaranteed. We deliver straight to your door in Chuka or Nairobi." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="relative text-center">
                <div className="text-8xl font-black text-gray-100 absolute -top-10 left-1/2 -translate-x-1/2 z-0">{n}</div>
                <div className="relative z-10">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
