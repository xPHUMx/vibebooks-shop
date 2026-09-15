"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { BOOKS, STUDENT_INFO } from "@/lib/booksData";

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredBooks = useMemo(() => {
    return BOOKS.filter((book) => {
      const matchCat =
        activeCategory === "all" || book.category === activeCategory;
      const text = `${book.title} ${book.subtitle} ${book.description} ${book.highlights.join(
        " "
      )}`.toLowerCase();
      const matchSearch = text.includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-6 animate-fade">
      {/* Minimalist Search Bar */}
      <div className="relative flex items-center w-full rounded-2xl bg-white/[0.03] backdrop-blur-xl px-4 py-3 border border-white/[0.08] shadow-lg transition-all focus-within:bg-white/[0.06] focus-within:border-secondary/40 focus-within:shadow-[0_0_20px_rgba(76,215,246,0.2)]">
        <span className="material-symbols-outlined text-secondary shrink-0 text-[20px]">
          search
        </span>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหา E-book วิศวกรรมซอฟต์แวร์, สถาปัตยกรรมระบบ, โค้ดตัวอย่าง..."
          className="w-full bg-transparent border-none outline-none text-xs text-on-surface placeholder:text-on-surface-variant/40 ml-3 min-w-0"
          type="text"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[13px]">close</span>
          </button>
        )}
      </div>

      {/* Hero Section — Minimalist Obsidian Glass */}
      <div className="relative w-full overflow-hidden rounded-3xl bg-surface-container-low/60 backdrop-blur-2xl p-6 shadow-2xl border border-white/[0.08]">
        {/* Subtle Animated Glowing Orbs */}
        <div className="absolute -top-16 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-16 -left-10 w-44 h-44 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
              Editorial Master Edition 2026
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight leading-snug">
            VibeBooks Engineering & AI Series
          </h1>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-lg font-normal">
            คลังคู่มือสถาปัตยกรรมซอฟต์แวร์ระดับโปรดักชัน ภาษาไทยฉบับสมบูรณ์ (Full 6-Page Technical Master)
            พร้อมผลการทดสอบระบบและซอร์สโค้ดจริง (DEMO ONLY)
          </p>

          <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={() => {
                document
                  .getElementById("product-grid")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-spring inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-secondary via-cyan-400 to-primary text-slate-950 text-xs font-bold shadow-[0_0_20px_rgba(76,215,246,0.35)] hover:opacity-95 transition-all"
            >
              <span>สำรวจคลังหนังสือ</span>
              <span className="material-symbols-outlined text-[16px]">bolt</span>
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06]">
              <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_rgba(76,215,246,0.8)]"></div>
              <div className="flex flex-col">
                <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">
                  Lead Architect & Author
                </span>
                <span className="text-[11px] text-secondary font-semibold">
                  {STUDENT_INFO.name} ({STUDENT_INFO.studentId})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory("all")}
          className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all btn-spring ${
            activeCategory === "all"
              ? "bg-secondary/20 text-secondary border border-secondary/40 font-bold shadow-[0_0_12px_rgba(76,215,246,0.25)]"
              : "bg-white/[0.03] text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
          }`}
        >
          ทั้งหมด ({BOOKS.length})
        </button>
        <button
          onClick={() => setActiveCategory("multimedia")}
          className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all btn-spring ${
            activeCategory === "multimedia"
              ? "bg-secondary/20 text-secondary border border-secondary/40 font-bold shadow-[0_0_12px_rgba(76,215,246,0.25)]"
              : "bg-white/[0.03] text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
          }`}
        >
          มัลติมีเดีย (Lab 1)
        </button>
        <button
          onClick={() => setActiveCategory("creative-ai")}
          className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all btn-spring ${
            activeCategory === "creative-ai"
              ? "bg-secondary/20 text-secondary border border-secondary/40 font-bold shadow-[0_0_12px_rgba(76,215,246,0.25)]"
              : "bg-white/[0.03] text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
          }`}
        >
          Creative AI (Lab 2)
        </button>
        <button
          onClick={() => setActiveCategory("productivity")}
          className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all btn-spring ${
            activeCategory === "productivity"
              ? "bg-secondary/20 text-secondary border border-secondary/40 font-bold shadow-[0_0_12px_rgba(76,215,246,0.25)]"
              : "bg-white/[0.03] text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
          }`}
        >
          ระบบผลผลิต (Lab 3 & 4)
        </button>
      </div>

      {/* Bento Product Grid — Minimalist Glass Cards with Clear Cover Images */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" id="product-grid">
        {filteredBooks.map((book, index) => {
          const accentColor =
            book.category === "multimedia"
              ? "text-[#a855f7] bg-[#a855f7]/15 border-[#a855f7]/30"
              : book.category === "creative-ai"
              ? "text-[#f59e0b] bg-[#f59e0b]/15 border-[#f59e0b]/30"
              : "text-[#06b6d4] bg-[#06b6d4]/15 border-[#06b6d4]/30";

          return (
            <article
              key={book.id}
              style={{ animationDelay: `${index * 90}ms` }}
              className="group relative flex flex-col rounded-3xl bg-surface-container-low/70 backdrop-blur-xl p-4 sm:p-5 shadow-xl border border-white/[0.08] glass-card-hover animate-fade-in-up"
            >
              {/* Crisp Book Image Frame with Subtle Vignette */}
              <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-surface-container-lowest border border-white/[0.06] flex items-center justify-center shadow-inner group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to default styling if needed
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/books/task_manager.png";
                  }}
                />

                {/* Subtle gradient vignette at bottom for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                {/* Lab Badge */}
                <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${accentColor}`}>
                  Lab {book.labNumber}
                </span>

                {/* Pages & Format Badge */}
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white/90 text-[10px] font-mono backdrop-blur-md border border-white/10 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-secondary">
                    picture_as_pdf
                  </span>
                  6 หน้าเต็ม
                </span>

                {/* Title Overlay in bottom of cover frame */}
                <div className="absolute bottom-2.5 inset-x-3 text-left">
                  <span className="text-[11px] font-semibold text-white/90 drop-shadow line-clamp-1">
                    {book.title}
                  </span>
                </div>
              </div>

              {/* Card Metadata & Minimalist Layout */}
              <div className="flex flex-col gap-2 pt-3 flex-1 justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h2 className="text-sm font-bold text-on-surface group-hover:text-secondary transition-colors line-clamp-1">
                      {book.title}
                    </h2>
                    <span className="text-sm font-extrabold text-secondary shrink-0 font-mono">
                      ฿{book.price}.00
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed mt-0.5">
                    {book.description}
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-white/[0.06]">
                  <span className="text-[11px] text-on-surface-variant flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-[13px] text-amber-400 fill-current">
                      star
                    </span>
                    <span>{book.rating}</span>
                    <span className="text-on-surface-variant/60">({book.ratingCount})</span>
                  </span>

                  <Link
                    href={`/checkout/${book.id}`}
                    className="btn-spring inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-container/90 to-secondary text-slate-950 text-xs font-bold shadow-md hover:shadow-[0_0_15px_rgba(76,215,246,0.3)] transition-all"
                  >
                    <span>สั่งซื้อ E-book</span>
                    <span className="material-symbols-outlined text-[14px]">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Trust Bento Strip — Ultra-Minimal Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="rounded-2xl bg-surface-container-low/50 backdrop-blur-md p-3.5 flex items-center gap-3 border border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-on-surface truncate">E-book ภาษาไทยฉบับเต็ม</span>
            <span className="text-[10px] text-on-surface-variant">เนื้อหาละเอียด 6 หน้า พร้อมโค้ดจริง</span>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-low/50 backdrop-blur-md p-3.5 flex items-center gap-3 border border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-on-surface truncate">Supabase Cloud Vault</span>
            <span className="text-[10px] text-on-surface-variant">Temporary Signed URL ปลอดภัย 100%</span>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-low/50 backdrop-blur-md p-3.5 flex items-center gap-3 border border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-on-surface truncate">In-App Reader for iPhone</span>
            <span className="text-[10px] text-on-surface-variant">อ่านบน MIT WebViewer ได้ทันที</span>
          </div>
        </div>
      </div>
    </div>
  );
}
