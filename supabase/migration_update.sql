-- ==============================================================================
-- BOOK SANGDAI (บุ๊ค สั่งได้) - INCREMENTAL SQL MIGRATION SCRIPT
-- รวมคำสั่งอัปเดตระบบ: พ่อค้า (Merchant Approval), คอมมูนิตี้ (Comments), สินค้า และสลิปโอนเงิน
-- ให้คัดลอกคำสั่งทั้งหมดนี้ไปวางใน Supabase Dashboard -> SQL Editor แล้วกด "Run"
-- ==============================================================================

-- 1. อัปเดตตาราง PROFILES สำหรับระบบสมัครพ่อค้า และ Role ใหม่
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'merchant', 'admin'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS merchant_status TEXT NOT NULL DEFAULT 'NONE' CHECK (merchant_status IN ('NONE', 'PENDING', 'APPROVED', 'REJECTED'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS merchant_applied_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_description TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS promptpay_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_logo_url TEXT;

-- 2. อัปเดตตาราง PRODUCTS ให้รองรับข้อมูลร้านค้าผู้จัดจำหน่าย และภาพตัวอย่าง
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS merchant_name TEXT DEFAULT 'Book Sangdai Official';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS merchant_promptpay TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS preview_images TEXT[];

-- 3. อัปเดตตาราง ORDERS สำหรับสลิปโอนเงินและร้านค้า
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS merchant_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS merchant_promptpay TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS slip_url TEXT;

-- 4. สร้างตาราง COMMENTS สำหรับระบบคอมมูนิตี้และความคิดเห็นจริง
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY DEFAULT ('cmt-' || gen_random_uuid()),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'สมาชิกคอมมูนิตี้',
    book_id TEXT DEFAULT 'all',
    book_title TEXT DEFAULT 'ทั่วไป (General Discussion)',
    rating INT DEFAULT 5,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- เปิดใช้งาน RLS สำหรับตาราง COMMENTS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read comments" ON public.comments;
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert comments" ON public.comments;
CREATE POLICY "Public insert comments" ON public.comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update comments" ON public.comments;
CREATE POLICY "Public update comments" ON public.comments FOR UPDATE USING (true);

-- 5. อัปเดต Trigger ซิงค์ข้อมูลเมื่อมีผู้ใช้ใหม่สมัครสมาชิกผ่าน Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
        'user'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. เพิ่มสิทธิ์ (RLS Policies) สำหรับตาราง ORDERS ในการสร้าง อัปเดตสลิป และอนุมัติสถานะ
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public select orders" ON public.orders;
CREATE POLICY "Public select orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public update orders" ON public.orders;
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true);

-- 7. เพิ่มสิทธิ์ (RLS Policies) สำหรับตาราง ORDER_ITEMS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select order_items" ON public.order_items;
CREATE POLICY "Public select order_items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert order_items" ON public.order_items;
CREATE POLICY "Public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- สิ้นสุดคำสั่ง Migration (สามารถรันซ้ำได้โดยไม่ทำให้ข้อมูลเดิมสูญหาย)
-- ==============================================================================
