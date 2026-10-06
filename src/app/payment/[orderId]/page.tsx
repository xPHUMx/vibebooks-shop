"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Order } from "@/types";
import { getPromptPayQRUrl } from "@/lib/promptpay";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const { user, openAuthModal } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 mins demo timer

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

  useEffect(() => {
    async function fetchOrder() {
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`/api/orders?orderId=${orderId}`, {
          headers: authHeaders,
        });
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          // If already paid, forward to delivery view
          if (data.order.status === "PAID") {
            router.push(`/order/${orderId}`);
          }
        }
      } catch (err) {
        console.error("Fetch order error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSlipFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพสลิป (.jpg, .png, .webp)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("ขนาดไฟล์รูปภาพสลิปต้องไม่เกิน 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSlipPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitSlip = async () => {
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการแนบสลิปชำระเงิน");
      openAuthModal("signin");
      return;
    }

    if (!slipPreview) {
      alert("กรุณาเลือกรูปภาพสลิปการโอนเงินก่อนกดยืนยัน");
      return;
    }

    setUploadingSlip(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/payment/slip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          orderId,
          slipData: slipPreview,
          autoVerify: false,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("vibebooks_last_pending_order_id", orderId);
        }
        router.push(`/order/${orderId}`);
      } else {
        if (data.requireLogin) {
          openAuthModal("signin");
        }
        alert(data.error || "เกิดข้อผิดพลาดในการแนบสลิป");
      }
    } catch {
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์เพื่อแนบสลิปได้");
    } finally {
      setUploadingSlip(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 animate-fade">
        <span className="material-symbols-outlined text-white text-[32px] animate-spin">
          progress_activity
        </span>
        <p className="text-xs text-[#86868b] mt-2 font-mono">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
      </div>
    );
  }

  const activeStoreName = order?.merchantName || "Book Sangdai Official";
  const activePromptPay = order?.merchantPromptPay || process.env.NEXT_PUBLIC_DEFAULT_PROMPTPAY || "081-234-5678";
  const totalAmount = order?.totalAmount || order?.bookPrice || 199;

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-fade">
      {/* Main Payment Gateway Card (Apple Minimalism) */}
      <div className="w-full bg-[#161617] rounded-[24px] p-5 sm:p-6 border border-white/[0.08] shadow-2xl flex flex-col space-y-4">
        {/* PromptPay Header Bar */}
        <div className="w-full bg-black rounded-[18px] p-4 flex items-center justify-between border border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="h-10 px-2.5 py-1 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/prompt-pay-logo.png"
                alt="PromptPay Logo"
                className="h-7 w-auto object-contain max-w-[120px]"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-sm font-semibold tracking-tight">PromptPay พร้อมเพย์</span>
              <span className="text-[#86868b] text-[10px] font-medium uppercase tracking-wider">
                Thai QR Payment
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-mono border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Ready
          </span>
        </div>

        {/* Store & Direct PromptPay Target Banner */}
        <div className="w-full bg-white/5 rounded-[16px] p-3.5 border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#86868b] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-amber-400">storefront</span>
              ร้านค้าผู้รับโอน:
            </span>
            <span className="text-white font-bold">{activeStoreName}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/[0.06]">
            <span className="text-[#86868b] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-emerald-400">contact_phone</span>
              เบอร์พร้อมเพย์ร้าน:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-400 font-bold tracking-wider">{activePromptPay}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activePromptPay.replace(/[^0-9]/g, ''));
                  alert(`คัดลอกเบอร์พร้อมเพย์ ${activePromptPay} แล้ว!`);
                }}
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-[#86868b] hover:text-white transition-colors"
                title="คัดลอกเบอร์พร้อมเพย์"
              >
                <span className="material-symbols-outlined text-[12px]">content_copy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary Strip */}
        <div className="w-full bg-black rounded-[16px] p-3.5 flex items-center justify-between gap-3 border border-white/[0.06]">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-[#86868b] uppercase tracking-wider">Order Reference</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-[#f5f5f7] font-mono font-bold truncate">{orderId}</span>
              <button
                onClick={handleCopyRef}
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-[#86868b] hover:text-white transition-colors cursor-pointer"
                title="คัดลอกรหัสคำสั่งซื้อ"
              >
                <span className="material-symbols-outlined text-[13px]">
                  {copied ? "check" : "content_copy"}
                </span>
              </button>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] text-[#86868b] uppercase tracking-wider">Amount Due</span>
            <span className="text-lg font-bold text-[#f5f5f7] tracking-tight font-mono">
              ฿{totalAmount}.00
            </span>
          </div>
        </div>

        {/* QR Stage Container */}
        <div className="flex flex-col items-center justify-center p-5 rounded-[18px] bg-black border border-white/[0.06]">
          <div className="w-52 h-52 bg-white rounded-2xl p-2.5 flex items-center justify-center shadow-lg relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getPromptPayQRUrl(activePromptPay, totalAmount)}
              alt="PromptPay EMVCo QR Code"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="mt-3 text-[11px] text-[#86868b] font-mono text-center">
            สแกนเพื่อโอนเงินตรงเข้าบัญชีร้านค้า ({activePromptPay})
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#86868b] font-mono">
            <span className="material-symbols-outlined text-[15px]">timer</span>
            <span>เวลารอดำเนินการ:</span>
            <span className="text-[#f5f5f7] font-bold">{formatTime(countdown)}</span>
          </div>
        </div>

        {/* Real Slip Upload Section */}
        <div className="p-4 rounded-[18px] bg-white/[0.03] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#f5f5f7] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#2997ff]">receipt_long</span>
              แนบหลักฐานการโอนเงิน (สลิป)
            </span>
            <span className="text-[10px] text-[#86868b]">JPG, PNG, WEBP</span>
          </div>

          {!user ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>กรุณาเข้าสู่ระบบก่อนแนบสลิปชำระเงิน</span>
              </div>
              <p className="text-[11px] text-[#86868b] leading-relaxed">
                จำเป็นต้องเข้าสู่ระบบเพื่อให้สลิปและสิทธิ์การรับไฟล์ผูกกับบัญชีของคุณอย่างถูกต้อง
              </p>
              <button
                type="button"
                onClick={() => openAuthModal("signin")}
                className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">login</span>
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            </div>
          ) : slipPreview ? (
            <div className="space-y-2.5">
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 max-h-48 flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slipPreview}
                  alt="Slip Preview"
                  className="max-h-44 w-auto object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setSlipPreview(null)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-xs"
                  title="เปลี่ยนรูปภาพ"
                >
                  ✕
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmitSlip}
                disabled={uploadingSlip}
                className="apple-btn-primary w-full py-3 text-xs font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploadingSlip ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                    <span>กำลังส่งสลิปให้ร้านค้าตรวจสอบ...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>ส่งสลิปให้ร้านค้าตรวจสอบ & รออนุมัติปล่อยไฟล์</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-white/15 hover:border-[#2997ff]/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-black/20">
              <span className="material-symbols-outlined text-2xl text-[#86868b] mb-1">
                add_photo_alternate
              </span>
              <span className="text-xs font-semibold text-[#f5f5f7]">
                คลิกเพื่อเลือกรูปสลิปจากเครื่อง
              </span>
              <span className="text-[10px] text-[#86868b] mt-0.5">
                เลือกสลิปจากแอปธนาคารของคุณ
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSlipFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-[11px] text-[#86868b] hover:text-white transition-colors"
          >
            ยกเลิกและกลับสู่หน้าร้านค้า
          </Link>
        </div>
      </div>
    </div>
  );
}
