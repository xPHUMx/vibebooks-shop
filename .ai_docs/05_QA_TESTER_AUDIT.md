# 🛡️ 05. QA / Tester Agent Document

**Role:** Quality Assurance (QA) Engineer  
**Goal:** ตรวจสอบความถูกต้องของโค้ด หา Logic Error, Security Flaws, Edge Cases และทำหน้าที่เป็น Gatekeeper ก่อนส่งมอบงาน  
**System Prompt:**
> "คุณคือ QA Engineer ที่เข้มงวด หน้าที่ของคุณคือตรวจสอบโค้ดทั้งหมดที่ Frontend และ Backend เขียนขึ้นมา ค้นหาจุดบกพร่อง (Bugs) ช่องโหว่ความปลอดภัย และสั่งให้ Developer แก้ไขให้ผ่านเกณฑ์ก่อนส่งมอบ"

---

## 1. Quality Assurance Gatekeeping Checklist

ทุกฟีเจอร์และคำสั่งจะต้องผ่านการตรวจ 5 ด่านนี้เสมอ:
- [x] **Compile & Build Test:** รัน `npx tsc --noEmit` ต้องได้ 0 errors
- [x] **Security Audit:** ไม่อนุญาตให้ bypass สิทธิ์การเข้าถึงข้อมูล หรือลบข้อมูลของผู้อื่น
- [x] **Data Integrity:** ข้อมูลใน Database และ State ต้องสอดคล้องกัน (เช่น การลบ item ออกจากออเดอร์)
- [x] **Responsive & UX Test:** รองรับทั้ง Mobile View และ Desktop จอใหญ่ ไม่มีการล้นหน้าจอ (No horizontal overflow)
- [x] **Documentation Sync:** เอกสารใน `.ai_docs/*.md` ต้องได้รับการอัปเดตตรงกับโค้ดจริง 100%

---

## 2. Test Cases & Verification Results

### Test Suite 1: Authentication & OTP Gate
| ID | คำอธิบายการทดสอบ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง |
|:---|:---|:---|:---:|
| **TC-AUTH-01** | พยายามเข้าสู่ระบบ (Sign-in) ด้วยอีเมลที่ไม่มีในฐานข้อมูล | ระบบปฏิเสธ ไม่ส่ง OTP และตอบกลับ Error `ไม่มีเมลนี้ในระบบ กรุณาสมัครสมาชิกก่อน` | ✅ PASS |
| **TC-AUTH-02** | พยายามสมัครสมาชิก (Sign-up) ด้วยอีเมลที่มีบัญชีอยู่แล้ว | ระบบปฏิเสธ แจ้งเตือน `อีเมลนี้มีบัญชีในระบบอยู่แล้ว กรุณากด "เข้าสู่ระบบ"` | ✅ PASS |
| **TC-AUTH-03** | สมัครสมาชิกครั้งแรกโดยยังไม่ได้กดยอมรับข้อตกลง | ระบบเด้งเปิด Modal ข้อตกลงให้อ่าน 100% ไม่อนุญาตให้ข้าม | ✅ PASS |
| **TC-AUTH-04** | ล็อกอินผ่าน Gmail (Google OAuth) ครั้งแรก | ระบบตรวจสอบพบว่ายังไม่มีประวัติยินยอม จึงเด้ง Modal ให้อ่าน 100% และกดยอมรับ | ✅ PASS |
| **TC-AUTH-05** | ผู้เยี่ยมชมทั่วไปเข้าชมหน้าแรกของเว็บไซต์ | ไม่มีการเด้ง Modal บังหน้าเว็บ เข้าชมได้ตามปกติ | ✅ PASS |

### Test Suite 2: Library E-book Deletion & Danger Zone
| ID | คำอธิบายการทดสอบ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง |
|:---|:---|:---|:---:|
| **TC-LIB-01** | กดปุ่มถังขยะสีแดงที่การ์ด E-book ในคลัง | เปิด Modal Danger Zone แสดงรหัส Catalog เป็นตัวหนังสือสีแดงหนาชัดเจน | ✅ PASS |
| **TC-LIB-02** | พิมพ์รหัส Catalog ไม่ตรง หรือเว้นว่าง | ปุ่ม "ลบออกจากคลังถาวร" ถูก Disabled และขึ้นข้อความสีแดงเตือน | ✅ PASS |
| **TC-LIB-03** | พิมพ์รหัส Catalog ตรงกัน 100% แล้วกดยืนยัน | ส่ง `DELETE` สำเร็จ รายการ E-book หายไปจากหน้าจอทันทีโดยไม่ต้องรีเฟรช | ✅ PASS |
| **TC-LIB-04** | พยายามส่งคำขอลบออเดอร์ของบุคคลอื่นโดยไม่มีสิทธิ์ | Backend ปฏิเสธด้วย Error 403 Forbidden | ✅ PASS |

