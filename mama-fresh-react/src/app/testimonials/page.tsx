import { Quote, MessageSquareHeart } from "lucide-react";

export const metadata = { title: "Customer Stories | Mama Fresh" };

async function getTestimonials() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-fresh-bg py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <MessageSquareHeart className="h-4 w-4" />
            Customer Stories
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
            What our community <br /><span className="text-primary italic">is saying</span>.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
            We take pride in every basket we deliver. Here's how Mama Fresh is changing grocery shopping for families across Chuka and Nairobi.
          </p>
        </div>
      </div>

      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {testimonials.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-medium">
              No testimonials yet — be the first to share your experience!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((item: any) => (
                <article key={item.id} className="relative p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col group hover:-translate-y-1 transition-all duration-300">
                  <Quote className="h-10 w-10 text-primary/10 absolute top-8 right-8 group-hover:text-primary/20 transition-colors" />
                  <p className="text-gray-700 text-lg font-medium leading-relaxed mb-8 relative z-10">
                    "{item.quote}"
                  </p>
                  <div className="mt-auto flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center font-black text-primary">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-xs text-primary font-bold uppercase tracking-tighter">Verified Customer</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[3rem] p-12 text-center text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-20 blur-[100px] pointer-events-none" />
            <h2 className="text-3xl font-black mb-6">Join 1,000+ happy families</h2>
            <p className="text-gray-400 mb-10 max-w-lg mx-auto">Experience the peace of mind that comes with dependable, village-fresh groceries delivered to your door.</p>
            <div className="flex justify-center flex-wrap gap-4">
              <a href="/shop" className="px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:scale-105 transition-all">Start Your Order</a>
              <a href="/about" className="px-8 py-4 rounded-2xl bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 transition-all">Learn More</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
