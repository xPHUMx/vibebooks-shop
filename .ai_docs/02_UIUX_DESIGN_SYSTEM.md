# 🎨 02. UI/UX Designer Agent Document

**Role:** UI/UX Designer  
**Goal:** ออกแบบ Wireframe, กำหนด Color Palette, Typography, User Flow และ Layout Structures ตามสไตล์ Apple Minimalist  
**System Prompt:**
> "คุณคือ UI/UX Designer ที่เชี่ยวชาญการออกแบบเว็บแอปสมัยใหม่ หน้าที่ของคุณคือการออกแบบ User Flow, ระบุโครงสร้างหน้าจอ (Layout Structure) และแนะนำโทนสี ฟอนต์ หรือ Component (เช่น ใช้ Tailwind CSS / Material UI) ให้สอดคล้องกับความต้องการจาก Product Manager"

---

## 1. Design Language & Aesthetics
- **Theme:** Apple Minimalist + Liquid Glassmorphism + Clean Charcoal Typography
- **Core Principles:**
  1. **Clarity & Simplicity:** พื้นหลังสว่างสะอาดตา `#fbfbfd` (Porcelain) ตัดด้วยตัวอักษร `#1d1d1f` (Charcoal)
  2. **Micro-Interactions:** การเคลื่อนไหวสมูท (`animate-fade-in`, `animate-scale-up`, `transition-all duration-200`)
  3. **Visual Hierarchy:** การใช้ Badges, Font-weight (Extrabold vs Regular), และ Glassmorphic Borders (`border-black/[0.06]`)
  4. **Strict Color Meaning:**
     - 🔴 **Red / Rose (`#ef4444` / `#f43f5e`):** Danger Zone, รหัส Catalog สีแดง, การลบข้อมูลถาวร
     - 🟢 **Emerald (`#10b981` / `#059669`):** อนุมัติแล้ว, อ่านครบ 100%, ชำระเงินสำเร็จ
     - 🟡 **Amber (`#f59e0b`):** รอพ่อค้าตรวจสอบสลิป, รออนุมัติ
     - ⚫ **Charcoal / Black (`#111111` / `#161617`):** แบรนด์หลัก Book Sangdai, ปุ่ม Primary Action

---

## 2. Color Palette & Tokens (Tailwind CSS)

```css
/* Color System Tokens */
--color-bg-canvas: #fbfbfd;       /* Porcelain White */
--color-surface-card: #ffffff;    /* Pure White */
--color-surface-dark: #161617;    /* Slate Black (Danger Modal) */
--color-text-main: #1d1d1f;       /* Deep Charcoal */
--color-text-muted: #86868b;      /* Muted Slate */
--color-brand-primary: #111111;   /* Book Sangdai Black */
--color-status-success: #10b981;  /* Emerald 500 */
--color-status-warning: #f59e0b;  /* Amber 500 */
--color-status-danger: #e11d48;   /* Rose 600 */
```

---

## 3. Typography System
- **Heading & Titles:** `Plus Jakarta Sans`, `Inter`, `Noto Sans Thai` (font-extrabold / font-black)
- **Monospace (รหัส Catalog, Order ID, OTP):** `font-mono` (`ui-monospace`, `SFMono-Regular`, `Consolas`)
- **Body Text:** `Noto Sans Thai`, `Inter` (font-normal, leading-relaxed)

---

## 4. Component Layout Specifications

### 4.1 Danger Zone Deletion Modal (`DeleteLibraryItemModal.tsx`)
```
┌────────────────────────────────────────────────────────┐
│  ⚠️  ยืนยันการลบ E-book ออกจากคลัง (Danger Zone)       │
│      การดำเนินการนี้ไม่สามารถย้อนกลับได้                 │
├────────────────────────────────────────────────────────┤
│  [📕] Test1                                            │
│       ไฟล์: vault/___Vibe_Coding_Ebook.pdf             │
├────────────────────────────────────────────────────────┤
│  กรุณากรอก รหัส Catalog (Catalog Code) เพื่อยืนยัน:    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ รหัส CATALOG:        prod-1791246546638-398u (RED)│  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ พิมพ์ "prod-1791246546638-398u" ที่นี่ (Input)    │  │
│  └──────────────────────────────────────────────────┘  │
│  สถานะ: ต้องกรอกรหัส catalog ให้ตรงกันเป๊ะเพื่อปลดล็อก  │
├────────────────────────────────────────────────────────┤
│  [     ยกเลิก     ]    [ 🗑️ ลบออกจากคลังถาวร (DISABLED) ]│
└────────────────────────────────────────────────────────┘
```

