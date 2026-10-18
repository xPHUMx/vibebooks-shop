# Book Sangdai (บุ๊ค สั่งได้) 📚✨

> **Next-Generation Digital Products & E-Book Commerce Platform**  
> แพลตฟอร์มอีคอมเมิร์ซจำหน่ายสินค้าดิจิทัลและอีบุ๊ก ดีไซน์แบบ Liquid Glass สไตล์ Apple Minimalist พร้อมระบบความปลอดภัยและการจัดส่งไฟล์อัตโนมัติ

---

## 👨‍💻 ผู้พัฒนาโครงการ (Author)
* **ชื่อ-นามสกุล:** นายเกียรติภูมิ หารศรีนาถ (Kiatphum Hansrinath)

---

## 🌟 ภาพรวมโครงการ (Project Overview)

**Book Sangdai (บุ๊ค สั่งได้)** ได้รับการออกแบบและพัฒนาขึ้นเพื่อเป็นศูนย์รวมสินค้าดิจิทัลระดับมืออาชีพ รองรับทั้ง E-Books, Notion Templates, Figma UI Kits, Developer Source Code และ Design Assets โดยเน้นประสบการณ์ผู้ใช้ระดับพรีเมียม (Apple-inspired UI/UX), ความปลอดภัยของทรัพย์สินทางปัญญา, และระบบจัดการแบบ Multi-Tenant แยกสิทธิ์การทำงานอย่างสมบูรณ์

---

## ✨ ฟีเจอร์เด่นของระบบ (Key Features)

### 1. 🛍️ หน้าร้านค้าและแคตตาล็อกดิจิทัล (Digital Storefront)
* **Liquid Glass Design:** ส่วนติดต่อผู้ใช้สไตล์กระจกเงางาม สะอาดตา และทันสมัย
* **หมวดหมู่สินค้าหลากหลาย:** กรองและค้นหาสินค้าตามประเภท (E-Book, Notion, Figma, Code, Assets)
* **Product Detail & Preview:** หน้าต่างพรีวิวสินค้าแบบ Interactive พร้อมระบบตัวอย่างอ่านไฟล์ PDF ในเบราว์เซอร์
* **Sliding Cart Drawer:** ตะกร้าสินค้าแบบสไลด์ข้าง พร้อมคำนวณยอดชำระแบบเรียลไทม์

### 2. 🛡️ ความปลอดภัยและการจัดการสิทธิ์ (Authentication & RBAC)
* **Supabase SSR Authentication:** รองรับการเข้าสู่ระบบด้วย Google OAuth และ Email/Password
* **ระบบบทบาทผู้ใช้ 3 ระดับ (Role-Based Access Control):**
  * **Customer (ลูกค้า):** สั่งซื้อสินค้า, ตรวจสอบออเดอร์ของตนเอง, ดาวน์โหลดไฟล์ในคลังหนังสือ (My Library)
  * **Merchant (ร้านค้า):** จัดการสินค้าของตนเอง, ดูยอดขาย, ตรวจสอบสลิปและอนุมัติปล่อยไฟล์สำหรับสินค้าตนเอง
  * **Admin (ผู้ดูแลระบบ):** ตรวจสอบภาพรวมระบบ, อนุมัติ/ปฏิเสธการสมัครเป็นร้านค้า, จัดการผู้ใช้งาน
* **Order & Slip Isolation:** ระบบแยกการเข้าถึงคำสั่งซื้อและสลิปโอนเงินอย่างเข้มงวดตามบทบาทและความเป็นเจ้าของ ป้องกันข้อมูลรั่วไหลข้ามร้านค้า
* **Payment Auth Guard:** บังคับเข้าสู่ระบบก่อนทำการสั่งซื้อหรือแนบสลิป เพื่อป้องกันปัญหาคำสั่งซื้อที่ไม่ระบุตัวตน (Orphan Orders)

### 3. 💳 การชำระเงินด้วย PromptPay QR & ระบบตรวจสอบสลิป (Payment Gateway)
* **Dynamic PromptPay QR Code:** สร้าง QR Code พร้อมเพย์ตามยอดชำระเงินจริง พร้อมเลขอ้างอิง (PromptPay Ref)
* **Merchant Multi-PromptPay:** รองรับเบอร์พร้อมเพย์แยกตามร้านค้าแต่ละร้าน
* **Slip Upload & Review:** แนบสลิปการโอนเงินเข้าสู่ Private Storage Bucket พร้อมระบบให้ร้านค้าตรวจสอบยอดจริงในบัญชีก่อนกดอนุมัติปล่อยไฟล์
* **Real-time Status Polling:** หน้าแคชเชียร์อัปเดตสถานะอัตโนมัติเมื่อร้านค้าอนุมัติคำสั่งซื้อ พร้อมเอฟเฟกต์ Confetti ฉลองความสำเร็จ

### 4. 🔒 ตู้นิรภัยดิจิทัลและระบบป้องกันลิขสิทธิ์ (Digital Vault & Security)
* **Private Vault Storage:** ไฟล์ Master สำหรับดาวน์โหลดถูกเก็บไว้ใน Private Bucket (`digital-vault`) โดยไม่เปิดสิทธิ์ Public
* **Time-Limited Signed URLs:** ลิงก์ดาวน์โหลดมีอายุเพียง 15 นาที เพื่อป้องกันการคัดลอกลิงก์ไปแจกจ่ายภายนอก
* **Dynamic PDF Watermarking:** ฝังลายน้ำระบุชื่อและอีเมลของผู้ซื้อลงในไฟล์เอกสาร เพื่อคุ้มครองลิขสิทธิ์
* **Interactive Apple PDF Reader:** เครื่องมือเปิดอ่านหนังสือ PDF ภายในระบบ พร้อมแถบเลื่อนและโหมดเต็มจอ

