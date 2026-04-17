"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Check, MapPin, Phone, ShieldCheck } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface TownCoordinator {
  id?: number;
  town: string;
  coordinator_name: string;
  whatsapp_number: string;
  pin: string;
  is_active: boolean;
}

const emptyCoordinator = (): TownCoordinator => ({
  town: "",
  coordinator_name: "",
  whatsapp_number: "",
  pin: "",
  is_active: true,
});

export default function AdminCoordinatorsPage() {
  const [coordinators, setCoordinators] = useState<TownCoordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<TownCoordinator | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCoordinators = async () => {
    try {
      const res = await fetch(`${API}/api/admin/coordinators/`);
      const data = await res.json();
      setCoordinators(data);
    } catch (err) {
      console.error("Failed to fetch coordinators", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoordinators(); }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const isEdit = !!form.id;
    const url = isEdit ? `${API}/api/admin/coordinators/${form.id}/` : `${API}/api/admin/coordinators/`;
    const method = isEdit ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      setForm(null);
      fetchCoordinators();
    } catch {
      alert("Failed to save coordinator.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCoordinator = async (id: number) => {
    try {
      await fetch(`${API}/api/admin/coordinators/${id}/`, { method: "DELETE" });
      setDeleteId(null);
      fetchCoordinators();
    } catch {
      alert("Failed to delete.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container mx-auto px-6 max-w-5xl pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" /> Town Coordinator Hub
          </h1>
          <button
            onClick={() => setForm(emptyCoordinator())}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Coordinator
          </button>
        </div>

        {loading ? (
          <div className="text-center text-primary font-bold animate-pulse py-20">Loading coordinators...</div>
        ) : coordinators.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No town coordinators yet.</p>
            <button onClick={() => setForm(emptyCoordinator())} className="mt-4 text-primary font-bold text-sm hover:underline">
              Add your first one
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coordinators.map(coord => (
              <div key={coord.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-black text-gray-900">{coord.town}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${coord.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {coord.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 font-medium">
                      <Phone className="h-3 w-3" /> {coord.whatsapp_number || "No contact yet"}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                   <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary border border-gray-100">
                         <Check className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                         <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1">Coordinator</p>
                         <p className="text-sm font-bold text-gray-900">{coord.coordinator_name}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-amber-500 border border-gray-100">
                         <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                         <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1">Access PIN</p>
                         <p className="text-sm font-black text-gray-900 tracking-[0.2em] font-mono leading-none">••••••</p>
                      </div>
                   </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...coord })}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(coord.id!)}
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
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
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">{form.id ? "Edit Coordinator" : "New Coordinator"}</h2>
              <button onClick={() => setForm(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Town Name</label>
                <input
                  value={form.town}
                  onChange={e => setForm(f => f ? { ...f, town: e.target.value } : f)}
                  placeholder="e.g. Meru"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Coordinator Name</label>
                <input
                  value={form.coordinator_name}
                  onChange={e => setForm(f => f ? { ...f, coordinator_name: e.target.value } : f)}
                  placeholder="e.g. John Kamau"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp</label>
                  <input
                    value={form.whatsapp_number}
                    onChange={e => setForm(f => f ? { ...f, whatsapp_number: e.target.value } : f)}
                    placeholder="254..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-medium text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Access PIN</label>
                  <input
                    value={form.pin}
                    onChange={e => setForm(f => f ? { ...f, pin: e.target.value } : f)}
                    placeholder="6 digits"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:outline-none font-black tracking-widest text-center text-gray-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <button
                  onClick={() => setForm(f => f ? { ...f, is_active: !f.is_active } : f)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${form.is_active ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <div>
                  <p className="text-sm font-black text-primary">Active Status</p>
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Controls access to dashboard</p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-white font-black hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                <Check className="h-5 w-5" />
                {saving ? "..." : form.id ? "Update Coordinator" : "Create Coordinator"}
              </button>
              <button onClick={() => setForm(null)} className="px-6 py-4 rounded-xl bg-white border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-colors">
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
          <div className="relative bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full text-center overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
               <Trash2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Remove Coordinator?</h3>
            <p className="text-gray-500 text-sm font-medium mb-8 px-4">They will lose all access to their collection dashboard immediately.</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteCoordinator(deleteId)}
                className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Remove
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-colors"
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
