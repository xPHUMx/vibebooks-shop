"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// Inline Icons (Zero external dependencies)
const ChevronLeftIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export interface CarouselItem {
  id?: string;
  tag?: string;
  titleLine1: string;
  titleLine2?: string;
  desc?: string;
  img: string;
  ctaText?: string;
  ctaUrl?: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  ratingCount?: number;
  labNumber?: number;
  category?: string;
}

export interface CoverFlowCarouselProps {
  items?: CarouselItem[];
  sectionLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  onCtaClick?: (item: CarouselItem) => void;
}

export const defaultBooks: CarouselItem[] = [
  {
    tag: "LAB 1 · ENGINEERING",
    titleLine1: "FastPlayer PRO",
    titleLine2: "Desktop Media Player Architecture",
    desc: "คู่มือสถาปัตยกรรม Desktop Media Player ภาษาไทย 6 หน้าเต็ม พัฒนาด้วย PyQt6 พร้อม Pure Vector Icon และ Persistent JSON",
    img: "/images/books/media_player.png",
    ctaText: "สั่งซื้อ ฿199",
    ctaUrl: "/checkout/media-player-pro",
    price: 199,
  },
  {
    tag: "LAB 2 · CREATIVE AI",
    titleLine1: "Mystic Tarot",
    titleLine2: "Celestial Altar Oracle AI System",
    desc: "คู่มือสถาปัตยกรรมระบบทำนายไพ่ Celestial Altar ผสานเสียงสมาธิ 432Hz Ambient BGM และ Defensive Vector Fallback",
    img: "/images/books/tarot_app.png",
    ctaText: "สั่งซื้อ ฿259",
    ctaUrl: "/checkout/mystic-tarot-altar",
    price: 259,
  },
  {
    tag: "LAB 3 & 4 · PRODUCTIVITY",
    titleLine1: "TaskManagerPRO",
    titleLine2: "Bento Kanban & SQLite Architecture",
    desc: "คู่มือสถาปัตยกรรม Bento Dashboard & Kanban Board ความปลอดภัยระดับ Enterprise ด้วย Parameterized SQLite และ PBKDF2 Hashing",
    img: "/images/books/task_manager.png",
    ctaText: "สั่งซื้อ ฿179",
    ctaUrl: "/checkout/taskmaster-pro",
    price: 179,
  },
];

