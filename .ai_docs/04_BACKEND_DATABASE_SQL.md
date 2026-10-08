# 🗄️ 04. Backend Developer & Database SQL Document

**Role:** Backend Developer  
**Goal:** ออกแบบ Database Schema, API Endpoints, ระบบ Authentication, จัดการความปลอดภัย และ **เตรียมคำสั่ง SQL สำหรับรันใน Supabase SQL Editor ทุกครั้งที่มีการเปลี่ยนแปลง**  
**System Prompt:**
> "คุณคือ Backend Developer ผู้เชี่ยวชาญด้าน Node.js, Python/FastAPI หรือ SQL/NoSQL Database หน้าที่ของคุณคือออกแบบโครงสร้างฐานข้อมูล เขียน API สำหรับรองรับการทำงานของ Frontend และคำนึงถึงความปลอดภัย (Security) เช่น การเข้ารหัสและการจัดการสิทธิ์ผู้ใช้"

---

## ⚡ คำสั่ง SQL UPDATE สำหรับรันใน Supabase SQL Editor (อัปเดตล่าสุด)
> คัดลอกบล็อกคำสั่ง SQL ด้านล่างนี้ไปรันใน **Supabase SQL Editor** ได้ทันที เพื่ออัปเกรดฐานข้อมูลให้รองรับระบบ Multi-Agent, ตาราง OTP, และฟิลด์บันทึกการยินยอม (Consent Audit Trail):

```sql
-- ==============================================================================
-- BOOK SANGDAI - SUPABASE SQL EDITOR UPDATE SCRIPT
-- Version: 2026.10 (Consent Trail + OTP Engine + Vault Deletion)
-- ==============================================================================

-- 1. เปิด Extensions ที่จำเป็น
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. อัปเดตตาราง profiles: เพิ่มคอลัมน์บันทึกข้อตกลงและนโยบาย (Consent Audit Trail)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS merchant_status TEXT DEFAULT 'NONE',
ADD COLUMN IF NOT EXISTS merchant_applied_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS store_logo_url TEXT;

COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'วันเวลาที่ผู้ใช้กดยอมรับ Terms and Conditions / EULA (PDPA Compliant)';
COMMENT ON COLUMN public.profiles.privacy_accepted_at IS 'วันเวลาที่ผู้ใช้กดยินยอมตาม Privacy Policy (PDPA Compliant)';
COMMENT ON COLUMN public.profiles.store_logo_url IS 'URL ตราสัญลักษณ์หรือโลโก้ร้านค้า (Store Logo)';

-- 3. สร้างตาราง email_otps สำหรับระบบยืนยันตัวตนผ่าน Gmail OTP
CREATE TABLE IF NOT EXISTS public.email_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    full_name TEXT,
    purpose VARCHAR(20) NOT NULL DEFAULT 'signin', -- 'signin' หรือ 'signup'
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index สำหรับค้นหา OTP อย่างรวดเร็ว
CREATE INDEX IF NOT EXISTS idx_email_otps_lookup 
ON public.email_otps (email, otp_code, used_at, expires_at);

-- 4. ตรวจสอบตาราง orders และ order_items สำหรับคลังดิจิทัล
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. ORD-2026-8821
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'EXPIRED')),
    promptpay_ref TEXT,
    slip_url TEXT,
    merchant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    merchant_name TEXT,
    merchant_promptpay TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    title TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_email ON public.orders (user_id, customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id, product_id);

-- 4.1 จัดการสถานะคลังลูกค้า (Vault Retention) และการลบธุรกรรมร้านค้า (Merchant Danger Zone)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS is_hidden_by_customer BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_deleted_by_merchant BOOLEAN DEFAULT FALSE;

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS is_hidden_by_customer BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.orders.is_hidden_by_customer IS 'ซ่อนรายการนี้จากคลังของลูกค้า โดยยอดขายและธุรกรรมใน Report Center ของร้านค้ายังคงอยู่ไม่สูญหาย';
COMMENT ON COLUMN public.orders.is_deleted_by_merchant IS 'ร้านค้าหรือ Admin กดยืนยันลบรายการธุรกรรม/ยอดขายนี้ออกจากระบบ';
COMMENT ON COLUMN public.order_items.is_hidden_by_customer IS 'ซ่อนไอเทมนี้จากคลังของลูกค้า';

-- 5. RLS Policies (Row Level Security)
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- นโยบายให้อ่านและลบรายการคำสั่งซื้อของตนเองได้
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders" ON public.orders
FOR SELECT USING (
    auth.uid() = user_id OR 
    customer_email = auth.jwt()->>'email'
);

DROP POLICY IF EXISTS "Users can delete own orders" ON public.orders;
CREATE POLICY "Users can delete own orders" ON public.orders
FOR DELETE USING (
    auth.uid() = user_id OR 
    customer_email = auth.jwt()->>'email'
);

DROP POLICY IF EXISTS "Users can delete own order items" ON public.order_items;
CREATE POLICY "Users can delete own order items" ON public.order_items
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR orders.customer_email = auth.jwt()->>'email')
    )
);
```

---

## 2. API Endpoints Specifications

