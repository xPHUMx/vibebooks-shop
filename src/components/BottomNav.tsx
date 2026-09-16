"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isCatalog = pathname === "/" || pathname.startsWith("/checkout");
  const isCommunity = pathname.startsWith("/community");
  const isTracking = pathname.startsWith("/tracking");

  return (
    <nav className="fixed bottom-4 inset-x-0 z-50 px-4 pb-safe flex justify-center pointer-events-none md:hidden">
      <div className="pointer-events-auto flex items-center justify-between gap-1 p-1.5 rounded-full bg-[#161617]/85 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.8)] w-full max-w-xs">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all duration-200 ${
            isCatalog && !isCommunity
              ? "text-white bg-white/[0.12] font-semibold shadow-sm"
              : "text-[#86868b] hover:text-[#f5f5f7]"
          }`}
        >
          <span className="material-symbols-outlined text-[19px]">menu_book</span>
          <span className="text-[9px] mt-0.5 tracking-tight font-medium">Catalog</span>
        </Link>

        <Link
          href="/community"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all duration-200 ${
            isCommunity
              ? "text-white bg-white/[0.12] font-semibold shadow-sm"
              : "text-[#86868b] hover:text-[#f5f5f7]"
          }`}
        >
          <span className="material-symbols-outlined text-[19px]">forum</span>
          <span className="text-[9px] mt-0.5 tracking-tight font-medium">Community</span>
        </Link>

        <Link
          href="/tracking"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all duration-200 ${
            isTracking
              ? "text-white bg-white/[0.12] font-semibold shadow-sm"
              : "text-[#86868b] hover:text-[#f5f5f7]"
          }`}
        >
          <span className="material-symbols-outlined text-[19px]">receipt_long</span>
          <span className="text-[9px] mt-0.5 tracking-tight font-medium">Track</span>
        </Link>
      </div>
    </nav>
  );
}
