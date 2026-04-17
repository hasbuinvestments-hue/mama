"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBasket, Menu, X } from "lucide-react";

export function Header() {
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <span className="text-xl font-bold text-white">M</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 hidden sm:block">
              MAMA <span className="text-primary">FRESH</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Home</Link>
            <Link href="/shop" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Shop</Link>
            <Link href="/collections" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Collections</Link>
            <Link href="/packages" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Packages</Link>
            <Link href="/farmers" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Meet the Farmers</Link>
            <Link href="/about" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">About</Link>
            <Link href="/impact" className="text-sm font-semibold text-primary hover:text-emerald-700 transition-colors">Our Impact</Link>
            <Link href="/verify" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Verify Impact</Link>
            <Link href="/orders/history" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">My Orders</Link>
          </nav>

          {/* Cart & Mobile Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-fresh-bg text-primary hover:bg-primary hover:text-white transition-all duration-200 group"
            >
              <ShoppingBasket className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-50 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-gray-900 px-2 py-1">Home</Link>
            <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-gray-900 px-2 py-1">Shop</Link>
            <Link href="/collections" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-gray-900 px-2 py-1">Collections</Link>
            <Link href="/packages" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-gray-900 px-2 py-1">Packages</Link>
            <Link href="/testimonials" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-gray-900 px-2 py-1">Testimonials</Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-gray-900 px-2 py-1">About</Link>
            <Link href="/impact" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-primary px-2 py-1">Our Impact</Link>
            <Link href="/orders/history" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-gray-900 px-2 py-1">My Orders</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
