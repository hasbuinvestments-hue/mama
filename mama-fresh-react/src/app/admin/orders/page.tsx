"use client";

import { useEffect, useState } from "react";
import { Phone, MapPin, Send, CheckCircle, ChevronRight, User, Store, RefreshCw } from "lucide-react";


interface Order {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  location: string;
  total_price: number;
  status: string;
  payment_status: string;
  mpesa_code: string | null;
  items: any[];
  vendor_assignments: {
    splits: any[];
    backups: Record<string, any>;
    manager_message: string;
  };
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: string, value: string) => {
    const isPaid = value === 'PAID';
    const body = isPaid ? { payment_status: 'PAID' } : { status: value };
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      fetchOrders();
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder(prev => prev
          ? isPaid ? { ...prev, payment_status: 'PAID' } : { ...prev, status: value }
          : null
        );
      }
    } catch (err) {
      alert("Failed to update");
    }
  };

  const openVendorWhatsApp = (vendor: any, items: any[]) => {
    const itemsList = items.map((item) => `• ${item.name} × ${item.quantity} ${item.unit}`).join("\n");
    const message = [
      `Hello ${vendor.name},`,
      `Mama Fresh Order #${selectedOrder?.order_id}`,
      `Stall: ${vendor.stall}`,
      "━━━━━━━━━━━━━━━━",
      itemsList,
      "━━━━━━━━━━━━━━━━",
      "Please prepare these items for pickup."
    ].join("\n");

    const url = `https://wa.me/${vendor.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const openCustomerWhatsApp = (order: Order) => {
    const message = `Hi ${order.customer_name}, Mama Fresh has received your order ${order.order_id} and we are preparing it now! We'll notify you when it's dispatched.`;
    const url = `https://wa.me/${order.customer_phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Order Hub...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="container mx-auto px-6 max-w-5xl flex items-center justify-between mb-10">
          <div>
            <span className="text-primary font-black uppercase tracking-widest text-xs mb-1 block">Live Queue</span>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              Order Hub
            </h1>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Order Queue */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Pending Orders ({orders.filter(o => o.status === 'PENDING').length})</h2>
            {orders.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl text-center border-2 border-dashed border-gray-200 text-gray-400 font-medium">
                No orders yet.
              </div>
            ) : (
              orders.map(order => (
                <button
                  key={order.order_id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-left p-6 rounded-3xl transition-all border ${
                    selectedOrder?.order_id === order.order_id 
                      ? "bg-white border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/20" 
                      : "bg-white border-transparent shadow-sm hover:border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-black text-primary uppercase tracking-tighter">#{order.order_id}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                      order.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{order.customer_name}</h3>
                  <div className="flex items-center gap-4 mt-4 text-xs font-medium text-gray-400">
                    <span className="flex items-center gap-1 font-black text-gray-700">KES {(order.total_price || 0).toLocaleString()}</span>
                    <span>•</span>
                    <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Order Details */}
          <div className="lg:col-span-7">
            {selectedOrder ? (
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-24">
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-10 pb-10 border-b border-gray-100">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Order {selectedOrder.order_id}</h2>
                    <div className="space-y-2 mt-4 text-gray-600 font-medium">
                      <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" />{selectedOrder.customer_name}</div>
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{selectedOrder.customer_phone}</div>
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" />{selectedOrder.location}</div>
                    </div>
                    {/* Payment status */}
                    <div className="mt-4 flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                        selectedOrder.payment_status === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-50 text-red-500'
                      }`}>
                        {selectedOrder.payment_status === 'PAID' ? 'PAID' : 'AWAITING PAYMENT'}
                      </span>
                      {selectedOrder.mpesa_code && (
                        <span className="text-xs font-black text-gray-500 tracking-widest">
                          M-Pesa: {selectedOrder.mpesa_code}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => openCustomerWhatsApp(selectedOrder)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-fresh-bg text-primary font-bold hover:bg-primary hover:text-white transition-all text-sm"
                    >
                      <Send className="h-4 w-4" /> Notify Customer
                    </button>
                    {selectedOrder.payment_status !== 'PAID' && (
                      <button
                        onClick={() => updateStatus(selectedOrder.order_id, 'PAID')}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all text-sm"
                      >
                        <CheckCircle className="h-4 w-4" /> Mark as Paid
                      </button>
                    )}
                    {selectedOrder.status === 'PENDING' && (
                      <button
                        onClick={() => updateStatus(selectedOrder.order_id, 'CONFIRMED')}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-emerald-700 transition-all text-sm"
                      >
                        <CheckCircle className="h-4 w-4" /> Mark Confirmed
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(selectedOrder.order_id, 'CANCELLED')}
                      className="text-gray-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest mt-2"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>

                <div className="space-y-10">
                  {selectedOrder.vendor_assignments.splits.map((group: any, idx: number) => (
                    <div key={idx} className="relative p-6 rounded-2xl bg-fresh-bg border border-emerald-50">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">Category: {group.vendor.category}</span>
                          <h4 className="text-xl font-bold text-gray-900">{group.vendor.name} — {group.vendor.stall}</h4>
                        </div>
                        <button 
                          onClick={() => openVendorWhatsApp(group.vendor, group.items)}
                          className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-sm hover:shadow-lg hover:scale-105 transition-all"
                        >
                          <Send className="h-6 w-6" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {group.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-gray-700">{item.name} × {item.quantity} {item.unit}</span>
                            <span className="text-gray-400 font-medium">KES {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <ChevronRight className="h-10 w-10 text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select an order</h3>
                <p className="text-gray-400 max-w-xs">Pick an order from the queue to see the vendor split and begin distribution.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
