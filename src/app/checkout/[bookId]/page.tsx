"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBookById } from "@/lib/booksData";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.bookId as string;
  const book = getBookById(bookId);
  const { user, profile, openAuthModal } = useAuth();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      setCustomerEmail(user.email || "");
      setCustomerName(profile?.fullName || user.user_metadata?.full_name || "");
    } else {
      setCustomerEmail("");
      setCustomerName("");
    }
  }, [user, profile]);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch {}
    return {};
  };

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

    if (!user) {
      setErrorMessage("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ");
      openAuthModal("signin");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          bookId: book.id,
          customerName: customerName || user.user_metadata?.full_name || "ลูกค้าผู้สั่งซื้อ",
          customerEmail: user.email || customerEmail,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        router.push(`/payment/${data.order.id}`);
      } else {
        if (data.requireLogin) {
          openAuthModal("signin");
        }
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
                <div>{book.specs?.pages || 120} หน้า · ภาษาไทย Master Edition</div>
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

        {/* Login Requirement Banner */}
        {!user ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-white space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>กรุณาเข้าสู่ระบบก่อนดำเนินการชำระเงิน</span>
            </div>
            <p className="text-[11px] text-[#86868b] leading-relaxed">
              ระบบจำเป็นต้องบันทึกประวัติการสั่งซื้อและสิทธิ์ดาวน์โหลดไฟล์ผูกกับบัญชีของคุณ เพื่อให้เข้าถึงไฟล์ได้ถาวร
            </p>
            <button
              type="button"
              onClick={() => openAuthModal("signin")}
              className="mt-1 px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">login</span>
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[16px] shrink-0">verified_user</span>
              <span className="truncate">เข้าสู่ระบบแล้ว: <strong>{user.email}</strong></span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">ผูกบัญชีแล้ว</span>
          </div>
        )}

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
            <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 flex items-center justify-between">
              <span>อีเมลรับ E-book และสิทธิ์ดาวน์โหลด</span>
              {user && <span className="text-[10px] text-[#86868b]">ผูกกับบัญชีล็อกอิน</span>}
            </label>
            <input
              type="email"
              required
              readOnly={!!user}
              value={user ? (user.email || "") : customerEmail}
              onChange={(e) => !user && setCustomerEmail(e.target.value)}
              placeholder={user ? user.email || "" : "กรุณาเข้าสู่ระบบก่อน"}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition-all ${
                user
                  ? "bg-white/[0.04] border-white/[0.08] text-white/80 cursor-not-allowed"
                  : "bg-black border-white/[0.08] text-[#f5f5f7]"
              }`}
            />
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#86868b] block">ยอดชำระสุทธิ</span>
              <span className="text-xl font-bold text-[#f5f5f7] font-mono">฿{book.price}.00</span>
            </div>

            {!user ? (
              <button
                type="button"
                onClick={() => openAuthModal("signin")}
                className="apple-btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">lock</span>
                <span>เข้าสู่ระบบก่อนเพื่อสั่งซื้อ</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="apple-btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span>{submitting ? "กำลังสร้างคำสั่งซื้อ..." : "ไปยังหน้าชำระเงิน"}</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
