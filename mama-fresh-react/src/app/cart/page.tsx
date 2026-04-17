"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, Send, ShoppingBag, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { TownCoordinator } from "@/types";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [orderError, setOrderError] = useState<string | null>(null);
  
  const API = process.env.NEXT_PUBLIC_API_URL;

  const validatePhone = (phone: string) => {
    return /^\+?1?\d{9,15}$/.test(phone);
  };

  useEffect(() => {
    // 1. Fetch Delivery Zones
    fetch(`${API}/api/towns/`)
      .then(res => res.json())
      .then(data => setTowns(data))
      .catch(err => console.error("Failed to fetch towns", err));

    // 2. Fetch Site Config
    fetch(`${API}/api/config/`)
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error("Failed to fetch config", err));
  }, [API]);

  const selectedTown = towns.find(t => t.town === customerData.zone);
  const deliveryFee = selectedTown ? parseFloat(selectedTown.delivery_fee) : 200;

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  const handleWhatsAppCheckout = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!customerData.name || !customerData.phone || !customerData.location) {
      setOrderError("Please fill in all delivery details.");
      return;
    }

    if (!validatePhone(customerData.phone)) {
      setOrderError("Please enter a valid phone number (e.g., 0712345678 or +254...).");
      return;
    }

    setOrderLoading(true);

    try {
      // 1. Send Order to Django Backend
      const response = await fetch(`${API}/api/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerData.name,
          phone: customerData.phone,
          location: customerData.location,
          zone: customerData.zone,
          deliveryType: customerData.zone === 'Nairobi' ? 'Parcel' : 'Local',
          is_express: isExpress,
          referral_code: referralCode,
          cart: cart
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.phone?.[0] || errorData.detail || "Failed to save order");
      }
      
      const data = await response.json();

      // 2. Handle Subscriptions if any
      const subscriptions = cart.filter(item => !!item.subscription);
      for (const subItem of subscriptions) {
        if (!subItem.subscription) continue;
        
        // Find zone ID - might need to fetch IDs if towns only has names
        // For simplicity, we'll assume the backend can handle town name or we use the 'id' from the list
        const zoneId = towns.find(t => t.town === customerData.zone)?.id;
        
        await fetch(`${API}/api/subscriptions/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer_name: customerData.name,
                customer_phone: customerData.phone,
                delivery_zone: zoneId,
                package: parseInt(subItem.subscription.packageId),
                package_tier: subItem.subscription.tier,
                frequency: subItem.subscription.frequency,
                next_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
                status: 'ACTIVE'
            })
        });
      }

      // 3. Clear Cart and Redirect to Success
      clearCart();
      window.location.href = `/cart/success?orderId=${data.order_id}&name=${encodeURIComponent(customerData.name)}`;

    } catch (err: any) {
      console.error(err);
      setOrderError(err.message || "Something went wrong. Please try again or contact us on WhatsApp.");
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
                      {towns.map((town) => (
                        <option key={town.id} value={town.town}>{town.town}</option>
                      ))}
                      {towns.length === 0 && <option>Nairobi</option>}
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

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Referral Code (Optional)</label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Got a code from a friend?"
                    className="w-full px-6 py-4 rounded-2xl bg-fresh-bg border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all font-medium uppercase tracking-wider"
                    maxLength={6}
                  />
                  {referralCode.length > 0 && referralCode.length < 6 && (
                    <p className="mt-1 ml-2 text-xs text-amber-500 font-medium">Codes are usually 6 characters long.</p>
                  )}
                </div>

                <div className="bg-emerald-50 rounded-[2rem] p-6 border-2 border-emerald-100 flex items-start gap-4">
                  <div className="h-6 w-6 mt-1 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isExpress}
                      onChange={(e) => setIsExpress(e.target.checked)}
                      className="h-6 w-6 rounded-lg text-primary focus:ring-primary border-emerald-200 cursor-pointer"
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-900 leading-none mb-1">⚡ Need it TODAY?</h4>
                    <p className="text-xs text-emerald-700 font-medium leading-tight">
                      Express delivery — same day by 6pm. Available for orders placed before 10am. <span className="font-black">+20% on your total</span>
                    </p>
                  </div>
                </div>

                {cart.some(item => !!item.subscription) && (
                  <div className="p-6 rounded-[2rem] bg-indigo-50 border-2 border-indigo-100 flex flex-col gap-3 animate-in fade-in zoom-in duration-500">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-indigo-900 leading-none mb-1">Subscription Confirmed</h4>
                            <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-widest leading-tight">Recurring Order Setup</p>
                        </div>
                    </div>
                    <div className="space-y-2 mt-2">
                        {cart.filter(item => !!item.subscription).map(item => (
                            <div key={item.id} className="text-sm font-medium text-indigo-800 bg-white/50 px-4 py-2 rounded-xl">
                                {item.subscription?.frequency} delivery of <span className="font-black underline decoration-indigo-300">{item.subscription?.tier}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-indigo-500 font-medium italic mt-1">First delivery scheduled for {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}. Payment instructions sent via WhatsApp.</p>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                    <span>Delivery ({customerData.zone})</span>
                    <span className="font-bold text-gray-700">{formatCurrency(deliveryFee)}</span>
                  </div>
                  {isExpress && (
                    <div className="flex justify-between items-center text-sm font-black text-emerald-600">
                      <span>Express Processing (20%)</span>
                      <span>{formatCurrency(cartTotal * 0.2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl font-black text-gray-900 pt-2 border-t border-dashed border-gray-100">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(cartTotal + deliveryFee + (isExpress ? cartTotal * 0.2 : 0))}</span>
                  </div>
                </div>

                {orderError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-shake">
                    {orderError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={orderLoading}
                  className="w-full mt-4 inline-flex items-center justify-center px-8 py-5 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/30 hover:bg-emerald-700 active:scale-95 transition-all gap-2 group disabled:opacity-60"
                >
                  <Send className="h-5 w-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                  {orderLoading ? "Placing Order..." : "Place My Order"}
                </button>
                <p className="text-[10px] text-gray-400 text-center font-medium mt-4 leading-tight uppercase tracking-widest px-4">
                  You will receive M-Pesa payment instructions after placing your order.
                </p>

                <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-6 text-center shadow-inner border border-emerald-200">
                   <div className="text-emerald-500 mb-2 flex justify-center">
                     <svg className="h-8 w-8" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   </div>
                   <h4 className="text-emerald-900 font-black mb-1">Make an Impact.</h4>
                   <p className="text-sm text-emerald-800 font-medium leading-snug">
                     By ordering directly from rural farmers instead of a supermarket today, you are saving approximately <span className="font-black bg-emerald-200 px-1 rounded-md">4.2 kg of CO₂</span>.
                   </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
