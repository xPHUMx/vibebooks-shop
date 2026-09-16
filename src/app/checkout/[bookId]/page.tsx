"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBookById } from "@/lib/booksData";
import DemoWarningBanner from "@/components/DemoWarningBanner";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.bookId as string;
  const book = getBookById(bookId);

  const [customerName, setCustomerName] = useState("นายเกียรติภูมิ หารศรีนาถ");
  const [customerEmail, setCustomerEmail] = useState("kiatphum.h@example.com");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!book) {
    return (
      <div className="text-center py-20 space-y-4">
        <span className="material-symbols-outlined text-[48px] text-rose-500">
          menu_book
        </span>
        <h1 className="text-xl font-bold text-[#f5f5f7]">ไม่พบข้อมูลหนังสือเล่มนี้</h1>
        <p className="text-xs text-[#86868b]">กรุณากลับไปเลือกจากหน้าแคตตาล็อกหลัก</p>
        <Link
          href="/"
          className="apple-btn-primary inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold"
        >
          กลับสู่หน้าร้านค้า
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          customerName,
          customerEmail,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        router.push(`/payment/${data.order.id}`);
      } else {
        setErrorMessage(data.error || "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ");
      }
    } catch (err) {
      setErrorMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#86868b] hover:text-white text-xs transition-all border border-white/[0.06]"
      >
        <span className="material-symbols-outlined text-[15px]">arrow_back</span>
        <span>ย้อนกลับไปแคตตาล็อก</span>
      </Link>

      {/* Selected Book Showcase Card (Apple Titanium Finish) */}
      <section className="rounded-[24px] bg-[#161617] p-5 sm:p-6 border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <div className="w-32 h-44 sm:w-36 sm:h-48 rounded-[16px] bg-black border border-white/[0.06] overflow-hidden flex items-center justify-center shrink-0 relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-white/90 text-[9px] font-mono border border-white/10">
              6 หน้าเต็ม
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white/80 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
              <span>Lab {book.labNumber} · {book.series}</span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-[#f5f5f7] tracking-tight">
              {book.title}
            </h1>
            <p className="text-xs text-[#86868b] leading-relaxed font-normal">
              {book.description}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
              <div>
                <span className="text-[10px] text-[#86868b] uppercase tracking-wider">ราคาจำหน่าย</span>
                <div className="text-xl font-bold text-[#f5f5f7] font-mono">฿{book.price}.00</div>
              </div>
              <div className="text-right text-[10px] text-[#86868b] space-y-0.5 font-mono">
                <div>ผู้รับผิดชอบ: {book.curator}</div>
                <div>{book.specs.pages} หน้า · ภาษาไทย Master Edition</div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights List */}
        <div className="pt-3 border-t border-white/[0.06] space-y-2">
          <span className="text-[11px] font-semibold text-[#f5f5f7]">หัวข้อสำคัญในเล่ม (E-book Highlights):</span>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-[#86868b]">
            {book.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[#0071e3] text-[14px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Customer Billing Form Card (Apple Style) */}
      <section className="rounded-[24px] bg-[#161617] p-5 sm:p-6 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white text-[18px]">badge</span>
            <h2 className="text-sm font-semibold text-[#f5f5f7]">ข้อมูลผู้รับและดาวน์โหลด E-book</h2>
          </div>
          <span className="text-[10px] text-[#86868b]">Instant Delivery</span>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
              ชื่อ-นามสกุล (สำหรับระบุในคำสั่งซื้อ)
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl bg-black border border-white/[0.08] px-3.5 py-2.5 text-xs text-[#f5f5f7] placeholder:text-[#86868b]/40 outline-none focus:border-white/25 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
              อีเมลรับ E-book (จำลองการจัดส่ง)
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full rounded-xl bg-black border border-white/[0.08] px-3.5 py-2.5 text-xs text-[#f5f5f7] placeholder:text-[#86868b]/40 outline-none focus:border-white/25 transition-all"
            />
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#86868b] block">ยอดชำระสุทธิ</span>
              <span className="text-xl font-bold text-[#f5f5f7] font-mono">฿{book.price}.00</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="apple-btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? "กำลังสร้างคำสั่งซื้อ..." : "ไปยังหน้าชำระเงิน"}</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </form>
      </section>

      {/* Demo Warning Banner */}
      <DemoWarningBanner />
    </div>
  );
}
