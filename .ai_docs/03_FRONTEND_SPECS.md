# 💻 03. Frontend Developer Agent Document

**Role:** Frontend Developer  
**Goal:** พัฒนาโค้ดฝั่ง Client-side ที่สะอาด ทันสมัย รองรับ Responsive และเชื่อมต่อ API อย่างถูกต้องตามมาตรฐาน Next.js 14 App Router  
**System Prompt:**
> "คุณคือ Frontend Developer ผู้เชี่ยวชาญด้าน React/Next.js และ Tailwind CSS หน้าที่ของคุณคือรับแบบร่างจาก UI/UX Designer แล้วเขียนโค้ดฝั่ง Client-side ที่สะอาด Responsive และเชื่อมต่อ API ได้อย่างถูกต้องตามมาตรฐาน"

---

## 1. Frontend Architecture & Technology Stack
- **Framework:** Next.js 14.2+ (App Router)
- **Language:** TypeScript 5.0+
- **Styling:** Tailwind CSS + Vanilla CSS Variables
- **Icons:** Google Material Symbols Outlined (`material-symbols-outlined`)
- **State Management:** React Context API (`AuthContext`, `CartContext`)

---

## 2. Component Hierarchy & File Mapping

```
src/
├── app/
│   ├── layout.tsx                     # Root Layout: Header, Nav, FirstTimeConsentModal
│   ├── page.tsx                       # Marketplace Catalog Home Page
│   ├── library/page.tsx               # My Library: Digital Vault, Paid & Pending Tabs
│   ├── order/[id]/page.tsx            # Order Status Tracking Room
│   └── checkout/page.tsx              # PromptPay QR Checkout Flow
├── components/
│   ├── AuthModal.tsx                  # Sign In, Sign Up, and OTP Verification Flow
│   ├── ConsentReaderModal.tsx         # Reusable Legal Terms & PDPA 100% Scroll Reader
│   ├── FirstTimeConsentModal.tsx      # Auto-listener for newly logged-in Gmail users
│   ├── DeleteLibraryItemModal.tsx     # Secure E-book Deletion Modal (Red Catalog ID)
│   ├── ApplePdfReader.tsx             # Canvas-based In-Browser PDF Reader
│   ├── Header.tsx                     # Global Navigation Header with Glassmorphism
│   └── CartDrawer.tsx                 # Shopping Cart Side Drawer
└── context/
    └── AuthContext.tsx                # Auth State, Profile Sync, Google OAuth, OTP Handlers
```

---

## 3. Core Frontend Flows & Logic Implementation

### 3.1 Authentication & Sign Up Flow (`AuthModal.tsx` & `FirstTimeConsentModal.tsx`)
1. **Sign-In Mode (เข้าสู่ระบบด้วย OTP):**
   - ผู้ใช้กรอกอีเมล -> ส่งคำขอ `sendOtp(email, '', 'signin')`
   - หากผู้ใช้ยังไม่มีอีเมลในระบบ: ฝั่ง API ส่ง Error `{ requireSignup: true }` -> แสดงข้อความเตือนสีแดงพร้อมปุ่มทางลัดสลับไปแท็บสมัครสมาชิกทันที
   - การยืนยัน OTP ในโหมด signin จะไม่ส่ง flag ยินยอมปลอม เพื่อให้ระบบตรวจจับได้หากผู้ใช้ยังไม่เคยยินยอมข้อตกลง
2. **Sign-Up Mode (สมัครสมาชิกใหม่):**
   - ผู้ใช้กรอกชื่อและอีเมล -> มีลิงก์ข้อตกลงและนโยบายความเป็นส่วนตัวให้คลิกอ่านได้ทันที
   - เมื่อกดปุ่ม "สมัครสมาชิก" หาก `!signupConsentAccepted` -> ระบบจะเปิด `ConsentReaderModal` ให้เลื่อนอ่าน 100% เสมอ (ไม่มีการข้ามด้วย localStorage เก่า)
   - เมื่อผู้ใช้เลื่อนอ่านครบ 100% และกดปุ่มตกลง: `setSignupConsentAccepted(true)` แล้วจึงส่ง `sendOtp(email, fullName, 'signup')`
   - เมื่อผู้ใช้กรอกรหัส OTP 6 หลักถูกต้อง: ระบบจะส่ง `verifyOtp(..., { agreedTerms: true, agreedPrivacy: true })` ไปบันทึก `terms_accepted_at` และ `privacy_accepted_at` ลงใน Supabase `profiles` ถาวร
   - ผลลัพธ์: ผู้ใช้ที่สมัครสมาชิกและอ่านแล้ว จะไม่พบป๊อปอัปเด้งซ้ำที่หน้าแรกอีก