---

## 3. Bug Tracker & Resolution Log

- **BUG-01 (Fixed):** `ReferenceError: Cannot access 'resetAll' before initialization` ใน `AuthModal.tsx` -> **Resolution:** ย้ายฟังก์ชัน `resetAll` ขึ้นก่อน `useEffect`
- **BUG-02 (Fixed):** หน้าแรกเด้งบังผู้เยี่ยมชม -> **Resolution:** ให้ `FirstTimeConsentModal` ทำงานเฉพาะเมื่อ `user` ล็อกอินแล้วเท่านั้น และปิดตัวเมื่อเป็น Guest
- **BUG-03 (Fixed):** ผู้ใช้ที่ยังไม่ได้ลงทะเบียนสามารถข้ามไปขอ OTP ในหน้าล็อกอินได้ -> **Resolution:** เพิ่มการตรวจสอบ `userExists` ใน `send-otp` และ `verify-otp` บังคับให้ต้องสมัครสมาชิกก่อน
- **BUG-04 (Fixed):** เข้าสู่ระบบครั้งแรกหรือสมัครสมาชิกครั้งแรกไม่ขึ้นข้อตกลงให้อ่าน เนื่องจากติดคีย์ตกค้างใน localStorage (`booksangdai_consent_accepted`) -> **Resolution:**
  1. ปรับ `FirstTimeConsentModal` ให้ใช้ฐานข้อมูล Supabase (`profile?.termsAcceptedAt`) เป็น Single Source of Truth เท่านั้น ไม่ใช้ localStorage ในการ bypass
  2. ปรับ `AuthModal` ตอนสมัครสมาชิก ให้เปิด `ConsentReaderModal` ให้อ่าน 100% เสมอ และเพิ่มลิงก์ข้อตกลงให้อ่านได้ทันทีก่อนกดปุ่ม
  3. แยก `ConsentReaderModal` ออกมาอยู่นอก card container ด้วย React Fragment เพื่อไม่ให้ถูก z-index ของโมดอลหลักจำกัดขอบเขต
  4. เพิ่ม fallback การปลดล็อกใน `handleScrollToBottom` ให้ถึง 100% อย่างแม่นยำทุกเบราว์เซอร์
- **BUG-05 (Fixed):** ตอน login แบบ Gmail ข้อตกลงเด้งขึ้นมาซ้ำๆ หลายๆ รอบถึงจะหาย (Race condition ระหว่าง background profile sync กับ consent check) -> **Resolution:**
  1. เพิ่ม Single-Flight Deduplication (`syncPromiseRef`) ใน `AuthContext` ป้องกันไม่ให้ `getSession`, `onAuthStateChange`, และ `code exchange` ยิงคำขอเชื่อมต่อฐานข้อมูลซ้ำซ้อนพร้อมกัน
  2. เพิ่มสถานะ `isProfileSyncing` ควบคุมวงจรชีวิตของ API เพื่อให้ทราบแน่ชัดว่าฐานข้อมูลเชื่อมต่อและดึงข้อมูลเสร็จสิ้นแล้วหรือไม่
  3. ปรับ `FirstTimeConsentModal` ให้รอจนกระทั่ง `!isLoading && !isProfileSyncing && profile !== null` ทำให้ระบบรอ API ทำงานเชื่อมกับ Database เสร็จและ Callback กลับมาก่อน 100% ค่อยตรวจสอบเงื่อนไข
  4. เพิ่มการล็อกสถานะในเซสชัน (`hasDismissedInSession: true`) และ `termsAcceptedRef` ทันทีที่ผู้ใช้กดยอมรับ เพื่อปิดหน้าต่างทันทีและป้องกันไม่ให้ background fetch ตัวอื่นเขียนทับค่าสถานะกลับเป็น null
