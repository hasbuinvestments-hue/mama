"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Check, Blend } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Mix {
  id?: number;
  title: string;
  slug: string;
  description: string;
  items: string[];
  image_url: string;
  order: number;
}

const emptyMix = (): Mix => ({
  title: "",
  slug: "",
  description: "",
  items: [""],
  image_url: "",
  order: 0,
});

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminMixesPage() {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Mix | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchMixes = async () => {
    try {
      const res = await fetch(`${API}/api/admin/mixes/`);
      const data = await res.json();
      setMixes(data);
    } catch (err) {
      console.error("Failed to fetch mixes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMixes(); }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const isEdit = !!form.id;
    const url = isEdit ? `${API}/api/admin/mixes/${form.id}/` : `${API}/api/admin/mixes/`;
    const method = isEdit ? "PUT" : "POST";
    const payload = {
      ...form,
      items: form.items.filter(i => i.trim()),
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      setForm(null);
      fetchMixes();
    } catch {
      alert("Failed to save mix.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMix = async (id: number) => {
    try {
      await fetch(`${API}/api/admin/mixes/${id}/`, { method: "DELETE" });
      setDeleteId(null);
      fetchMixes();
    } catch {
      alert("Failed to delete.");
    }
  };

  const updateItem = (i: number, val: string) =>
    setForm(f => f ? { ...f, items: f.items.map((item, idx) => idx === i ? val : item) } : f);

  const addItem = () =>
    setForm(f => f ? { ...f, items: [...f.items, ""] } : f);

  const removeItem = (i: number) =>
    setForm(f => f ? { ...f, items: f.items.filter((_, idx) => idx !== i) } : f);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container mx-auto px-6 max-w-4xl pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Blend className="h-6 w-6 text-primary" /> Juice & Smoothie Mixes
          </h1>
          <button
            onClick={() => setForm(emptyMix())}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Mix
          </button>
        </div>

        {loading ? (
          <div className="text-center text-primary font-bold animate-pulse py-20">Loading...</div>
        ) : mixes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Blend className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No mixes yet.</p>
            <button onClick={() => setForm(emptyMix())} className="mt-4 text-primary font-bold text-sm hover:underline">
              Add your first mix
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mixes.map(mix => (
              <div key={mix.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="relative h-32 bg-gray-100 overflow-hidden">
                  <img
                    src={mix.image_url || "/assets/placeholder.svg"}
                    alt={mix.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.svg"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <h3 className="text-white font-black text-lg">{mix.title}</h3>
                    <p className="text-white/70 text-xs">/{mix.slug}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-500 italic mb-3">"{mix.description}"</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {mix.items.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-fresh-bg text-primary text-xs font-bold">{item}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => setForm({ ...mix, items: mix.items.length ? mix.items : [""] })}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(mix.id!)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {form && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setForm(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl my-8">
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">{form.id ? "Edit Mix" : "New Mix"}</h2>
              <button onClick={() => setForm(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Title</label>
                <input
                  value={form.title}
                  onChange={e => {
                    const title = e.target.value;
                    setForm(f => f ? { ...f, title, slug: f.id ? f.slug : toSlug(title) } : f);
                  }}
                  placeholder="e.g. Bright Start"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => f ? { ...f, slug: e.target.value } : f)}
                  placeholder="e.g. bright-start"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium font-mono text-sm"
                />
                <p className="text-[11px] text-gray-400 mt-1">Used in URL: /shop?mix=<strong>{form.slug || "..."}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Short Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => f ? { ...f, description: e.target.value } : f)}
                  placeholder="e.g. A zesty morning blend to kickstart your day"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Ingredients (Product Names)</label>
                  <button onClick={addItem} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">Must match product names exactly (case-insensitive).</p>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={item}
                        onChange={e => updateItem(i, e.target.value)}
                        placeholder="e.g. Carrots"
                        className="flex-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none text-sm font-medium"
                      />
                      <button onClick={() => removeItem(i)} className="p-2 text-gray-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Image URL</label>
                <input
                  value={form.image_url}
                  onChange={e => setForm(f => f ? { ...f, image_url: e.target.value } : f)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                />
                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-100 h-28 bg-gray-50">
                  <img
                    src={form.image_url || "/assets/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.svg"; }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Display Order</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={e => setForm(f => f ? { ...f, order: Number(e.target.value) } : f)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {saving ? "Saving..." : form.id ? "Save Changes" : "Add Mix"}
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
            <h3 className="text-xl font-black text-gray-900 mb-2">Delete this mix?</h3>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteMix(deleteId)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">
                Yes, Delete
              </button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
