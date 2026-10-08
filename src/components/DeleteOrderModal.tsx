'use client';

import React, { useState } from 'react';
import { Order } from '@/types';

interface DeleteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  order: Order | null;
  isDeleting?: boolean;
}

export default function DeleteOrderModal({
  isOpen,
  onClose,
  onConfirm,
  order,
  isDeleting = false,
}: DeleteOrderModalProps) {
  const [typedCode, setTypedCode] = useState('');

  if (!isOpen || !order) return null;

  const isMatched = typedCode.trim().toUpperCase() === order.id.trim().toUpperCase();

  const handleClose = () => {
    if (isDeleting) return;
    setTypedCode('');
    onClose();
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatched || isDeleting) return;
    await onConfirm();
    setTypedCode('');
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
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white tracking-tight">
              ยืนยันการลบรายการธุรกรรม (Merchant Danger Zone)
            </h3>
            <p className="text-xs text-[#86868b] mt-0.5 leading-relaxed">
              การดำเนินการนี้จะนำยอดขายและประวัติคำสั่งซื้อนี้ออกจากศูนย์รายงาน (Report Center) ของร้านค้าอย่างถาวร
            </p>
          </div>
        </div>

        {/* Order Details Preview */}
        <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#86868b]">ยอดรวมคำสั่งซื้อ:</span>
            <span className="font-bold text-white text-sm">฿{order.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#86868b]">ลูกค้า:</span>
            <span className="text-white font-medium truncate max-w-[200px]">
              {order.customerName} ({order.customerEmail})
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#86868b]">สถานะ:</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                order.status === 'PAID'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {order.status === 'PAID' ? 'ชำระเงินแล้ว' : 'รอตรวจสอบ'}
            </span>
          </div>
        </div>

        {/* Security Requirement: Red Order Confirmation Code */}
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-[#86868b]">
            กรุณากรอก <span className="text-rose-500 font-bold">รหัสคำสั่งซื้อ (Order ID)</span> ด้านล่างนี้เพื่อยืนยันการลบยอด:
          </label>
          <div className="px-3.5 py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between gap-2 shadow-inner">
            <span className="text-[10px] text-rose-300 uppercase tracking-wider font-mono font-semibold">
              รหัสยืนยัน:
            </span>
            <span className="text-sm font-mono font-black text-rose-500 tracking-wider select-all">
              {order.id}
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <input
              type="text"
              autoFocus
              value={typedCode}
              onChange={(e) => setTypedCode(e.target.value)}
              placeholder={`พิมพ์ "${order.id}" เพื่อยืนยัน`}
              className="w-full h-11 px-4 rounded-xl bg-black border border-white/15 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm font-mono text-white placeholder:text-[#555] outline-none transition-all"
            />
            {typedCode.trim().length > 0 && (
              <p
                className={`text-[11px] mt-1.5 flex items-center gap-1 ${
                  isMatched ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isMatched ? 'check_circle' : 'cancel'}
                </span>
                <span>
                  {isMatched
                    ? 'รหัสยืนยันถูกต้อง สามารถกดลบได้'
                    : 'รหัสไม่ตรงกัน กรุณาพิมพ์ให้ตรงกับด้านบนทุกตัวอักษร'}
                </span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!isMatched || isDeleting}
              className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all disabled:opacity-30 disabled:hover:bg-rose-600 flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/30 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังลบ...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                  <span>ยืนยันการลบธุรกรรม</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
