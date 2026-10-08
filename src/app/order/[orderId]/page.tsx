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
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const fetchOrder = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/orders?orderId=${orderId}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error("Fetch order error:", err);
    } finally {
      if (!silent) setLoading(false);
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Auto-poll every 4 seconds if order is pending approval
  useEffect(() => {
    if (!order || order.status === "PAID") return;

    const interval = setInterval(() => {
      fetchOrder(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [order?.status, orderId]);

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

      // 1. Try copying to clipboard automatically
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

      // 4. Open Mobile Download Assistant modal
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

  const isPaid = order?.status === "PAID";
  const hasSlip = !!order?.slipUrl;

  return (
    <div className="space-y-5 max-w-lg mx-auto animate-fade">
      {/* Top Status Card (Apple Style) */}
      <div className={`rounded-[24px] bg-[#161617] p-6 text-center flex flex-col items-center border ${isPaid ? "border-emerald-500/20" : "border-amber-500/20"} shadow-2xl`}>
        {isPaid ? (
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-md">
            <span className="material-symbols-outlined text-[26px]">check_circle</span>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-md animate-pulse">
            <span className="material-symbols-outlined text-[26px]">schedule</span>
          </div>
        )}

        <h1 className="text-xl font-bold text-[#f5f5f7] tracking-tight mb-1">
          {isPaid ? "สั่งซื้อและชำระเงินสำเร็จเรียบร้อย" : "รอร้านค้าตรวจสอบสลิปและอนุมัติ"}
        </h1>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.06] border border-white/10 mb-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-400" : "bg-amber-400 animate-ping"}`} />
          <span className="text-[10px] text-white/90 uppercase tracking-wider font-semibold">
            {isPaid ? "Status: PAID · Verified" : "Status: PENDING · รอพ่อค้าเช็คยอดเงิน"}
          </span>
        </div>

        <div className="text-[11px] text-[#86868b]">
          Ref: <strong className="text-[#f5f5f7] font-mono">{orderId}</strong> ·{" "}
          <span>{order?.customerName || "คุณลูกค้า"}</span>
        </div>

        {!isPaid && (
          <div className="mt-3 w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left text-xs text-amber-200/90 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>ระบบกำลังรอพ่อค้าตรวจสอบสลิป</span>
            </div>
            <p className="text-[11px] text-amber-200/70 leading-relaxed">
              พ่อค้าจะตรวจสอบยอดเงินเข้าในบัญชีธนาคาร/พร้อมเพย์ของร้าน เมื่อตรวจสอบถูกต้องและกดยืนยัน หน้านี้จะปลดล็อคให้ดาวน์โหลดและเปิดอ่านไฟล์ทันที (ระบบเช็คให้อัตโนมัติทุก 4 วินาที)
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] text-amber-400/80 font-mono">
                {order?.merchantName ? `ร้านค้า: ${order.merchantName}` : "ร้านค้ากำลังตรวจสอบ"}
              </span>
              <button
                onClick={() => {
                  setIsCheckingStatus(true);
                  fetchOrder(false);
                }}
                disabled={isCheckingStatus}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className={`material-symbols-outlined text-[12px] ${isCheckingStatus ? "animate-spin" : ""}`}>
                  sync
                </span>
                <span>{isCheckingStatus ? "กำลังเช็ค..." : "เช็คสถานะตอนนี้"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slip Details Card if slip is submitted */}
      {!isPaid && hasSlip && (
        <div className="rounded-[20px] bg-[#161617] p-4 border border-white/[0.06] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 rounded-lg bg-black/50 border border-white/10 overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order?.slipUrl || `/api/slip/${orderId}`}
                onError={(e) => {
                  if (!e.currentTarget.src.includes('/api/slip/')) {
                    e.currentTarget.src = `/api/slip/${orderId}`;
                  }
                }}
                alt="Payment Slip"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-emerald-400">receipt_long</span>
                แนบสลิปโอนเงินแล้ว
              </span>
              <span className="text-[11px] text-[#86868b] mt-0.5">
                ยอดโอน: <strong className="text-white font-mono">฿{(order?.totalAmount ?? order?.bookPrice ?? 0).toLocaleString()}</strong>
              </span>
              {order?.merchantPromptPay && (
                <span className="text-[10px] text-[#86868b] font-mono mt-0.5">
                  โอนเข้า PromptPay: {order.merchantPromptPay}
                </span>
              )}
            </div>
          </div>
          <a
            href={order?.slipUrl?.startsWith('data:') ? order.slipUrl : `/api/slip/${orderId}`}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white text-[11px] font-medium flex items-center gap-1 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[14px]">visibility</span>
            <span>ดูสลิปเต็ม</span>
          </a>
        </div>
      )}

      {/* Simulated Transactional Email Card */}
      {isPaid && (
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
      )}

      {/* Secure Digital Delivery Card */}
      <div className="rounded-[24px] bg-[#161617] p-5 sm:p-6 border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white text-[18px]">encrypted</span>
            <span className="text-xs font-semibold text-[#f5f5f7]">Digital Delivery Service</span>
          </div>
          <span className="text-[10px] text-[#86868b] bg-black px-2.5 py-0.5 rounded-full font-mono border border-white/[0.08]">
            {isPaid ? `หมดอายุใน: ${formatCountdown(countdown)}` : "สถานะ: รอการอนุมัติ"}
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
            {isPaid ? (
              <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Supabase Storage & In-App Canvas Ready
              </span>
            ) : (
              <span className="text-[10px] text-amber-400 mt-1 flex items-center gap-1 font-mono">
                <span className="material-symbols-outlined text-[12px]">lock</span>
                ไฟล์ถูกล็อค • รอพ่อค้าอนุมัติสลิป
              </span>
            )}
          </div>
        </div>

        {/* Cross-Platform Guidance (Paid only) */}
        {isPaid && (
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
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {isPaid ? (
            <>
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
            </>
          ) : (
            <div className="space-y-2">
              <button
                disabled
                className="w-full py-3.5 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white/40 text-xs font-medium flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-400/60">lock</span>
                <span>รอพ่อค้าตรวจสอบสลิปและอนุมัติปล่อยไฟล์</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled
                  className="py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/30 text-xs font-medium flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  <span>ดาวน์โหลด (ล็อค)</span>
                </button>
                <button
                  onClick={() => {
                    setIsCheckingStatus(true);
                    fetchOrder(false);
                  }}
                  disabled={isCheckingStatus}
                  className="apple-btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-amber-300 border-amber-500/30"
                >
                  <span className={`material-symbols-outlined text-[15px] ${isCheckingStatus ? "animate-spin" : ""}`}>
                    sync
                  </span>
                  <span>{isCheckingStatus ? "กำลังตรวจสอบ..." : "รีเฟรชเช็คการอนุมัติ"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-center gap-3 text-xs">
          <Link
            href="/library"
            className="text-[#2997ff] hover:underline flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[15px]">folder_special</span>
            <span>ดูในคลังของฉัน (My Library)</span>
          </Link>
          <span className="text-white/20">•</span>
          <Link
            href="/"
            className="text-[#86868b] hover:text-white transition-colors"
          >
            กลับสู่หน้าร้านค้า
          </Link>
        </div>
      </div>

      {/* Download Assistant Modal (For Mobile Browsers & Direct Downloads) */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade">
          <div className="w-full max-w-md bg-[#161617] rounded-[24px] border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#2997ff]">
                  download_for_offline
                </span>
                <h3 className="text-sm font-bold text-white">
                  ดาวน์โหลด E-Book & ไฟล์ดิจิทัล
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
              ท่านสามารถเข้าถึงและดาวน์โหลดหนังสือได้ง่ายๆ 3 วิธีดังนี้:
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
