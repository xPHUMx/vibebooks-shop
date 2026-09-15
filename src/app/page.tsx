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
      {/* Search Bar matching Stitch */}
      <div className="relative flex items-center w-full rounded-2xl bg-white/[0.03] backdrop-blur-xl px-4 py-3 specular-border shadow-lg transition-all focus-within:bg-white/[0.06] focus-within:shadow-[0_0_24px_rgba(139,92,246,0.25)]">
        <span className="material-symbols-outlined text-secondary shrink-0 text-[20px]">
          search
        </span>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, architecture, topic..."
          className="w-full bg-transparent border-none outline-none text-xs text-on-surface placeholder:text-on-surface-variant/50 ml-3 min-w-0"
          type="text"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-white"
          >
            <span className="material-symbols-outlined text-[13px]">close</span>
          </button>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative w-full overflow-hidden rounded-3xl bg-surface-container/60 backdrop-blur-2xl p-6 shadow-xl specular-border">
        <div className="absolute -top-16 -right-12 w-52 h-52 bg-primary-container/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]"></span>
              Editorial Release 2026
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight leading-snug">
            Engineering & Creative E-books
          </h1>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-lg font-normal">
            คลังหนังสือวิศวกรรมซอฟต์แวร์และสื่ออินเตอร์แอคทีฟ สั่งซื้อง่าย รับไฟล์ทันที
            ระบบชำระเงินจำลอง (DEMO ONLY) ปลอดภัย 100%
          </p>

          <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={() => {
                document
                  .getElementById("product-grid")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-inverse-primary via-primary-container to-secondary-container text-on-primary text-xs font-bold shadow-[0_0_24px_rgba(139,92,246,0.45)] active:scale-95 transition-transform"
            >
              <span>Explore Collection</span>
              <span className="material-symbols-outlined text-[16px]">bolt</span>
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] backdrop-blur-md specular-border">
              <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_rgba(76,215,246,0.8)]"></div>
              <div className="flex flex-col">
                <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">
                  Curator & Developer
                </span>
                <span className="text-[11px] text-secondary font-semibold">
                  {STUDENT_INFO.nameEn} • {STUDENT_INFO.studentId}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory("all")}
          className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all ${
            activeCategory === "all"
              ? "bg-primary/20 text-primary font-bold shadow-[0_0_16px_rgba(208,188,255,0.3)]"
              : "bg-white/[0.04] text-on-surface-variant hover:text-on-surface"
          }`}
        >
          All Guides ({BOOKS.length})
        </button>
        <button
          onClick={() => setActiveCategory("multimedia")}
          className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all ${
            activeCategory === "multimedia"
              ? "bg-primary/20 text-primary font-bold shadow-[0_0_16px_rgba(208,188,255,0.3)]"
              : "bg-white/[0.04] text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Multimedia & DSP
        </button>
        <button
          onClick={() => setActiveCategory("creative-ai")}
          className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all ${
            activeCategory === "creative-ai"
              ? "bg-primary/20 text-primary font-bold shadow-[0_0_16px_rgba(208,188,255,0.3)]"
              : "bg-white/[0.04] text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Creative AI & 3D
        </button>
        <button
          onClick={() => setActiveCategory("productivity")}
          className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all ${
            activeCategory === "productivity"
              ? "bg-primary/20 text-primary font-bold shadow-[0_0_16px_rgba(208,188,255,0.3)]"
              : "bg-white/[0.04] text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Productivity Systems
        </button>
      </div>

      {/* Bento Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" id="product-grid">
        {filteredBooks.map((book) => {
          const accentColor =
            book.category === "multimedia"
              ? "secondary"
              : book.category === "creative-ai"
              ? "tertiary"
              : "primary";

          return (
            <article
              key={book.id}
              className="group relative flex flex-col rounded-3xl bg-surface-container-low/80 backdrop-blur-xl p-5 shadow-xl specular-border transition-all duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_24px_rgba(76,215,246,0.18)] hover:-translate-y-1"
            >
              {/* Visual 3D Book Presentation */}
              <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-surface-container-lowest flex items-center justify-center shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 via-transparent to-primary/20 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-32 h-40 rounded-r-xl rounded-l-xs bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest shadow-2xl flex flex-col justify-between p-3 overflow-hidden transform group-hover:scale-105 transition-transform">
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/60 via-white/10 to-transparent"></div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-75"
                  />
                  <div className="relative z-10 flex justify-between items-start">
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded bg-${accentColor}/20 text-${accentColor} text-[9px] uppercase font-bold`}
                    >
                      LAB {book.labNumber}
                    </span>
                    <span
                      className={`material-symbols-outlined text-${accentColor} text-[16px]`}
                    >
                      {book.category === "multimedia"
                        ? "graphic_eq"
                        : book.category === "creative-ai"
                        ? "auto_awesome"
                        : "dashboard_customize"}
                    </span>
                  </div>
                  <div className="relative z-10 flex flex-col">
                    <span className="text-[12px] font-bold text-on-surface leading-tight">
                      {book.title}
                    </span>
                    <span className={`text-[9px] text-${accentColor}`}>
                      {book.subtitle}
                    </span>
                  </div>
                </div>

                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-surface-container-highest/90 text-secondary text-[10px] font-bold shadow flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">
                    verified
                  </span>{" "}
                  Lab {book.labNumber}
                </span>
              </div>

              {/* Card Metadata & Actions */}
              <div className="flex flex-col gap-2 pt-3 flex-1 justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h2 className="text-sm font-bold text-on-surface truncate">
                      {book.title}
                    </h2>
                    <span className="text-sm font-extrabold text-secondary shrink-0">
                      ฿{book.price}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    {book.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-on-surface-variant text-[10px]">
                      {book.specs.pages} Pages
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[10px] font-semibold">
                      PDF + Code
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">
                      star
                    </span>{" "}
                    {book.rating} ({book.ratingCount})
                  </span>
                  <Link
                    href={`/checkout/${book.id}`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary-container to-secondary text-on-primary text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>View & Order</span>
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

      {/* Trust Bento Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
        <div className="rounded-2xl bg-surface-container-low p-3.5 flex items-center gap-3 specular-border">
          <div className="w-9 h-9 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">bolt</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-on-surface">จัดส่งอัตโนมัติ 5 วินาที</span>
            <span className="text-[10px] text-on-surface-variant">รับลิงก์ดาวน์โหลดทันทีหลังสั่งซื้อ</span>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-low p-3.5 flex items-center gap-3 specular-border">
          <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">lock_clock</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-on-surface">Temporary Signed URL</span>
            <span className="text-[10px] text-on-surface-variant">ลิงก์ส่วนตัวหมดอายุใน 15 นาที</span>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-low p-3.5 flex items-center gap-3 specular-border">
          <div className="w-9 h-9 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">smartphone</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-on-surface">MIT App Inventor Ready</span>
            <span className="text-[10px] text-on-surface-variant">รองรับการเปิดบน Android WebViewer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