3. **Continue with Gmail / First-Time Login (`FirstTimeConsentModal.tsx` & `AuthContext.tsx`):**
   - ผู้ใช้เข้าสู่ระบบด้วย Google OAuth -> เข้าสู่กระบวนการแลก Session
   - **Single-Flight Deduplication & Sync Lock:** ใน `AuthContext` มีการป้องกันการเรียก `fetchAndSyncProfile` ซ้ำซ้อนพร้อมกันใน background โดยใช้ `syncPromiseRef` และควบคุมสถานะ `isProfileSyncing`
   - **Wait for DB Callback:** `FirstTimeConsentModal` จะไม่เปิดทำงานจนกว่า `!isLoading && !isProfileSyncing && profile !== null` เพื่อให้ API ทำงานเชื่อมต่อกับ Database เสร็จสิ้นและ Callback ข้อมูลจริงกลับมาก่อน 100%
   - **Session Dismissed Lock (`hasDismissedInSession`):** เมื่อผู้ใช้กดยอมรับ ระบบจะสั่งปิด Modal ทันที และล็อกสถานะในเซสชันไม่ให้เด้งซ้ำอีกระหว่างรอ API อัปเดตตาราง `profiles`
   - การล็อกอินครั้งต่อไป ระบบจะตรวจพบว่า `profile.termsAcceptedAt` มีค่าแล้วจาก Supabase จึงไม่แสดงป๊อปอัปซ้ำ
4. **Guest / Visitor Protection:**
   - หาก `!user` (ผู้ใช้ยังไม่ได้ล็อกอิน): `FirstTimeConsentModal` จะปิดการทำงานเสมอ เพื่อให้ผู้เยี่ยมชมเลือกดูหนังสือได้อย่างอิสระ ไม่ถูกป๊อปอัปบังหน้าจอ

### 3.2 Secure Library Item Deletion (`DeleteLibraryItemModal.tsx`)
- รับ Props: `item: { orderId, productId, title, fileName }`
- State: `typedCatalogCode`
- Validation: `isMatched = typedCatalogCode.trim() === item.productId.trim()`
- เมื่อกดยืนยัน: ส่ง `DELETE` ไปยัง `/api/orders` พร้อม `orderId`, `productId` และ `email`
- อัปเดต `setOrders(...)` ทันทีโดยไม่ต้อง Reload หน้าเว็บ

### 3.3 Store Logo Instant Preview & Auto-Persistence (`merchant/page.tsx` & `profile/page.tsx`)
- **Instant Preview:** ใช้ `URL.createObjectURL(file)` แสดงรูปทันทีที่ผู้ใช้เลือกไฟล์ ไม่ต้องรอ network response
- **Auto-Persistence:** เมื่อ API `/api/upload` ตอบกลับ URL จะเรียก `updateProfile({ storeLogoUrl: data.url })` อัตโนมัติทันที เพื่อบันทึกลง Supabase `profiles.store_logo_url` และ AuthContext ทันทีโดยไม่ต้องรอกดปุ่มบันทึกฟอร์ม
- **Image Fallback:** เพิ่ม `onError` handler ใน `<img>` ป้องกันปัญหาภาพแตก (broken image icon)

### 3.4 Checkout QR Code Warning & BeforeUnload Gate (`payment/[orderId]/page.tsx` & `checkout/page.tsx`)
- **Unmissable Banner:** แสดงแถบเตือนสีแดง-กุหลาบ `⚠️ คำเตือนสำคัญ: ห้ามปิดหน้านี้เด็ดขาด!` พร้อมป้ายกระพริบ `DO NOT CLOSE` ทั้งเหนือและรอบ QR Code
- **BeforeUnload Event Guard:** เพิ่ม `window.addEventListener('beforeunload', ...)` แจ้งเตือนยืนยันก่อนผู้ใช้จะเผลอปิดแท็บหรือกดย้อนกลับขณะที่สถานะคำสั่งซื้อยังเป็น PENDING

