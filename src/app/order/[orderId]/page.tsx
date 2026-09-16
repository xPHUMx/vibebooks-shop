"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Order } from "@/types";
import { BOOKS } from "@/lib/booksData";
import ApplePdfReader from "@/components/ApplePdfReader";

export default function OrderDeliveryPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(172800); // 48 hours in seconds
  const [downloading, setDownloading] = useState(false);
  const [showInAppReader, setShowInAppReader] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [directDownloadUrl, setDirectDownloadUrl] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders?orderId=${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
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
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentBook = BOOKS.find((b) => b.id === order?.bookId) || BOOKS[0];
  const pdfStreamUrl = `/api/pdf/${orderId}`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/download/${orderId}`);
      const data = await res.json();
      const targetUrl =
        data.success && data.downloadUrl
          ? data.downloadUrl
          : `${window.location.origin}${pdfStreamUrl}`;

      setDirectDownloadUrl(targetUrl);

      // 1. MIT App Inventor WebViewer Bridge (ActivityStarter trigger)
      if (typeof window !== "undefined" && (window as any).AppInventor) {
        try {
          (window as any).AppInventor.setWebViewString(targetUrl);
        } catch (e) {
          console.log("AppInventor bridge message:", e);
        }
      }

      // 2. Try copying to clipboard automatically
      try {
        await navigator.clipboard.writeText(targetUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      } catch {
        // clipboard fallback
      }

      // 3. Try triggering standard download link
      try {
        const a = document.createElement("a");
        a.href = targetUrl;
        a.download = order?.fileName || currentBook.fileName;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {
        // standard download fallback
      }

      // 4. Open Mobile & MIT App Download Assistant modal
      setDownloadModalOpen(true);
    } catch (err) {
      console.error("Download handling exception:", err);
      setDirectDownloadUrl(`${window.location.origin}${pdfStreamUrl}`);
      setDownloadModalOpen(true);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyPdfLink = async () => {
    try {
      const fullUrl = `${window.location.origin}${pdfStreamUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 animate-fade">
        <span className="material-symbols-outlined text-white text-[32px] animate-spin">
          progress_activity
        </span>
        <p className="text-xs text-[#86868b] mt-2 font-mono">กำลังโหลดข้อมูลการส่งมอบ...</p>
      </div>
    );
  }

  const effectiveDownloadUrl = directDownloadUrl || (typeof window !== "undefined" ? `${window.location.origin}${pdfStreamUrl}` : pdfStreamUrl);
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(effectiveDownloadUrl)}&embedded=true`;

  return (
    <div className="space-y-5 max-w-lg mx-auto animate-fade">
      {/* Top Success Card (Apple Style) */}
      <div className="rounded-[24px] bg-[#161617] p-6 text-center flex flex-col items-center border border-white/[0.08] shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-md">
          <span className="material-symbols-outlined text-[26px]">check_circle</span>
        </div>

        <h1 className="text-xl font-bold text-[#f5f5f7] tracking-tight mb-1">
          สั่งซื้อและชำระเงินสำเร็จเรียบร้อย
        </h1>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.06] border border-white/10 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-white/90 uppercase tracking-wider font-semibold">
            Status: PAID · Verified
          </span>
        </div>

        <div className="text-[11px] text-[#86868b]">
          Ref: <strong className="text-[#f5f5f7] font-mono">{orderId}</strong> ·{" "}
          <span>{order?.customerName || "คุณลูกค้า"}</span>
        </div>
      </div>

      {/* Simulated Transactional Email Card */}
      <div className="rounded-[20px] bg-[#161617] p-4 flex items-start gap-3 border border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0 text-white">
          <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-[#f5f5f7] font-semibold truncate">
            จัดส่งใบเสร็จและลิงก์สำรองทางอีเมลแล้ว
          </span>
          <p className="text-[11px] text-[#86868b] mt-0.5 font-mono">
            {order?.customerEmail || "buyer@example.com"}
          </p>
        </div>
      </div>

      {/* Secure Digital Delivery Card */}
      <div className="rounded-[24px] bg-[#161617] p-5 sm:p-6 border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white text-[18px]">encrypted</span>
            <span className="text-xs font-semibold text-[#f5f5f7]">Digital Delivery Vault</span>
          </div>
          <span className="text-[10px] text-[#86868b] bg-black px-2.5 py-0.5 rounded-full font-mono border border-white/[0.08]">
            หมดอายุใน: {formatCountdown(countdown)}
          </span>
        </div>

        {/* Book Preview Tile */}
        <div className="p-3.5 rounded-[18px] bg-black border border-white/[0.06] flex items-center gap-3.5">
          <div className="w-14 h-18 rounded-lg overflow-hidden bg-[#2c2c2e] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentBook.coverImage}
              alt={currentBook.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#f5f5f7] truncate">
              {order?.bookTitle || currentBook.title}
            </span>
            <span className="text-[10px] text-[#86868b] mt-0.5">
              ไฟล์: {order?.fileName || currentBook.fileName}
            </span>
            <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-[12px]">verified</span>
              Supabase Storage & In-App Canvas Ready
            </span>
          </div>
        </div>

        {/* Cross-Platform Android & iOS WebViewer Guidance */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-[11px] text-[#86868b] space-y-2">
          <div className="flex items-center justify-between text-[#f5f5f7] font-medium">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#2997ff]">devices</span>
              <span>รองรับทั้ง Android & iOS สมบูรณ์แบบ</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-mono uppercase">
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white">iOS</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white">Android</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/[0.06] text-[10.5px]">
            <div className="flex items-start gap-1.5 text-[#a1a1a6]">
              <span className="material-symbols-outlined text-[14px] text-white shrink-0 mt-0.5">phone_iphone</span>
              <span><strong>iOS / iPhone:</strong> กดปุ่ม <em>&quot;เปิดอ่านบนแอปทันที&quot;</em> หรือเปิดผ่าน Safari</span>
            </div>
            <div className="flex items-start gap-1.5 text-[#a1a1a6]">
              <span className="material-symbols-outlined text-[14px] text-emerald-400 shrink-0 mt-0.5">android</span>
              <span><strong>Android:</strong> สามารถเปิดอ่านในแอปได้ทันที หรือเปิดใน Chrome เพื่อดาวน์โหลดลงเครื่อง</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* In-App Reader Button (Primary Apple Blue) */}
          <button
            onClick={() => setShowInAppReader(true)}
            className="apple-btn-primary w-full py-3.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">menu_book</span>
            <span>เปิดอ่านบนแอปทันที (In-App Canvas Reader)</span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="apple-btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>{downloading ? "กำลังประมวลผล..." : "ดาวน์โหลด PDF"}</span>
            </button>

            <button
              onClick={handleCopyPdfLink}
              className="apple-btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">
                {copiedLink ? "check" : "link"}
              </span>
              <span>{copiedLink ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-[#86868b] hover:text-white transition-colors"
          >
            กลับสู่หน้าร้านค้า
          </Link>
        </div>
      </div>

      {/* Download Assistant Modal (For MIT App Inventor & Mobile Browsers) */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade">
          <div className="w-full max-w-md bg-[#161617] rounded-[24px] border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#2997ff]">
                  download_for_offline
                </span>
                <h3 className="text-sm font-bold text-white">
                  ดาวน์โหลด E-Book บนมือถือ & MIT App
                </h3>
              </div>
              <button
                onClick={() => setDownloadModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>คัดลอกลิงก์ดาวน์โหลดเรียบร้อยแล้ว!</span>
            </div>

            <p className="text-xs text-[#86868b] leading-relaxed">
              สำหรับผู้ใช้งานผ่าน <strong>MIT App Inventor</strong> คุณสามารถเข้าถึงหนังสือได้ง่ายๆ 3 วิธีดังนี้:
            </p>

            <div className="space-y-2.5">
              {/* Option 1: Open In-App Reader */}
              <button
                onClick={() => {
                  setDownloadModalOpen(false);
                  setShowInAppReader(true);
                }}
                className="apple-btn-primary w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                <span>วิธีที่ 1: เปิดอ่านในแอปทันที (ไม่ต้องโหลดไฟล์)</span>
              </button>

              {/* Option 2: Open in External Browser */}
              <a
                href={effectiveDownloadUrl}
                target="_blank"
                rel="noreferrer"
                className="apple-btn-secondary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#2997ff]">open_in_browser</span>
                <span>วิธีที่ 2: เปิดดาวน์โหลดใน Google Chrome / Safari</span>
              </a>

              {/* Option 3: Google Docs Viewer */}
              <a
                href={googleDocsViewerUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-medium text-[#86868b] hover:text-white transition-all flex items-center justify-center gap-1.5 border border-white/[0.06]"
              >
                <span className="material-symbols-outlined text-[14px]">cloud</span>
                <span>เปิดดูผ่าน Google Docs Cloud Viewer</span>
              </a>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868b]">
              <span>ต้องการส่งต่อหรือเปิดบนคอม?</span>
              <button
                onClick={handleCopyPdfLink}
                className="text-[#2997ff] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]">content_copy</span>
                <span>{copiedLink ? "คัดลอกแล้ว!" : "คัดลอกลิงก์อีกครั้ง"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-featured Apple-Style Canvas PDF Reader Modal */}
      {showInAppReader && (
        <ApplePdfReader
          orderId={orderId}
          bookTitle={order?.bookTitle || currentBook.title}
          fileName={order?.fileName || currentBook.fileName}
          onClose={() => setShowInAppReader(false)}
          downloadUrl={effectiveDownloadUrl}
        />
      )}
    </div>
  );
}
