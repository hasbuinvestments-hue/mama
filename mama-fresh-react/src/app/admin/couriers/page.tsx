"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Check, Truck } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Courier {
  id?: number;
  name: string;
  phone_number: string;
  is_active: boolean;
}

const emptyCourier = (): Courier => ({ name: "", phone_number: "", is_active: true });

export default function AdminCouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Courier | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCouriers = async () => {
    try {
      const res = await fetch(`${API}/api/couriers/`);
      const data = await res.json();
      setCouriers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCouriers(); }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const isEdit = !!form.id;
    const url = isEdit ? `${API}/api/couriers/${form.id}/` : `${API}/api/couriers/`;
    const method = isEdit ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setForm(null);
      fetchCouriers();
    } catch {
      alert("Failed to save courier.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCourier = async (id: number) => {
    try {
      await fetch(`${API}/api/couriers/${id}/`, { method: "DELETE" });
      setDeleteId(null);
      fetchCouriers();
    } catch {
      alert("Failed to delete.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container mx-auto px-6 max-w-4xl pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> Courier Management
          </h1>
          <button
            onClick={() => setForm(emptyCourier())}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Courier
          </button>
        </div>

        {loading ? (
          <div className="text-center text-primary font-bold animate-pulse py-20">Loading couriers...</div>
        ) : couriers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No couriers yet.</p>
            <button onClick={() => setForm(emptyCourier())} className="mt-4 text-primary font-bold text-sm hover:underline">
              Add your first courier
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Name</th>
                  <th className="text-left px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Phone</th>
                  <th className="text-left px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {couriers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                    <td className="px-4 py-4 text-gray-500">{c.phone_number}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setForm({ ...c })} className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(c.id!)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
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

      {form && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setForm(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">{form.id ? "Edit Courier" : "New Courier"}</h2>
              <button onClick={() => setForm(null)} className="p-2 rounded-xl hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => f ? { ...f, name: e.target.value } : f)}
                  placeholder="e.g. Peter Mwangi"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                <input
                  value={form.phone_number}
                  onChange={e => setForm(f => f ? { ...f, phone_number: e.target.value } : f)}
                  placeholder="254..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm(f => f ? { ...f, is_active: !f.is_active } : f)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? "bg-primary" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-7" : "translate-x-1"}`} />
                </button>
                <span className="text-sm font-bold text-gray-700">{form.is_active ? "Active — available for batches" : "Inactive"}</span>
              </div>
            </div>
            <div className="p-8 border-t border-gray-100 flex gap-3">
              <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                <Check className="h-4 w-4" /> {saving ? "Saving..." : form.id ? "Save Changes" : "Add Courier"}
              </button>
              <button onClick={() => setForm(null)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center">
            <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-900 mb-2">Delete this courier?</h3>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteCourier(deleteId)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">Yes, Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
