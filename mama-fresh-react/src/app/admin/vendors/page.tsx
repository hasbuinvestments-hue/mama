"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Check, Users } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Vendor {
  id?: number;
  full_name: string;
  stall_number: string;
  whatsapp_number: string;
  bio: string;
  profile_image: string;
  is_active: boolean;
}

const emptyVendor = (): Vendor => ({
  full_name: "",
  stall_number: "",
  whatsapp_number: "",
  bio: "",
  profile_image: "",
  is_active: true,
});

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Vendor | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${API}/api/vendors/`);
      const data = await res.json();
      setVendors(data);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const isEdit = !!form.id;
    const url = isEdit ? `${API}/api/vendors/${form.id}/` : `${API}/api/vendors/`;
    const method = isEdit ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      setForm(null);
      fetchVendors();
    } catch {
      alert("Failed to save vendor.");
    } finally {
      setSaving(false);
    }
  };

  const deleteVendor = async (id: number) => {
    try {
      await fetch(`${API}/api/vendors/${id}/`, { method: "DELETE" });
      setDeleteId(null);
      fetchVendors();
    } catch {
      alert("Failed to delete.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container mx-auto px-6 max-w-5xl pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Farmer / Vendor Manager
          </h1>
          <button
            onClick={() => setForm(emptyVendor())}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Farmer
          </button>
        </div>

        {loading ? (
          <div className="text-center text-primary font-bold animate-pulse py-20">Loading farmers...</div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No farmers yet.</p>
            <button onClick={() => setForm(emptyVendor())} className="mt-4 text-primary font-bold text-sm hover:underline">
              Add your first farmer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vendors.map(vendor => (
              <div key={vendor.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 p-6">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={vendor.profile_image || "/assets/placeholder.svg"}
                      alt={vendor.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.svg"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-black text-gray-900 truncate">{vendor.full_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex-shrink-0 ${vendor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {vendor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{vendor.stall_number}</p>
                    <p className="text-xs text-gray-400">{vendor.whatsapp_number}</p>
                  </div>
                </div>
                {vendor.bio && (
                  <p className="px-6 pb-4 text-sm text-gray-500 line-clamp-2">{vendor.bio}</p>
                )}
                <div className="flex gap-3 px-6 pb-6 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => setForm({ ...vendor })}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(vendor.id!)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
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
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl my-8">
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">{form.id ? "Edit Farmer" : "New Farmer"}</h2>
              <button onClick={() => setForm(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  value={form.full_name}
                  onChange={e => setForm(f => f ? { ...f, full_name: e.target.value } : f)}
                  placeholder="e.g. Mary Wanjiku"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Stall Number</label>
                  <input
                    value={form.stall_number}
                    onChange={e => setForm(f => f ? { ...f, stall_number: e.target.value } : f)}
                    placeholder="e.g. Stall 4B"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp Number</label>
                  <input
                    value={form.whatsapp_number}
                    onChange={e => setForm(f => f ? { ...f, whatsapp_number: e.target.value } : f)}
                    placeholder="e.g. 254712345678"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => f ? { ...f, bio: e.target.value } : f)}
                  rows={3}
                  placeholder="Short description of this farmer..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Profile Image URL</label>
                <input
                  value={form.profile_image}
                  onChange={e => setForm(f => f ? { ...f, profile_image: e.target.value } : f)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium"
                />
                {form.profile_image && (
                  <div className="mt-3 h-24 w-24 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                    <img
                      src={form.profile_image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/assets/placeholder.svg"; }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm(f => f ? { ...f, is_active: !f.is_active } : f)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-bold text-gray-700">{form.is_active ? "Active — receives orders" : "Inactive — skipped in rotation"}</span>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {saving ? "Saving..." : form.id ? "Save Changes" : "Add Farmer"}
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
            <h3 className="text-xl font-black text-gray-900 mb-2">Delete this farmer?</h3>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteVendor(deleteId)}
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
