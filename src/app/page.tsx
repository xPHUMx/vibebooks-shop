"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { BOOKS, STUDENT_INFO } from "@/lib/booksData";
import CoverFlowCarousel, { CarouselItem } from "@/components/CoverFlowCarousel";

export default function HomePage() {
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

  // Transform books into CoverFlow carousel items
  const carouselItems: CarouselItem[] = useMemo(() => {
    const sourceBooks = filteredBooks.length > 0 ? filteredBooks : BOOKS;
    return sourceBooks.map((book) => {
      let tag = `LAB ${book.labNumber} · ARCHITECTURE`;
      let titleLine1 = book.title;
      let titleLine2 = book.subtitle;

      if (book.id === "media-player-pro") {
        tag = "LAB 1 · ENGINEERING";
        titleLine1 = "FastPlayer PRO";
        titleLine2 = "PyQt6 & QtMultimedia Desktop Engineering";
      } else if (book.id === "mystic-tarot-altar") {
        tag = "LAB 2 · CREATIVE AI";
        titleLine1 = "Mystic Tarot";
        titleLine2 = "Celestial Altar Oracle AI System";
      } else if (book.id === "taskmaster-pro") {
        tag = "LAB 3 & 4 · PRODUCTIVITY";
        titleLine1 = "TaskManagerPRO";
        titleLine2 = "Bento Kanban & SQLite Architecture";
      }

      return {
        id: book.id,
        tag,
        titleLine1,
        titleLine2,
        desc: book.description,
        img: book.coverImage,
        ctaText: `สั่งซื้อ ฿${book.price}`,
        ctaUrl: `/checkout/${book.id}`,
        price: book.price,
        originalPrice: book.originalPrice,
        rating: book.rating,
        ratingCount: book.ratingCount,
        labNumber: book.labNumber,
        category: book.category,
      };
    });
  }, [filteredBooks]);

  return (
    <div className="space-y-12 animate-fade pb-12">
      {/* 1) APPLE-STYLE MINIMALIST PREMIUM HERO SECTION */}
      <section className="relative text-center pt-4 sm:pt-10 pb-6 flex flex-col items-center">
        {/* Apple Eyebrow Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
          <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-[0.2em]">
            Editorial Master Edition · 2026
          </span>
        </div>

        {/* Apple Pro Titanium Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-2xl leading-[1.1] mb-3">
          <span className="bg-gradient-to-b from-white via-[#f5f5f7] to-[#86868b] bg-clip-text text-transparent">
            VibeBooks PRO.
          </span>
          <br />
          <span className="text-2xl sm:text-4xl md:text-5xl font-semibold text-[#a1a1a6] tracking-tight">
            The Architecture of Software & AI.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-xs sm:text-sm text-[#86868b] max-w-lg leading-relaxed mb-6 font-normal">
          คลังคู่มือสถาปัตยกรรมซอฟต์แวร์ระดับโปรดักชัน ภาษาไทยฉบับสมบูรณ์ 6 หน้าเต็ม
          พร้อมผลการทดสอบระบบและซอร์สโค้ดจริง (DEMO ONLY)
        </p>

        {/* Author / Lead Architect Capsule */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161617] border border-white/[0.08] mb-8">
          <span className="text-[10px] text-[#86868b] uppercase tracking-wider font-mono">
            Lead Architect
          </span>
          <span className="text-xs text-[#f5f5f7] font-semibold">
            {STUDENT_INFO.name}
          </span>
          <span className="text-[10px] text-[#86868b] font-mono">
            ({STUDENT_INFO.studentId})
          </span>
        </div>

        {/* Apple Action Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => {
              document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="apple-btn-primary px-6 py-2.5 text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>สำรวจหนังสือ</span>
            <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
          </button>

          <Link
            href="/community"
            className="apple-btn-secondary px-6 py-2.5 text-xs font-semibold flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[15px] text-[#2997ff]">forum</span>
            <span>คอมมูนิตี้ & รีวิว</span>
          </Link>
        </div>
      </section>

      {/* 2) 3D COVERFLOW SHOWCASE (APPLE HARDWARE EXPERIENCE) */}
      <section id="showcase" className="relative">
        <CoverFlowCarousel
          items={carouselItems}
          sectionLabel="EDITORIAL MASTER SHOWCASE"
          autoplay={true}
          autoplayDelay={5000}
        />
      </section>

      {/* 3) SEARCH & APPLE SEGMENTED FILTER CONTROL */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Apple-style Minimal Search Bar */}
          <div className="relative flex-1 flex items-center rounded-2xl bg-[#161617] px-4 py-2.5 border border-white/[0.08] transition-all focus-within:border-white/20 focus-within:bg-[#1c1c1e]">
            <span className="material-symbols-outlined text-[#86868b] text-[18px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา E-book วิศวกรรมซอฟต์แวร์, สถาปัตยกรรมระบบ, โค้ดตัวอย่าง..."
              className="w-full bg-transparent border-none outline-none text-xs text-[#f5f5f7] placeholder:text-[#86868b]/60 ml-2.5"
              type="text"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[#86868b] hover:text-white"
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            )}
          </div>

          <span className="text-xs text-[#86868b] font-mono text-right shrink-0">
            แสดง {filteredBooks.length} จาก {BOOKS.length} เล่ม
          </span>
        </div>

        {/* Segmented Filter Pills (Apple Style) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              activeCategory === "all"
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-[#161617] text-[#86868b] hover:text-white border border-white/[0.06]"
            }`}
          >
            ทั้งหมด ({BOOKS.length})
          </button>
          <button
            onClick={() => setActiveCategory("multimedia")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              activeCategory === "multimedia"
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-[#161617] text-[#86868b] hover:text-white border border-white/[0.06]"
            }`}
          >
            มัลติมีเดีย (Lab 1)
          </button>
          <button
            onClick={() => setActiveCategory("creative-ai")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              activeCategory === "creative-ai"
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-[#161617] text-[#86868b] hover:text-white border border-white/[0.06]"
            }`}
          >
            Creative AI (Lab 2)
          </button>
          <button
            onClick={() => setActiveCategory("productivity")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              activeCategory === "productivity"
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-[#161617] text-[#86868b] hover:text-white border border-white/[0.06]"
            }`}
          >
            ระบบผลผลิต (Lab 3 & 4)
          </button>
        </div>
      </section>

      {/* 4) APPLE-STYLE BENTO GRID (SPEC TILES) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {filteredBooks.map((book) => {
          return (
            <article
              key={book.id}
              className="group relative flex flex-col rounded-[24px] bg-[#161617] border border-white/[0.08] hover:border-white/[0.18] p-4 sm:p-5 transition-all duration-300 hover:shadow-2xl"
            >
              {/* Cover Frame */}
              <div className="relative w-full h-44 sm:h-48 rounded-[18px] overflow-hidden bg-black border border-white/[0.06] flex items-center justify-center shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/books/task_manager.png";
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Lab Badge */}
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-black/60 backdrop-blur-md border border-white/10 text-white/90">
                  Lab {book.labNumber}
                </span>

                {/* Format Badge */}
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white/80 text-[10px] font-mono backdrop-blur-md border border-white/10 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-[#2997ff]">
                    picture_as_pdf
                  </span>
                  6 หน้าเต็ม
                </span>

                {/* Title Overlay in bottom of cover frame */}
                <div className="absolute bottom-2.5 inset-x-3 text-left">
                  <span className="text-[11px] font-semibold text-white/95 drop-shadow line-clamp-1">
                    {book.title}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-col gap-2 pt-3 flex-1 justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h2 className="text-sm font-semibold text-[#f5f5f7] group-hover:text-white transition-colors line-clamp-1">
                      {book.title}
                    </h2>
                    <span className="text-sm font-bold text-[#f5f5f7] shrink-0 font-mono">
                      ฿{book.price}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#86868b] line-clamp-2 leading-relaxed mt-1">
                    {book.description}
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-white/[0.06]">
                  <span className="text-[11px] text-[#86868b] flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-[13px] text-amber-400 fill-current">
                      star
                    </span>
                    <span className="text-[#f5f5f7] font-semibold">{book.rating}</span>
                    <span className="text-[#86868b]">({book.ratingCount})</span>
                  </span>

                  <Link
                    href={`/checkout/${book.id}`}
                    className="apple-btn-primary px-4 py-1.5 text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <span>สั่งซื้อ</span>
                    <span className="material-symbols-outlined text-[13px]">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* 5) APPLE-STYLE TECH SPEC TILES */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="rounded-[20px] bg-[#161617] p-4 flex items-center gap-3.5 border border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[#f5f5f7]">Thai Digital Master</span>
            <span className="text-[10px] text-[#86868b]">เนื้อหาละเอียด 6 หน้า พร้อมซอร์สโค้ด</span>
          </div>
        </div>

        <div className="rounded-[20px] bg-[#161617] p-4 flex items-center gap-3.5 border border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-[#2997ff] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[#f5f5f7]">Supabase Cloud Vault</span>
            <span className="text-[10px] text-[#86868b]">Temporary Signed URL ปลอดภัย 100%</span>
          </div>
        </div>

        <div className="rounded-[20px] bg-[#161617] p-4 flex items-center gap-3.5 border border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[#f5f5f7]">iOS & Mobile Ready</span>
            <span className="text-[10px] text-[#86868b]">อ่านบน MIT WebViewer ได้ทันที</span>
          </div>
        </div>
      </section>
    </div>
  );
}