- **BUG-06 (Fixed):** รูปภาพร้านค้าไม่ขึ้นตอนอัปโหลด -> **Resolution:**
  1. เพิ่ม `updates.store_logo_url = storeLogoUrl` ใน `src/app/api/profile/route.ts` และ `merchant/apply/route.ts` ให้บันทึกลงฟิลด์ `store_logo_url` ใน `public.profiles` จริง
  2. เพิ่ม Instant Blob Preview (`URL.createObjectURL(file)`) ใน `merchant/page.tsx` และ `profile/page.tsx` แสดงรูปทันทีที่ผู้ใช้เลือกไฟล์ ไม่ต้องรอ network response
  3. เพิ่มระบบ Auto-Save ทันทีที่อัปโหลดสำเร็จผ่าน `updateProfile({ storeLogoUrl: data.url })` ทำให้รูปไม่หายแม้ผู้ใช้ไม่กดปุ่มบันทึกฟอร์ม
  4. เพิ่ม `onError` fallback ป้องกันไอคอนรูปภาพแตก
- **BUG-07 (Fixed):** `Rendered more hooks than during the previous render` ในหน้า merchant และ admin -> **Resolution:** ย้าย React hooks (`useMemo`) ทั้งหมดขึ้นมาอยู่ก่อนเงื่อนไข early return (`!isMerchantOrAdmin` และ `!profile || role !== 'admin'`) ให้เป็นไปตาม React Rules of Hooks 100%

---

### Test Suite 3: Merchant & Admin Report Centers
| ID | คำอธิบายการทดสอบ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง |
|:---|:---|:---|:---:|
| **TC-REP-01** | เปิดแท็บ "ศูนย์รายงาน & สถิติ" ใน Merchant Dashboard | แสดง 6 KPI Cards, กราฟ Funnel อัตราส่วนชำระเงิน, อันดับสินค้าขายดี (Gold/Silver/Bronze) ถูกต้อง | ✅ PASS |
| **TC-REP-02** | กรองช่วงเวลา (ทั้งหมด / 30 วัน / 7 วัน / วันนี้) | ข้อมูลคำนวณใหม่ตามช่วงเวลาทันที สถิติเปลี่ยนแบบ Reactive | ✅ PASS |
| **TC-REP-03** | กด "ส่งออก CSV" ในหน้าร้านค้า | ดาวน์โหลดไฟล์ UTF-8 BOM CSV ข้อมูลออเดอร์เปิดใน Microsoft Excel ภาษาไทยไม่เพี้ยน | ✅ PASS |
| **TC-REP-04** | เปิดแท็บ "ศูนย์รายงานระบบ" ใน Admin Dashboard | แสดง Platform GMV, Store Performance Matrix เปรียบเทียบทุกร้านในระบบ | ✅ PASS |
| **TC-REP-05** | กด "พิมพ์รายงาน" (Print) | เรียก `window.print()` เปิด Print Dialog พร้อมสไตล์จัดหน้าเอกสารที่สะอาดตา | ✅ PASS |

### Test Suite 4: Store Image Upload & Instant Preview
| ID | คำอธิบายการทดสอบ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง |
|:---|:---|:---|:---:|
| **TC-IMG-01** | เลือกไฟล์รูปภาพโลโก้ร้านค้า (.png/.jpg) | รูปแสดงผลทันทีแบบ Real-time โดยใช้ Blob Object URL ภายใน 10ms | ✅ PASS |
| **TC-IMG-02** | รูปอัปโหลดเสร็จสิ้นไปยัง Supabase Storage | ระบบบันทึกลง Database ทันที (Auto-persist) เมื่อรีเฟรชหน้ารูปยังคงอยู่ | ✅ PASS |
| **TC-IMG-03** | รูปภาพ URL ปลายทางเสียหายหรือโหลดไม่สำเร็จ | แสดงไอคอน Fallback Storefront แทนรูปภาพแตก | ✅ PASS |

### Test Suite 5: Checkout QR Warning Banner & BeforeUnload
| ID | คำอธิบายการทดสอบ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง |
|:---|:---|:---|:---:|
| **TC-CHK-01** | เข้าหน้าชำระเงิน `/payment/[orderId]` ขณะสถานะ PENDING | แสดงแบนเนอร์สีแดงเด่นชัด `⚠️ คำเตือนสำคัญ: ห้ามปิดหน้านี้เด็ดขาด!` ทั้งบนและล่าง QR | ✅ PASS |
| **TC-CHK-02** | ผู้ใช้พยายามกดย้อนกลับ, ปิดแท็บ, หรือรีเฟรชขณะยังไม่แนบสลิป | เบราว์เซอร์แสดงแจ้งเตือน BeforeUnload Warning ป้องกันการปิดหน้าโดยไม่ได้ตั้งใจ | ✅ PASS |
| **TC-CHK-03** | ผู้ใช้แนบสลิปชำระเงินและกดยืนยันสำเร็จ | คำเตือน BeforeUnload ปลดล็อก อนุญาตให้เปลี่ยนหน้าได้อย่างราบรื่น | ✅ PASS |

