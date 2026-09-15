"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Order } from "@/types";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15:00 mins

  useEffect(() => {
    // Fire celebratory confetti on page load
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#ec4899", "#06b6d4"],
      });
    } catch (e) {
      // ignore
    }

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

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/download/${orderId}`);
      const data = await res.json();

      if (data.success) {
        if (data.downloadUrl && !data.simulated) {
          window.open(data.downloadUrl, "_blank");
        } else {
          // Simulated instant download for academic showcase
          const blob = new Blob(
            [
              `%PDF-1.4\n% VibeBooks PRO Academic Demo\nTitle: ${order?.bookTitle || "E-book"}\nAuthor: นายเกียรติภูมิ หารศรีนาถ (64332110242-2)\nOrder ID: ${orderId}\nLicense: Verified Single-User Educational Grant\n`
            ],
            { type: "application/pdf" }
          );
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = order?.fileName || "ebook_download.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการดาวน์โหลด");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อดาวน์โหลด");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-secondary text-[36px] animate-spin">
          progress_activity
        </span>
        <p className="text-xs text-on-surface-variant mt-2">กำลังโหลดข้อมูลการส่งมอบ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto animate-fade">
      {/* Top Success Card from Stitch */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-6 shadow-xl text-center flex flex-col items-center specular-border">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-secondary/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative mb-2 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-secondary/25 blur-lg animate-pulse"></div>
          <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center shadow-lg relative">
            <span
              className="material-symbols-outlined text-secondary text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-on-surface tracking-tight mb-1">
          สั่งซื้อและชำระเงินสำเร็จเรียบร้อย! 🎉
        </h1>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container-highest shadow-sm mb-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
          <span className="text-[10px] text-secondary uppercase tracking-wider font-bold">
            Status: PAID (Verified Simulation)
          </span>
        </div>

        <div className="text-[11px] text-on-surface-variant">
          Ref: <strong className="text-on-surface font-mono">{orderId}</strong> •{" "}
          <span>{order?.customerName || "คุณลูกค้า"}</span>
        </div>
      </div>

      {/* Simulated Transactional Email Card */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container p-4 shadow-md flex items-start gap-3 specular-border">
        <div className="w-9 h-9 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-[20px]">
            mark_email_read
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-on-surface font-semibold truncate">
            จัดส่งใบเสร็จและลิงก์สำรองทางอีเมลแล้ว
          </span>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            ส่งไปยัง:{" "}
            <span className="text-secondary font-mono">
              {order?.customerEmail || "buyer@example.com"}
            </span>
          </p>
          <p className="text-[10px] text-outline mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">info</span>
            <span>ตรวจสอบในกล่องขาเข้าหรือ Junk Mail หากไม่พบใน 60 วินาที</span>
          </p>
        </div>
      </div>

      {/* Secure Digital Delivery Card (15-min signed URL) */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container p-5 shadow-xl specular-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[18px]">
              encrypted
            </span>
            <span className="text-xs font-bold text-on-surface">Secure Digital Delivery</span>
          </div>
          <span className="text-[10px] text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full font-mono border border-secondary/20">
            ⏱ หมดอายุใน: {formatCountdown(countdown)} น.
          </span>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-3 flex items-center gap-3 shadow-inner specular-border">
          <div className="w-10 h-12 rounded-lg bg-surface-container-high flex flex-col items-center justify-center shrink-0 shadow relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-tertiary-container"></div>
            <span className="material-symbols-outlined text-tertiary-container text-[22px]">
              picture_as_pdf
            </span>
            <span className="text-[8px] text-tertiary font-bold uppercase">PDF</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="text-xs font-bold text-on-surface truncate">
              {order?.fileName || "Media_Player_PRO_Engineering.pdf"}
            </h2>
            <p className="text-[10px] text-on-surface-variant">
              ระบบใช้ Supabase Temporary Signed URL ปลอดภัยสูงสุด
            </p>
          </div>
        </div>

        {/* Download Action Button */}
        <button
          onClick={handleDownload}
          disabled={downloading || countdown === 0}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-secondary via-secondary-container to-primary text-on-secondary text-xs font-bold shadow-lg shadow-cyan-950/40 hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>
            {downloading
              ? "กำลังสร้างไฟล์ดาวน์โหลด..."
              : countdown === 0
              ? "ลิงก์หมดอายุแล้ว กรุณาขอใหม่ที่หน้า Tracking"
              : "ดาวน์โหลดไฟล์ E-book PDF ทันที"}
          </span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="pt-2 flex items-center justify-between text-xs">
        <Link
          href={`/tracking?orderId=${orderId}&email=${encodeURIComponent(
            order?.customerEmail || ""
          )}`}
          className="text-secondary hover:underline flex items-center gap-1"
        >
          <span>ตรวจสอบในหน้า Tracking Portal</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
        <Link href="/" className="text-on-surface-variant hover:text-white transition-colors">
          กลับสู่หน้าร้านค้าหลัก
        </Link>
      </div>
    </div>
  );
}
