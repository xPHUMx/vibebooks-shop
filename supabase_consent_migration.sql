-- ==============================================================
-- Book Sangdai: เพิ่มคอลัมน์บันทึกการยอมรับข้อตกลงและนโยบาย (Consent Audit Trail)
-- รันคำสั่งนี้ใน Supabase SQL Editor
-- ==============================================================

-- 1. เพิ่มคอลัมน์เก็บวันเวลาที่ยอมรับข้อตกลงและเงื่อนไข (Terms of Service / EULA)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- 2. เพิ่มคอลัมน์เก็บวันเวลาที่ยินยอมตามนโยบายความเป็นส่วนตัว (Privacy Policy / PDPA)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;

-- 3. เพิ่มคอมเมนต์อธิบายคอลัมน์เพื่อความชัดเจน
COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'วันเวลาที่ผู้ใช้กดยอมรับ Terms and Conditions / EULA';
COMMENT ON COLUMN public.profiles.privacy_accepted_at IS 'วันเวลาที่ผู้ใช้กดยินยอมตาม Privacy Policy (PDPA)';
