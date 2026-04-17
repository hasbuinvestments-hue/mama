"use client";

import { useEffect, useState } from "react";
import { Package, Clock, CheckCircle, XCircle, TrendingUp, ChevronDown, ChevronUp, AlertTriangle, Send, Check } from "lucide-react";
import { OrderBatch } from "@/types";

interface OrderItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface Order {
  order_id: string;
  customer_name: string;
  location: string;
  total_price: number;
  status: string;
  payment_status: string;
  mpesa_code: string | null;
  items: OrderItem[];
  created_at: string;
  batch_detail?: OrderBatch;
}

interface FrequentItem {
  name: string;
  count: number;
}

type Tab = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED";

const STATUS_CONFIG: Record<string, { label: string; icon: React.JSX.Element; bg: string; text: string }> = {
  PENDING: {
    label: "Pending",
    icon: <Clock className="h-3.5 w-3.5" />,
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  CONFIRMED: {
    label: "Delivered",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <XCircle className="h-3.5 w-3.5" />,
    bg: "bg-red-100",
    text: "text-red-500",
  },
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [frequent, setFrequent] = useState<FrequentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [complaintForm, setComplaintForm] = useState<{ orderId: string; product: string; reason: string } | null>(null);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintSent, setComplaintSent] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/history/`)
      .then(r => r.json())
      .then(data => {
        setOrders(data.orders || []);
        setFrequent(data.frequent_items || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const submitComplaint = async () => {
    if (!complaintForm) return;
    setSubmittingComplaint(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/complaints/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: complaintForm.orderId,
          product_name: complaintForm.product,
          reason: complaintForm.reason,
          vendor: 1,
        }),
      });
      setComplaintSent(complaintForm.orderId);
      setComplaintForm(null);
    } catch {
      alert("Failed to submit complaint.");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const filtered = tab === "ALL" ? orders : orders.filter(o => o.status === tab);

  const counts = {
    ALL: orders.length,
    PENDING: orders.filter(o => o.status === "PENDING").length,
    CONFIRMED: orders.filter(o => o.status === "CONFIRMED").length,
    CANCELLED: orders.filter(o => o.status === "CANCELLED").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="text-primary font-black uppercase tracking-widest text-xs mb-1 block">Your Account</span>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Order History
          </h1>
          <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-700 w-fit">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            No login needed — orders are linked to this device automatically
          </div>
        </div>

        {/* Frequently Ordered */}
        {frequent.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Your Favourites</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {frequent.map(item => (
                <span
                  key={item.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-fresh-bg text-primary text-xs font-bold"
                >
                  {item.name}
                  <span className="bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black">
                    {item.count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(["ALL", "PENDING", "CONFIRMED", "CANCELLED"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                tab === t
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white text-gray-500 border border-gray-100 hover:border-gray-200"
              }`}
            >
              {t === "ALL" ? "All" : STATUS_CONFIG[t].label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[9px] ${tab === t ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {counts[t]}
              </span>
            </button>
          ))}
        </div>

        {/* Order List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-gray-700 mb-1">No orders here</h3>
            <p className="text-sm text-gray-400">
              {tab === "ALL"
                ? "You haven't placed any orders from this device yet."
                : `No ${STATUS_CONFIG[tab]?.label.toLowerCase()} orders found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const isExpanded = expanded === order.order_id;

              return (
                <div
                  key={order.order_id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Order Row */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : order.order_id)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-black text-primary uppercase tracking-tight">
                          #{order.order_id}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                        {order.payment_status === "PAID" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-500">
                            Unpaid
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">{order.customer_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-black text-gray-900">
                        KES {Number(order.total_price).toLocaleString()}
                      </p>
                      <div className="flex justify-end mt-1">
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4 text-gray-400" />
                          : <ChevronDown className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                    </div>
                  </button>

                  {/* Tracking Progress Bar */}
                  {order.batch_detail && order.status !== 'CANCELLED' && (
                    <div className="px-5 py-6 bg-fresh-bg/30 border-t border-gray-50">
                        <div className="relative flex justify-between items-center max-w-sm mx-auto">
                            {/* Lines */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-gray-200 -z-10" />
                            <div 
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-1000 -z-10" 
                                style={{ width: 
                                    order.batch_detail.dispatched_to_customers_at ? '100%' :
                                    order.batch_detail.arrived_nairobi_at ? '66%' :
                                    order.batch_detail.pickup_confirmed_at ? '33%' : '0%'
                                }}
                            />

                            {[
                                { id: 'placed', label: 'Placed', active: true },
                                { id: 'picked', label: 'Picked Up', active: !!order.batch_detail.pickup_confirmed_at },
                                { id: 'transit', label: 'In Transit', active: !!order.batch_detail.arrived_nairobi_at },
                                { id: 'delivered', label: 'Delivered', active: order.batch_detail.status === 'DELIVERED' }
                            ].map((step, idx) => (
                                <div key={step.id} className="flex flex-col items-center gap-1.5">
                                    <div className={`h-4 w-4 rounded-full border-2 transition-all ${
                                        step.active ? 'bg-primary border-primary scale-125' : 'bg-white border-gray-300'
                                    }`}>
                                        {step.active && <Check className="h-2.5 w-2.5 text-white mx-auto mt-0.5" />}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-tighter ${step.active ? 'text-primary' : 'text-gray-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}

                  {/* Expanded Items */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Items Ordered</h4>
                      <div className="space-y-2">
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-700">
                              {item.name} × {item.quantity} {item.unit}
                            </span>
                            <span className="text-gray-400 font-medium">
                              KES {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                      {order.mpesa_code && (
                        <div className="mt-4 pt-3 border-t border-gray-50">
                          <p className="text-xs text-gray-500 font-medium">
                            M-Pesa Code: <span className="font-black text-gray-800 tracking-widest">{order.mpesa_code}</span>
                          </p>
                        </div>
                      )}
                      {/* Complaint Section */}
                      {complaintSent === order.order_id ? (
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-bold">Complaint submitted — we'll follow up shortly.</span>
                        </div>
                      ) : complaintForm?.orderId === order.order_id ? (
                        <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Report an Issue</p>
                          <select
                            value={complaintForm.product}
                            onChange={e => setComplaintForm(f => f ? { ...f, product: e.target.value } : f)}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium focus:border-primary focus:outline-none"
                          >
                            <option value="">Select item with issue</option>
                            {(order.items || []).map((item, i) => (
                              <option key={i} value={item.name}>{item.name}</option>
                            ))}
                          </select>
                          <textarea
                            value={complaintForm.reason}
                            onChange={e => setComplaintForm(f => f ? { ...f, reason: e.target.value } : f)}
                            placeholder="Describe the issue (e.g. rotten, wrong quantity...)"
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium focus:border-primary focus:outline-none resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={submitComplaint}
                              disabled={submittingComplaint || !complaintForm.product || !complaintForm.reason}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs disabled:opacity-40 hover:bg-red-700 transition-colors"
                            >
                              <Send className="h-3 w-3" />
                              {submittingComplaint ? "Sending..." : "Submit"}
                            </button>
                            <button
                              onClick={() => setComplaintForm(null)}
                              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-gray-50">
                          <button
                            onClick={() => setComplaintForm({ orderId: order.order_id, product: "", reason: "" })}
                            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" /> Report an issue with this order
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
