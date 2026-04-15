"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Check, ShoppingBag, Star } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id?: number;
  name: string;
  category: number | string;
  category_name?: string;
  unit: string;
  price: string;
  sale_price: string;
  image_url: string;
  is_top_seller: boolean;
}

const emptyProduct = (): Product => ({
  name: "",
  category: "",
  unit: "",
  price: "",
  sale_price: "",
  image_url: "",
  is_top_seller: false,
});

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetchAll = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`${API}/api/products/`),
        fetch(`${API}/api/categories/`),
      ]);
      const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
      setProducts(pData);
      setCategories(cData);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const isEdit = !!form.id;
    const url = isEdit ? `${API}/api/products/${form.id}/` : `${API}/api/products/`;
    const method = isEdit ? "PUT" : "POST";
    const payload = {
      ...form,
      sale_price: form.sale_price || null,
      image_url: form.image_url || null,
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      setForm(null);
      fetchAll();
    } catch {
      alert("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await fetch(`${API}/api/products/${id}/`, { method: "DELETE" });
      setDeleteId(null);
      fetchAll();
    } catch {
      alert("Failed to delete.");
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container mx-auto px-6 max-w-5xl pt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" /> Product Manager
          </h1>
          <button
            onClick={() => setForm(emptyProduct())}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products or categories..."
          className="w-full mb-6 px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary focus:outline-none font-medium"
        />

        {loading ? (
          <div className="text-center text-primary font-bold animate-pulse py-20">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{search ? "No products match your search." : "No products yet."}</p>
            {!search && (
              <button onClick={() => setForm(emptyProduct())} className="mt-4 text-primary font-bold text-sm hover:underline">
                Add your first product
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="text-left px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="text-left px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Unit</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={product.image_url || "/assets/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.svg"; }}
                          />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900">{product.name}</span>
                          {product.is_top_seller && (
                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black">
                              <Star className="h-2.5 w-2.5" /> Top
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-500 hidden md:table-cell">{product.category_name}</td>
                    <td className="px-4 py-4 font-bold text-gray-900">
                      KES {Number(product.price).toLocaleString()}
                      {product.sale_price && (
                        <span className="ml-2 text-xs text-red-500 font-bold">→ KES {Number(product.sale_price).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-400 hidden sm:table-cell">{product.unit}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setForm({ ...product, sale_price: product.sale_price || "" })}
                          className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id!)}
                          className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Edit / Add Form Modal */}
      {form && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setForm(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl my-8">
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">{form.id ? "Edit Product" : "New Product"}</h2>
              <button onClick={() => setForm(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => f ? { ...f, name: e.target.value } : f)}
                    placeholder="e.g. Tomatoes"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => f ? { ...f, category: e.target.value } : f)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Unit</label>
                  <input
                    value={form.unit}
                    onChange={e => setForm(f => f ? { ...f, unit: e.target.value } : f)}
                    placeholder="e.g. kg, bunch, piece"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price (KES)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => f ? { ...f, price: e.target.value } : f)}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Sale Price (optional)</label>
                  <input
                    type="number"
                    value={form.sale_price}
                    onChange={e => setForm(f => f ? { ...f, sale_price: e.target.value } : f)}
                    placeholder="Leave blank if not on sale"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                  />
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
                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-100 h-32 bg-gray-50">
                  <img
                    src={form.image_url || "/assets/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.svg"; }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm(f => f ? { ...f, is_top_seller: !f.is_top_seller } : f)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.is_top_seller ? 'bg-amber-400' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_top_seller ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400" />
                  {form.is_top_seller ? "Marked as Top Seller" : "Not a Top Seller"}
                </span>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {saving ? "Saving..." : form.id ? "Save Changes" : "Add Product"}
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
            <h3 className="text-xl font-black text-gray-900 mb-2">Delete this product?</h3>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteProduct(deleteId)}
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
