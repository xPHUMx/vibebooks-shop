"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STUDENT_INFO } from "@/lib/booksData";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#000000]/80 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
      <div className="max-w-4xl mx-auto h-12 sm:h-14 px-4 flex items-center justify-between gap-4">
        {/* Brand Logo & Author */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          {/* Minimalist Apple-style Vector Monogram */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-b from-[#2c2c2e] to-[#1c1c1e] border border-white/10 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M9 6h6" />
              <path d="M9 10h6" />
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-semibold tracking-tight text-[#f5f5f7] group-hover:text-white transition-colors">
                {STUDENT_INFO.brand}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-white/90 uppercase tracking-wider">
                PRO
              </span>
            </div>
            <span className="text-[9px] text-[#86868b] font-medium hidden sm:inline">
              by {STUDENT_INFO.nameEn} ({STUDENT_INFO.studentId})
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Apple Style) */}
        <nav className="hidden md:flex items-center gap-6 text-[12px] font-medium text-[#86868b]">
          <Link
            href="/"
            className={`transition-colors hover:text-white ${
              pathname === "/" ? "text-white font-semibold" : ""
            }`}
          >
            แคตตาล็อก
          </Link>
          <Link
            href="/community"
            className={`transition-colors hover:text-white ${
              pathname.startsWith("/community") ? "text-white font-semibold" : ""
            }`}
          >
            คอมมูนิตี้ & รีวิว
          </Link>
          <Link
            href="/tracking"
            className={`transition-colors hover:text-white ${
              pathname.startsWith("/tracking") ? "text-white font-semibold" : ""
            }`}
          >
            ติดตามคำสั่งซื้อ
          </Link>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/community"
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.04] text-[#86868b] hover:text-white hover:bg-white/[0.08] transition-all"
            title="คอมมูนิตี้และรีวิว"
          >
            <span className="material-symbols-outlined text-[18px]">forum</span>
          </Link>

          <Link
            href="/tracking"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.04] text-[#86868b] hover:text-white hover:bg-white/[0.08] transition-all"
            title="ติดตามคำสั่งซื้อ"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          </Link>

          <Link
            href="/"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] text-white hover:bg-white/[0.12] relative transition-all"
            title="แคตตาล็อก E-book"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#0071e3] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
              3
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
