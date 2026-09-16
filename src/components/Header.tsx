"use client";

import Link from "next/link";
import { STUDENT_INFO } from "@/lib/booksData";

export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="max-w-4xl mx-auto h-16 px-4 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-3 min-w-0 flex-1 group">
          {/* SVG Brand Logo from Google Stitch */}
          <svg className="h-9 w-9 shrink-0 shadow-lg rounded-xl transition-transform group-hover:scale-105" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="vb-grad-nav" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6"/>
                <stop offset="50%" stopColor="#ec4899"/>
                <stop offset="100%" stopColor="#06b6d4"/>
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="#14121d"/>
            <rect width="98" height="98" x="1" y="1" rx="27" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
            <path d="M28 32 C36 28, 44 32, 50 36 C56 32, 64 28, 72 32 L72 68 C64 64, 56 68, 50 72 C44 68, 36 64, 28 68 Z" fill="url(#vb-grad-nav)" opacity="0.95"/>
            <path d="M50 36 L50 72" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="50" cy="27" r="3.5" fill="#06b6d4"/>
          </svg>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">
                {STUDENT_INFO.brand}
              </span>
              <span className="text-xs text-on-surface-variant font-medium hidden sm:inline">
                · Obsidian Glass
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-secondary font-medium truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 animate-pulse"></span>
              By {STUDENT_INFO.nameEn} ({STUDENT_INFO.studentId})
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/community"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.05] text-on-surface-variant hover:text-secondary hover:bg-white/[0.1] transition-all"
            title="คอมมูนิตี้และรีวิว E-book"
          >
            <span className="material-symbols-outlined text-[19px]">forum</span>
          </Link>
          <Link
            href="/tracking"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.05] text-on-surface-variant hover:text-on-surface hover:bg-white/[0.1] transition-all"
            title="ค้นหาและติดตามคำสั่งซื้อ"
          >
            <span className="material-symbols-outlined text-[19px]">receipt_long</span>
          </Link>
          <Link
            href="/#storefront"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.05] text-on-surface-variant hover:text-on-surface hover:bg-white/[0.1] relative transition-all"
            title="แคตตาล็อกหนังสือ"
          >
            <span className="material-symbols-outlined text-[19px]">shopping_bag</span>
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-secondary text-on-secondary text-[9px] font-bold flex items-center justify-center shadow-sm">
              3
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
