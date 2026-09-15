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
  const [showReader, setShowReader] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15:00 mins

  useEffect(() => {
    // Fire celebratory confetti on page load
    try {
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b"],
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

  const pdfStreamUrl = `/api/pdf/${orderId}`;

  // Direct open / navigation for iOS WKWebView (MIT App Inventor Companion on iPhone)
  const handleOpenDirect = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/download/${orderId}`);
      const data = await res.json();
      const targetUrl = data.downloadUrl || pdfStreamUrl;

      // In iOS MIT App Inventor WebViewer, window.location.href navigates directly to the PDF
      // which triggers iOS native PDF renderer with pinch-to-zoom and Save to Files action sheet!
      window.location.href = targetUrl;
    } catch (err) {
      window.location.href = pdfStreamUrl;
    } finally {
      setDownloading(false);
    }
  };

  // Copy direct URL to clipboard for Safari / Files app
  const handleCopyPdfLink = async () => {
    try {
      const fullUrl = `${window.location.origin}${pdfStreamUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3500);
    } catch (err) {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3500);
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

      {/* Secure Digital Delivery Card */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container p-5 shadow-xl specular-border space-y-4">
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

        {/* E-book File Information Box */}
        <div className="rounded-2xl bg-surface-container-lowest p-3.5 flex items-center gap-3.5 shadow-inner border border-white/[0.06]">
          <div className="w-12 h-14 rounded-xl bg-surface-container-high flex flex-col items-center justify-center shrink-0 shadow relative overflow-hidden border border-white/10">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-secondary"></div>
            <span className="material-symbols-outlined text-secondary text-[24px]">
              menu_book
            </span>
            <span className="text-[7.5px] text-secondary-fixed font-bold uppercase font-mono">6 หน้าไทย</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="text-xs font-bold text-on-surface truncate">
              {order?.bookTitle || "FastPlayer PRO (Media Player Engineering)"}
            </h2>
            <span className="text-[10px] text-secondary font-mono truncate">
              {order?.fileName || "Media_Player_PRO_Engineering.pdf"}
            </span>
            <p className="text-[10px] text-on-surface-variant mt-0.5">
              ฉบับสมบูรณ์ภาษาไทย 6 หน้า • Supabase Vault Certified
            </p>
          </div>
        </div>

        {/* Action 1: IN-APP PDF READER (Primary for MIT App Inventor & iPhone) */}
        <button
          onClick={() => setShowReader(!showReader)}
          className="btn-spring w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-secondary via-cyan-400 to-primary text-slate-950 text-xs font-bold shadow-lg shadow-cyan-950/40 hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">
            {showReader ? "visibility_off" : "auto_stories"}
          </span>
          <span>
            {showReader
              ? "ซ่อนหน้าต่างอ่าน E-book"
              : "📖 เปิดอ่าน E-book ทันที (In-App Reader สำหรับมือถือ & ไอโฟน)"}
          </span>
        </button>

        {/* Secondary Action Grid (Direct Open & Copy Link) */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleOpenDirect}
            disabled={downloading || countdown === 0}
            className="btn-spring py-2.5 px-3 rounded-xl bg-surface-container-highest/70 hover:bg-surface-container-highest text-on-surface text-xs font-semibold border border-white/[0.08] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">
              open_in_browser
            </span>
            <span>เปิดเต็มหน้าจอ (Safari)</span>
          </button>

          <button
            onClick={handleCopyPdfLink}
            className="btn-spring py-2.5 px-3 rounded-xl bg-surface-container-highest/70 hover:bg-surface-container-highest text-on-surface text-xs font-semibold border border-white/[0.08] transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">
              {copiedLink ? "check_circle" : "content_copy"}
            </span>
            <span>{copiedLink ? "คัดลอกลิงก์แล้ว!" : "คัดลอกลิงก์ดาวน์โหลด"}</span>
          </button>
        </div>

        {/* Copied Toast Banner */}
        {copiedLink && (
          <div className="p-2.5 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary text-[11px] flex items-center gap-2 animate-fade">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>
              คัดลอกลิงก์แล้ว! นำไปวางในแอป Safari บน iPhone เพื่อบันทึกเข้าแอป &quot;ไฟล์ (Files)&quot; หรือ &quot;Books&quot; ได้ทันที
            </span>
          </div>
        )}

        {/* Special Tip Card for iPhone & MIT App Inventor Companion */}
        <div className="rounded-xl bg-surface-container-lowest/80 p-3.5 specular-border space-y-1.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-secondary font-bold">
            <span className="material-symbols-outlined text-[16px]">phone_iphone</span>
            <span>คำแนะนำการเปิดไฟล์บน iPhone (MIT Companion / iOS):</span>
          </div>
          <ul className="text-on-surface-variant space-y-1 pl-4 list-disc text-[10.5px] leading-relaxed">
            <li>
              <strong className="text-on-surface">วิธีที่ 1 (สะดวกที่สุด):</strong> กดปุ่ม{" "}
              <span className="text-secondary font-semibold">&quot;เปิดอ่าน E-book ทันที&quot;</span> ด้านบน เพื่ออ่านเนื้อหาฉบับสมบูรณ์ 6 หน้าได้ในแอปทันที
            </li>
            <li>
              <strong className="text-on-surface">วิธีที่ 2 (บันทึกลง iPhone):</strong> กด{" "}
              <span className="text-secondary font-semibold">&quot;คัดลอกลิงก์ดาวน์โหลด&quot;</span> แล้วเปิดใน Safari จากนั้นกดปุ่มแชร์ &rarr; &quot;บันทึกไปยังไฟล์ (Save to Files)&quot;
            </li>
          </ul>
        </div>
      </div>

      {/* Embedded In-App PDF Reader Modal / Drawer */}
      {showReader && (
        <div className="rounded-2xl bg-surface-container-high p-4 shadow-2xl specular-border space-y-3 animate-fade">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                menu_book
              </span>
              <span className="text-xs font-bold text-on-surface truncate">
                {order?.bookTitle || "E-book Reader"} (6 หน้าฉบับสมบูรณ์)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={pdfStreamUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded-lg bg-surface-container hover:bg-surface-container-highest text-secondary transition-colors"
                title="เปิดในแท็บใหม่"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
              <button
                onClick={() => setShowReader(false)}
                className="p-1 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface-variant hover:text-white transition-colors"
                title="ปิดตัวอ่าน"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          {/* Embedded Native WKWebView/Browser PDF Canvas */}
          <div className="w-full h-[68vh] rounded-xl overflow-hidden bg-slate-950 border border-white/10 shadow-inner relative">
            <iframe
              src={pdfStreamUrl}
              className="w-full h-full border-0 rounded-xl"
              title="E-book Viewer"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
            <span>💡 สามารถใช้สองนิ้วซูมขยาย (Pinch-to-zoom) และเลื่อนอ่านได้ทุกหน้า</span>
            <button
              onClick={() => setShowReader(false)}
              className="text-secondary hover:underline font-semibold"
            >
              ปิดหน้าต่าง [✕]
            </button>
          </div>
        </div>
      )}

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
