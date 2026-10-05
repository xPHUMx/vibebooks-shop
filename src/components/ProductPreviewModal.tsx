'use client';

import React, { useState } from 'react';
import { DigitalProduct } from '@/types';

interface ProductPreviewModalProps {
  product: Partial<DigitalProduct> & {
    title: string;
    price: number;
    originalPrice?: number;
    coverImage?: string;
    previewImages?: string[];
    fileName?: string;
    fileSize?: string;
    fileFormat?: string;
    merchantName?: string;
    description?: string;
    category?: string;
    badge?: string;
  };
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
}

export default function ProductPreviewModal({
  product,
  onClose,
  onConfirm,
  confirmLabel = 'ยืนยันและสร้างสินค้า',
}: ProductPreviewModalProps) {
  const [activeSampleIndex, setActiveSampleIndex] = useState<number>(0);

  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || price * 1.5);
  const discountPercent =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const samples = product.previewImages || [];
  const cover =
    product.coverImage ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-squircle-lg shadow-level-3 border border-black/10 overflow-hidden z-10 animate-fade-in-up my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="p-4 px-6 border-b border-black/[0.08] bg-porcelain flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs font-bold text-charcoal">
              หน้าต่างตัวอย่างสินค้า (Live Customer Preview)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-black/5 text-[10px] font-mono text-muted-slate font-bold">
              PREVIEW MODE
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-black/[0.05] border border-black/10 flex items-center justify-center text-charcoal shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Preview Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-6">
          {/* Main Media Showcase */}
          <div className="space-y-3">
            <div className="relative w-full h-64 sm:h-72 rounded-squircle bg-porcelain border border-black/[0.06] overflow-hidden group">
              <img
                src={samples.length > 0 && activeSampleIndex > 0 ? samples[activeSampleIndex - 1] : cover}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[11px] font-bold shadow-sm">
                  {product.badge}
                </span>
              )}
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] text-[11px] font-semibold text-charcoal shadow-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-accent-emerald">verified</span>
                <span>100% Verified Original</span>
              </div>
            </div>

            {/* Samples Thumbnails Selector (If merchant uploaded samples) */}
            {samples.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-slate uppercase tracking-wider block">
                  ตัวอย่างสินค้า ({samples.length + 1} ภาพ):
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {/* Cover thumbnail */}
                  <button
                    type="button"
                    onClick={() => setActiveSampleIndex(0)}
                    className={`w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                      activeSampleIndex === 0
                        ? 'border-secondary ring-2 ring-secondary/20 scale-105'
                        : 'border-black/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={cover} alt="Cover" className="w-full h-full object-cover" />
                  </button>
                  {/* Samples thumbnails */}
                  {samples.map((sUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSampleIndex(idx + 1)}
                      className={`w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                        activeSampleIndex === idx + 1
                          ? 'border-secondary ring-2 ring-secondary/20 scale-105'
                          : 'border-black/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={sUrl} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase tracking-wider">
                {product.category || 'Digital Asset'}
              </span>
              <div className="flex items-center gap-1 text-xs text-charcoal font-bold">
                <span className="material-symbols-outlined text-[16px] text-amber-500 fill-1">star</span>
                <span>5.0</span>
                <span className="text-muted-slate font-normal">(สินค้าใหม่)</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-charcoal">
              {product.title || 'ชื่อสินค้าดิจิทัล'}
            </h2>
            {product.subtitle && (
              <p className="text-xs sm:text-sm text-muted-slate mt-1">{product.subtitle}</p>
            )}

            {/* Merchant info badge */}
            <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">🏪</span>
                <div>
                  <span className="text-muted-slate text-[10px] block">จัดจำหน่ายโดย</span>
                  <span className="font-bold text-charcoal">
                    {product.merchantName || 'ร้านค้าของคุณ'}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white text-amber-800 text-[10px] font-bold border border-amber-300">
                Official Merchant
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-3 p-4 rounded-squircle bg-porcelain border border-black/[0.06]">
            <span className="text-2xl sm:text-3xl font-extrabold tabular-nums text-charcoal">
              ฿{price.toLocaleString()}
            </span>
            {originalPrice > price && (
              <>
                <span className="text-sm text-muted-slate line-through tabular-nums">
                  ฿{originalPrice.toLocaleString()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-accent-coral/10 text-accent-coral text-xs font-bold">
                  ลด {discountPercent}%
                </span>
              </>
            )}
            <span className="ml-auto text-xs text-accent-emerald font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              ส่งมอบไฟล์ทันที
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-muted-slate uppercase tracking-wider mb-2">
              รายละเอียดผลิตภัณฑ์
            </h3>
            <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed whitespace-pre-line bg-porcelain p-4 rounded-2xl border border-black/[0.06]">
              {product.description || 'ยังไม่ได้ระบุคำอธิบายสินค้า'}
            </p>
          </div>

          {/* Vault Specs Sheet */}
          <div className="p-4 rounded-squircle bg-porcelain border border-black/[0.06] text-xs">
            <h4 className="text-[11px] font-bold text-charcoal uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
              <span>ข้อมูลจำเพาะของไฟล์และลิขสิทธิ์ (Specifications)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-muted-slate block text-[10px]">ชื่อไฟล์ต้นฉบับ</span>
                <span className="font-mono font-bold text-charcoal truncate block" title={product.fileName}>
                  {product.fileName || '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-slate block text-[10px]">รูปแบบไฟล์</span>
                <span className="font-semibold text-charcoal">{product.fileFormat || 'Digital File'}</span>
              </div>
              <div>
                <span className="text-muted-slate block text-[10px]">ขนาดไฟล์</span>
                <span className="font-semibold text-charcoal">{product.fileSize || 'Auto Size'}</span>
              </div>
              <div>
                <span className="text-muted-slate block text-[10px]">ใบอนุญาต</span>
                <span className="font-semibold text-accent-emerald">Commercial License</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 sm:p-5 border-t border-black/[0.08] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-muted-slate hidden sm:block">
            * นี่คือหน้าตัวอย่างที่ลูกค้าของคุณจะมองเห็นเมื่อเข้ามาดูสินค้านี้
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none h-11 px-5 rounded-full border border-black/10 hover:bg-black/[0.04] text-charcoal text-xs font-semibold transition-all"
            >
              แก้ไขต่อ
            </button>
            {onConfirm && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirm();
                }}
                className="flex-1 sm:flex-none h-11 px-6 rounded-full bg-black text-white hover:bg-charcoal text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{confirmLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
