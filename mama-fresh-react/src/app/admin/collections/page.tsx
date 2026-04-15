"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Check, LayoutGrid } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Collection {
  id?: number;
  title: string;
  description: string;
  product_names: string[];
  is_active: boolean;
  order: number;
}

const emptyCollection = (): Collection => ({
  title: "",
  description: "",
  product_names: [""],
  is_active: true,
  order: 0,
});

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Collection | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${API}/api/admin/collections/`);
      const data = await res.json();
      setCollections(data);
    } catch (err) {
      console.error("Failed to fetch collections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCollections(); }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const isEdit = !!form.id;
    const url = isEdit ? `${API}/api/admin/collections/${form.id}/` : `${API}/api/admin/collections/`;
    const method = isEdit ? "PUT" : "POST";
    const payload = {
      ...form,
      product_names: form.product_names.filter(n => n.trim()),
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      setForm(null);
      fetchCollections();
    } catch {
      alert("Failed to save collection.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCollection = async (id: number) => {
    try {
      await fetch(`${API}/api/admin/collections/${id}/`, { method: "DELETE" });
      setDeleteId(null);
      fetchCollections();
    } catch {
      alert("Failed to delete.");
    }
  };

  const updateName = (i: number, val: string) =>
    setForm(f => f ? { ...f, product_names: f.product_names.map((n, idx) => idx === i ? val : n) } : f);

  const addName = () =>
    setForm(f => f ? { ...f, product_names: [...f.product_names, ""] } : f);

  const removeName = (i: number) =>
    setForm(f => f ? { ...f, product_names: f.product_names.filter((_, idx) => idx !== i) } : f);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container mx-auto px-6 max-w-4xl pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary" /> Collections
          </h1>
          <button
            onClick={() => setForm(emptyCollection())}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Collection
          </button>
        </div>

        {loading ? (
          <div className="text-center text-primary font-bold animate-pulse py-20">Loading...</div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <LayoutGrid className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No collections yet.</p>
            <button onClick={() => setForm(emptyCollection())} className="mt-4 text-primary font-bold text-sm hover:underline">
              Add your first collection
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map(col => (
              <div key={col.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${!col.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-gray-900 text-lg">{col.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${col.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {col.is_active ? 'Visible' : 'Hidden'}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 uppercase">Order: {col.order}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{col.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {col.product_names.map((n, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-fresh-bg text-primary text-xs font-bold">{n}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setForm({ ...col, product_names: col.product_names.length ? col.product_names : [""] })}
                      className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(col.id!)}
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
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
              <h2 className="text-xl font-black text-gray-900">{form.id ? "Edit Collection" : "New Collection"}</h2>
              <button onClick={() => setForm(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => f ? { ...f, title: e.target.value } : f)}
                  placeholder="e.g. Breakfast Basket"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => f ? { ...f, description: e.target.value } : f)}
                  rows={2}
                  placeholder="Short description of this collection"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Product Names</label>
                  <button onClick={addName} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">Must match product names exactly (case-insensitive).</p>
                <div className="space-y-2">
                  {form.product_names.map((n, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={n}
                        onChange={e => updateName(i, e.target.value)}
                        placeholder="e.g. Tomatoes"
                        className="flex-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none text-sm font-medium"
                      />
                      <button onClick={() => removeName(i)} className="p-2 text-gray-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Display Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={e => setForm(f => f ? { ...f, order: Number(e.target.value) } : f)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setForm(f => f ? { ...f, is_active: !f.is_active } : f)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm font-bold text-gray-700">{form.is_active ? "Visible" : "Hidden"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {saving ? "Saving..." : form.id ? "Save Changes" : "Add Collection"}
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
            <h3 className="text-xl font-black text-gray-900 mb-2">Delete this collection?</h3>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteCollection(deleteId)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">
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
