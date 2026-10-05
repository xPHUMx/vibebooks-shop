'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  DIGITAL_PRODUCTS,
  CATEGORIES,
  STORE_INFO,
} from '@/lib/productsData';
import { DigitalProduct, ProductCategory } from '@/types';
import { useCart } from '@/context/CartContext';
import ProductModal from '@/components/ProductModal';
import ApplePdfReader from '@/components/ApplePdfReader';

export default function StorefrontPage() {
  const [productsList, setProductsList] = useState<DigitalProduct[]>(DIGITAL_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<DigitalProduct | null>(null);
  const [readingBook, setReadingBook] = useState<DigitalProduct | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    fetchRealProducts();
  }, []);

  const fetchRealProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.products && data.products.length > 0) {
        setProductsList(data.products);
      }
    } catch (e) {
      console.warn('Real products fetch notice:', e);
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return productsList.filter((prod) => {
      const matchCat =
        activeCategory === 'all' || prod.category === activeCategory;
      const text = `${prod.title} ${prod.subtitle} ${prod.description} ${prod.categoryNameTh || ''} ${prod.merchantName || ''}`.toLowerCase();
      const matchSearch = text.includes(searchQuery.toLowerCase().trim());
      return matchCat && matchSearch;
    });
  }, [productsList, activeCategory, searchQuery]);

  // Featured flagship products for Bento Showcase
  const flagshipProduct = productsList.find(
    (p) => p.id === 'liquid-glass-apple-ui-kit'
  ) || productsList[0];

  const secondaryFeatures = productsList.filter(
    (p) => p.id !== flagshipProduct?.id && p.isFeatured
  ).slice(0, 2);


  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      {/* 1. HERO SECTION: Liquid Glass Optical Showcase */}
      <section className="relative pt-6 sm:pt-12 pb-8 flex flex-col items-center text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-black/[0.06] shadow-level-1 mb-5">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-xs font-semibold text-charcoal tracking-wide">
            Next.js 14 SSR • Supabase Vault • Liquid Glass Commerce
          </span>
        </div>

        {/* Brand Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-charcoal max-w-3xl leading-[1.12] mb-4">
          <span>{STORE_INFO.brand}</span>
          <span className="block text-2xl sm:text-4xl md:text-5xl font-semibold text-muted-slate mt-1">
            คลังหนังสือวิศวกรรม & ดิจิทัลโปรดักส์สั่งได้ดั่งใจ
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-sm sm:text-base text-muted-slate max-w-xl leading-relaxed mb-6">
          ศูนย์รวม E-Books สถาปัตยกรรมซอฟต์แวร์, Figma Design System, Notion OS และ ซอร์สโค้ดระดับ Production พร้อมระบบจัดส่งไฟล์อัตโนมัติ 100%
        </p>

        {/* Lead Curator Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] shadow-level-1 mb-8">
          <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold">
            ก
          </div>
          <span className="text-xs font-semibold text-charcoal">
            {STORE_INFO.curator}
          </span>
          <span className="text-[11px] text-muted-slate">
            ({STORE_INFO.studentId})
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-emerald/15 text-[#248a3d]">
            Verified Creator
          </span>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
          <div className="p-3.5 rounded-squircle bg-white border border-black/[0.06] shadow-level-1 text-center">
            <span className="material-symbols-outlined text-[20px] text-secondary mb-1">bolt</span>
            <div className="text-sm font-bold text-charcoal">Instant Delivery</div>
            <div className="text-[11px] text-muted-slate">ส่งมอบไฟล์ทันทีผ่าน Vault</div>
          </div>
          <div className="p-3.5 rounded-squircle bg-white border border-black/[0.06] shadow-level-1 text-center">
            <span className="material-symbols-outlined text-[20px] text-accent-emerald mb-1">verified</span>
            <div className="text-sm font-bold text-charcoal">100% Commercial</div>
            <div className="text-[11px] text-muted-slate">สิทธิ์ใช้งานเชิงพาณิชย์</div>
          </div>
          <div className="p-3.5 rounded-squircle bg-white border border-black/[0.06] shadow-level-1 text-center">
            <span className="material-symbols-outlined text-[20px] text-accent-coral mb-1">qr_code_2</span>
            <div className="text-sm font-bold text-charcoal">PromptPay QR</div>
            <div className="text-[11px] text-muted-slate">ชำระสะดวก ไม่มีค่าธรรมเนียม</div>
          </div>
          <div className="p-3.5 rounded-squircle bg-white border border-black/[0.06] shadow-level-1 text-center">
            <span className="material-symbols-outlined text-[20px] text-amber-500 mb-1">star</span>
            <div className="text-sm font-bold text-charcoal">5.0 Star Rating</div>
            <div className="text-[11px] text-muted-slate">รับประกันคุณภาพเนื้อหา</div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL BENTO SHOWCASE (Liquid Glass Flagships) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal">
              Editor’s Flagship Vaults
            </h2>
            <p className="text-xs text-muted-slate">ผลิตภัณฑ์คัดสรรพิเศษสำหรับนักพัฒนาและดีไซเนอร์</p>
          </div>
          <span className="text-xs font-semibold text-secondary hidden sm:inline">
            Curated by Book Sangdai
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Hero Card (Spans 2 columns on desktop) */}
          <div
            onClick={() => setSelectedProduct(flagshipProduct)}
            className="md:col-span-2 rounded-squircle-lg bg-white border border-black/[0.06] shadow-level-1 hover:shadow-level-2 transition-all p-6 sm:p-8 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col items-start max-w-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-black text-white text-[11px] font-bold shadow-sm">
                  ★ {flagshipProduct.badge || 'Flagship Edition'}
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-500/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>🏪</span>
                  <span>{flagshipProduct.merchantName || 'Book Sangdai Official'}</span>
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight group-hover:text-secondary transition-colors">
                {flagshipProduct.title}
              </h3>
              <p className="text-sm text-muted-slate mt-2 line-clamp-2">
                {flagshipProduct.subtitle}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-charcoal tabular-nums">
                    ฿{flagshipProduct.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-slate line-through tabular-nums">
                    ฿{flagshipProduct.originalPrice.toLocaleString()}
                  </span>
                </div>
                <Link
                  href={`/products/${flagshipProduct.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3.5 py-1.5 rounded-full bg-black/5 hover:bg-black/10 text-xs font-semibold text-charcoal flex items-center gap-1 transition-all"
                >
                  <span>ดูรายละเอียด</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Preview Thumbnail Container */}
            <div className="mt-6 w-full h-48 sm:h-64 rounded-squircle bg-porcelain border border-black/[0.06] overflow-hidden relative shadow-inner">
              <Image
                src={flagshipProduct.coverImage}
                alt={flagshipProduct.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Secondary Bento Cards (Spans 1 column) */}
          <div className="space-y-5 flex flex-col justify-between">
            {secondaryFeatures.map((sec) => (
              <div
                key={sec.id}
                onClick={() => setSelectedProduct(sec)}
                className="flex-1 rounded-squircle-lg bg-white border border-black/[0.06] shadow-level-1 hover:shadow-level-2 transition-all p-5 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase">
                      {sec.categoryNameTh}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                      <span>🏪</span>
                      <span className="truncate max-w-[100px]">{sec.merchantName || 'Book Sangdai Official'}</span>
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-charcoal tracking-tight group-hover:text-secondary transition-colors line-clamp-1">
                    {sec.title}
                  </h4>
                  <p className="text-xs text-muted-slate mt-1 line-clamp-2">
                    {sec.subtitle}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/[0.06]">
                    <span className="text-xs font-bold text-charcoal tabular-nums">
                      ฿{sec.price.toLocaleString()}
                    </span>
                    <Link
                      href={`/products/${sec.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-semibold text-secondary hover:underline flex items-center gap-0.5"
                    >
                      <span>ดูรายละเอียด</span>
                      <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                <div className="mt-4 w-full h-28 rounded-squircle bg-porcelain border border-black/[0.06] overflow-hidden relative">
                  <Image
                    src={sec.coverImage}
                    alt={sec.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SEARCH & CATEGORY FILTER BAR */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Global Search Capsule */}
          <div className="relative flex-1 flex items-center rounded-full bg-white px-4 py-2.5 border border-black/[0.08] shadow-level-1 transition-all focus-within:border-secondary focus-within:shadow-level-2">
            <span className="material-symbols-outlined text-muted-slate text-[20px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา E-books, Figma kits, Notion OS, Next.js templates..."
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-charcoal placeholder:text-muted-slate/70 ml-2.5"
              type="text"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="w-5 h-5 rounded-full bg-black/[0.06] hover:bg-black/[0.1] flex items-center justify-center text-charcoal"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          <span className="text-xs text-muted-slate font-medium text-right shrink-0 px-1">
            พบสินค้า {filteredProducts.length} รายการ
          </span>
        </div>

        {/* Category Pills (Liquid Glass Floating Capsules) */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white hover:bg-black/[0.03] text-charcoal/80 border border-black/[0.06]'
              }`}
            >
              {cat.labelTh}
            </button>
          ))}
        </div>
      </section>

      {/* 4. PRODUCT GRID (Squircle Cards & Quick Add) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => (
          <article
            key={prod.id}
            className="liquid-card p-4 sm:p-5 flex flex-col justify-between group"
          >
            {/* Top Media Frame (1:1 / 4:3 Ratio) */}
            <div
              onClick={() => setSelectedProduct(prod)}
              className="relative w-full h-52 rounded-squircle bg-porcelain border border-black/[0.06] overflow-hidden cursor-pointer shadow-inner"
            >
              <Image
                src={prod.coverImage}
                alt={prod.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Badges Overlay */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-charcoal border border-black/[0.06] shadow-sm">
                  {prod.categoryNameTh}
                </span>

                {prod.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/80 backdrop-blur-md text-white shadow-sm">
                    {prod.badge}
                  </span>
                )}
              </div>

              {/* Bottom format pill */}
              <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-charcoal text-[10px] font-medium border border-black/[0.06] flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[13px] text-secondary">
                  {prod.category === 'ebook' ? 'picture_as_pdf' : 'folder_zip'}
                </span>
                <span>{prod.fileSize}</span>
              </div>
            </div>

            {/* Product Metadata */}
            <div className="pt-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1 text-xs text-charcoal font-semibold">
                    <span className="material-symbols-outlined text-[15px] text-amber-500 fill-1">star</span>
                    <span>{prod.rating.toFixed(1)}</span>
                    <span className="text-muted-slate font-normal">({prod.ratingCount})</span>
                  </div>

                  <span className="text-[11px] text-amber-800 font-bold flex items-center gap-1 truncate max-w-[140px]" title={prod.merchantName || 'Book Sangdai Official'}>
                    <span>🏪</span>
                    <span className="truncate">{prod.merchantName || 'Book Sangdai Official'}</span>
                  </span>
                </div>

                <Link
                  href={`/products/${prod.id}`}
                  className="text-base font-bold text-charcoal hover:text-secondary transition-colors line-clamp-1 block"
                >
                  {prod.title}
                </Link>
                <p className="text-xs text-muted-slate line-clamp-2 mt-1 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              {/* Pricing & Split Action Controls */}
              <div className="pt-4 mt-3 border-t border-black/[0.06] flex items-center justify-between gap-2">
                <div>
                  <div className="text-lg font-extrabold text-charcoal tabular-nums">
                    ฿{prod.price.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-muted-slate line-through tabular-nums">
                    ฿{prod.originalPrice.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/products/${prod.id}`}
                    className="h-9 px-3 rounded-full border border-black/10 bg-white hover:bg-black/[0.04] text-xs font-semibold text-charcoal transition-all flex items-center gap-1 shrink-0"
                    title="ดูรายละเอียดเพิ่มเติมสินค้านี้"
                  >
                    <span>ดูรายละเอียด</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </Link>
                  <button
                    onClick={() => addToCart(prod, 1)}
                    className="h-9 px-3.5 rounded-full bg-black hover:bg-charcoal text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all active:scale-95"
                    title="ใส่ตะกร้าสินค้า"
                  >
                    <span className="material-symbols-outlined text-[15px]">add_shopping_cart</span>
                    <span className="hidden sm:inline">ใส่ตะกร้า</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* 5. FOOTER CURATOR CERTIFICATE */}
      <footer className="mt-16 pt-8 border-t border-black/[0.06] text-center text-xs text-muted-slate space-y-2">
        <p className="font-semibold text-charcoal">
          {STORE_INFO.brand} ({STORE_INFO.brandTh}) • สถาปัตยกรรมระบบดิจิทัลโปรดักส์และคู่มือวิศวกรรม
        </p>
        <p>
          พัฒนาและจัดทำโดย {STORE_INFO.curator} ({STORE_INFO.curatorEn}) — รหัสนักศึกษา {STORE_INFO.studentId}
        </p>
        <p className="text-[11px] text-muted-slate/70">
          Powered by Next.js 14 App Router, Supabase SSR Auth, Private Vault Storage & PromptPay QR
        </p>
      </footer>

      {/* Modals */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenPdfReader={(prod) => {
          setReadingBook(prod);
        }}
      />

      {readingBook && (
        <ApplePdfReader
          orderId={readingBook.id}
          bookTitle={readingBook.title}
          fileName={readingBook.fileName}
          onClose={() => setReadingBook(null)}
        />
      )}
    </div>
  );
}
