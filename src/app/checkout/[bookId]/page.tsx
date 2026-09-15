"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBookById } from "@/lib/booksData";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.bookId as string;
  const book = getBookById(bookId);

  const [customerName, setCustomerName] = useState("นายเกียรติภูมิ หารศรีนาถ");
  const [customerEmail, setCustomerEmail] = useState("kiatphum.h@example.com");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!book) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-lg font-bold text-on-surface">ไม่พบข้อมูลหนังสือที่ต้องการ</h2>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-on-secondary text-xs font-bold"
        >
          กลับสู่หน้าร้านค้า
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      if (!res.ok || !data.success) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ");
      }

      // Navigate to mock payment gateway
      router.push(`/payment/${data.order.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to proceed to checkout");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto animate-fade">
      {/* Back to Catalog Pill */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high/80 text-on-surface hover:text-secondary text-xs transition-all shadow-sm"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Back to Catalog</span>
      </Link>

      {/* Selected Book Showcase Card from Stitch */}
      <section className="flex flex-col rounded-2xl bg-surface-container p-5 shadow-xl specular-border relative overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <div className="w-36 h-48 rounded-xl bg-surface-container-lowest p-3 flex flex-col items-center justify-center shrink-0 shadow-inner relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-contain rounded drop-shadow-md"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary text-[10px] font-semibold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>Lab {book.labNumber} • {book.series}</span>
            </div>

            <h1 className="text-lg font-bold text-on-surface leading-tight">
              {book.title}
            </h1>
            <p className="text-xs text-on-surface-variant leading-relaxed font-normal">
              {book.description}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Price</span>
                <div className="text-xl font-black text-secondary">฿{book.price}.00</div>
              </div>
              <div className="text-right text-[10px] text-on-surface-variant">
                <div>Curator: {book.curator}</div>
                <div>{book.specs.pages} หน้า • {book.specs.format}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
          <span className="text-[11px] font-bold text-primary">เนื้อหาและจุดเด่นในเล่ม:</span>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-on-surface-variant">
            {book.highlights.map((h, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Customer Billing Form Card */}
      <section className="rounded-2xl bg-surface-container-high/90 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl specular-border space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">badge</span>
            <span className="text-sm font-bold text-on-surface">ข้อมูลผู้สั่งซื้อ (สำหรับจัดส่งลิงก์ดาวน์โหลด)</span>
          </div>
          <span className="text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Encrypted</span>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs">
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary specular-border transition-all shadow-inner"
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary specular-border transition-all shadow-inner"
              />
            </div>
            <p className="text-[10px] text-on-surface-variant/80 mt-1">
              📧 ระบบจะจัดส่งรหัสคำสั่งซื้อและลิงก์ดาวน์โหลดสำรองไปยังอีเมลนี้โดยอัตโนมัติ
            </p>
          </div>

          {/* Safety Notice */}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>ขั้นตอนถัดไปเป็นระบบชำระเงินจำลอง (DEMO ONLY) สำหรับทดสอบโครงงาน</span>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-container via-primary to-secondary text-on-primary-container text-xs font-bold shadow-lg shadow-purple-950/40 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>กำลังสร้างคำสั่งซื้อ...</span>
            ) : (
              <>
                <span>ดำเนินการต่อ เพื่อชำระเงิน (จำลอง) →</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
