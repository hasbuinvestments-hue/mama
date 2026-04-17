"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, MapPin, ArrowRight, Loader2, Store } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CoordinatorLoginPage() {
  const router = useRouter();
  const [town, setTown] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!town || !pin) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/coordinator/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ town, pin }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("coordinator_session", JSON.stringify({ town, pin, name: data.coordinator.coordinator_name }));
        router.push("/coordinator/dashboard");
      } else {
        setError(data.error || "Invalid login credentials");
      }
    } catch (err) {
      setError("Connection failure. Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
           <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
              <Store className="h-8 w-8 text-white" />
           </div>
           <h1 className="text-3xl font-black text-gray-900 mb-2">Mama Fresh</h1>
           <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Coordinator Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
           <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-5">
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Your Town Hub</label>
                 <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                    <input
                      type="text"
                      value={town}
                      onChange={e => setTown(e.target.value)}
                      placeholder="e.g. Meru"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:outline-none font-bold text-gray-900 transition-all"
                      required
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Access PIN</label>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:outline-none font-black tracking-[0.5em] text-gray-900 transition-all"
                      required
                    />
                 </div>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-black text-center animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !town || !pin}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In to Hub <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
           </div>
        </form>

        <p className="mt-12 text-center text-xs text-gray-400 font-medium">
          Authorised logistics access only.<br />
          Contact Nairobi admin for account issues.
        </p>
      </div>
    </div>
  );
}
