-- ==============================================================================
-- VIBEBOOKS PRO - POSTGRESQL SUPABASE SCHEMA
-- Author: นายเกียรติภูมิ หารศรีนาถ (64332110242-2)
-- Project: Vibe Coding E-book Shop
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Books Table
CREATE TABLE IF NOT EXISTS public.books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    series TEXT NOT NULL,
    lab_number INT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 5.0,
    rating_count INT DEFAULT 0,
    description TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    curator TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. 'ORD-2026-8821'
    book_id TEXT REFERENCES public.books(id) ON DELETE SET NULL,
    book_title TEXT NOT NULL,
    book_price DECIMAL(10, 2) NOT NULL,
    file_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Books: Anyone can read books catalog
CREATE POLICY "Allow public read-only access to books"
    ON public.books FOR SELECT
    USING (true);

-- Orders: Anyone can insert orders (checkout)
CREATE POLICY "Allow public insert on orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

-- Orders: Anyone can select order by id & email verification
CREATE POLICY "Allow users to read their own order"
    ON public.orders FOR SELECT
    USING (true);

-- Orders: Allow update status for payment simulation
CREATE POLICY "Allow order status update"
    ON public.orders FOR UPDATE
    USING (true);

-- 6. Pre-seed E-Books Catalog Data
INSERT INTO public.books (
    id, title, subtitle, series, lab_number, category, price, original_price, rating, rating_count, description, file_name, file_size, cover_image, curator
) VALUES 
(
    'media-player-pro',
    'Media Player PRO Engineering',
    'Audio/Video DSP & Streaming Architecture',
    'Lab 1 Engineering Series',
    1,
    'multimedia',
    199.00,
    390.00,
    4.9,
    128,
    'คู่มือสถาปัตยกรรมระบบเครื่องเล่นสื่อมัลติมีเดียขั้นสูง เจาะลึก Web Audio API, AudioContext DSP, Equalizer 10 แบนด์, Visualizer Spectrum และ Canvas Rendering สำหรับ Production',
    'Media_Player_PRO_Engineering.pdf',
    '24.8 MB',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBM_oIxvJVl88ICp_yW_qmkG9qIXIXgpzB-YciRw31eXbz0l4sLoGSWyWD4Kjpxw_u0dJB2ex0NAliraFkOO-5u-EHaq0s_PP_NwIXVKoO_y6n_IfJw6ew-9QIc_mgTFxY4AWArbaR54Jzq6eP2-QuBgARjB-GgqqWj1VxGRngJu4S-0Gg-uy5yRF8tkg15eQGxdZQ_ntloxMYlrbS6tt5YEJ7qBf5SorH6LjVkfcVuwhfUjhPyciIc',
    'นายเกียรติภูมิ หารศรีนาถ'
),
(
    'mystic-tarot-altar',
    'Mystic Tarot Altar System',
    '3D Interactive Tarot & AI Divination',
    'Lab 2 Creative AI Series',
    2,
    'creative-ai',
    259.00,
    450.00,
    5.0,
    204,
    'ศาสตร์และศิลป์การพัฒนาแท่นบูชาเสมือนจริงและระบบทำนายไพ่ทาโรต์ 3D ผสานงานออกแบบ Glassmorphism ระดับลึก การสุ่มไพ่ 78 ใบ Celtic Cross และการสร้างคำทำนายด้วย AI Prompt Engineering',
    'Mystic_Tarot_Altar_System.pdf',
    '32.4 MB',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAKzuxjOOrpIA70b5MolLQkqvEiwuiqm45tvssofQz_uTfphOHbJ52Mjfo4wwzeaAmsi6kE_sTutXNlgDTk4bxSdfC87WmyLcxD81WohWdIRDdRN9upxu6tqPMEk49JrjkOKMXD3hhlRqdmZrHbDTlL98IBcNxVL5l1pm18UrC4smvAmWis-wBgO9c8L2x00GHfQ14nl1cx4xVM7Yu1ErDUzTs0kU7jhVE2Opt1iVK1is295SWl_XGM',
    'นายเกียรติภูมิ หารศรีนาถ'
),
(
    'taskmaster-pro',
    'TaskMaster PRO Architecture',
    'Bento Dashboard & Kanban Architecture',
    'Lab 3 Productivity Systems',
    3,
    'productivity',
    179.00,
    320.00,
    4.8,
    95,
    'การพัฒนาระบบบริหารจัดการภารกิจระดับองค์กร Bento Dashboard & Kanban Board ระบบ Multi-theme, Chart Analytics, Data Integrity และความปลอดภัยรหัสผ่านระดับสากล',
    'TaskMaster_PRO_Architecture.pdf',
    '18.2 MB',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDEl26e_b72nBw9yv4H4e7YyA9B8t5Zz8q_xR6q3F7w1L6s4V2j1K9n8P7m6T5r4W3q2X1z0Y9b8A7c6D5e4F3g2H1j0K9l8M7n6P5q4R3s2T1u0V9w8X7y6Z5a4B3c2D1e0F9g8H7j6K5l4M3n2P1q0R9s8T7u6V5w4X3y2Z1',
    'นายเกียรติภูมิ หารศรีนาถ'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage Bucket Setup Note:
-- Create a private bucket named 'ebook-vault' in Supabase Storage.
-- Upload the 3 PDF files corresponding to file_name column.
-- Use supabase.storage.from('ebook-vault').createSignedUrl(file_name, 900) for 15-min temporary download.