### 2.1 Authentication & OTP Endpoints
| Endpoint | Method | คำอธิบาย & กฎความปลอดภัย |
|:---|:---:|:---|
| `/api/auth/send-otp` | `POST` | **ตรวจสอบอีเมลในฐานข้อมูล:** หากเลือก `signin` แต่อีเมลยังไม่มีใน `profiles` หรือ `auth.users` จะส่งคืน Error `404: "ไม่มีเมลนี้ในระบบ กรุณาสมัครสมาชิกก่อน"` และไม่อนุญาตให้ส่ง OTP โดยเด็ดขาด หากเลือก `signup` แต่อีเมลมีอยู่แล้ว จะส่งคืน Error `400: "อีเมลนี้มีบัญชีในระบบอยู่แล้ว กรุณากด 'เข้าสู่ระบบ'"` |
| `/api/auth/verify-otp` | `POST` | ตรวจสอบรหัส OTP 6 หลัก หากรหัสถูกต้องและ `purpose === 'signup'` จะสร้างบัญชีใหม่พร้อมบันทึก `terms_accepted_at`, `privacy_accepted_at` หากเป็น `signin` จะสร้าง Magic Session เข้าระบบ |

### 2.2 Orders & Vault Endpoints
| Endpoint | Method | คำอธิบาย |
|:---|:---:|:---|
| `/api/orders` | `GET` | ดึงรายการคำสั่งซื้อแยกตามผู้ใช้ (`email`, `userId`), ร้านค้า (`merchantId`), หรือคำสั่งซื้อเดียว รองรับการนำไปประมวลผล Report Center |
| `/api/orders` | `DELETE` | **ลบรายการ / ปรับลดธุรกรรม:**<br>1. **ลูกค้าลบออกจากคลัง:** ส่ง `orderId`, `productId` -> ระบบเรียก `hideLibraryItem` ซ่อนจากคลังของลูกค้าเท่านั้น ยอดขายและประวัติใน Report Center ของร้านค้าไม่สูญหาย<br>2. **ร้านค้าหรือ Admin ลบธุรกรรม:** ส่ง `orderId`, `isMerchantDelete: true` -> ตรวจสอบสิทธิ์ร้านค้า/Admin และเรียก `deleteOrderForMerchant` ปรับลดยอดออกจากระบบ |
| `/api/profile` | `PUT` | อัปเดตข้อมูลโปรไฟล์ผู้ใช้ รวมถึง `store_logo_url`, `termsAcceptedAt` และ `privacyAcceptedAt` ลง `public.profiles` ทันที |
| `/api/merchant/apply` | `POST` | สมัครเป็นผู้ขาย บันทึกข้อมูลร้านค้า โค้ด PromptPay และ `store_logo_url` ลงใน `public.profiles` |

---

## 3. Data Contracts & Reporting Aggregations (Report Center)

### 3.1 Merchant Report Metrics
- **Gross Revenue (THB):** $\sum (\text{order.total\_amount})$ สำหรับ orders ที่ `status === 'PAID'` ของร้านค้านั้น
- **Paid Orders Count:** จำนวนคำสั่งซื้อที่ชำระเงินสำเร็จ
- **Pending Review Count:** จำนวนคำสั่งซื้อที่รอตรวจสอบสลิป (`status === 'PENDING'`)
- **Conversion Rate (%):** $(\text{Paid Orders} / \text{Total Orders}) \times 100$
- **Average Order Value (AOV):** $\text{Gross Revenue} / \text{Paid Orders}$
- **Top Performing Products:** วิเคราะห์จาก `order_items` นับความถี่และรายได้รวม จัดอันดับ #1 Gold, #2 Silver, #3 Bronze

### 3.2 Admin Platform Matrix
- **Platform GMV:** ยอดขายรวมทุกร้านค้าในระบบ
- **Store Performance Matrix:** กรุ๊ปข้อมูลแยกรายร้าน (`storeName`, `ownerEmail`, `paidRevenue`, `orderCount`, `catalogCount`, `verificationStatus`)
- **CSV Data Export:** รองรับการแปลงอาร์เรย์ของ Order Records เป็น UTF-8 BOM CSV Format เพื่อเปิดใน Excel ได้ถูกต้องโดยภาษาไทยไม่เพี้ยน

---

## 4. Database Schema Impact Analysis (FEAT-CATALOG-04)
- **Status:** Schema Unchanged (No SQL Migration Needed)
- **Rationale:** โครงสร้างข้อมูลสินค้า (`DigitalProduct`) ในระบบมีฟิลด์ `price`, `originalPrice`, และ `category` อยู่แล้ว และข้อมูล Category Metadata ถูกจัดการเป็น Constant Structure ฝั่ง Frontend พร้อม Material Symbols Icons จึงไม่ส่งผลกระทบต่อสคริปต์ SQL เดิมใน Supabase Editor

---

## 5. Entity-Relationship (ER) & Sequence Flow Diagrams
- **ER Diagram:** โครงสร้างตารางและความสัมพันธ์ระหว่าง `profiles`, `products`, `orders`, `order_items`, `email_otps`, และ `community_comments` ได้รับการจัดทำเป็น Mermaid ER Diagram ใน [docs/SYSTEM_DIAGRAMS.md](file:///c:/Users/Phums/.gemini/antigravity/scratch/ebook_shop/docs/SYSTEM_DIAGRAMS.md#3-entity-relationship-er-diagram-แผนภาพความสัมพันธ์ข้อมูล)
- **Sequence Diagram:** ลำดับการรับส่งข้อมูลการสร้าง Order, การอัปโหลดสลิปสู่ Supabase Storage, การตรวจสอบสลิปของร้านค้า และการส่งไฟล์ดิจิทัลมาสเตอร์ ได้รับการบันทึกใน [docs/SYSTEM_DIAGRAMS.md](file:///c:/Users/Phums/.gemini/antigravity/scratch/ebook_shop/docs/SYSTEM_DIAGRAMS.md#4-sequence-diagram-แผนภาพลำดับขั้นตอนการทำงาน)


