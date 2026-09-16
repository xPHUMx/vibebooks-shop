"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Order } from "@/types";
import DemoWarningBanner from "@/components/DemoWarningBanner";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 mins demo timer

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders?orderId=${orderId}`);
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

  const handleSimulatePayment = async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/payment/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/order/${orderId}`);
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการยืนยันการชำระเงินจำลอง");
      }
    } catch (err) {
      alert("ไม่สามารถจำลองการชำระเงินได้");
    } finally {
      setPaying(false);
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

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-fade">
      {/* Prominent Mandatory DEMO Warning Banner */}
      <DemoWarningBanner />

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
                Thai QR Payment · Demo
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-mono border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Ready
          </span>
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
              ฿{order ? order.bookPrice : 199}.00
            </span>
          </div>
        </div>

        {/* QR Stage Container */}
        <div className="flex flex-col items-center justify-center p-5 rounded-[18px] bg-black border border-white/[0.06]">
          <div className="w-44 h-44 bg-white rounded-2xl p-3 flex flex-col items-center justify-center relative shadow-lg">
            {/* Simulated QR Pattern Graphic */}
            <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
              <rect x="5" y="5" width="25" height="25" fill="black" />
              <rect x="10" y="10" width="15" height="15" fill="white" />
              <rect x="13" y="13" width="9" height="9" fill="black" />
              <rect x="70" y="5" width="25" height="25" fill="black" />
              <rect x="75" y="10" width="15" height="15" fill="white" />
              <rect x="78" y="13" width="9" height="9" fill="black" />
              <rect x="5" y="70" width="25" height="25" fill="black" />
              <rect x="10" y="75" width="15" height="15" fill="white" />
              <rect x="13" y="78" width="9" height="9" fill="black" />
              <rect x="35" y="10" width="10" height="10" fill="black" />
              <rect x="50" y="15" width="12" height="8" fill="black" />
              <rect x="35" y="35" width="30" height="30" fill="black" />
              <rect x="42" y="42" width="16" height="16" fill="white" />
              <text x="50" y="52" fontSize="6" fontWeight="bold" fill="#0071e3" textAnchor="middle">
                DEMO
              </text>
              <rect x="70" y="35" width="8" height="15" fill="black" />
              <rect x="10" y="40" width="15" height="8" fill="black" />
              <rect x="35" y="75" width="15" height="15" fill="black" />
              <rect x="65" y="70" width="25" height="8" fill="black" />
              <rect x="75" y="85" width="15" height="10" fill="black" />
            </svg>
            <div className="absolute bottom-1 px-2 py-0.5 bg-rose-600 text-white text-[8px] font-bold rounded-full uppercase tracking-wider">
              TEST QR ONLY
            </div>
          </div>

          <div className="mt-3 text-[11px] text-[#86868b] font-mono">
            PromptPay ID: 000-000-0000 (Simulated Demo)
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#86868b] font-mono">
            <span className="material-symbols-outlined text-[15px]">timer</span>
            <span>เวลารอดำเนินการ:</span>
            <span className="text-[#f5f5f7] font-bold">{formatTime(countdown)}</span>
          </div>
        </div>

        {/* Action Button: Simulate Payment (Apple Blue Button) */}
        <button
          onClick={handleSimulatePayment}
          disabled={paying}
          className="apple-btn-primary w-full py-3 text-xs font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {paying ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
              <span>กำลังตรวจสอบยอดเงิน...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>จำลองการโอนเงินสำเร็จ (Simulate Pay)</span>
            </>
          )}
        </button>

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
