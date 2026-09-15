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
    <div className="space-y-5 max-w-lg mx-auto animate-fade">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary text-[10px] font-semibold">
          <span className="material-symbols-outlined text-[14px]">
            verified_user
          </span>
          <span>Instant Recovery</span>
        </div>
        <h1 className="text-xl font-bold text-on-surface tracking-tight">
          Self-Service Order Tracking
        </h1>
        <p className="text-xs text-on-surface-variant">
          ค้นหาประวัติคำสั่งซื้อ ตรวจสอบสถานะการชำระเงิน และขอรับลิงก์ดาวน์โหลดใหม่
        </p>
      </div>

      {/* Glass Lookup Form Card */}
      <div className="w-full rounded-3xl bg-surface-container-low/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl flex flex-col gap-3.5 border border-white/[0.08] animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[18px]">
              manage_search
            </span>
            <span className="text-xs font-bold text-on-surface">License Lookup</span>
          </div>
          <span className="text-[10px] text-secondary bg-secondary/15 border border-secondary/30 px-2.5 py-0.5 rounded-full font-mono">
            Encrypted
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-on-surface-variant">
                Order Reference ID (หมายเลขคำสั่งซื้อ)
              </label>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[10px] text-secondary hover:underline"
              >
                [ใช้รหัสทดสอบ Demo]
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                tag
              </span>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="เช่น ORD-2026-8821"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:border-secondary/40 focus:ring-1 focus:ring-secondary/40 border border-white/[0.08] font-mono shadow-inner transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Billing Email (อีเมลที่ใช้สั่งซื้อ)
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="เช่น buyer@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:border-secondary/40 focus:ring-1 focus:ring-secondary/40 border border-white/[0.08] shadow-inner transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-spring w-full py-3 px-4 rounded-xl bg-gradient-to-r from-secondary-container via-secondary to-primary text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/40 hover:opacity-95 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
            <span>
              {loading ? "กำลังค้นหาข้อมูลในระบบ..." : "Search Order Digital Vault"}
            </span>
          </button>
        </form>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Search Result Card */}
      {order && (
        <div className="w-full rounded-2xl bg-surface-container-high p-4 shadow-xl flex flex-col gap-3 specular-border animate-fade">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-on-surface">
                  {order.id}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-0.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface"
                  title="Copy"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
              <span className="text-[10px] text-on-surface-variant mt-0.5">
                ผู้สั่งซื้อ: {order.customerName}
              </span>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                order.status === "PAID"
                  ? "bg-secondary text-on-secondary"
                  : "bg-error text-on-error"
              }`}
            >
              {order.status === "PAID" ? "PAID & DELIVERED" : order.status}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest flex items-center justify-between specular-border gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                menu_book
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-on-surface truncate">
                  {order.bookTitle}
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  {order.fileName} • ฿{order.bookPrice}.00
                </span>
              </div>
            </div>

            <Link
              href={order.status === "PAID" ? `/order/${order.id}` : `/payment/${order.id}`}
              className="px-3 py-1.5 rounded-lg bg-secondary/15 text-secondary border border-secondary/30 text-xs font-semibold hover:bg-secondary hover:text-on-secondary transition-all shrink-0"
            >
              {order.status === "PAID" ? "Get Link →" : "Pay Now →"}
            </Link>
          </div>
        </div>
      )}

      {/* Back to Home */}
      <div className="text-center pt-2">
        <Link href="/" className="text-xs text-on-surface-variant hover:text-white">
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
          <span className="material-symbols-outlined text-secondary text-[36px] animate-spin">
            progress_activity
          </span>
          <p className="text-xs text-on-surface-variant mt-2">กำลังโหลดระบบค้นหา...</p>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