### 5. 🏪 ศูนย์จัดการร้านค้า (Merchant Dashboard)
* **Product CRUD:** เพิ่ม แก้ไข และลบสินค้า
* **Delete Protection Modal:** ระบบป้องกันการลบสินค้าโดยไม่ตั้งใจ โดยผู้ใช้ต้องกรอกรหัสสินค้าเพื่อยืนยันก่อนลบ
* **Order & Revenue Management:** ตรวจสอบประวัติการขาย สลิปโอนเงิน และสถิติยอดจำหน่าย

### 6. 🌐 ระบบชุมชนและรีวิว (Community & Reviews)
* **Verified Buyer Reviews:** ระบบรีวิวและให้คะแนนที่จำกัดสิทธิ์ให้เฉพาะผู้ที่ซื้อสินค้านั้นแล้วเท่านั้นจึงจะแสดงความคิดเห็นได้
* **Minimalist White Tone:** ดีไซน์การ์ดรีวิวและคอมเมนต์แบบมินิมอล สะอาดตา

### 7. 📱 รองรับการใช้งานข้ามแพลตฟอร์ม (Cross-Platform)
* **Web:** รองรับทุกอุปกรณ์ทั้ง Desktop, Tablet และ Mobile (Responsive 100%)
* **Desktop App:** รองรับการแพ็กเกจเป็นแอปพลิเคชัน Desktop ด้วย **Electron**
* **Mobile App:** รองรับการบิลด์เป็นแอปพลิเคชัน iOS และ Android ด้วย **Capacitor**

---

## 🛠️ สถาปัตยกรรมและเทคโนโลยี (Tech Stack)

| ส่วนประกอบ | เทคโนโลยีที่ใช้ |
| :--- | :--- |
| **Frontend Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + Custom Liquid Glass Design Tokens |
| **Backend & Database** | [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Storage Buckets) |
| **Authentication** | `@supabase/ssr` (Google OAuth & Email Session Cookie) |
| **PDF Processing** | `pdf-lib` + `@pdf-lib/fontkit` (Dynamic Watermarking) |
| **Desktop Wrapper** | [Electron](https://www.electronjs.org/) + `electron-builder` |
| **Mobile Runtime** | [Capacitor](https://capacitorjs.com/) (iOS / Android) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
ebook_shop/
├── public/                 # รูปภาพ, โลโก้ และ Static Assets
├── src/
│   ├── app/                # Next.js App Router Routes
│   │   ├── admin/          # แดชบอร์ดผู้ดูแลระบบ
│   │   ├── api/            # API Route Handlers (Orders, Products, Slip, Download, etc.)
│   │   ├── auth/           # OAuth Callbacks & Login
│   │   ├── checkout/       # หน้าตะกร้าและแคชเชียร์ PromptPay
│   │   ├── community/      # หน้าคอมมูนิตี้และรีวิวสินค้า
│   │   ├── library/        # หน้ารวมไฟล์ดิจิทัลที่ซื้อ (My Library)
│   │   ├── merchant/       # แดชบอร์ดร้านค้าและคู่ค้า
│   │   ├── payment/        # หน้าสแกน QR และแนบสลิป
│   │   ├── products/       # หน้ารายละเอียดสินค้าแต่ละรายการ
│   │   ├── profile/        # ข้อมูลโปรไฟล์ผู้ใช้งานและร้านค้า
│   │   └── tracking/       # หน้าติดตามสถานะคำสั่งซื้อ
│   ├── components/         # UI Components (Header, CartDrawer, ProductModal, etc.)
│   ├── context/            # React Contexts (AuthContext, CartContext)
│   ├── lib/                # Database Helpers, PromptPay Generator, Supabase Clients
│   └── types/              # TypeScript Interfaces & Types
├── supabase/               # Database Schema SQL & RLS Policies
├── desktop/                # สคริปต์สำหรับ Electron Desktop App
├── package.json
└── tsconfig.json
```

---

## 🚀 การติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### 1. ความต้องการเบื้องต้น (Prerequisites)
* Node.js 18.x หรือ 20.x ขึ้นไป
* บัญชีและโปรเจกต์ [Supabase](https://supabase.com/)

### 2. โคลนคลังโค้ดและติดตั้ง Dependencies
```bash
git clone https://github.com/xPHUMx/vibebooks-shop.git
cd vibebooks-shop
npm install
```

### 3. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)
สร้างไฟล์ `.env.local` ในรูทของโปรเจกต์:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. รันระบบสำหรับโหมดพัฒนา (Development Mode)
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:3000` เพื่อดูผลลัพธ์

### 5. การทดสอบการ Build ระบบ (Production Build)
```bash
npm run build
```

---

## 🖥️ การรันบน Desktop & Mobile

* **รันบน Desktop (Electron):**
  ```bash
  npm run desktop
  ```
* **บิลด์ตัวติดตั้ง Desktop Windows (.exe):**
  ```bash
  npm run desktop:dist
  ```
* **ซิงค์โค้ดไปยัง Capacitor Mobile:**
  ```bash
  npm run cap:sync
  ```

---

## 📄 ลิขสิทธิ์ (License)
สงวนลิขสิทธิ์ พ.ศ. 2569 **Book Sangdai** โดย **นายเกียรติภูมิ หารศรีนาถ (Kiatphum Hansrinath)**
