# คู่มือการเชื่อมต่อฐานข้อมูล Supabase และระบบ API จริง
**โครงงาน**: VibeBooks PRO (Vibe Coding E-book Platform)  
**ผู้จัดทำ**: นายเกียรติภูมิ หารศรีนาถ (64332110242-2)  

---

## สรุป 5 ขั้นตอนการเชื่อมต่อ Supabase จริง

### ขั้นตอนที่ 1: สร้าง Project ใหม่บน Supabase
1. เข้าไปที่ [https://supabase.com](https://supabase.com) แล้วเข้าสู่ระบบ (Sign In with GitHub ได้)
2. กดปุ่ม **"New Project"**
3. กรอกข้อมูล:
   - **Name**: `vibebooks-platform`
   - **Database Password**: ตั้งรหัสผ่านที่ปลอดภัย (และจดจำไว้)
   - **Region**: เลือก `Singapore (ap-southeast-1)` (ใกล้ไทยที่สุดและเร็วที่สุด)
4. กด **"Create new project"** และรอระบบ Provisioning ประมาณ 1-2 นาที

---

### ขั้นตอนที่ 2: รัน SQL Schema สร้างตารางฐานข้อมูลและข้อมูลเริ่มต้น
1. ในหน้าแดชบอร์ด Supabase ไปที่เมนู **"SQL Editor"** (ไอคอน `>_` บนแถบเมนูซ้าย)
2. กดปุ่ม **"New query"**
3. คัดลอกเนื้อหาทั้งหมดจากไฟล์:
   `ebook_shop/supabase/schema.sql`
4. วางลงในช่อง Query แล้วกดปุ่ม **"Run"** (หรือกด `Ctrl + Enter`)
5. **สิ่งที่ระบบจะสร้างให้อัตโนมัติ**:
   - ตาราง `public.books`: เก็บข้อมูล E-book ทั้ง 3 เล่ม
   - ตาราง `public.orders`: เก็บข้อมูลคำสั่งซื้อและสถานะ (`PENDING`, `PAID`, `EXPIRED`)
   - กฎความปลอดภัย **Row Level Security (RLS)**
   - ข้อมูลเริ่มต้น (Seed Data) E-book ทั้ง 3 เล่มของนักศึกษา

---

### ขั้นตอนที่ 3: สร้าง Private Storage Bucket และอัปโหลดไฟล์ PDF
1. ไปที่เมนู **"Storage"** บนแถบซ้าย
2. กดปุ่ม **"New bucket"**
3. ตั้งชื่อ: `ebook-vault`
4. **จุดสำคัญ**: ตรวจสอบว่าตัวเลือก **Public bucket** ปิดอยู่ (OFF) เพื่อให้เป็นถังเก็บไฟล์ส่วนตัวที่มีความปลอดภัยสูง
5. กด **Save**
6. คลิกเข้าไปใน Bucket `ebook-vault` แล้วกด **"Upload files"**
7. เลือกไฟล์ PDF ทั้ง 3 ไฟล์ที่ระบบสร้างไว้ให้ในโฟลเดอร์:
   `ebook_shop/supabase/storage_vault_files/`
   - `Media_Player_PRO_Engineering.pdf`
   - `Mystic_Tarot_Altar_System.pdf`
   - `TaskMaster_PRO_Architecture.pdf`

---

### ขั้นตอนที่ 4: คัดลอก API Keys ใส่ในไฟล์ `.env.local`
1. ไปที่เมนู **"Project Settings"** (ไอคอนฟันเฟืองด้านล่างซ้าย) ➔ เมนู **"API"**
2. คัดลอกค่า 2 ค่า:
   - **Project URL** (เช่น `https://xyzcompany.supabase.co`)
   - **Project API Keys** ในส่วน **`anon` `public`** (ข้อความรหัสยาวๆ)
3. เปิดไฟล์ `.env.local` ในโฟลเดอร์โปรเจกต์:
   `C:\Users\Phums\.gemini\antigravity\scratch\ebook_shop\.env.local`
4. วางค่าทั้งสองลงไป ดังนี้:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
5. บันทึกไฟล์

---

### ขั้นตอนที่ 5: ทดสอบการเชื่อมต่อระบบจริง
เปิด Terminal แล้วรันคำสั่ง:
```bash
node scripts/test_supabase_connection.js
```
สคริปต์จะทดสอบ 3 ขั้นตอน:
1. อ่านข้อมูลหนังสือ 3 เล่มจากตาราง `books`
2. ทดสอบจำลองสร้างคำสั่งซื้อและอัปเดตสถานะเป็น `PAID` ในตาราง `orders`
3. ทดสอบการสร้าง **Temporary Signed URL อายุ 15 นาที (900 วินาที)** จาก Storage `ebook-vault`
