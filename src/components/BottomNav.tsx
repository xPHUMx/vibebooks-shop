"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isCatalog = pathname === "/" || pathname.startsWith("/checkout");
  const isTracking = pathname.startsWith("/tracking");
  const isPaymentOrOrder = pathname.startsWith("/payment") || pathname.startsWith("/order");

  return (
    <nav className="fixed bottom-4 inset-x-0 z-50 px-4 pb-safe flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between gap-1 px-3 py-1.5 rounded-full bg-surface-container-highest/80 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6)] w-full max-w-sm">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
            isCatalog
              ? "text-secondary bg-white/[0.08] font-semibold shadow-[0_0_16px_rgba(76,215,246,0.25)]"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">menu_book</span>
          <span className="text-[10px] mt-0.5">Catalog</span>
        </Link>

        <Link
          href="/tracking"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
            isTracking
              ? "text-secondary bg-white/[0.08] font-semibold shadow-[0_0_16px_rgba(76,215,246,0.25)]"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          <span className="text-[10px] mt-0.5">Track Order</span>
        </Link>

        <div
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
            isPaymentOrOrder
              ? "text-secondary bg-white/[0.08] font-semibold shadow-[0_0_16px_rgba(76,215,246,0.25)]"
              : "text-on-surface-variant/40"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">verified</span>
          <span className="text-[10px] mt-0.5">Payment</span>
        </div>
      </div>
    </nav>
  );
}