### Test Suite 6: Removal of Storefront Sample Reader
| ID | คำอธิบายการทดสอบ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง |
|:---|:---|:---|:---:|
| **TC-READ-01** | คลิกดูรายละเอียดสินค้าในหน้าแรกของร้านค้า | Modal สินค้าแสดงเฉพาะปุ่ม "ใส่ตะกร้า" และ "สั่งซื้อทันที" ไม่มีปุ่ม "เปิดอ่านตัวอย่าง" | ✅ PASS |
| **TC-READ-02** | ตรวจสอบการทำงานของ In-Browser PDF Reader | ใช้งานได้สมบูรณ์เฉพาะในหน้า `/library` และ `/order/[id]` สำหรับผู้ที่สั่งซื้อจริงเท่านั้น | ✅ PASS |

### Test Suite 7: Customer Vault Deletion Retention (Report Center Integrity)
| ID | คำอธิบายการทดสอบ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง |
|:---|:---|:---|:---:|
| **TC-VAULT-01** | ลูกค้าลบ E-book ออกจากคลังใน `/library` ด้วยรหัส Catalog | รายการ E-book หายไปจากหน้าคลังของลูกค้าทันที (`is_hidden_by_customer = true`) | ✅ PASS |
| **TC-VAULT-02** | ตรวจสอบยอดขายใน Merchant / Admin Report Center หลังลูกค้าลบคลัง | ยอดขายรวม (Gross Revenue) และประวัติคำสั่งซื้อของร้านค้ายังคงอยู่ครบถ้วน 100% ไม่สูญหาย | ✅ PASS |

### Test Suite 8: Merchant Transaction Deletion with Security Code Gate
| ID | คำอธิบายการทดสอบ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง |
|:---|:---|:---|:---:|
| **TC-MDEL-01** | ร้านค้ากดปุ่มถังขยะสีแดงที่รายการคำสั่งซื้อใน Orders Tab หรือ Reports Tab | เปิด Modal `DeleteOrderModal` แสดงยอดเงิน ชื่อลูกค้า และรหัสยืนยัน Order ID สีแดงหนา | ✅ PASS |
| **TC-MDEL-02** | กรอกรหัส Order ID ไม่ตรง หรือยังไม่กรอก | ปุ่ม "ยืนยันการลบธุรกรรม" ถูก Disabled และขึ้นข้อความสีแดงเตือน | ✅ PASS |
| **TC-MDEL-03** | กรอกรหัส Order ID ตรงกัน 100% แล้วกดยืนยัน | ส่ง `DELETE /api/orders` พร้อม `isMerchantDelete: true` สำเร็จ ยอดธุรกรรมถูกปรับลดออกจาก Dashboard และ Report Center ทันที | ✅ PASS |

