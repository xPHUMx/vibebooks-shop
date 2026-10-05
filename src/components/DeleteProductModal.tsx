'use client';

import React, { useState } from 'react';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  product: {
    id: string;
    title: string;
    price?: number;
    coverImage?: string;
  } | null;
  isDeleting?: boolean;
}

export default function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  product,
  isDeleting = false,
}: DeleteProductModalProps) {
  const [typedId, setTypedId] = useState('');

  if (!isOpen || !product) return null;

  const isMatched = typedId.trim() === product.id.trim();

  const handleClose = () => {
    if (isDeleting) return;
    setTypedId('');
    onClose();
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatched || isDeleting) return;
    await onConfirm();
    setTypedId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#161617] text-[#f5f5f7] rounded-[24px] border border-rose-500/30 p-6 shadow-2xl relative space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white tracking-tight">
              ยืนยันการลบสินค้า (Danger Zone)
            </h3>
            <p className="text-xs text-[#86868b] mt-0.5 leading-relaxed">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้ สินค้าจะถูกนำออกจากระบบถาวร
            </p>
          </div>
        </div>

        {/* Product Details Preview */}
        <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08] flex items-center gap-3">
          {product.coverImage && (
            <div className="w-12 h-16 rounded-xl bg-black border border-white/10 overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.coverImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white truncate">
              {product.title}
            </h4>
            {product.price !== undefined && (
              <span className="text-[11px] text-[#86868b] font-mono">
                ฿{product.price}.00
              </span>
            )}
          </div>
        </div>

        {/* Security Requirement: Red Product ID */}
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-[#86868b]">
            กรุณากรอก <span className="text-rose-400 font-semibold">รหัสสินค้า (Product ID)</span> ด้านล่างนี้เพื่อยืนยัน:
          </label>
          <div className="px-3.5 py-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between gap-2">
            <span className="text-[10px] text-[#86868b] uppercase tracking-wider font-mono">
              รหัสสินค้า:
            </span>
            <span className="text-sm font-mono font-bold text-rose-400 tracking-wider select-all">
              {product.id}
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <input
              type="text"
              autoFocus
              disabled={isDeleting}
              value={typedId}
              onChange={(e) => setTypedId(e.target.value)}
              placeholder={`พิมพ์ "${product.id}" ที่นี่`}
              className="w-full h-11 px-3.5 rounded-xl bg-black border border-rose-500/40 focus:border-rose-500 text-rose-400 font-mono text-xs placeholder:text-[#86868b]/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all font-semibold"
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              {isMatched ? (
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  รหัสสินค้าถูกต้อง พร้อมลบ
                </span>
              ) : typedId.length > 0 ? (
                <span className="text-rose-400/80">
                  รหัสยังไม่ตรงกับ &quot;{product.id}&quot;
                </span>
              ) : (
                <span className="text-[#86868b]">
                  ต้องกรอกรหัสสินค้าให้ตรงกันเป๊ะเพื่อปลดล็อกปุ่มลบ
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleClose}
              className="flex-1 h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-[#f5f5f7] transition-all cursor-pointer disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!isMatched || isDeleting}
              className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/30 text-xs font-bold text-white transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                  <span>กำลังลบสินค้า...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                  <span>ลบสินค้านี้ถาวร</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
