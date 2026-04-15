"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart, Package, BarChart2, MessageSquare,
  LayoutGrid, Blend, Users, ShoppingBag, Store,
} from "lucide-react";

const navItems = [
  { href: "/admin/orders",       label: "Orders",        icon: ShoppingCart },
  { href: "/admin/packages",     label: "Packages",      icon: Package },
  { href: "/admin/products",     label: "Products",      icon: ShoppingBag },
  { href: "/admin/vendors",      label: "Farmers",       icon: Users },
  { href: "/admin/collections",  label: "Collections",   icon: LayoutGrid },
  { href: "/admin/mixes",        label: "Mixes",         icon: Blend },
  { href: "/admin/testimonials", label: "Testimonials",  icon: MessageSquare },
  { href: "/admin/analytics",    label: "Analytics",     icon: BarChart2 },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-14">
        <Link href="/admin/orders" className="flex items-center gap-2 mr-4 flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Store className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-gray-900 text-sm hidden sm:block">Admin</span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <a
          href="/"
          className="text-xs font-bold text-gray-400 hover:text-gray-700 flex-shrink-0 hidden sm:block"
        >
          ← Site
        </a>
      </div>
    </header>
  );
}
