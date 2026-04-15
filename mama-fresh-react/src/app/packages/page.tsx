import { Package } from "@/types";
import { PackageGrid } from "@/components/PackageGrid";
import { Package as PackageIcon } from "lucide-react";

export const metadata = { title: "Grocery Packages | Mama Fresh" };

async function getPackages(): Promise<Package[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/packages/`, { cache: 'no-store' });
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
  } catch (err) {
    console.error("Failed to fetch packages:", err);
    return [];
  }
}

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-fresh-bg py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <PackageIcon className="h-5 w-5" />
            </div>
            <span className="text-sm font-black text-primary uppercase tracking-[0.2em]">Curated for You</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
            Our Grocery <span className="text-primary italic">Packages</span>
          </h1>
          <p className="text-lg text-gray-600 mt-6 max-w-2xl leading-relaxed">
            Choose from our specialized bundles designed for families, events, and office shared shopping.
            Packages are the fastest way to get your essentials with one click.
          </p>
        </div>
      </div>

      <PackageGrid packages={packages} />

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-8 underline decoration-primary/30 decoration-8 underline-offset-4">Why use packages?</h2>
              <div className="space-y-8">
                {[
                  { n: 1, title: "Fast Selection", desc: "No need to pick 20 individual items. Choose a budget tier and let us handle the curation." },
                  { n: 2, title: "Cost Effective", desc: "Packages are optimized for weight and delivery volume, often saving you on shipping costs." },
                  { n: 3, title: "Seasonal Variety", desc: "We swap items based on what's freshest at the farm that morning, ensuring you get the best harvest." },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex gap-4">
                    <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">{n}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                      <p className="text-gray-500 text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-fresh-bg rounded-[2rem] p-12 border border-emerald-50">
              <h3 className="text-2xl font-black text-gray-900 mb-6">Need a custom package?</h3>
              <p className="text-gray-600 mb-8 font-medium italic">"We handle massive event orders and recurring corporate pantry restocks. If our standard packages don't fit, we'll build one that does."</p>
              <a
                href="https://wa.me/254792705921"
                className="inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                Contact our Concierge
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