### Test Suite 9: Category Selector Icons & Discount Percentage Badges
| ID | คำอธิบายการทดสอบ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง |
|:---|:---|:---|:---:|
| **TC-CAT-01** | ตรวจสอบปุ่มตัวกรองหมวดหมู่ทั้งหมดในหน้าแรก | แสดงไอคอน Material Symbols ตรงตามหมวดหมู่ (เช่น `apps`, `menu_book`, `palette`, `terminal`) ในทุกๆ แคปซูล | ✅ PASS |
| **TC-CAT-02** | คลิกสลับเลือกหมวดหมู่ | ไอคอนและตัวหนังสือเปลี่ยนเป็นสีขาวขยายขนาด (`scale-110`) และกรองสินค้าถูกต้อง | ✅ PASS |
| **TC-CAT-03** | สินค้าที่มี `originalPrice > price` (เช่น Liquid Glass UI Kit: 790 -> 390) | แสดงป้าย `-51%` ที่มุมบนซ้ายของการ์ดสินค้า พร้อมขีดฆ่าราคาเดิม สะอาดตา ไม่มีป้ายซ้ำซ้อน | ✅ PASS |
| **TC-CAT-04** | สินค้าที่ราคาปกติ (`originalPrice <= price` หรือไม่ได้ลด) | ไม่แสดงป้ายลดราคา ไม่เกิดข้อผิดพลาด NaN% หรือ 0% | ✅ PASS |
| **TC-CAT-05** | หมวดหมู่ผลงานแบบแนวตั้ง (Vertical Cards) | แสดงกล่องไอคอนสี่เหลี่ยมโค้งมนขนาด 56-64px เรียงในแถวแนวนอนพร้อมชื่อด้านล่าง คล้ายภาพอ้างอิง | ✅ PASS |
| **TC-CAT-06** | ปุ่ม "ดูทั้งหมด >" ในส่วนหมวดหมู่ผลงาน | กดแล้วรีเซ็ตตัวกรองกลับเป็น 'all' และแสดงผลงานทั้งหมดอย่างถูกต้อง | ✅ PASS |
| **TC-CAT-07** | ชื่อหมวดหมู่ในหน้าหลัก Dashboard vs Dropdown ร้านค้า | ทั้ง 8 หมวดหมู่มีชื่อตรงกัน 1:1 (`E-Books & Manuals`, `Figma UI Kits`, `Notion Systems`, `Source Code & SaaS`, `3D & Visual Assets`, `Creative AI & Prompts`, `Multimedia & Audio`, `Productivity Packs`) | ✅ PASS |
| **TC-CAT-08** | เพิ่มสินค้าใหม่ในฝั่ง Merchant (`/merchant`) | ตัวเลือก `<select>` แสดงครบทั้ง 8 หมวดหมู่ และบันทึก `categoryNameTh` ได้ตรงกัน | ✅ PASS |
| **TC-CAT-09** | แก้ไขสินค้าในฝั่ง Merchant (`/merchant`) | ตัวเลือก `<select>` โหลดหมวดหมู่ปัจจุบันและมีตัวเลือกครบ 8 หมวดหมู่ตรงกับ Dashboard | ✅ PASS |
| **TC-CAT-10** | เพิ่มสินค้าในฝั่ง Admin (`/admin`) | Dropdown หมวดหมู่ดึงจาก `CATEGORIES` ทั้ง 8 หมวดหมู่ตรงกันทุกประการ | ✅ PASS |
| **TC-ICON-01** | ตรวจสอบไฟล์ Asset ในโปรเจกต์ | พบ `public/icon.png`, `public/apple-touch-icon.png`, `public/favicon.ico`, `public/icon-192.png`, `public/icon-512.png` ครบทุกฟอร์แมต | ✅ PASS |
| **TC-ICON-02** | ตรวจสอบ Favicon / Browser Tab Icon | Next.js Metadata `icons` และ `<link>` ใน Header ให้บริการ `/favicon.ico` และ `/icon.png` 200 OK | ✅ PASS |
| **TC-ICON-03** | ตรวจสอบ Header Brand Logo | แถบ Header แสดงภาพไอคอนร้านค้าขนาด 36x36px ขอบมนสวยงาม | ✅ PASS |
| **TC-ICON-04** | ตรวจสอบ Modal & Login Page Brand Logo | Auth Modal, Consent Modal, และ `/auth/login` แสดงโลโก้ใหม่ตรงกันทั้งหมด | ✅ PASS |
| **TC-ICON-05** | Vercel Deployment & PWA Compatibility | ไอคอนทุกขนาดให้บริการผ่าน static server ไม่พึ่งพา sharp dynamic metadata เพื่อการ Deploy บน Vercel ได้ราบรื่น 100% | ✅ PASS |
| **TC-OTP-01** | ตรวจสอบอีเมล OTP ใน Gmail | แสดง Brand Icon Production แทนหนังสือ และตัวเลข 6 หลักแบบ Minimalist Tiles พร้อมป้ายกำกับหมดอายุ 2 นาที | ✅ PASS |
| **TC-OTP-02** | ตรวจสอบอายุรหัส OTP Backend | กำหนด `expires_at` เท่ากับ 2 นาที (120 วินาที) หลังสร้าง | ✅ PASS |
| **TC-AUTH-03** | ช่อง "จดจำฉันไว้ในระบบ" (Remember Me) | ปรากฏในทั้ง AuthModal และ `/auth/login` จำอีเมลลง `localStorage` และ Auto-fill ครั้งต่อไปได้อย่างถูกต้อง | ✅ PASS |

