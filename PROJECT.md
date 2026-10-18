# 📚 เอกสารศูนย์กลางการตรวจโครงงาน (PROJECT.md)
# โครงงาน: Book Sangdai (บุ๊ค สั่งได้) — Digital Commerce Platform

> **เรียน ท่านอาจารย์ผู้สอนและคณะกรรมการประเมินโครงงาน:**  
> ท่านสามารถตรวจประเมินโครงงานชิ้นนี้ได้โดยตรงจากเอกสาร **`PROJECT.md`** หน้านี้ โดยคลิกลิงก์เพื่อเปิดดูรายละเอียด วิดีโอ/ไดอะแกรม โค้ด และผลการทดสอบของแต่ละหัวข้อได้ทันที

---

## 👨‍💻 ข้อมูลโครงงานและผู้จัดทำ (Project Information)

* **ชื่อโครงงาน:** Book Sangdai (บุ๊ค สั่งได้) — Next-Generation Digital Products & E-Book Commerce Platform
* **ผู้พัฒนาโครงงาน:** **นายเกียรติภูมิ หารศรีนาถ (Kiatphum Hansrinath)**
* **คลังซอร์สโค้ด (GitHub Repository):** [https://github.com/xPHUMx/vibebooks-shop](https://github.com/xPHUMx/vibebooks-shop)
* **เว็บไซต์ระบบที่ Deploy ใช้งานจริง (Live Production URL):** [https://vibebooks-shop.vercel.app](https://vibebooks-shop.vercel.app)
* **หน้าแสดงผลการทำงาน CI/CD (GitHub Actions):** [https://github.com/xPHUMx/vibebooks-shop/actions](https://github.com/xPHUMx/vibebooks-shop/actions)

---

## 📑 สารบัญลิงก์สำหรับตรวจประเมินโครงงาน (Evaluation Directory)

ท่านอาจารย์สามารถคลิกลิงก์ด้านล่างเพื่อเปิดดูเอกสารและหลักฐานการทำงานในแต่ละส่วนได้โดยตรง:

| หัวข้อการตรวจประเมิน | ลิงก์เข้าดูเอกสารและหลักฐานใน Repository | รายละเอียดเนื้อหาโดยย่อ |
| :--- | :--- | :--- |
| **1. Spec ของระบบ**<br>*(System Specification)* | 📄 **[เปิดดูเอกสารข้อกำหนดของระบบ (SYSTEM_SPECIFICATION.md)](./docs/SYSTEM_SPECIFICATION.md)** | ขอบเขตของระบบ, ข้อกำหนดเชิงหน้าที่ (FR-01 ถึง FR-10), ข้อกำหนดที่มิใช่เชิงหน้าที่ (NFR), ตารางสิทธิ์ผู้ใช้ (Role Matrix) และโครงสร้างฐานข้อมูล |
| **2. Class Diagram & Sequence Diagram**<br>*(Architecture Diagrams)* | 📐 **[เปิดดูรวมแผนภาพสถาปัตยกรรม (SYSTEM_DIAGRAMS.md)](./docs/SYSTEM_DIAGRAMS.md)**<br>— 🔹 **[กดดูเฉพาะ Class Diagram](./docs/SYSTEM_DIAGRAMS.md#5-class-diagram-แผนภาพโครงสร้างคลาสและออบเจกต์)**<br>— 🔹 **[กดดูเฉพาะ Sequence Diagram](./docs/SYSTEM_DIAGRAMS.md#4-sequence-diagram-แผนภาพลำดับขั้นตอนการทำงาน)**<br>— 🔹 **[กดดู Use Case Diagram](./docs/SYSTEM_DIAGRAMS.md#1-use-case-diagram-แผนภาพการใช้งานระบบ)**<br>— 🔹 **[กดดู Entity-Relationship (ER) Diagram](./docs/SYSTEM_DIAGRAMS.md#3-entity-relationship-er-diagram-แผนภาพความสัมพันธ์ข้อมูล)**<br>— 🔹 **[กดดู Activity Diagram](./docs/SYSTEM_DIAGRAMS.md#2-activity-diagram-แผนภาพกิจกรรมการทำงาน)** | แผนภาพทางวิศวกรรมซอฟต์แวร์ครบทั้ง 6 แบบ วาดด้วยไวยากรณ์ Mermaid Markdown แสดงผลอัตโนมัติบน GitHub 100% |
| **3. งานฝั่งผู้ใช้: Persona, Wireframe และผลตรวจ Accessibility**<br>*(UX / UI & a11y)* | 🎨 **[เปิดดูเอกสารงานฝั่งผู้ใช้และการเข้าถึง (USER_EXPERIENCE_AND_ACCESSIBILITY.md)](./docs/USER_EXPERIENCE_AND_ACCESSIBILITY.md)**<br>— 🔹 **[กดดูกลุ่มผู้ใช้งานจำลอง (User Personas)](./docs/USER_EXPERIENCE_AND_ACCESSIBILITY.md#1-กลุ่มผู้ใช้งานจำลอง-user-personas)**<br>— 🔹 **[กดดูพิมพ์เขียวหน้าจอ (Wireframes & UI Layout)](./docs/USER_EXPERIENCE_AND_ACCESSIBILITY.md#2-โครงสร้างสถาปัตยกรรมข้อมูลและพิมพ์เขียวหน้าจอ-wireframes--ui-layout)**<br>— 🔹 **[กดดูผลตรวจการเข้าถึง WCAG 2.1 AA (Accessibility Audit)](./docs/USER_EXPERIENCE_AND_ACCESSIBILITY.md#3-รายงานผลการตรวจการเข้าถึงตามมาตรฐาน-wcag-21-aa-accessibility-audit-report)** | กลุ่มผู้ใช้ 3 กลุ่ม (ผู้ซื้อ, ร้านค้า, แอดมิน), พิมพ์เขียวผังหน้าจอ, ตารางผลตรวจตามมาตรฐาน W3C WCAG 2.1 ระดับ AA ผ่านเกณฑ์ 100% พร้อมคะแนน Lighthouse 98-100 |
| **4. Test อัตโนมัติ และหน้าผลการรัน CI**<br>*(Automated Tests & CI/CD)* | 🧪 **[เปิดดูรายงานผลการทดสอบและสถานะ CI (TEST_AND_CI_RESULTS.md)](./docs/TEST_AND_CI_RESULTS.md)**<br>— 🔹 **[ดูโค้ดไฟล์ชุดทดสอบอัตโนมัติ (automated_suite.test.js)](./tests/automated_suite.test.js)**<br>— 🔹 **[ดูไฟล์กำหนดการทำงาน CI Pipeline (.github/workflows/ci.yml)](./.github/workflows/ci.yml)**<br>— 🔹 **[เปิดดูหน้าผลการรันสดบน GitHub Actions](https://github.com/xPHUMx/vibebooks-shop/actions)** | ชุดทดสอบ 13 Test Cases (ผ่าน 100%), ตรวจสอบ Type ด้วย `tsc --noEmit` (0 Errors), บิลด์ Next.js 19 Routes สำเร็จ และไปป์ไลน์ GitHub Actions CI |
| **5. บันทึกการใช้ AI**<br>*(AI Usage & Multi-Agent Log)* | 🤖 **[เปิดดูบันทึกการใช้งาน AI ในการพัฒนา (AI_USAGE_LOG.md)](./docs/AI_USAGE_LOG.md)**<br>— 🔹 **[ดูเอกสารสถาปัตยกรรม Multi-Agent 5 มิติ (.ai_docs/README.md)](./.ai_docs/README.md)** | ลำดับการ Prompt และขั้นตอนการพัฒนา 5 ระยะ, การวิเคราะห์ความถูกต้องและเทคนิค Prompt Engineering, และการสะท้อนผลการเรียนรู้ |

---

## 🔍 สรุปไฮไลต์ของแต่ละเรื่อง (Executive Highlights)

### 1. สเปกระบบ (System Specification)
* **สถาปัตยกรรม:** Next.js 14 App Router + Supabase SSR PostgreSQL
* **ระบบความปลอดภัย:** Row Level Security (RLS) แยกสิทธิ์ผู้ใช้ 3 กลุ่ม (Customer, Merchant, Admin) อย่างเด็ดขาด และมีระบบ Login Gate บังคับเข้าสู่ระบบก่อนทำการสั่งซื้อหรือชำระเงิน
* **ตู้นิรภัยดิจิทัล (Digital Vault):** เก็บไฟล์มาสเตอร์ใน Private Storage Bucket ส่งมอบผ่าน Time-Limited Signed URL 15 นาที พร้อมฝังลายน้ำชื่อ-อีเมลผู้ซื้อบนไฟล์ PDF

### 2. แผนภาพ Class Diagram & Sequence Diagram
* **Sequence Diagram:** แสดงลำดับขั้นตอนการทำงานครบวงจร ตั้งแต่การเลือกสินค้า, สร้างคำสั่งซื้อ, สร้าง PromptPay QR, อัปโหลดสลิป, ร้านค้าตรวจสอบสลิป จนถึงการปล่อยไฟล์ดาวน์โหลด
* **Class Diagram:** แสดงความสัมพันธ์ของคลาสและโมเดลข้อมูล (`Profile`, `Product`, `Order`, `OrderItem`, `DigitalVaultService`, `PaymentGatewayEngine`)
* **Use Case & ER Diagrams:** สอดคล้องกับตารางและ API Routes จริงในโปรเจกต์ 100%

### 3. งานฝั่งผู้ใช้ (User Experience & Accessibility)
* **3 Personas:** คุณธนกฤต (นักศึกษา/ผู้ซื้อ), คุณวรัญญา (นักเขียน/ร้านค้า), และคุณกิตติศักดิ์ (ผู้ดูแลระบบ)
* **Wireframes:** พิมพ์เขียวแสดงเลย์เอาต์หน้าแรก, แถบตะกร้าสินค้าเลื่อนข้าง (Sliding Cart Drawer), แคชเชียร์ PromptPay และคลังหนังสือส่วนตัว
* **Accessibility (WCAG 2.1 AA):** ผ่านเกณฑ์ทั้ง 4 ด้าน (Perceivable, Operable, Understandable, Robust) โดยมี Color Contrast สูงถึง 14.2:1 (เกณฑ์ขั้นต่ำ 4.5:1), ควบคุมด้วยคีย์บอร์ดได้ 100% และปุ่มสัมผัสไม่ต่ำกว่า 44x44px

### 4. การทดสอบอัตโนมัติ และระบบ CI/CD
* **ชุดทดสอบอัตโนมัติ:** รันผ่านคำสั่ง `npm test` ตรวจสอบทั้งอัลกอริทึม CRC16 ของ PromptPay, รหัสอ้างอิงคำสั่งซื้อ, การป้องกัน Path Traversal ในการส่งมอบไฟล์, และการคัดกรองข้อมูลคำสั่งซื้อข้ามร้านค้า (ผ่าน 13/13 ข้อ)
* **GitHub Actions CI:** ตรวจจับและบิลด์อัตโนมัติบนระบบคลาวด์ผ่านไฟล์ `.github/workflows/ci.yml` ทดสอบเสร็จสิ้นก่อนส่งต่อไปยัง Vercel Production

### 5. บันทึกการใช้งาน AI
* **กระบวนการพัฒนา:** บันทึกประวัติคำสั่ง (Prompts) ตั้งแต่การออกแบบโครงสร้าง, การจัดการความปลอดภัย, การแก้ไขปัญหา Race condition ในการซิงค์โปรไฟล์, และการพัฒนาไปป์ไลน์ CI/CD
* **ความโปร่งใส:** แสดงขอบเขตที่ AI ช่วยเหลือ (ความเร็ว 5-8 เท่า) และขอบเขตที่ต้องใช้การกำกับดูแลโดยมนุษย์ (Human-in-the-Loop)

---

## 🛠️ คำสั่งสำหรับการตรวจสอบและทดสอบระบบในเครื่อง (Local Verification)

หากท่านอาจารย์ต้องการทดสอบระบบในเครื่อง Local สามารถเปิด Terminal แล้วรันคำสั่งต่อไปนี้:

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ทดสอบความถูกต้องของ Type ทั้งระบบ (ต้องได้ 0 Errors)
npx tsc --noEmit

# 3. รันชุดทดสอบอัตโนมัติ (Automated Test Suite)
npm test

# 4. ทดสอบการ Build สำหรับ Production (ต้องผ่านครบทั้ง 19 Routes)
npm run build

# 5. เริ่มต้นรันเซิร์ฟเวอร์สำหรับทดสอบ
npm run dev
```

---

*เอกสารฉบับนี้จัดทำขึ้นโดย นายเกียรติภูมิ หารศรีนาถ (Kiatphum Hansrinath) เพื่อใช้เป็นสารบัญหลักในการประเมินและตรวจผลงานโครงงาน Book Sangdai อย่างสมบูรณ์*
