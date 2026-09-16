const STUDENT = {
  name: "นายเกียรติภูมิ หารศรีนาถ",
  studentId: "64332110242-2",
  brand: "VibeBooks PRO — Architecture & Engineering",
  date: "16 กันยายน 2026",
};

const CHAPTERS = {
  ch1: {
    title: "บทที่ 1: ภาพรวมสถาปัตยกรรมระบบ (System Architecture)",
    intro: "ระบบ VibeBooks PRO ได้รับการออกแบบภายใต้สถาปัตยกรรมไฮบริด (Hybrid Client-Cloud Architecture) เพื่อตอบสนองการใช้งานที่ไร้รอยต่อทั้งบนคอมพิวเตอร์และบนอุปกรณ์พกพา โดยมุ่งเน้นความเรียบหรู คมชัด และความถูกต้องตามมาตรฐานวิศวกรรมซอฟต์แวร์สมัยใหม่",
    points: [
      "1. Client & Mobile Runtime (MIT App Inventor / Mobile Browser): ทำหน้าที่เป็น Front-end ติดต่อกับผู้ใช้ผ่านหน้าจอ WebViewer ที่รองรับทั้งสมาร์ทโฟน Android และ iPhone โดยมี ActivityStarter ทำหน้าที่ส่งต่อการดาวน์โหลดไฟล์ไปยังเบราว์เซอร์ภายนอกเมื่อต้องการบันทึกไฟล์ลงใน Storage ของโทรศัพท์",
      "2. Edge Application Server (Next.js 14 on Vercel): ทำหน้าที่ให้บริการหน้าเว็บทั้ง 9 Routes ด้วยความเร็วสูงสุด พร้อม API Routes สำหรับการประมวลผลคำสั่งซื้อ (/api/orders), ตรวจรับการชำระเงิน (/api/payment/simulate), และการสตรีมมิงไฟล์เอกสาร (/api/pdf/[orderId])",
      "3. Cloud Database & Secure Vault (Supabase): เก็บข้อมูลคำสั่งซื้อใน PostgreSQL Database และจัดเก็บไฟล์ E-Book ขนาดเต็มทั้ง 3 เล่มใน Bucket ปลอดภัย 'ebook-vault' พร้อมระบบออก Signed URL ชั่วคราว 15 นาที เพื่อป้องกันการละเมิดลิขสิทธิ์"
    ]
  },
  ch2: {
    title: "บทที่ 2: หน้าหลักและระบบแคตตาล็อกสินค้า (Storefront & Catalog)",
    intro: "หน้าแรกของ VibeBooks PRO ออกแบบในสไตล์ Apple Hardware Showcase โดยตัดสิ่งรบกวนสายตาออกทั้งหมด นำเสนอหนังสือผ่านการ์ด 3D ลอยตัวและ Bento Grid ที่ให้ความรู้สึกระดับพรีเมียม",
    annotations: [
      {
        num: 1,
        component: "Apple-Style Navigation Bar",
        description: "แถบเมนูกระจกฝ้าสีดำ (Frosted Glass Header) แสดงไอคอนหนังสือ VibeBooks PRO, ป้ายบอกเวอร์ชัน, เมนูลัดสำหรับติดตามคำสั่งซื้อ, เมนูคอมมูนิตี้, และไอคอนแสดงยอดรายการหนังสือ"
      },
      {
        num: 2,
        component: "Hero Spotlight Headline",
        description: "หัวข้อใหญ่สไตล์ Apple Pro 'VibeBooks PRO. The Architecture of Software & AI.' พร้อมป้ายรับรอง Lead Architect ระบุชื่อและรหัสนักศึกษาอย่างชัดเจน และปุ่มกดสำรวจหนังสือสีน้ำเงิน Apple Blue"
      },
      {
        num: 3,
        component: "3D CoverFlow Carousel",
        description: "สไลเดอร์ 3 มิตินำเสนอหน้าปกหนังสือ สามารถเลื่อนด้วยการปัดสัมผัสบนหน้าจอมือถือ หรือคลิกปุ่มลูกศร มีเอฟเฟกต์หมุนองศา Perspective 3D เสมือนถือหนังสือจริงในมือ"
      },
      {
        num: 4,
        component: "Segmented Category Filter",
        description: "ปุ่มฟิลเตอร์ทรงแคปซูลสำหรับกรองหนังสือตามหมวดหมู่ (ทั้งหมด, ออดิโอ/มัลติมีเดีย, โหราศาสตร์/AI, ประสิทธิภาพงาน) เปลี่ยนสีแบบ Instant Smooth Transition"
      },
      {
        num: 5,
        component: "Bento Spec Grid & CTAs",
        description: "การ์ดแสดงรายละเอียดเชิงลึกของหนังสือแต่ละเล่ม พร้อมภาพจับหน้าจอซอฟต์แวร์ของจริง, สเปกฮาร์ดแวร์, ราคา 990 บาท, และปุ่ม 'สั่งซื้อทันที' นำทางไปยังหน้า Checkout"
      }
    ]
  },
  ch3: {
    title: "บทที่ 3: ขั้นตอนการสั่งซื้อและการชำระเงิน (Checkout & Payment)",
    intro: "ระบบ Checkout และ Payment ได้รับการออกแบบให้เข้าใจง่าย ปลอดภัย และลดขั้นตอนการกรอกข้อมูลที่ไม่จำเป็น โดยจำลองระบบ PromptPay QR Code ที่ถูกต้องตามมาตรฐานสากล",
    checkoutAnnotations: [
      {
        num: 1,
        component: "Order Summary Tile",
        description: "สรุปรายการหนังสือที่เลือกซื้อ แสดงภาพปก ความยาวหน้า (6 หน้าภาษาไทย), นามสกุลไฟล์ (.pdf), และยอดเงินที่ต้องชำระ 990 บาท"
      },
      {
        num: 2,
        component: "Customer Information Form",
        description: "ช่องสำหรับกรอกชื่อผู้รับและที่อยู่อีเมล โดยระบบจะใช้ข้อมูลนี้ในการสร้างใบเสร็จอิเล็กทรอนิกส์และส่งมอบไฟล์ E-Book สำรอง"
      },
      {
        num: 3,
        component: "Payment Selector & Submit",
        description: "ตัวเลือกชำระเงินผ่าน PromptPay QR Code พร้อมปุ่ม 'ดำเนินการชำระเงิน' ที่จะทำการบันทึกข้อมูลลงฐานข้อมูล Supabase ทันที"
      }
    ],
    paymentAnnotations: [
      {
        num: 1,
        component: "Dynamic PromptPay QR Card",
        description: "กล่องสีขาวตัดพื้นหลังดำ แสดงโลโก้พร้อมเพย์ทางการ (prompt-pay-logo.png) พร้อม QR Code สัญลักษณ์การชำระเงินที่สร้างขึ้นตามรหัสคำสั่งซื้อจริง"
      },
      {
        num: 2,
        component: "Countdown & Reference Bar",
        description: "แถบแสดงเวลานับถอยหลัง 15 นาที เพื่อรักษาความปลอดภัยของธุรกรรม พร้อมเลข Ref ID สั่งซื้อ สำหรับใช้อ้างอิงการตรวจสอบ"
      },
      {
        num: 3,
        component: "Instant Payment Simulation",
        description: "ปุ่ม 'จำลองการชำระเงินสำเร็จ (Verify Payment)' สำหรับใช้ทดสอบระบบ เมื่อกดแล้วระบบจะอัปเดตสถานะในฐานข้อมูลเป็น PAID ทันที และพาไปยังหน้าส่งมอบ"
      }
    ]
  },
  ch4: {
    title: "บทที่ 4: การส่งมอบดิจิทัลและ In-App Canvas Reader",
    intro: "หน้าส่งมอบดิจิทัล (/order/[orderId]) เป็นหัวใจสำคัญในการเข้าถึง E-Book โดยเฉพาะอย่างยิ่งสำหรับผู้ใช้งานผ่านสมาร์ทโฟนและแอปพลิเคชัน MIT App Inventor",
    deliveryAnnotations: [
      {
        num: 1,
        component: "Verified Status Capsule",
        description: "ป้ายยืนยันสถานะการชำระเงิน 'PAID · Verified' สีเขียวมรกต พร้อมหมายเลขคำสั่งซื้อและชื่อของผู้สั่งซื้อ"
      },
      {
        num: 2,
        component: "Multi-Platform Guidance Card",
        description: "การ์ดคำแนะนำแยกแพลตฟอร์มชัดเจน สำหรับ iOS/iPhone และ Android เพื่อแนะนำวิธีเปิดอ่านหรือดาวน์โหลดไฟล์ที่ราบรื่นที่สุด"
      },
      {
        num: 3,
        component: "In-App Canvas Reader CTA",
        description: "ปุ่มหลักสีน้ำเงิน Apple Blue 'เปิดอ่านบนแอปทันที' ซึ่งจะเรียกใช้งาน Mozilla PDF.js Engine เรนเดอร์หน้าหนังสือลงบน Canvas โดยไม่ต้องติดตั้งแอปเสริม"
      },
      {
        num: 4,
        component: "Download & Copy Actions",
        description: "ปุ่มดาวน์โหลดไฟล์ PDF เข้าเครื่องโดยตรง และปุ่มคัดลอกลิงก์เข้าระบบคลิปบอร์ดสำหรับนำไปเปิดบนเบราว์เซอร์หรือส่งต่อ"
      }
    ],
    readerAnnotations: [
      {
        num: 1,
        component: "Apple Glass Header Toolbar",
        description: "แถบส่วนบนสีเข้มแสดงชื่อไฟล์ E-book, เครดิตผู้จัดทำ, ปุ่มสลับโหมดการอ่าน (เลื่อนต่อเนื่อง/ทีละหน้า), ปุ่มแชร์, และปุ่มปิดหน้าต่าง"
      },
      {
        num: 2,
        component: "High-DPI Canvas Viewport",
        description: "พื้นที่แสดงเอกสารที่วาดลงบน HTML5 <canvas> ด้วยความคมชัดสูง (2.5x Device Pixel Ratio) แสดงผลภาษาไทย ไททาเนียมสเปก และกล่องโค้ดได้สมบูรณ์แบบ"
      },
      {
        num: 3,
        component: "Floating Control Pill",
        description: "แผงควบคุมลอยตัวด้านล่าง มีปุ่มเลื่อนหน้าก่อนหน้า/ถัดไป, ตัวระบุจำนวนหน้า (1 จาก 6 หน้า), ปุ่มซูมออก (-), และปุ่มซูมเข้า (+)"
      },
      {
        num: 4,
        component: "Header Fast Actions",
        description: "ปุ่มกดสั่งพิมพ์เอกสารหรือบันทึกเป็น PDF (Print to PDF) ผ่านฟังก์ชันเบราว์เซอร์ และปุ่มปิดกลับสู่หน้าหลัก"
      }
    ]
  },
  ch5: {
    title: "บทที่ 5: สถาปัตยกรรมและบล็อกใน MIT App Inventor",
    intro: "เพื่อให้แอปพลิเคชันสามารถทำงานได้อย่างสมบูรณ์แบบบนระบบปฏิบัติการ Android และจำลองบน iOS Companion ได้ทำการปรับปรุงโค้ดบล็อกและคอมโพเนนต์ในไฟล์ VibeBooks_MIT_App.aia ให้มีระบบบริดจ์ (Bridge) อัจฉริยะ",
    mitAnnotations: [
      {
        num: 1,
        component: "Screen1.BackPressed Event",
        description: "บล็อกตรวจสอบการกดปุ่มย้อนกลับของโทรศัพท์ ถ้า WebViewer สามารถถอยหลังได้ (CanGoBack) จะสั่งให้ถอยหลัง แต่ถ้าอยู่หน้าแรกจะสั่งปิดแอปพลิเคชันอย่างนุ่มนวล"
      },
      {
        num: 2,
        component: "WebViewStringChange Event",
        description: "บล็อกรับข้อความจาก JavaScript ภายในหน้าเว็บ เมื่อผู้ใช้กดปุ่มดาวน์โหลด หน้าเว็บจะส่ง URL มายัง WebViewString บล็อกนี้จะตรวจสอบความยาวและส่ง URL ไปยัง ActivityStarter ทันที"
      },
      {
        num: 3,
        component: "ActivityStarter Bridge Component",
        description: "คอมโพเนนต์สำหรับเรียก Intent ภายนอก ตั้งค่า Action เป็น 'android.intent.action.VIEW' เพื่อเปิด Google Chrome หรือ Browser หลักของเครื่องโทรศัพท์ ทำการดาวน์โหลดไฟล์ PDF เข้าสู่โฟลเดอร์ Downloads โดยตรง"
      }
    ]
  },
  ch6: {
    title: "บทที่ 6: การติดตามคำสั่งซื้อและการจัดการฐานข้อมูล",
    intro: "ผู้ใช้งานสามารถค้นหาและติดตามสถานะคำสั่งซื้อย้อนหลังได้ตลอด 24 ชั่วโมงผ่านหน้า Tracking (/tracking) โดยระบุเพียงหมายเลขรหัสคำสั่งซื้อ",
    trackingAnnotations: [
      {
        num: 1,
        component: "Order Search Input",
        description: "กล่องค้นหาสำหรับพิมพ์เลข Order Ref ID เพื่อตรวจสอบข้อมูลคำสั่งซื้อในฐานข้อมูลแบบ Realtime"
      },
      {
        num: 2,
        component: "Order History & Status Card",
        description: "การ์ดสรุปรายการสั่งซื้อ แสดงชื่อหนังสือ วันที่สั่งซื้อ ยอดเงิน และสถานะการชำระเงิน (PAID / PENDING)"
      },
      {
        num: 3,
        component: "Quick Re-Access Links",
        description: "ปุ่มเปิดไปยังหน้าส่งมอบดิจิทัล เพื่อให้ลูกค้าสามารถกลับมาเปิดอ่าน E-book หรือดาวน์โหลดไฟล์ซ้ำได้ทุกเวลา"
      }
    ]
  }
};

module.exports = {
  STUDENT,
  CHAPTERS
};
