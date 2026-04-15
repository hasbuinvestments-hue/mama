"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Check, Package } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface PricingTier {
  label: string;
  price: number;
  summary: string;
}

interface Pkg {
  id?: number;
  name: string;
  badge: string;
  description: string;
  image_url: string;
  highlights: string[];
  pricing: PricingTier[];
  is_active: boolean;
}

const emptyPkg = (): Pkg => ({
  name: "",
  badge: "",
  description: "",
  image_url: "",
  highlights: [""],
  pricing: [{ label: "", price: 0, summary: "" }],
  is_active: true,
});

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Pkg | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API}/api/admin/packages/`);
      const data = await res.json();
      setPackages(data);
    } catch (err) {
      console.error("Failed to fetch packages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const isEdit = !!form.id;
    const url = isEdit ? `${API}/api/admin/packages/${form.id}/` : `${API}/api/admin/packages/`;
    const method = isEdit ? "PUT" : "POST";

    // Clean empty strings from arrays
    const payload = {
      ...form,
      highlights: form.highlights.filter(h => h.trim()),
      pricing: form.pricing.filter(p => p.label.trim()),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      setForm(null);
      fetchPackages();
    } catch (err) {
      alert("Failed to save package.");
    } finally {
      setSaving(false);
    }
  };

  const deletePackage = async (id: number) => {
    try {
      await fetch(`${API}/api/admin/packages/${id}/`, { method: "DELETE" });
      setDeleteId(null);
      fetchPackages();
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  // --- Helpers for form array fields ---
  const updateHighlight = (i: number, val: string) =>
    setForm(f => f ? { ...f, highlights: f.highlights.map((h, idx) => idx === i ? val : h) } : f);

  const addHighlight = () =>
    setForm(f => f ? { ...f, highlights: [...f.highlights, ""] } : f);

  const removeHighlight = (i: number) =>
    setForm(f => f ? { ...f, highlights: f.highlights.filter((_, idx) => idx !== i) } : f);

  const updateTier = (i: number, field: keyof PricingTier, val: string | number) =>
    setForm(f => f ? { ...f, pricing: f.pricing.map((t, idx) => idx === i ? { ...t, [field]: val } : t) } : f);

  const addTier = () =>
    setForm(f => f ? { ...f, pricing: [...f.pricing, { label: "", price: 0, summary: "" }] } : f);

  const removeTier = (i: number) =>
    setForm(f => f ? { ...f, pricing: f.pricing.filter((_, idx) => idx !== i) } : f);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container mx-auto px-6 max-w-5xl pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" /> Package Manager
          </h1>
          <button
            onClick={() => setForm(emptyPkg())}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Package
          </button>
        </div>
        {loading ? (
          <div className="text-center text-primary font-bold animate-pulse py-20">Loading packages...</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No packages yet.</p>
            <button onClick={() => setForm(emptyPkg())} className="mt-4 text-primary font-bold text-sm hover:underline">
              Add your first package
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="relative w-full h-40 bg-gray-50 overflow-hidden">
                  <img
                    src={pkg.image_url || "/assets/placeholder.svg"}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.svg"; }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{pkg.badge}</span>
                      <h3 className="text-xl font-black text-gray-900">{pkg.name}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {pkg.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{pkg.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pkg.pricing.map((t, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-fresh-bg text-primary text-xs font-bold">
                        {t.label} — KES {Number(t.price).toLocaleString()}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-gray-50">
                    <button
                      onClick={() => setForm({ ...pkg })}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(pkg.id!)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit / Add Form Modal */}
      {form && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setForm(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl my-8">
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">{form.id ? "Edit Package" : "New Package"}</h2>
              <button onClick={() => setForm(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Package Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => f ? { ...f, name: e.target.value } : f)}
                    placeholder="e.g. Nyumbani"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Badge Label</label>
                  <input
                    value={form.badge}
                    onChange={e => setForm(f => f ? { ...f, badge: e.target.value } : f)}
                    placeholder="e.g. Monthly groceries"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => f ? { ...f, description: e.target.value } : f)}
                  rows={3}
                  placeholder="What is this package for?"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Image URL</label>
                <input
                  value={form.image_url}
                  onChange={e => setForm(f => f ? { ...f, image_url: e.target.value } : f)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                />
                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-100 h-40 bg-gray-50">
                  <img
                    src={form.image_url || "/assets/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.svg"; }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Preview updates as you type the URL above</p>
              </div>

              {/* Highlights */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Highlights</label>
                  <button onClick={addHighlight} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {form.highlights.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={h}
                        onChange={e => updateHighlight(i, e.target.value)}
                        placeholder="e.g. Groceries & dry foods"
                        className="flex-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none text-sm font-medium"
                      />
                      <button onClick={() => removeHighlight(i)} className="p-2 text-gray-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Tiers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Pricing Tiers</label>
                  <button onClick={addTier} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Tier
                  </button>
                </div>
                <div className="space-y-3">
                  {form.pricing.map((tier, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-fresh-bg border border-emerald-50 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={tier.label}
                          onChange={e => updateTier(i, "label", e.target.value)}
                          placeholder="Tier name e.g. Nyumbani Lite"
                          className="px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-primary focus:outline-none text-sm font-medium"
                        />
                        <input
                          type="number"
                          value={tier.price}
                          onChange={e => updateTier(i, "price", Number(e.target.value))}
                          placeholder="Price in KES"
                          className="px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-primary focus:outline-none text-sm font-medium"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={tier.summary}
                          onChange={e => updateTier(i, "summary", e.target.value)}
                          placeholder="Short description of this tier"
                          className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-primary focus:outline-none text-sm font-medium"
                        />
                        <button onClick={() => removeTier(i)} className="p-2 text-gray-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm(f => f ? { ...f, is_active: !f.is_active } : f)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-bold text-gray-700">{form.is_active ? "Visible on website" : "Hidden from website"}</span>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {saving ? "Saving..." : form.id ? "Save Changes" : "Create Package"}
              </button>
              <button onClick={() => setForm(null)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center">
            <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-900 mb-2">Delete this package?</h3>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => deletePackage(deleteId)}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