export function CoverFlowCarousel({
  items = defaultBooks,
  sectionLabel = "VIBEBOOKS MASTER SERIES",
  autoplay = true,
  autoplayDelay = 5000,
  className = "",
  onCtaClick,
}: CoverFlowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(0);
  const total = items.length;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx % total);
  };

  useEffect(() => {
    if (!autoplay || isHovered || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, nextSlide, total]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  if (!items || items.length === 0) return null;

  const cardSpacing1 = isMobile ? 175 : 285;
  const cardSpacing2 = isMobile ? 310 : 500;
  const cardWidth = isMobile ? "270px" : "330px";
  const cardHeight = isMobile ? "430px" : "490px";

  return (
    <section
      className={`relative w-full min-h-[620px] sm:min-h-[700px] flex items-center justify-center overflow-hidden py-6 sm:py-10 select-none rounded-[32px] bg-[#000000] border border-white/[0.08] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Apple-style Subtle Ambient Backdrop Reflection */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={items[currentIndex]?.img}
          alt="ambience background"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.16) blur(40px)",
            transform: "scale(1.2)",
            transition: "opacity 900ms cubic-bezier(0.16, 1, 0.3, 1), filter 900ms ease",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.94) 100%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-3 sm:px-4 z-10 flex flex-col items-center">
        {/* Apple Pro Eyebrow */}
        {sectionLabel && (
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-white/20" />
            <h3 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#86868b]">
              {sectionLabel}
            </h3>
            <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-white/20" />
          </div>
        )}

        {/* 3D Coverflow Stage */}
        <div
          className="relative w-full h-[450px] sm:h-[510px] flex justify-center items-center mb-6 sm:mb-8"
          style={{ perspective: "1400px" }}
        >
          {items.map((item, idx) => {
            const offset = (idx - currentIndex + total) % total;

            let transform = "translateX(0px) scale(0.4) rotateY(0deg)";
            let opacity = 0;
            let zIndex = 0;
            let filter = "brightness(0.3) blur(3px)";
            let isCenter = false;

            if (offset === 0) {
              isCenter = true;
              transform = "translateX(0px) scale(1) rotateY(0deg)";
              opacity = 1;
              zIndex = 30;
              filter = "brightness(1)";
            } else if (offset === 1) {
              transform = `translateX(${cardSpacing1}px) scale(0.85) rotateY(-22deg)`;
              opacity = 0.6;
              zIndex = 20;
              filter = "brightness(0.7)";
            } else if (offset === total - 1) {
              transform = `translateX(-${cardSpacing1}px) scale(0.85) rotateY(22deg)`;
              opacity = 0.6;
              zIndex = 20;
              filter = "brightness(0.7)";
            } else if (offset === 2) {
              transform = `translateX(${cardSpacing2}px) scale(0.7) rotateY(-36deg)`;
              opacity = 0.3;
              zIndex = 10;
              filter = "brightness(0.5) blur(1px)";
            } else if (offset === total - 2) {
              transform = `translateX(-${cardSpacing2}px) scale(0.7) rotateY(36deg)`;
              opacity = 0.3;
              zIndex = 10;
              filter = "brightness(0.5) blur(1px)";
            }

            return (
              <div
                key={item.id || idx}
                onClick={() => !isCenter && goToSlide(idx)}
                style={{
                  position: "absolute",
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: "24px",
                  overflow: "hidden",
                  backgroundColor: "#161617",
                  border: isCenter ? "1px solid rgba(255, 255, 255, 0.18)" : "1px solid rgba(255, 255, 255, 0.08)",
                  transform,
                  opacity,
                  zIndex,
                  filter,
                  transformOrigin: "center center",
                  transition: "all 750ms cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: isCenter
                    ? "0 30px 70px rgba(0,0,0,0.95), 0 0 35px rgba(255,255,255,0.06)"
                    : "0 15px 35px rgba(0,0,0,0.6)",
                  cursor: isCenter ? "default" : "pointer",
                }}
              >
                {/* Photo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img}
                  alt={item.titleLine1}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/books/task_manager.png";
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.98) 100%)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />

                {/* Content Overlay */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    padding: "20px 20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "center",
                    zIndex: 20,
                    opacity: isCenter ? 1 : 0,
                    transform: isCenter ? "translateY(0px)" : "translateY(14px)",
                    transition: "opacity 450ms ease, transform 450ms ease",
                    pointerEvents: isCenter ? "auto" : "none",
                  }}
                >
                  {/* Tag (Apple Pill) */}
                  <div className="flex justify-end w-full">
                    <span className="inline-block text-[10px] font-semibold tracking-wider text-white/80 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      {item.tag}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col items-center gap-1.5 mt-auto pb-1">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f5f5f7] m-0 drop-shadow-md">
                      {item.titleLine1}
                    </h2>

                    {item.titleLine2 && (
                      <span className="text-xs sm:text-sm font-medium text-[#86868b] tracking-tight">
                        {item.titleLine2}
                      </span>
                    )}

                    <div className="w-8 h-[1.5px] bg-white/20 rounded-full my-2" />

                    {item.desc && (
                      <p className="text-[11px] sm:text-xs text-[#a1a1a6] line-clamp-2 max-w-[260px] m-0 mb-3 leading-relaxed">
                        {item.desc}
                      </p>
                    )}

                    {/* Apple Pill CTA */}
                    {item.ctaUrl ? (
                      <Link
                        href={item.ctaUrl}
                        onClick={() => {
                          if (onCtaClick) onCtaClick(item);
                        }}
                        className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-[#f5f5f7] active:scale-95 transition-all shadow-md"
                      >
                        <span>{item.ctaText || "สั่งซื้อ E-book"}</span>
                        <ArrowRightIcon />
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          if (onCtaClick) onCtaClick(item);
                        }}
                        className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-[#f5f5f7] active:scale-95 transition-all shadow-md"
                      >
                        <span>{item.ctaText || "สั่งซื้อ E-book"}</span>
                        <ArrowRightIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows (Apple Circular Glass) */}
        <button
          onClick={prevSlide}
          aria-label="Previous book"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 hover:border-white/25 text-white flex items-center justify-center backdrop-blur-xl transition-all z-40 shadow-lg cursor-pointer"
        >
          <ChevronLeftIcon />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next book"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 hover:border-white/25 text-white flex items-center justify-center backdrop-blur-xl transition-all z-40 shadow-lg cursor-pointer"
        >
          <ChevronRightIcon />
        </button>

        {/* Apple Capsule Pagination Dots */}
        <div className="flex items-center justify-center gap-2 z-30">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                height: "6px",
                width: idx === currentIndex ? "24px" : "6px",
                borderRadius: "9999px",
                backgroundColor: idx === currentIndex ? "#ffffff" : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all 300ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CoverFlowCarousel;
