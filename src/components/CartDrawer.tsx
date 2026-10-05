'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, removeFromCart, updateQuantity, totalAmount, totalItems } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Liquid Glass Ambient Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer Surface (Level 2 Elevation, Liquid Glass) */}
      <div className="relative w-full max-w-md bg-white h-full shadow-level-3 border-l border-black/[0.06] flex flex-col z-10 animate-slide-left">
        {/* Drawer Header */}
        <div className="h-16 px-6 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-charcoal">shopping_bag</span>
            <h2 className="text-base font-bold tracking-tight text-charcoal">
              Cart ({totalItems})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-charcoal/70 hover:text-black transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-black/[0.03] border border-black/[0.06] flex items-center justify-center text-muted-slate mb-4">
                <span className="material-symbols-outlined text-[28px]">production_quantity_limits</span>
              </div>
              <p className="text-sm font-semibold text-charcoal">ตะกร้าของคุณว่างเปล่า</p>
              <p className="text-xs text-muted-slate mt-1 max-w-[220px]">
                เลือกชม E-Books, UI Kits, และระบบเทมเพลตเพื่อเพิ่มลงในตะกร้า
              </p>
              <button
                onClick={closeCart}
                className="mt-6 px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold shadow-sm hover:bg-charcoal transition-all"
              >
                เลือกดูสินค้าดิจิทัล
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="p-3.5 rounded-squircle bg-porcelain border border-black/[0.06] flex gap-3.5 relative group transition-all hover:border-black/[0.12]"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-white border border-black/[0.06] overflow-hidden shrink-0 relative">
                  <Image
                    src={product.coverImage}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-6">
                  <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider block truncate">
                    {product.categoryNameTh}
                  </span>
                  <h4 className="text-xs font-bold text-charcoal truncate mt-0.5" title={product.title}>
                    {product.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold tabular-nums text-charcoal">
                      ฿{(product.price * quantity).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-slate">
                      (฿{product.price} x {quantity})
                    </span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="absolute top-3 right-3 text-muted-slate hover:text-accent-coral transition-colors p-1"
                  title="ลบออกจากตะกร้า"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Bottom Checkout Panel */}
        {items.length > 0 && (
          <div className="p-6 border-t border-black/[0.06] bg-porcelain/60 backdrop-blur-md space-y-4">
            {/* Delivery / Voucher Badge */}
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 text-[#248a3d]">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>จัดส่งทันทีผ่าน Supabase Vault</span>
              </div>
              <span className="font-bold">ฟรี</span>
            </div>

            {/* Price Summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-slate">
                <span>ยอดรวมสินค้า ({totalItems} รายการ)</span>
                <span className="tabular-nums">฿{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-charcoal pt-1 border-t border-black/[0.06]">
                <span>ยอดชำระสุทธิ</span>
                <span className="tabular-nums text-lg text-charcoal">฿{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full h-12 rounded-full bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-charcoal transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
              ชำระเงินด้วย PromptPay QR
            </Link>

            <p className="text-[10px] text-center text-muted-slate">
              รับลิงก์ดาวน์โหลดที่ปลอดภัยและไฟล์ Master ทันทีหลังยืนยันยอด
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
