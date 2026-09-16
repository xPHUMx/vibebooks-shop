"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Order } from "@/types";

function TrackingContent() {
  const searchParams = useSearchParams();
  const qOrderId = searchParams?.get("orderId") || "";
  const qEmail = searchParams?.get("email") || "";

  const [orderId, setOrderId] = useState(qOrderId || "ORD-2026-8821");
  const [email, setEmail] = useState(qEmail || "kiatphum.h@example.com");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (qOrderId && qEmail) {
      handleLookup(qOrderId, qEmail);
    }
  }, [qOrderId, qEmail]);

  const handleLookup = async (idToSearch = orderId, emailToSearch = email) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(
        `/api/orders?orderId=${encodeURIComponent(
          idToSearch.trim()
        )}&email=${encodeURIComponent(emailToSearch.trim())}`
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setOrder(data.order);
      } else {
        setOrder(null);
        setErrorMessage(
          data.error || "ไม่พบข้อมูลคำสั่งซื้อที่ตรงกับหมายเลขและอีเมลที่ระบุ"
        );
      }
    } catch (err) {
      setOrder(null);
      setErrorMessage("เกิดข้อผิดพลาดในการค้นหาข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup();
  };

  const handleFillDemo = () => {
    setOrderId("ORD-2026-8821");
    setEmail("kiatphum.h@example.com");
    handleLookup("ORD-2026-8821", "kiatphum.h@example.com");
  };

  const handleCopy = () => {
    if (order) {
      navigator.clipboard?.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-fade">
      {/* Page Header (Apple Style) */}
      <div className="text-center pt-2 sm:pt-6 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
          <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-[0.2em]">
            Order Recovery · 24/7
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
          <span className="bg-gradient-to-b from-white via-[#f5f5f7] to-[#86868b] bg-clip-text text-transparent">
            ติดตามและค้นหาคำสั่งซื้อ.
          </span>
        </h1>

        <p className="text-xs text-[#86868b] max-w-sm leading-relaxed">
          ตรวจสอบสถานะการชำระเงิน และขอรับลิงก์ดาวน์โหลด E-book ภาษาไทยฉบับเต็มได้ทันที
        </p>
      </div>

      {/* Apple Titanium Card Form */}
      <div className="w-full rounded-[24px] bg-[#161617] p-5 sm:p-6 border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-[18px]">manage_search</span>
            <span className="text-xs font-semibold text-[#f5f5f7]">License & Order Lookup</span>
          </div>
          <span className="text-[10px] text-[#86868b] font-mono">
            Direct Cloud Sync
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-medium text-[#86868b]">
                Order Reference ID (หมายเลขคำสั่งซื้อ)
              </label>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[10px] text-[#2997ff] hover:underline cursor-pointer"
              >
                [ใช้รหัสทดสอบ Demo]
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#86868b] text-[16px]">
                tag
              </span>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="เช่น ORD-2026-8821"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black text-[#f5f5f7] text-xs outline-none focus:border-white/25 border border-white/[0.08] font-mono transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
              Billing Email (อีเมลที่ใช้สั่งซื้อ)
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#86868b] text-[16px]">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="เช่น buyer@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black text-[#f5f5f7] text-xs outline-none focus:border-white/25 border border-white/[0.08] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="apple-btn-primary w-full py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
            <span>
              {loading ? "กำลังค้นหาข้อมูล..." : "ค้นหาคำสั่งซื้อ (Search Order)"}
            </span>
          </button>
        </form>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Search Result Card */}
      {order && (
        <div className="w-full rounded-[24px] bg-[#161617] p-5 border border-white/[0.08] shadow-xl space-y-3 animate-fade">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-[#f5f5f7]">
                  {order.id}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded bg-white/10 hover:bg-white/20 text-[#86868b] hover:text-white cursor-pointer"
                  title="คัดลอก"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
              <span className="text-[10px] text-[#86868b] mt-0.5">
                ผู้สั่งซื้อ: {order.customerName}
              </span>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                order.status === "PAID"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
              }`}
            >
              {order.status === "PAID" ? "PAID & READY" : order.status}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-black flex items-center justify-between border border-white/[0.06] gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-white text-[18px]">
                menu_book
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#f5f5f7] truncate">
                  {order.bookTitle}
                </span>
                <span className="text-[10px] text-[#86868b]">
                  {order.fileName} · ฿{order.bookPrice}.00
                </span>
              </div>
            </div>

            <Link
              href={order.status === "PAID" ? `/order/${order.id}` : `/payment/${order.id}`}
              className="apple-btn-primary px-3.5 py-1.5 text-xs font-semibold shrink-0"
            >
              {order.status === "PAID" ? "เปิดอ่าน →" : "ชำระเงิน →"}
            </Link>
          </div>
        </div>
      )}

      {/* Back to Home */}
      <div className="text-center pt-2">
        <Link href="/" className="text-xs text-[#86868b] hover:text-white transition-colors">
          ← กลับสู่หน้าร้านค้าหลัก
        </Link>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-white text-[32px] animate-spin">
            progress_activity
          </span>
          <p className="text-xs text-[#86868b] mt-2 font-mono">กำลังโหลดระบบค้นหา...</p>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
