"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DemoWarningBanner from "@/components/DemoWarningBanner";
import { Order } from "@/types";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(899); // 14:59 mins

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders?orderId=${orderId}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
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
  }, [orderId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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
        alert(data.error || "เกิดข้อผิดพลาดในการจำลองการชำระเงิน");
        setPaying(false);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setPaying(false);
    }
  };

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-secondary text-[36px] animate-spin">
          progress_activity
        </span>
        <p className="text-xs text-on-surface-variant mt-2">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto animate-fade">
      {/* Prominent Mandatory DEMO Warning Banner */}
      <DemoWarningBanner />

      {/* Main Payment Gateway Card from Stitch */}
      <div className="w-full bg-surface-container-high/90 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl specular-border flex flex-col relative overflow-hidden">
        {/* Thai PromptPay Branded Header Bar */}
        <div className="w-full bg-gradient-to-r from-[#0d2a54] via-[#1a437a] to-[#261f5c] rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="h-11 px-2.5 py-1 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
              <img
                src="/prompt-pay-logo.png"
                alt="PromptPay Logo"
                className="h-8 w-auto object-contain max-w-[120px]"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-sm font-bold tracking-tight">PromptPay พร้อมเพย์</span>
              <span className="text-secondary-fixed text-[10px] font-semibold tracking-wider uppercase">
                Thai QR Payment • Simulated Demo
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
            Ready to scan
          </span>
        </div>

        {/* Order Summary Strip */}
        <div className="mt-4 w-full bg-surface-container-lowest/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-inner specular-border">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Order Reference</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-on-surface font-mono font-bold truncate">{orderId}</span>
              <button
                onClick={handleCopyRef}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-secondary transition-colors"
                title="คัดลอกรหัสคำสั่งซื้อ"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copied ? "check" : "content_copy"}
                </span>
              </button>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Amount Due</span>
            <span className="text-lg font-bold text-secondary tracking-tight">
              ฿{order ? order.bookPrice : 199}.00
            </span>
          </div>
        </div>

        {/* QR Stage Container */}
        <div className="mt-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-surface-container-lowest specular-border shadow-inner">
          <div className="w-48 h-48 bg-white rounded-xl p-3 flex flex-col items-center justify-center relative shadow-md">
            {/* Simulated QR Pattern Graphic */}
            <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
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
              <text x="50" y="52" fontSize="6" fontWeight="bold" fill="#7c3aed" textAnchor="middle">
                DEMO
              </text>
              <rect x="70" y="35" width="8" height="15" fill="black" />
              <rect x="10" y="40" width="15" height="8" fill="black" />
              <rect x="35" y="75" width="15" height="15" fill="black" />
              <rect x="65" y="70" width="25" height="8" fill="black" />
              <rect x="75" y="85" width="15" height="10" fill="black" />
            </svg>
            <div className="absolute bottom-1 px-2 py-0.5 bg-rose-600 text-white text-[8px] font-black rounded-full uppercase tracking-wider">
              TEST QR ONLY
            </div>
          </div>

          <div className="mt-2 text-[10px] text-on-surface-variant font-mono">
            PromptPay ID: 000-000-0000 (Simulated Demo Account)
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary">timer</span>
            <span>เวลารอดำเนินการ:</span>
            <span className="font-mono font-bold text-secondary">{formatTime(countdown)} นาที</span>
          </div>
        </div>

        {/* Customer Breakdown */}
        {order && (
          <div className="mt-4 p-3 rounded-xl bg-surface-container text-xs text-on-surface-variant space-y-1">
            <div className="flex justify-between">
              <span>รายการ:</span>
              <span className="text-on-surface font-medium">{order.bookTitle}</span>
            </div>
            <div className="flex justify-between">
              <span>ผู้สั่งซื้อ:</span>
              <span className="text-on-surface font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>ส่งไปที่อีเมล:</span>
              <span className="text-secondary font-mono">{order.customerEmail}</span>
            </div>
          </div>
        )}

        {/* Simulation Action */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleSimulatePayment}
            disabled={paying}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-secondary-container via-secondary to-primary-container text-on-secondary font-bold text-xs shadow-lg shadow-cyan-950/40 hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {paying ? (
              <span>กำลังตรวจสอบการชำระเงินจำลอง...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>[กดเพื่อทดสอบ] จำลองการชำระเงินสำเร็จ (Simulate Pay)</span>
              </>
            )}
          </button>

          <Link
            href="/"
            className="block w-full text-center text-[11px] text-on-surface-variant hover:text-white py-1 transition-colors"
          >
            ยกเลิกและกลับสู่หน้าร้านค้า
          </Link>
        </div>
      </div>
    </div>
  );
}