### 4.2 Consent Reading Gate Modal (`ConsentReaderModal.tsx`)
- **Layer & Z-Index:** `fixed inset-0 z-[100]` แยกอิสระจาก Modal Card อื่น ป้องกันการถูกจำกัดขอบเขตการแสดงผล
- **Header:**
  - โลโก้สี่เหลี่ยมสีดำ Book Sangdai พร้อมไอคอน `local_library`
  - ชื่อหัวข้อ: "ข้อตกลงและนโยบายความเป็นส่วนตัว" หรือ "ยินดีต้อนรับสู่ Book Sangdai"
  - หลอด Progress Bar พร้อมแอนิเมชันความคืบหน้า 0% - 100% (สีเขียว Emerald เมื่อครบ 100%)
- **Scroll Area (`max-h-[50vh]`):**
  - แผงเลื่อนอ่านแบ่งเป็น 2 ส่วนชัดเจน:
    - **ส่วนที่ 1 (ป้ายสีดำ):** ข้อตกลงและเงื่อนไขการใช้งาน (Terms & Conditions / EULA)
    - **ส่วนที่ 2 (ป้ายสีเขียว):** นโยบายความเป็นส่วนตัวตามกฎหมาย PDPA (Privacy Policy)
  - แถบสถานะสีเขียวล่างสุดเมื่อเลื่อนถึงก้นกล่อง: `✓ ท่านได้เลื่อนอ่านข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัวครบถ้วนแล้ว`
- **Footer Controls:**
  - ทางลัด Quick Scroll: ปุ่มลูกศร `คลิกเพื่อเลื่อนลงล่างสุด (X%)` ช่วยให้ผู้ใช้เลื่อนลงล่างได้อย่างรวดเร็ว
  - ลิงก์ฉบับเต็ม: เปิดหน้ารวมเงื่อนไขในแท็บใหม่
  - ปุ่ม Action:
    - **ก่อนเลื่อนอ่านครบ:** ไอคอนกุญแจล็อก `🔒 โปรดเลื่อนอ่านให้จบก่อนกดตกลง` (พื้นหลังเทา ปิดการใช้งาน)
    - **เมื่อเลื่อนอ่านครบ 100%:** ไอคอนเครื่องหมายถูกสีเขียว `✓ ฉันได้อ่านและยอมรับข้อตกลงทั้งหมด` (พื้นหลังดำ สว่าง ปลดล็อกพร้อมกด)

