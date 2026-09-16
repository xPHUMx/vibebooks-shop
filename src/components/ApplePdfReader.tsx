"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface ApplePdfReaderProps {
  orderId: string;
  bookTitle: string;
  fileName: string;
  onClose: () => void;
  downloadUrl?: string;
}

export default function ApplePdfReader({
  orderId,
  bookTitle,
  fileName,
  onClose,
  downloadUrl,
}: ApplePdfReaderProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [viewMode, setViewMode] = useState<"continuous" | "single">("continuous");
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const pageRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const pdfUrl = `/api/pdf/${orderId}`;

  useEffect(() => {
    let isMounted = true;

    async function initPdf() {
      try {
        setLoading(true);
        setError(null);

        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "/vendor/pdfjs/pdf.min.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () =>
              reject(new Error("ไม่สามารถโหลดเอนจิน PDF ได้ กรุณาลองใหม่อีกครั้ง"));
            document.head.appendChild(script);
          });
        }

        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          throw new Error("PDF Engine initialization failed");
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.js";

        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: false,
        });

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err: any) {
        console.error("PDF.js load error:", err);
        if (isMounted) {
          setError(err.message || "ไม่สามารถเปิดไฟล์ PDF ได้ กรุณาลองใหม่อีกครั้ง");
          setLoading(false);
        }
      }
    }

    initPdf();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  const renderPage = useCallback(
    async (pageIndex: number, canvas: HTMLCanvasElement) => {
      if (!pdfDocRef.current) return;
      try {
        const page = await pdfDocRef.current.getPage(pageIndex);
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const viewport = page.getViewport({ scale: scale * dpr });
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.warn(`Render error on page ${pageIndex}:`, err);
      }
    },
    [scale]
  );

  useEffect(() => {
    if (!pdfDocRef.current || loading) return;

    if (viewMode === "continuous") {
      for (let i = 1; i <= numPages; i++) {
        const canvas = pageRefs.current[i - 1];
        if (canvas) {
          renderPage(i, canvas);
        }
      }
    } else {
      const canvas = pageRefs.current[0];
      if (canvas) {
        renderPage(currentPage, canvas);
      }
    }
  }, [numPages, scale, viewMode, currentPage, loading, renderPage]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareUrl = window.location.origin + pdfUrl;
    if (navigator.share) {
      try {
        await navigator.share({
          title: bookTitle,
          text: `E-book: ${bookTitle} โดย นายเกียรติภูมิ หารศรีนาถ (64332110242-2)`,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      const fullUrl = window.location.origin + pdfUrl;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col text-[#f5f5f7] select-none animate-fade">
      {/* Top Apple Minimalist Header Bar */}
      <header className="h-14 px-3 sm:px-6 bg-[#161617]/90 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#0071e3] text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-white truncate">
              {bookTitle}
            </h2>
            <span className="text-[10px] text-[#86868b] truncate hidden sm:inline">
              ผู้จัดทำ: นายเกียรติภูมิ หารศรีนาถ (64332110242-2)
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-white/[0.06] p-0.5 rounded-full border border-white/[0.08] text-[11px]">
            <button
              onClick={() => setViewMode("continuous")}
              className={`px-2.5 py-1 rounded-full transition-all ${
                viewMode === "continuous"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-[#86868b] hover:text-white"
              }`}
            >
              เลื่อนต่อเนื่อง
            </button>
            <button
              onClick={() => setViewMode("single")}
              className={`px-2.5 py-1 rounded-full transition-all ${
                viewMode === "single"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-[#86868b] hover:text-white"
              }`}
            >
              ทีละหน้า
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white transition-colors cursor-pointer"
            title="แชร์ หรือ คัดลอกลิงก์"
          >
            <span className="material-symbols-outlined text-[17px]">share</span>
          </button>

          {/* Print / Save as PDF Button */}
          <button
            onClick={handlePrint}
            className="hidden sm:flex w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] items-center justify-center text-white transition-colors cursor-pointer"
            title="พิมพ์ หรือ บันทึกเป็น PDF"
          >
            <span className="material-symbols-outlined text-[17px]">print</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1 ml-1"
          >
            <span>ปิด</span>
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Document Scroll Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-6 flex flex-col items-center justify-start scrollbar-none relative"
      >
        {/* Loading State */}
        {loading && (
          <div className="my-auto flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[28px] text-[#2997ff] animate-spin">
                progress_activity
              </span>
            </div>
            <p className="text-sm font-semibold text-[#f5f5f7]">กำลังเปิดอ่าน E-Book สไตล์ Apple...</p>
            <p className="text-xs text-[#86868b] mt-1 font-mono">
              กำลังเรนเดอร์เอกสารผ่าน Canvas Engine
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="my-auto max-w-sm w-full bg-[#1c1c1e] p-6 rounded-2xl border border-red-500/20 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ไม่สามารถเรนเดอร์ PDF ได้</h3>
              <p className="text-xs text-[#86868b] mt-1">{error}</p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="apple-btn-primary w-full py-2.5 text-xs font-semibold"
              >
                {copied ? "คัดลอกลิงก์สำเร็จแล้ว!" : "คัดลอกลิงก์ไปเปิดใน Chrome"}
              </button>
              <button
                onClick={onClose}
                className="apple-btn-secondary w-full py-2 text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )}

        {/* Continuous Scroll View */}
        {!loading && !error && viewMode === "continuous" && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-5 my-auto pb-24">
            {Array.from({ length: numPages }).map((_, idx) => (
              <div
                key={idx}
                className="w-full flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden bg-white border border-white/20 transition-transform"
              >
                {/* Page Indicator Tag */}
                <div className="w-full bg-[#2c2c2e] text-[#86868b] px-3 py-1 text-[10px] font-mono flex items-center justify-between select-none border-b border-white/[0.06]">
                  <span>หน้า {idx + 1} จาก {numPages}</span>
                  <span className="text-[9px] text-[#2997ff]">VibeBooks PRO Master</span>
                </div>
                <div className="w-full flex justify-center bg-white overflow-hidden">
                  <canvas
                    ref={(el) => {
                      pageRefs.current[idx] = el;
                    }}
                    className="max-w-full block"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Single Page View */}
        {!loading && !error && viewMode === "single" && (
          <div className="w-full max-w-2xl flex flex-col items-center my-auto pb-24">
            <div className="w-full flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden bg-white border border-white/20">
              <div className="w-full bg-[#2c2c2e] text-[#86868b] px-3 py-1 text-[10px] font-mono flex items-center justify-between select-none border-b border-white/[0.06]">
                <span>หน้า {currentPage} จาก {numPages}</span>
                <span className="text-[9px] text-[#2997ff]">VibeBooks PRO Master</span>
              </div>
              <div className="w-full flex justify-center bg-white overflow-hidden">
                <canvas
                  ref={(el) => {
                    pageRefs.current[0] = el;
                  }}
                  className="max-w-full block"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Apple Action Pill */}
      {!loading && !error && (
        <div className="fixed bottom-5 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-full bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.75)]">
            {viewMode === "single" && (
              <>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="w-8 h-8 rounded-full bg-white/[0.08] disabled:opacity-30 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
                  title="หน้าก่อนหน้า"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="text-xs font-mono font-medium px-2 text-[#f5f5f7]">
                  {currentPage} / {numPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                  disabled={currentPage >= numPages}
                  className="w-8 h-8 rounded-full bg-white/[0.08] disabled:opacity-30 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
                  title="หน้าถัดไป"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
                <div className="w-px h-4 bg-white/15 mx-1" />
              </>
            )}

            {viewMode === "continuous" && (
              <span className="text-xs font-mono font-medium px-2 text-[#86868b]">
                รวม {numPages} หน้า
              </span>
            )}

            <button
              onClick={() => setScale((s) => Math.max(0.7, +(s - 0.2).toFixed(1)))}
              className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
              title="ซูมออก"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_out</span>
            </button>
            <span className="text-[11px] font-mono font-medium text-[#f5f5f7] px-1">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(2.5, +(s + 0.2).toFixed(1)))}
              className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
              title="ซูมเข้า"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>

            <div className="w-px h-4 bg-white/15 mx-1" />

            <button
              onClick={() => setViewMode((m) => (m === "continuous" ? "single" : "continuous"))}
              className="px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/20 text-[10px] font-medium text-white transition-all flex items-center gap-1 cursor-pointer sm:hidden"
            >
              <span className="material-symbols-outlined text-[13px]">
                {viewMode === "continuous" ? "layers" : "view_stream"}
              </span>
              <span>{viewMode === "continuous" ? "ทีละหน้า" : "เลื่อนอ่าน"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
