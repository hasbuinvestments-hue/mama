"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, Send, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [orderLoading, setOrderLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    location: "",
    zone: "Nairobi",
  });

  const deliveryFees: Record<string, number> = {
    Nairobi: 200,
    Chuka: 50,
    Nyeri: 150,
  };
  const deliveryFee = deliveryFees[customerData.zone] ?? 200;

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  const handleWhatsAppCheckout = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!customerData.name || !customerData.phone || !customerData.location) {
      alert("Please fill in all delivery details.");
      return;
    }

    setOrderLoading(true);

    try {
      // 1. Send Order to Django Backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerData.name,
          phone: customerData.phone,
          location: customerData.location,
          deliveryType: customerData.zone === 'Nairobi' ? 'Parcel' : 'Local',
          cart: cart
        })
      });

      if (!response.ok) throw new Error("Failed to save order");
      const data = await response.json();

      // 2. Clear Cart and Redirect to Success
      clearCart();
      window.location.href = `/cart/success?orderId=${data.order_id}&name=${encodeURIComponent(customerData.name)}`;

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again or contact us on WhatsApp.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your basket is empty</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            It looks like you haven't added any fresh groceries to your basket yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Start Shopping
          </Link>
      </div>
    );
  }

  return (
    <div className="bg-fresh-bg min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            Your Shopping <span className="text-primary italic">Basket</span>
          </h1>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            Saved on this device — your basket stays even if you close the tab
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
          {/* Cart Items */}
          <div className="lg:col-span-7 space-y-4 mb-8 lg:mb-0">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-white hover:border-emerald-100 transition-all group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)} / {item.unit}</p>
                  </div>
                  
                  <div className="flex items-center bg-gray-50 rounded-2xl p-1 gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-gray-500 transition-all"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-primary transition-all"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-right min-w-[100px]">
                    <p className="font-black text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs font-bold text-red-400 hover:text-red-600 mt-1 uppercase tracking-widest transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-6 flex justify-between items-center text-gray-400">
              <button 
                onClick={clearCart}
                className="text-xs font-black uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Clear all items
              </button>
              <p className="text-xs font-medium italic">All produce is picked fresh for your order.</p>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 sticky top-24 border border-white">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Details</h2>
              
              <form onSubmit={handleWhatsAppCheckout} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Your Name</label>
                  <input
                    required
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-6 py-4 rounded-2xl bg-fresh-bg border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                      placeholder="07..."
                      className="w-full px-6 py-4 rounded-2xl bg-fresh-bg border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Area / Zone</label>
                    <select
                      value={customerData.zone}
                      onChange={(e) => setCustomerData({ ...customerData, zone: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-fresh-bg border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-medium appearance-none"
                    >
                      <option>Nairobi</option>
                      <option>Chuka</option>
                      <option>Nyeri</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Delivery Location</label>
                  <textarea
                    required
                    rows={2}
                    value={customerData.location}
                    onChange={(e) => setCustomerData({ ...customerData, location: e.target.value })}
                    placeholder="Apartment name, house number, area details..."
                    className="w-full px-6 py-4 rounded-2xl bg-fresh-bg border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-medium resize-none"
                  />
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                    <span>Delivery ({customerData.zone})</span>
                    <span className="font-bold text-gray-700">{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-black text-gray-900 pt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(cartTotal + deliveryFee)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={orderLoading}
                  className="w-full mt-8 inline-flex items-center justify-center px-8 py-5 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/30 hover:bg-emerald-700 active:scale-95 transition-all gap-2 group disabled:opacity-60"
                >
                  <Send className="h-5 w-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                  {orderLoading ? "Placing Order..." : "Place My Order"}
                </button>
                <p className="text-[10px] text-gray-400 text-center font-medium mt-4 leading-tight uppercase tracking-widest px-4">
                  You will receive M-Pesa payment instructions after placing your order.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
