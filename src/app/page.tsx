"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { BOOKS, STUDENT_INFO } from "@/lib/booksData";
import CoverFlowCarousel, { CarouselItem } from "@/components/CoverFlowCarousel";
import GlyphPortal from "@/components/GlyphPortal";

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
      let tag = `#Lab${book.labNumber}_Architecture`;
      let titleLine1 = book.title.toUpperCase();
      let titleLine2 = `– ${book.series.toUpperCase()}`;

      if (book.id === "media-player-pro") {
        tag = "#Lab1_Engineering";
        titleLine1 = "FASTPLAYER PRO";
        titleLine2 = "– AUDIO & VIDEO ENGINE";
      } else if (book.id === "mystic-tarot-altar") {
        tag = "#Lab2_CreativeAI";
        titleLine1 = "MYSTIC TAROT";
        titleLine2 = "– 3-CARD ORACLE AI";
      } else if (book.id === "taskmaster-pro") {
        tag = "#Lab3_Productivity";
        titleLine1 = "TASKMANAGER PRO";
        titleLine2 = "– BENTO KANBAN & SQLITE";
      }

      return {
        id: book.id,
        tag,
        titleLine1,
        titleLine2,
        desc: book.description,
        img: book.coverImage,
        ctaText: `สั่งซื้อ ฿${book.price}.00`,
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
      {/* 1) LANDING INTRO PORTAL (หน้าหลักก่อนเข้าสู่เว็บ) */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-[0_25px_70px_rgba(0,0,0,0.8)]">
        <GlyphPortal
          word="VIBEBOOKS"
          focusChar="B"
          interactive={true}
          scrollLength={2.0}
          enterLabel="เข้าสู่คลังหนังสือ (Enter Catalog)"
          style={{
            "--gp-paper": "#07050e",
            "--gp-ink": "#ffffff",
            "--gp-field": "#0c0a18",
            "--gp-foreground": "#f8fafc",
          }}
          background={
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 18% 20%, rgba(168,85,247,0.45), transparent 45%), radial-gradient(circle at 82% 25%, rgba(6,182,212,0.4), transparent 40%), radial-gradient(circle at 50% 85%, rgba(245,158,11,0.25), transparent 50%), linear-gradient(145deg, #07050e 0%, #130f24 50%, #06040d 100%)",
              }}
            >
              {/* Subtle Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            </div>
          }
          front={
            <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8 pointer-events-none">
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between pointer-events-auto flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  <span className="text-[11px] font-bold text-secondary tracking-wider uppercase">
                    VibeBooks Editorial 2026
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-white/50 block uppercase tracking-widest font-mono">
                    Author & Architect
                  </span>
                  <span className="text-xs text-amber-300 font-semibold">
                    {STUDENT_INFO.name} ({STUDENT_INFO.studentId})
                  </span>
                </div>
              </div>

              {/* Bottom Callout & Quick Skip */}
              <div className="text-center pb-2 pointer-events-auto">
                <p className="text-xs text-white/80 max-w-lg mx-auto mb-3 font-normal drop-shadow">
                  คลังคู่มือสถาปัตยกรรมซอฟต์แวร์ระดับโปรดักชัน ภาษาไทยฉบับสมบูรณ์ (DEMO ONLY)
                </p>
                <a
                  href="#storefront"
                  className="btn-spring inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-secondary/80 to-primary/80 hover:from-secondary hover:to-primary text-slate-950 text-xs font-bold shadow-[0_0_20px_rgba(76,215,246,0.3)] transition-all"
                >
                  <span>สำรวจคลังหนังสือ 3D ทันที</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                </a>
              </div>
            </div>
          }
        >
          {/* Content revealed inside the portal */}
          <div className="text-center max-w-xl mx-auto py-10 px-4 space-y-5 animate-fade">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30 text-[11px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              ยินดีต้อนรับสู่ VibeBooks PRO
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              คลังคู่มือวิศวกรรมซอฟต์แวร์และ AI ครบวงจร 3 ใบงาน
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-md mx-auto">
              พร้อมซอร์สโค้ดจริง, ผลการทดสอบระบบ 100%, และไฟล์ E-book ภาษาไทย 6 หน้าเต็ม
            </p>
            <div className="pt-2">
              <a
                href="#storefront"
                className="btn-spring inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-secondary via-cyan-400 to-primary text-slate-950 text-xs font-extrabold shadow-xl hover:shadow-[0_0_25px_rgba(76,215,246,0.4)] transition-all"
              >
                <span>เข้าสู่คลังแคตตาล็อก</span>
                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              </a>
            </div>
          </div>
        </GlyphPortal>
      </div>

      {/* 2) MAIN STOREFRONT SECTION (#storefront) */}
      <div id="storefront" className="space-y-8 pt-4">
        {/* Top Search & Author Meta Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Minimalist Search Bar */}
          <div className="relative flex-1 flex items-center rounded-2xl bg-white/[0.03] backdrop-blur-xl px-4 py-3 border border-white/[0.08] shadow-lg transition-all focus-within:bg-white/[0.06] focus-within:border-secondary/40 focus-within:shadow-[0_0_20px_rgba(76,215,246,0.2)]">
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

          {/* Quick Links: Community & Author */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/community"
              className="btn-spring inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md border border-white/[0.08] text-on-surface text-xs font-bold transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">forum</span>
              <span>ชุมชน & รีวิว</span>
            </Link>

            <div className="hidden sm:inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08]">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.8)] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Author & Architect
                </span>
                <span className="text-[12px] text-secondary font-bold">
                  {STUDENT_INFO.name} ({STUDENT_INFO.studentId})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D CoverFlow Carousel Section (Primary Showcase) */}
        <div className="relative">
          <CoverFlowCarousel
            items={carouselItems}
            sectionLabel="VIBEBOOKS EDITORIAL MASTER 2026"
            autoplay={true}
            autoplayDelay={4500}
          />
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory("all")}
              className={`filter-chip shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all btn-spring ${
                activeCategory === "all"
                  ? "bg-secondary/20 text-secondary border border-secondary/40 font-bold shadow-[0_0_12px_rgba(76,215,246,0.25)]"
                  : "bg-white/[0.03] text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
              }`}
            >
              ทั้งหมด ({BOOKS.length})
            </button>
            <button
              onClick={() => setActiveCategory("multimedia")}
              className={`filter-chip shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all btn-spring ${
                activeCategory === "multimedia"
                  ? "bg-secondary/20 text-secondary border border-secondary/40 font-bold shadow-[0_0_12px_rgba(76,215,246,0.25)]"
                  : "bg-white/[0.03] text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
              }`}
            >
              มัลติมีเดีย (Lab 1)
            </button>
            <button
              onClick={() => setActiveCategory("creative-ai")}
              className={`filter-chip shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all btn-spring ${
                activeCategory === "creative-ai"
                  ? "bg-secondary/20 text-secondary border border-secondary/40 font-bold shadow-[0_0_12px_rgba(76,215,246,0.25)]"
                  : "bg-white/[0.03] text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
              }`}
            >
              Creative AI (Lab 2)
            </button>
            <button
              onClick={() => setActiveCategory("productivity")}
              className={`filter-chip shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all btn-spring ${
                activeCategory === "productivity"
                  ? "bg-secondary/20 text-secondary border border-secondary/40 font-bold shadow-[0_0_12px_rgba(76,215,246,0.25)]"
                  : "bg-white/[0.03] text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
              }`}
            >
              ระบบผลผลิต (Lab 3 & 4)
            </button>
          </div>

          <span className="text-xs text-on-surface-variant font-mono">
            แสดง {filteredBooks.length} เล่ม
          </span>
        </div>

        {/* Bento Grid — Direct Book Comparison & Details */}
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
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/books/task_manager.png";
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

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
    </div>
  );
}