### 3.5 Merchant & Admin Report Center Architecture
- **Merchant Report Center (`merchant/page.tsx`):**
  - แท็บ `reports` แยกอิสระจากคำสั่งซื้อและสินค้า
  - ตัวกรองเวลา (ทั้งหมด, 30 วัน, 7 วัน, วันนี้)
  - คำนวณ KPI รายได้รวม, AOV, Conversion Rate
  - จัดอันดับสินค้าขายดี (Product Performance Leaderboard)
  - ฟังก์ชันส่งออก CSV (`handleExportMerchantCsv`) และพิมพ์รายงาน (`window.print()`)
- **Admin Report Center (`admin/page.tsx`):**
  - ตารางเปรียบเทียบผลประกอบการรายร้านค้า (Store Performance Matrix)
  - Platform GMV และสรุปจำนวนคำสั่งซื้อทั้งระบบ
  - ส่งออก Master CSV รายการธุรกรรมทั้งระบบ (`handleExportAdminCsv`)
- **React Rules of Hooks Compliance:** ทุก hook (`useMemo`, `useState`, `useEffect`) ถูกประกาศไว้ด้านบนสุดของ Component ก่อนเงื่อนไข Early Return เสมอ ป้องกันข้อผิดพลาด `Rendered more hooks than during the previous render`

### 3.6 Removal of Storefront Preview Reader (`ProductModal.tsx` & `page.tsx`)
- นำปุ่ม "เปิดอ่านตัวอย่าง" และการเรียก `<ApplePdfReader>` ออกจากหน้าแคตตาล็อกหน้าร้านค้าหลัก
- สงวนฟีเจอร์การเปิดอ่าน In-Browser PDF Reader เฉพาะในหน้า **My Library (`/library`)** และ **Order Success (`/order/[id]`)** สำหรับผู้ใช้ที่เป็นเจ้าของสิทธิ์จริงเท่านั้น

### 3.7 Merchant & Admin Transaction Danger Zone Deletion (`DeleteOrderModal.tsx`)
- **Component:** `src/components/DeleteOrderModal.tsx`
- **Props:** `isOpen`, `onClose`, `onConfirm`, `order`, `isDeleting`
- **Security Validation:** ตรวจสอบความถูกต้องของรหัสคำสั่งซื้อ (`order.id`) ในรูปแบบตัวพิมพ์ใหญ่/เล็ก ตัวอักษรสีแดงเด่นชัด `select-all`
- **API Call:** ส่ง `DELETE /api/orders` พร้อม `{ orderId, isMerchantDelete: true }`
- **State Update:** กรองออเดอร์ออกจาก State `orders` ทันที ทำให้ตัวเลข KPI และศูนย์รายงาน (Report Center) อัปเดตยอดใหม่แบบเรียลไทม์

### 3.8 Category Selector Vertical Cards & Clean Compact Discount Badges (`src/lib/productsData.ts` & `src/app/page.tsx`)
- **Category Icon & Metadata Mapping (`src/lib/productsData.ts`):**
  - จับคู่ Material Symbols Outlined ให้ตรงกับหมวดหมู่ตามดีไซน์:
    - `all`: `apps` (ทั้งหมด)
    - `notion`: `table_chart` (Notion)
    - `figma`: `polyline` (Figma)
    - `code`: `terminal` (Next.js)
    - `ebook`: `menu_book` (อีบุ๊คดีไซน์)
    - `assets`: `view_in_ar` (ปลั๊กอิน 3D)
    - `creative-ai`: `psychology` (Creative AI)
    - `multimedia`: `headphones` (มัลติมีเดีย)
    - `productivity`: `bolt` (Productivity)