### Test Suite 10: Legacy VibeBooks & MIT App Inventor Cleanup Audit
| ID | คำอธิบายการทดสอบ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง |
|:---|:---|:---|:---:|
| **TC-CLN-01** | ตรวจสอบโฟลเดอร์ `mit_app_inventor/` | โฟลเดอร์และไฟล์ทั้งหมดถูกลบออกจากโปรเจกต์ 100% | ✅ PASS |
| **TC-CLN-02** | ตรวจสอบไฟล์ `.aia`, `.docx` และ mockups `design_stitch/` | ไฟล์และโฟลเดอร์เหล่านี้ถูกลบออกจาก repository 100% | ✅ PASS |
| **TC-CLN-03** | ค้นหาคำว่า `vibebook` ในโค้ดทั้งหมด (ยกเว้น Git Remote URL) | ไม่พบการใช้งานชื่อแบรนด์เก่า หรือ fallback key ในโค้ด | ✅ PASS |
| **TC-CLN-04** | ค้นหา `AppInventor` และ `mit_app` ในซอร์สโค้ดและคอมเมนต์ | ไม่พบโค้ดหรือคอมเมนต์ที่ตกค้างใน Client/Server routes | ✅ PASS |
| **TC-CLN-05** | ทดสอบ TypeScript Compilation (`npx tsc --noEmit`) | ผ่านสมบูรณ์ 0 errors | ✅ PASS |

### Test Suite 11: System Architecture & UML Diagrams Audit
| ID | คำอธิบายการทดสอบ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง |
|:---|:---|:---|:---:|
| **TC-DIA-01** | ตรวจสอบไฟล์ `docs/SYSTEM_DIAGRAMS.md` | มีแผนภาพครบทั้ง 6 หมวดหมู่ (Use Case, Activity, ER, Sequence, Class, Site Map) | ✅ PASS |
| **TC-DIA-02** | ตรวจสอบไวยากรณ์ Mermaid Markdown | ไวยากรณ์ถูกต้อง ไม่มีการใช้เครื่องหมายวงเล็บผิดรูปแบบ เรนเดอร์ได้สมบูรณ์ | ✅ PASS |
| **TC-DIA-03** | ตรวจสอบความถูกต้องของ Entity และ Database Schema | ฟิลด์ใน ER Diagram ตรงกับ PostgreSQL Schema ใน `04_BACKEND_DATABASE_SQL.md` 100% | ✅ PASS |
| **TC-DIA-04** | ตรวจสอบลำดับ Flow ใน Sequence Diagram | สะท้อนกระบวนการสั่งซื้อ, ชำระเงิน, ตรวจสลิป, และปลดล็อกคลังจริงของระบบ | ✅ PASS |
| **TC-DIA-05** | ตรวจสอบ Site Map & UI Flow | แสดงเส้นทาง Route ทุกหน้าตั้งแต่หน้าแรกไปจนถึง Merchant & Admin Portal | ✅ PASS |

### Test Suite 12: Mobile (Capacitor) & Desktop (Electron) Multi-Platform Audit
| ID | คำอธิบายการทดสอบ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง |
|:---|:---|:---|:---:|
| **TC-MOB-01** | ตรวจสอบการติดตั้ง Capacitor Core & CLI | ติดตั้ง `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios` ครบถ้วน | ✅ PASS |
| **TC-MOB-02** | ตรวจสอบไฟล์ `capacitor.config.ts` | กำหนด `appId: store.booksangdai.app`, `server.url: https://booksangdai.vercel.app` ถูกต้อง | ✅ PASS |
| **TC-DSK-01** | ตรวจสอบการติดตั้ง Electron | ติดตั้ง `electron` และมีไฟล์ entry point `desktop/main.js` พร้อม preload | ✅ PASS |
| **TC-DSK-02** | ตรวจสอบการจัดการความปลอดภัย Electron | เปิดใช้ `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false` | ✅ PASS |
| **TC-DSK-03** | ตรวจสอบสคริปต์ใน `package.json` | มีคำสั่ง `npm run desktop`, `npm run cap:sync`, `npm run cap:open:android` ใช้งานได้ | ✅ PASS |
| **TC-DSK-04** | คอมไพล์ตัวติดตั้ง Windows Installer (`npm run desktop:dist`) | สร้างไฟล์ `dist-desktop/Book Sangdai Setup 2.0.0.exe` (184 MB) สมบูรณ์ | ✅ PASS |
| **TC-DSK-05** | คอมไพล์โปรแกรมแบบ Portable EXE (`npm run desktop:dist`) | สร้างไฟล์ `dist-desktop/Book Sangdai 2.0.0.exe` (184 MB) ดับเบิลคลิกเปิดได้ทันที | ✅ PASS |
| **TC-DOC-01** | ตรวจสอบคู่มือ `docs/MOBILE_AND_DESKTOP_GUIDE.md` | มีคำแนะนำการติดตั้ง, รัน, และ build APK/.exe ละเอียดครบถ้วน | ✅ PASS |