### 4.3 Report Center Design Specs (Merchant & Admin)
- **Aesthetic:** Apple Minimalist Dashboard with Porcelain Cards and Smooth Borders (`rounded-squircle border-black/[0.06]`)
- **Executive KPI Cards:** 6-column grid displaying Gross Revenue, Paid Orders, Pending Review Orders, Conversion Rate, AOV, and Store/Catalog figures with color-coded material icons.
- **Timeframe Selector Pills:** Capsule segmented controls (`ทั้งหมด`, `30 วัน`, `7 วัน`, `วันนี้`) with smooth dark active state.
- **Visual Distribution Bar:** Order status funnel (Emerald for PAID, Amber for PENDING).
- **Leaderboard Ranking:** Clean table layout with gold (#1), silver (#2), bronze (#3) badges for top-selling items.
- **Action Buttons:** Floating capsule buttons for `📥 ส่งออก CSV` and `🖨️ พิมพ์รายงาน`.

### 4.4 Checkout QR Code Critical Alert Banner
- **Warning Container:**
  - Gradient Background: `bg-gradient-to-r from-rose-950/90 via-red-900/80 to-rose-950/90`
  - Border: 2px solid `border-rose-500/80`
  - Glow Shadow: `shadow-[0_0_30px_rgba(244,63,94,0.35)]`
  - Header: Animated warning badge `DO NOT CLOSE` + text `⚠️ คำเตือนสำคัญ: ห้ามปิดหน้านี้เด็ดขาด!`
  - Subtext: เน้นย้ำให้ผู้ใช้รอสแกนชำระเงินและแนบสลิปให้เสร็จสมบูรณ์ ห้ามปิดเบราว์เซอร์หรือกดย้อนกลับ
  - QR Code Ring: `ring-4 ring-rose-500/30` พร้อมป้ายเตือนล็อคด้านล่าง QR Code

### 4.5 Merchant Transaction Danger Zone Modal (`DeleteOrderModal.tsx`)
```
┌────────────────────────────────────────────────────────┐
│  🧾  ยืนยันการลบรายการธุรกรรม (Merchant Danger Zone)   │
│      จะนำยอดขายและประวัตินี้ออกจาก Report Center ถาวร  │
├────────────────────────────────────────────────────────┤
│  ยอดรวม: ฿1,250                                        │
│  ลูกค้า: Somchai Sukjai (somchai@example.com)          │
│  สถานะ:  [ชำระเงินแล้ว]                                │
├────────────────────────────────────────────────────────┤
│  กรุณากรอก รหัสคำสั่งซื้อ (Order ID) ด้านล่างนี้เพื่อยืนยัน:│
│  ┌──────────────────────────────────────────────────┐  │
│  │ รหัสยืนยัน:          ORD-2026-8821 (RED BOLD)    │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ พิมพ์ "ORD-2026-8821" ที่นี่ (Auto-focused Input) │  │
│  └──────────────────────────────────────────────────┘  │
│  สถานะ: ✓ รหัสยืนยันถูกต้อง สามารถกดลบได้               │
├────────────────────────────────────────────────────────┤
│  [     ยกเลิก     ]    [ 🗑️ ยืนยันการลบธุรกรรม (ROSE) ] │
└────────────────────────────────────────────────────────┘
```
- **Aesthetic:** Dark Charcoal Surface `#161617` with Rose Accents `#f43f5e`
- **Security Safeguard:** Input code matching with uppercase/lowercase tolerance, interactive validation badge, disabled submit button until verified 100%.

### 4.6 Category Selector Vertical Cards System (`src/app/page.tsx`)
- **Section Header:**
  - Left: `หมวดหมู่ผลงาน` (`text-lg sm:text-xl font-bold text-charcoal tracking-tight`)
  - Right: `ดูทั้งหมด >` (`text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 cursor-pointer`)
- **Container:** Horizontal scrollable rail `overflow-x-auto scrollbar-none py-2 px-0.5 gap-3 sm:gap-4 flex items-center justify-start sm:justify-start lg:justify-between`
- **Category Vertical Item Structure:**
  1. **Top Icon Box (`rounded-2xl`):**
     - Dimensions: `w-14 h-14 sm:w-16 sm:h-16`
     - Inactive State: `bg-white text-charcoal/80 border border-black/[0.08] shadow-sm hover:border-black/25 hover:shadow-md hover:-translate-y-0.5 hover:text-black`
     - Active State: `bg-black text-white border-black shadow-md ring-2 ring-black/15 scale-105`
     - Icon Size: `text-[24px] sm:text-[26px]`
  2. **Bottom Label:**
     - Typography: `text-xs mt-2 text-center max-w-[96px] sm:max-w-[110px] truncate`
     - Inactive: `font-medium text-charcoal/70 group-hover:text-charcoal`
     - Active: `font-bold text-black`

### 4.7 Clean Compact Discount Percentage Badges
- **Media Frame Top-Left Badge:**
  - Token: `absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-[#dc2626] text-white text-[11px] font-bold shadow-sm`
  - Content: `-{discountPercent}%` (e.g. `-51%`, `-44%`, `-100%`)
  - Design Philosophy: Minimal, compact, un-cluttered red pill matching high-conversion Apple-esque storefront aesthetics.
- **Top-Right Bookmark Pill:**
  - Token: `w-7 h-7 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.08] flex items-center justify-center text-charcoal/70 shadow-sm` with `favorite_border` icon.
- **Pricing Clean Layout:**
  - Eliminated redundant second discount badge in the price section to ensure clean whitespace and focus on primary price and struck-through original price.

### 4.8 Unified Category Taxonomy & Form Control Tokens
- **Single Source of Truth:** `CATEGORIES` array in `productsData.ts`.
- **Form Select Elements (`merchant` & `admin`):**
  - Styled with `w-full px-3 py-2 text-xs rounded-xl border border-black/[0.08] bg-black/[0.02] text-black font-medium focus:outline-none focus:ring-1 focus:ring-black`.
  - Dropdown options display unified bilingual/standard titles:
    - `E-Books & Manuals`
    - `Figma UI Kits`
    - `Notion Systems`
    - `Source Code & SaaS`
    - `3D & Visual Assets`
    - `Creative AI & Prompts`
    - `Multimedia & Audio`
    - `Productivity Packs`
- **Dashboard Consistency:** The horizontal category rail on the storefront and merchant product creation select options share 100% identical titles and IDs.

### 4.9 Official Brand Icon & Favicon Design Specifications
- **Source Asset:** `Icon Production.jpg` (High-resolution brand artwork)
- **Deployment Targets:**
  - `public/icon.jpg`: Official web favicon and static asset
  - `src/app/icon.jpg`: Next.js automated App Icon route (`/icon`)
  - `public/favicon.ico`: Legacy browser compatibility
  - `public/manifest.json`: Web app manifest icon (`192x192` & `512x512`)
- **UI Container Tokens:**
  - **Header Brand Logo:** `w-9 h-9 rounded-xl bg-black border border-black/10 overflow-hidden shadow-sm group-hover:scale-105`
  - **Auth Modal:** `w-12 h-12 rounded-2xl bg-charcoal border border-black/10 overflow-hidden shadow-sm`
  - **Login Page:** `w-14 h-14 rounded-2xl bg-black border border-black/10 overflow-hidden shadow-md`
  - **Consent Modal:** `w-12 h-12 rounded-2xl bg-charcoal border border-black/10 overflow-hidden shadow-sm`
  - **Aspect & Object Fit:** `w-full h-full object-cover` preserving visual fidelity.

### 4.10 Minimalist OTP Email & Remember Me Form Controls
- **Email Typography & Palette:**
  - Card: `#ffffff` background with `24px` border-radius and subtle `0 8px 30px rgba(0,0,0,0.06)` shadow.
  - Header: Pitch black (`#111111`) with rounded Icon Production artwork (`56x56px`, `15px` radius).
  - Digit Tiles: Modern Apple typography (`SF Pro Display`), individual white tiles (`40x48px`, `10px` radius, `#dcdcde` border) displayed via HTML table.
  - Expiry Pill: Soft red badge `⏱ รหัสมีอายุ 2 นาที` (`#fef2f2` bg, `#fee2e2` border, `#dc2626` text).
- **Remember Me Checkbox Token:**
  - `w-4 h-4 rounded border-black/20 text-black focus:ring-black accent-black cursor-pointer`
  - Label: `text-[12px] text-charcoal/80 group-hover:text-charcoal transition-colors font-medium`

### 4.11 Complete Site Map & UI Flow Architecture
- แผนผังสถาปัตยกรรมหน้าจอและการเชื่อมโยง User Journey ทั้งหมดได้รับการจัดทำเป็น Mermaid Flowchart ใน [docs/SYSTEM_DIAGRAMS.md](file:///c:/Users/Phums/.gemini/antigravity/scratch/ebook_shop/docs/SYSTEM_DIAGRAMS.md#6-site-map--ui-flow-แผนผังเว็บไซต์และการเชื่อมโยงหน้าจอ)
- รองรับการเดินทางของ User จากหน้าแรก (Storefront) -> เลือกลงตะกร้า -> เช็คเอาต์ -> ชำระเงิน PromptPay QR -> ส่งสลิป -> ปลดล็อกใน My Library พร้อมทางเชื่อมต่อไปยัง Merchant Portal และ Admin Portal อย่างครบวงจร








