-- ==============================================================================
-- BOOK SANGDAI (บุ๊คสร้างได้) - SUPABASE SQL EDITOR UPDATE SCRIPT
-- รวมคำสั่งอัปเดตฐานข้อมูลล่าสุดทั้งหมด สามารถคัดลอกไปรันใน SQL Editor ได้ทันที
-- ==============================================================================

-- 1. เปิดใช้งาน Extensions ที่จำเป็น
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ตาราง profiles: เพิ่มคอลัมน์บันทึกการยอมรับข้อตกลงและนโยบายความเป็นส่วนตัว และโลโก้ร้านค้า
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS merchant_status TEXT DEFAULT 'NONE',
ADD COLUMN IF NOT EXISTS merchant_applied_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS store_logo_url TEXT;

COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'วันเวลาที่ผู้ใช้กดยอมรับ Terms and Conditions / EULA';
COMMENT ON COLUMN public.profiles.privacy_accepted_at IS 'วันเวลาที่ผู้ใช้กดยินยอมตาม Privacy Policy (PDPA)';
COMMENT ON COLUMN public.profiles.store_logo_url IS 'URL ตราสัญลักษณ์หรือโลโก้ร้านค้า (Store Logo)';

-- 3. ตาราง email_otps: สำหรับระบบยืนยันตัวตน OTP ทาง Gmail
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

CREATE INDEX IF NOT EXISTS idx_email_otps_lookup 
ON public.email_otps (email, otp_code, used_at, expires_at);

-- 4. ตาราง orders & order_items: สำหรับระบบคลังหนังสือดิจิทัลและการสั่งซื้อ
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
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

-- 5. กำหนด Row Level Security (RLS) เพื่อความปลอดภัย
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

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

-- ==============================================================================
-- อัปเดตเสร็จสมบูรณ์!
-- ==============================================================================
