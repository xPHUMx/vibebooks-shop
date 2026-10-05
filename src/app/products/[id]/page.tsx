'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { DigitalProduct } from '@/types';
import { useCart } from '@/context/CartContext';
import { DIGITAL_PRODUCTS } from '@/lib/productsData';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<DigitalProduct | null>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addedToast, setAddedToast] = useState(false);

  const { addToCart, openCart } = useCart();

  useEffect(() => {
    if (productId) {
      fetchProductDetails(productId);
    }
  }, [productId]);

  const fetchProductDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success && data.product) {
        setProduct(data.product);
        setMerchant(data.merchant);
      } else {
        // Fallback to local catalog
        const found = DIGITAL_PRODUCTS.find((p) => p.id === id);
        if (found) {
          setProduct(found);
        }
      }
    } catch (e) {
      const found = DIGITAL_PRODUCTS.find((p) => p.id === id);
      if (found) setProduct(found);
    } finally {
      setIsLoading(false);
    }
  };

  const storeDisplayName =
    merchant?.store_name || product?.merchantName || 'Book Sangdai Official';
  const storePromptPay =
    merchant?.promptpay_id || product?.merchantPromptPay;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      ...product,
      merchantName: storeDisplayName,
      merchantPromptPay: storePromptPay || product.merchantPromptPay,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart({
      ...product,
      merchantName: storeDisplayName,
      merchantPromptPay: storePromptPay || product.merchantPromptPay,
    });
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center animate-fade-in">
        <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted-slate font-medium">กำลังโหลดข้อมูลรายละเอียดสินค้า...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center animate-fade-in">
        <div className="p-8 rounded-squircle bg-white border border-black/[0.08] shadow-level-2 space-y-4">
          <span className="material-symbols-outlined text-[48px] text-muted-slate">inventory_2</span>
          <h1 className="text-lg font-bold text-charcoal">ไม่พบสินค้าดิจิทัลที่คุณค้นหา</h1>
          <p className="text-xs text-muted-slate">
            สินค้านี้อาจถูกนำออกจากระบบหรือรหัสสินค้าไม่ถูกต้อง
          </p>
          <Link
            href="/"
            className="inline-flex h-11 px-6 rounded-full bg-black text-white hover:bg-charcoal text-xs font-bold items-center justify-center transition-all"
          >
            กลับสู่หน้าร้านค้า
          </Link>
        </div>
      </div>
    );
  }

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-muted-slate font-medium">
        <Link href="/" className="hover:text-charcoal transition-colors">
          หน้าแรก
        </Link>
        <span>/</span>
        <Link href={`/?category=${product.category}`} className="hover:text-charcoal transition-colors">
          {product.categoryNameTh || product.category}
        </Link>
        <span>/</span>
        <span className="text-charcoal font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Glass Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Showcase (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="relative aspect-[3/4] rounded-squircle-lg overflow-hidden bg-porcelain border border-black/[0.08] shadow-level-2 group">
            <Image
              src={product.coverImage}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
            />
            {product.badge && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[11px] font-bold shadow-sm">
                {product.badge}
              </div>
            )}
            {discountPercent > 0 && (
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-accent-coral text-white text-[11px] font-black shadow-sm">
                -{discountPercent}% OFF
              </div>
            )}
          </div>

          {/* Quick File Specs Capsule */}
          <div className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-sm grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-muted-slate block">รูปแบบไฟล์</span>
              <span className="text-xs font-bold text-charcoal">{product.fileFormat || 'Digital'}</span>
            </div>
            <div className="border-x border-black/[0.06]">
              <span className="text-[10px] text-muted-slate block">ขนาดไฟล์</span>
              <span className="text-xs font-bold text-charcoal">{product.fileSize}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-slate block">การจัดส่ง</span>
              <span className="text-xs font-bold text-accent-emerald flex items-center justify-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">bolt</span>
                <span>ทันที</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Information, Merchant Card & Actions (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">folder</span>
              <span>{product.categoryNameTh || product.category.toUpperCase()}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal leading-tight">
              {product.title}
            </h1>

            <p className="text-sm text-muted-slate leading-relaxed">
              {product.subtitle}
            </p>

            {/* Rating Stars & ID */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full text-amber-700 text-xs font-bold">
                <span>⭐ {product.rating.toFixed(1)}</span>
                <span className="text-muted-slate font-normal">({product.ratingCount} รีวิว)</span>
              </div>
              <span className="text-[11px] text-muted-slate font-mono">
                รหัสสินค้า: #{product.id}
              </span>
            </div>
          </div>

          {/* STORE & MERCHANT CARD (Required) */}
          <div className="p-4 sm:p-5 rounded-squircle bg-white border border-black/[0.08] shadow-level-1 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-900 text-xl font-bold shrink-0">
                  🏪
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-muted-slate uppercase tracking-wider">
                      ร้านค้าผู้จัดจำหน่าย
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-accent-emerald/15 text-[#248a3d] text-[9px] font-bold">
                      ✓ ผู้ขายได้รับการรับรอง
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-charcoal truncate mt-0.5">
                    {storeDisplayName}
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-black/[0.04] text-[11px] font-semibold text-charcoal shrink-0 hidden sm:inline">
                Verified Seller
              </span>
            </div>

            {merchant?.store_description && (
              <p className="text-xs text-muted-slate leading-relaxed pl-1">
                {merchant.store_description}
              </p>
            )}

            <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between text-[11px] text-muted-slate">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
                <span>ระบบรักษาความปลอดภัยดาวน์โหลดไฟล์ Private Vault 15 นาที</span>
              </span>
              {storePromptPay && (
                <span className="font-mono text-charcoal font-semibold">
                  พร้อมเพย์ร้าน: {storePromptPay}
                </span>
              )}
            </div>
          </div>

          {/* Price & Purchase Actions */}
          <div className="p-5 rounded-squircle bg-white border border-black/[0.08] shadow-level-1 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-charcoal tabular-nums">
                ฿{product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-muted-slate line-through tabular-nums">
                  ฿{product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-xs text-accent-emerald font-bold">
                ชำระครั้งเดียว ดาวน์โหลดได้ตลอดชีพ
              </span>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleAddToCart}
                className="h-12 rounded-full border border-black/15 bg-white hover:bg-black/[0.04] text-xs sm:text-sm font-bold text-charcoal flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                <span>เพิ่มลงในตะกร้า</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="h-12 rounded-full bg-black hover:bg-charcoal text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                <span>ซื้อทันทีด้วย PromptPay</span>
              </button>
            </div>

            {addedToast && (
              <div className="p-3 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-[#248a3d] text-xs flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>เพิ่มสินค้าลงในตะกร้าเรียบร้อยแล้ว!</span>
                </div>
                <button
                  onClick={openCart}
                  className="font-bold underline text-xs hover:opacity-80"
                >
                  เปิดตะกร้า
                </button>
              </div>
            )}
          </div>

          {/* Description & Highlights */}
          <div className="space-y-4 pt-2">
            <div>
              <h2 className="text-sm font-bold text-charcoal uppercase tracking-wider mb-2">
                รายละเอียดสินค้า (Product Overview)
              </h2>
              <p className="text-xs sm:text-sm text-charcoal leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                  ไฮไลท์สำคัญ (Key Highlights)
                </h3>
                <ul className="space-y-1.5">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-charcoal flex items-start gap-2">
                      <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
