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
        <span className="material-symbols-outlined text-[48px] text-error">
          menu_book
        </span>
        <h1 className="text-xl font-bold text-on-surface">ไม่พบข้อมูลหนังสือเล่มนี้</h1>
        <p className="text-xs text-on-surface-variant">กรุณากลับไปเลือกจากหน้าแคตตาล็อกหลัก</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-on-secondary text-xs font-bold"
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
    <div className="space-y-5 max-w-2xl mx-auto animate-fade">
      {/* Back to Catalog Pill */}
      <Link
        href="/"
        className="btn-spring inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-on-surface hover:text-secondary text-xs transition-all border border-white/[0.06]"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>ย้อนกลับไปแคตตาล็อก</span>
      </Link>

      {/* Selected Book Showcase Card — Minimalist Obsidian Glass */}
      <section className="flex flex-col rounded-3xl bg-surface-container-low/70 backdrop-blur-xl p-5 shadow-xl border border-white/[0.08] relative overflow-hidden animate-fade-in-up">
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <div className="w-36 h-48 rounded-2xl bg-surface-container-lowest border border-white/[0.06] overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-secondary text-[9px] font-mono border border-white/10">
              6 หน้าฉบับเต็ม
            </span>
          </div>

          <div className="flex-1 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-[10px] font-semibold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>Lab {book.labNumber} • {book.series}</span>
            </div>

            <h1 className="text-lg font-bold text-on-surface leading-tight">
              {book.title}
            </h1>
            <p className="text-xs text-on-surface-variant leading-relaxed font-normal">
              {book.description}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">ราคาจำหน่าย</span>
                <div className="text-xl font-extrabold text-secondary font-mono">฿{book.price}.00</div>
              </div>
              <div className="text-right text-[10px] text-on-surface-variant space-y-0.5 font-mono">
                <div>ผู้รับผิดชอบ: {book.curator}</div>
                <div>{book.specs.pages} หน้า • ภาษาไทย Master Edition</div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights List */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1.5">
          <span className="text-[11px] font-bold text-primary">หัวข้อสำคัญในเล่ม (E-book Highlights):</span>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-on-surface-variant">
            {book.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[14px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Customer Billing Form Card */}
      <section className="rounded-3xl bg-surface-container-low/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl border border-white/[0.08] space-y-4 animate-fade-in-up">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">badge</span>
            <span className="text-sm font-bold text-on-surface">ข้อมูลผู้สั่งซื้อ (สำหรับจัดส่งลิงก์ดาวน์โหลด)</span>
          </div>
          <span className="text-[10px] text-secondary bg-secondary/15 border border-secondary/30 px-2.5 py-0.5 rounded-full font-mono">
            Encrypted
          </span>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs animate-fade">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Full Name (ชื่อ-นามสกุล ของคุณ) <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">person</span>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="เช่น นายเกียรติภูมิ หารศรีนาถ"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:border-secondary/40 focus:ring-1 focus:ring-secondary/40 border border-white/[0.08] transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Delivery Email (อีเมลสำหรับรับไฟล์ E-book) <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">mail</span>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="เช่น student@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:border-secondary/40 focus:ring-1 focus:ring-secondary/40 border border-white/[0.08] transition-all shadow-inner"
              />
            </div>
            <p className="text-[10px] text-on-surface-variant/80 mt-1">
              📧 ระบบจะจัดส่งรหัสคำสั่งซื้อและลิงก์ดาวน์โหลดสำรองไปยังอีเมลนี้โดยอัตโนมัติ
            </p>
          </div>

          {/* Safety Notice */}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0">shield</span>
            <span>
              ข้อมูลของคุณได้รับการปกป้อง และใช้เพื่อการจำลองระบบจำหน่าย E-book ทางวิชาการเท่านั้น
            </span>
          </div>

          {/* Mandatory Demo Warning Banner */}
          <DemoWarningBanner />

          {/* Order Summary & Submit Button */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant">ยอดรวมทั้งสิ้น:</span>
              <span className="text-lg font-bold text-secondary font-mono">฿{book.price}.00</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-spring w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-secondary via-cyan-400 to-primary text-slate-950 text-xs font-bold shadow-lg shadow-cyan-950/40 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
              <span>{submitting ? "กำลังสร้างคำสั่งซื้อ..." : "ดำเนินการชำระเงิน (PromptPay QR) →"}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
