-- ==============================================================================
-- BOOK SANGDAI (บุ๊คสั่งได้) - SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Author: นายเกียรติภูมิ หารศรีนาถ (64332110242-2)
-- Architecture: Next.js 14 SSR + Supabase Auth + Private Storage Vaults + RLS
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Profiles Table (Synced with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'merchant', 'admin')),
    merchant_status TEXT NOT NULL DEFAULT 'NONE' CHECK (merchant_status IN ('NONE', 'PENDING', 'APPROVED', 'REJECTED')),
    merchant_applied_at TIMESTAMPTZ,
    store_name TEXT,
    store_description TEXT,
    promptpay_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist for upgraded migrations
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS merchant_status TEXT DEFAULT 'NONE';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS merchant_applied_at TIMESTAMPTZ;


-- Trigger auto sync user from auth.users to public.profiles
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
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Product Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY, -- 'ebook', 'figma', 'notion', 'code', 'assets'
    name TEXT NOT NULL,
    name_th TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products Table (Digital Products & Engineering E-books)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 5.0,
    rating_count INT DEFAULT 0,
    description TEXT NOT NULL,
    highlights JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '{}'::jsonb,
    file_name TEXT NOT NULL,
    file_size TEXT NOT NULL,
    file_format TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    badge TEXT,
    is_featured BOOLEAN DEFAULT false,
    curator TEXT NOT NULL DEFAULT 'นายเกียรติภูมิ หารศรีนาถ',
    merchant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    merchant_name TEXT,
    merchant_promptpay TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. 'ORD-2026-8821'
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    merchant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'REFUNDED')),
    promptpay_ref TEXT,
    slip_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    -- Backwards compatibility fields for single book checkout
    book_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    book_title TEXT,
    book_price DECIMAL(10, 2),
    file_name TEXT
);

-- 6. Order Items Table (Supports Multi-item Cart Checkout)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Community Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY DEFAULT ('cmt-' || gen_random_uuid()),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    book_id TEXT DEFAULT 'all',
    book_title TEXT DEFAULT 'General Discussion',
    rating INT DEFAULT 5,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Compatibility View for Legacy Books Table Queries
CREATE OR REPLACE VIEW public.books AS
SELECT 
    id,
    title,
    subtitle,
    COALESCE(specs->>'release', 'Lab Series') AS series,
    COALESCE((specs->>'pages')::int, 100) AS lab_number,
    category_id AS category,
    price,
    original_price,
    rating,
    rating_count,
    description,
    file_name,
    file_size,
    cover_image,
    curator,
    created_at
FROM public.products;

-- 9. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- 9. RLS Policies
-- Profiles:
CREATE POLICY "Public read user profiles"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Categories: Public read-only
CREATE POLICY "Public read categories"
    ON public.categories FOR SELECT
    USING (true);

-- Products: Public read-only
CREATE POLICY "Public read products"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Admin manage products"
    ON public.products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Merchants insert own products"
    ON public.products FOR INSERT
    WITH CHECK (
        auth.uid() = merchant_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Merchants update own products"
    ON public.products FOR UPDATE
    USING (
        auth.uid() = merchant_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Merchants delete own products"
    ON public.products FOR DELETE
    USING (
        auth.uid() = merchant_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Orders:
CREATE POLICY "Public insert orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users read own orders"
    ON public.orders FOR SELECT
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('merchant', 'admin')
        )
    );

CREATE POLICY "Merchants read own store orders"
    ON public.orders FOR SELECT
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('merchant', 'admin')
        )
    );

CREATE POLICY "Merchants and Admin update orders"
    ON public.orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('merchant', 'admin')
        )
    );

-- Order Items:
CREATE POLICY "Public insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users read order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (
                o.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.role IN ('merchant', 'admin')
                )
            )
        )
    );

-- 10. Seed Categories Data
INSERT INTO public.categories (id, name, name_th, description, sort_order) VALUES
('ebook', 'E-Books & Manuals', 'อีบุ๊ค & คู่มือวิศวกรรม', 'คู่มือสถาปัตยกรรมระบบและแล็บวิศวกรรมคอมพิวเตอร์', 1),
('figma', 'Figma UI Kits', 'ดีไซน์ซิสเต็ม & Figma', 'ชุดคอมโพเนนต์และระบบการออกแบบ Liquid Glass คุณภาพสูง', 2),
('notion', 'Notion Systems', 'เทมเพลต Notion OS', 'เทมเพลตระบบปฏิบัติการสำหรับดิจิทัลครีเอเตอร์และสตูดิโอ', 3),
('code', 'Source Code & SaaS', 'ซอร์สโค้ด & สตาร์ทอัพ', 'โปรเจกต์ Next.js, Supabase, Tailwind ที่พร้อมใช้งานทันที', 4),
('assets', '3D & Visual Assets', 'กราฟิก 3D & แอสเสท', 'โมเดล 3D และวัตถุแก้วโปร่งแสงความละเอียดสูงระดับ 4K', 5)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_th = EXCLUDED.name_th;

-- 11. Trigger for New User Auth Profile Creation
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
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 12. Storage Vault Setup Instructions:
-- A. Create a private bucket named 'digital-vault' or 'ebook-vault' in Supabase Dashboard.
-- B. Ensure bucket public is FALSE (private download only).
-- C. Download requests are securely signed via Supabase Admin Client:
--    supabase.storage.from('digital-vault').createSignedUrl(fileName, 900)
--    which generates a 15-minute expiring link only for verified orders.
-- ==============================================================================
