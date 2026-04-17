"use client";

import React from "react";

export default function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-primary/20">
      {children}
    </div>
  );
}
