'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DigitalProduct } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductModalProps {
  product: DigitalProduct | null;
  onClose: () => void;
  onOpenPdfReader?: (product: DigitalProduct) => void;
}

export default function ProductModal({ product, onClose, onOpenPdfReader }: ProductModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  if (!product) return null;

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleBuyNow = () => {
    addToCart(product, 1);
    onClose();
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Liquid Glass Ambient Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card (Level 3 Elevation) */}
      <div className="relative w-full max-w-2xl bg-white rounded-squircle-lg shadow-level-3 border border-black/[0.08] overflow-hidden z-10 animate-fade-in-up my-auto max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md hover:bg-white border border-black/10 flex items-center justify-center text-charcoal shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
          {/* Top Media Showcase */}
          <div className="relative w-full h-64 sm:h-72 rounded-squircle bg-porcelain border border-black/[0.06] overflow-hidden">
            <Image
              src={product.coverImage}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[11px] font-bold shadow-sm">
                {product.badge}
              </span>
            )}
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] text-xs font-semibold text-charcoal shadow-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-accent-emerald">verified</span>
              <span>100% Verified Original</span>
            </div>
          </div>

          {/* Title & Metadata */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase tracking-wider">
                {product.categoryNameTh}
              </span>
              <div className="flex items-center gap-1 text-xs text-charcoal font-bold">
                <span className="material-symbols-outlined text-[16px] text-amber-500 fill-1">star</span>
                <span>{product.rating}</span>
                <span className="text-muted-slate font-normal">({product.ratingCount} รีวิว)</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal">
              {product.title}
            </h2>
            <p className="text-sm text-muted-slate mt-1">{product.subtitle}</p>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-3 p-4 rounded-squircle bg-porcelain border border-black/[0.06]">
            <span className="text-2xl sm:text-3xl font-extrabold tabular-nums text-charcoal">
              ฿{product.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-slate line-through tabular-nums">
              ฿{product.originalPrice.toLocaleString()}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-accent-coral/10 text-accent-coral text-xs font-bold">
              ลด {discountPercent}%
            </span>
            <span className="ml-auto text-xs text-accent-emerald font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              ดาวน์โหลดได้ทันที
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-muted-slate uppercase tracking-wider mb-2">
              รายละเอียดผลิตภัณฑ์
            </h3>
            <p className="text-sm text-charcoal/80 leading-relaxed">{product.description}</p>
          </div>

          {/* Highlights & Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-squircle bg-porcelain border border-black/[0.06]">
              <h4 className="text-xs font-bold text-charcoal mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                จุดเด่นระบบ (Highlights)
              </h4>
              <ul className="space-y-2 text-xs text-charcoal/80">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent-emerald font-bold">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-squircle bg-porcelain border border-black/[0.06]">
              <h4 className="text-xs font-bold text-charcoal mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-accent-emerald">inventory_2</span>
                สิ่งที่จะได้รับในแพ็กเกจ
              </h4>
              <ul className="space-y-2 text-xs text-charcoal/80">
                {product.features?.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-secondary font-bold">✦</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Specs Sheet */}
          <div className="p-4 rounded-squircle bg-porcelain border border-black/[0.06] text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-muted-slate block">รูปแบบไฟล์</span>
                <span className="font-semibold text-charcoal">{product.fileFormat}</span>
              </div>
              <div>
                <span className="text-muted-slate block">ขนาดไฟล์</span>
                <span className="font-semibold text-charcoal">{product.fileSize}</span>
              </div>
              <div>
                <span className="text-muted-slate block">เวอร์ชัน</span>
                <span className="font-semibold text-charcoal">{product.specs?.version || '2.0'}</span>
              </div>
              <div>
                <span className="text-muted-slate block">สิทธิ์การใช้งาน</span>
                <span className="font-semibold text-accent-emerald">Commercial License</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Sticky Action Bar (Liquid Glass Purchase Split Bar) */}
        <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-white/95 backdrop-blur-md flex items-center gap-3">
          {product.category === 'ebook' && onOpenPdfReader && (
            <button
              onClick={() => {
                onClose();
                onOpenPdfReader(product);
              }}
              className="h-12 px-4 rounded-full border border-black/10 bg-white hover:bg-black/[0.04] text-charcoal text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              เปิดอ่านตัวอย่าง
            </button>
          )}

          <button
            onClick={() => {
              addToCart(product, 1);
            }}
            className="flex-1 h-12 rounded-full border border-black/15 bg-white hover:bg-black/[0.03] text-charcoal text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            ใส่ตะกร้า (฿{product.price})
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 h-12 rounded-full bg-black text-white hover:bg-charcoal text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            สั่งซื้อทันที
          </button>
        </div>
      </div>
    </div>
  );
}