- **Vertical Category Cards Layout (`src/app/page.tsx`):**
  - หัวข้อหลัก `หมวดหมู่ผลงาน` พร้อมปุ่ม `ดูทั้งหมด >` (คลิกเพื่อรีเซ็ตกลับเป็น `all`)
  - โครงสร้างปุ่มแนวตั้ง (Icon Box ด้านบน ขนาด 56-64px โค้งมน `rounded-2xl` + ตัวหนังสือชื่อหมวดหมู่ตรงกลางด้านล่าง)
  - Active State สลับเป็นพื้นหลังดำ (`bg-black text-white ring-2 ring-black/15 scale-105`) อย่างนุ่มนวล
- **Clean Compact Discount Badges (เหมือนภาพตัวอย่าง):**
  - คำนวณส่วนลด:
    ```ts
    const discountPercent = prod.originalPrice > prod.price
      ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
      : 0;
    ```
  - จัดวางป้ายแคปซูลสีแดงกะทัดรัด `-X%` ที่มุมบนซ้ายของภาพสินค้า (`absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-[#dc2626] text-white text-[11px] font-bold shadow-sm`)
  - เพิ่มไอคอน Wishlist Heart (`favorite_border`) ที่มุมบนขวา
  - ตัดป้ายลดราคาซ้ำซ้อนบริเวณราคาสินค้าออก คงไว้เฉพาะราคาจริงตัวหนาและราคาเดิมขีดฆ่า (`line-through`) ให้พื้นที่ดูโปร่ง สบายตา (Clean Minimalist)

- **Unified Category Taxonomy Synchronization (หมวดหมู่ตรงกัน 100%):**
  - **Single Source of Truth (`src/lib/productsData.ts`):**
    - `CATEGORIES` array กำหนด id และ labelTh ให้ตรงกันทั้งระบบ (8 หมวดหมู่: `ebook`, `figma`, `notion`, `code`, `assets`, `creative-ai`, `multimedia`, `productivity`)
    - ฟังก์ชัน Helper `getCategoryName(catId: string): string` ป้องกันค่า fallback ว่างเปล่า
  - **Merchant & Admin Modals (`src/app/merchant/page.tsx` & `src/app/admin/page.tsx`):**
    - Dynamic rendering ของ `<select>` โดยใช้ `CATEGORIES.filter(c => c.id !== 'all')`
    - เพิ่ม payload `categoryNameTh: getCategoryName(category)` ในการ Create/Edit ทุกครั้ง
    - อัปเดต Table & Ranking badges ให้แสดงผล `item.product.categoryNameTh || getCategoryName(item.product.category)`
  - **Storefront Dashboard (`src/app/page.tsx`):**
    - Category Rail การ์ดด้านบนปรับขนาดความกว้างข้อความ `max-w-[96px] sm:max-w-[110px]` ให้พอดีกับชื่อหมวดหมู่อย่างสวยงาม
  - **API Layer (`src/app/api/products/route.ts` & `[id]/route.ts`):**
    - `mapDbProductToDigitalProduct` แมป `categoryNameTh: row.category_name_th || getCategoryName(cat)` สอดคล้องกันทั้งฝั่ง Database และ Mock data

- **Official Brand Icon Integration (`Icon Production.jpg`):**
  - **Asset Location:**
    - `public/icon.jpg` และ `public/icon-production.jpg` (Static asset served directly at `/icon.jpg`)
    - `public/favicon.ico` สำหรับ legacy browser support
  - **App Metadata Configuration (`src/app/layout.tsx`):**
    ```ts
    icons: {
      icon: "/icon.jpg",
      shortcut: "/icon.jpg",
      apple: "/icon.jpg",
    }
    ```
  - **PWA Manifest (`public/manifest.json`):**
    - ชี้ `src: "/icon.jpg"` ความละเอียดรองรับทั้ง mobile launcher และ browser shortcut
  - **UI Brand Components:**
    - `Header.tsx`: นำภาพ `/icon.jpg` มาแสดงเป็นไอคอนแบรนด์ด้านบนซ้าย
    - `AuthModal.tsx` & `ConsentReaderModal.tsx`: โลโก้โมดัลแสดงภาพ `/icon.jpg`
    - `src/app/auth/login/page.tsx`: โลโก้หน้า Login หลักแสดงภาพ `/icon.jpg`
    - `src/lib/productsData.ts`: เพิ่ม `logoUrl: "/icon.jpg"` ใน `STORE_INFO`




