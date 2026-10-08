# 📐 Book Sangdai (บุ๊คสั่งได้) — System Architecture & UML Diagrams

เอกสารรวมแผนภาพสถาปัตยกรรมระบบ (UML & System Diagrams) ของแพลตฟอร์ม **Book Sangdai (บุ๊คสั่งได้)** รองรับการทำงานของระบบสั่งซื้อดิจิทัล, คลังหนังสือดิจิทัลส่วนตัว (Digital Vault), ระบบยืนยันตัวตนสองชั้น (Gmail OTP & Google OAuth), การตรวจสอบสลิปโอนเงิน (PromptPay Slip Verification), และศูนย์รายงานสถิติของร้านค้า (Merchant Report Center)

---

## 📑 สารบัญแผนภาพ (Diagram Index)
1. [1. Use Case Diagram (แผนภาพการใช้งานระบบ)](#1-use-case-diagram-แผนภาพการใช้งานระบบ)
2. [2. Activity Diagram (แผนภาพกิจกรรมการทำงาน)](#2-activity-diagram-แผนภาพกิจกรรมการทำงาน)
3. [3. Entity-Relationship (ER) Diagram (แผนภาพความสัมพันธ์ข้อมูล)](#3-entity-relationship-er-diagram-แผนภาพความสัมพันธ์ข้อมูล)
4. [4. Sequence Diagram (แผนภาพลำดับขั้นตอนการทำงาน)](#4-sequence-diagram-แผนภาพลำดับขั้นตอนการทำงาน)
5. [5. Class Diagram (แผนภาพโครงสร้างคลาสและออบเจกต์)](#5-class-diagram-แผนภาพโครงสร้างคลาสและออบเจกต์)
6. [6. Site Map & UI Flow (แผนผังเว็บไซต์และการเชื่อมโยงหน้าจอ)](#6-site-map--ui-flow-แผนผังเว็บไซต์และการเชื่อมโยงหน้าจอ)

---

## 1. Use Case Diagram (แผนภาพการใช้งานระบบ)
แผนภาพแสดงขอบเขตหน้าที่และกรณีการใช้งานของผู้ใช้แต่ละบทบาท (Actors) ได้แก่ **ผู้ซื้อทั่วไป (Buyer / Guest)**, **สมาชิกที่ลงทะเบียน (Registered Member)**, **ร้านค้า (Merchant)**, **ผู้ดูแลระบบ (Super Admin)** และบริการภายนอก (External Services)

```mermaid
flowchart LR
    %% Actors
    subgraph Actors ["👥 ผู้ใช้งานและระบบภายนอก (Actors)"]
        Guest["👤 ผู้เยี่ยมชม / ลูกค้าทั่วไป\n(Guest / Buyer)"]
        Member["🔐 สมาชิกที่ลงทะเบียน\n(Registered Member)"]
        Merchant["🏪 ร้านค้า / ผู้สร้างสรรค์\n(Merchant)"]
        Admin["👑 ผู้ดูแลระบบ\n(Super Admin)"]
        ResendAPI["📧 Resend Email API"]
        SupabaseService["⚡ Supabase Services\n(Auth / DB / Storage)"]
    end

    %% Use Cases Subsystems
    subgraph StorefrontSystem ["🛍️ หน้าร้านและการสั่งซื้อ (Catalog & Checkout)"]
        UC1(["ค้นหาและกรองสินค้าตามหมวดหมู่\n(Browse & Filter Catalog)"])
        UC2(["ดูรายละเอียดสินค้าและส่วนลด\n(View Product & Discounts)"])
        UC3(["เพิ่มสินค้าลงตะกร้า / ซื้อทันที\n(Cart & Direct Checkout)"])
        UC4(["สร้าง PromptPay QR และแนบสลิป\n(PromptPay & Slip Upload)"])
        UC5(["ติดตามสถานะคำสั่งซื้อ\n(Track Order Status)"])
    end

    subgraph AuthSystem ["🔐 การยืนยันตัวตนและนโยบาย (Auth & Consent)"]
        UC6(["สมัครสมาชิก / ขอรหัส OTP\n(Sign Up & Request OTP)"])
        UC7(["เข้าสู่ระบบด้วย OTP 2 นาที\n(Sign In via Gmail OTP)"])
        UC8(["เข้าสู่ระบบด้วย Google OAuth\n(Continue with Google)"])
        UC9(["อ่านข้อตกลง 100% (PDPA & EULA)\n(Consent Reading Gate)"])
        UC10(["จำฉันไว้ในระบบ\n(Remember Me Session)"])
    end

    subgraph VaultSystem ["📚 คลังดิจิทัลส่วนตัว (My Library Vault)"]
        UC11(["ดูคลังสินค้าที่ชำระแล้วและรออนุมัติ\n(View Paid & Pending Vault)"])
        UC12(["อ่าน E-book ในเบราว์เซอร์\n(In-Browser PDF Reader)"])
        UC13(["ดาวน์โหลดไฟล์ดิจิทัลมาสเตอร์\n(Direct Master Download)"])
        UC14(["ลบ E-book ออกจากคลังด้วยรหัสยืนยัน\n(Secure Vault Deletion)"])
    end

    subgraph MerchantSystem ["💼 ระบบร้านค้า (Merchant Portal)"]
        UC15(["ยื่นขอเปิดร้านค้า / ตั้งค่าร้าน\n(Merchant Application & Setup)"])
        UC16(["เพิ่มและจัดการสินค้า 8 หมวดหมู่\n(Product Inventory Management)"])
        UC17(["ตรวจสอบสลิปโอนเงินและอนุมัติออเดอร์\n(Slip Verification & Approval)"])
        UC18(["ดูศูนย์รายงานสถิติยอดขาย (Report Center)\n(Analytics, Funnel & Leaderboard)"])
        UC19(["ลบรายการธุรกรรมด้วยรหัสยืนยัน Order ID\n(Secure Transaction Deletion)"])
        UC20(["ส่งออกข้อมูลธุรกรรมเป็น CSV\n(Export Orders CSV)"])
    end

    subgraph AdminSystem ["⚙️ ระบบผู้ดูแลส่วนกลาง (Admin Portal)"]
        UC21(["ดูภาพรวมรายได้ทั้งระบบ (Platform GMV)\n(Global Dashboard Overview)"])
        UC22(["จัดการร้านค้าและอนุมัติใบสมัคร\n(Store Approvals & Directory)"])
        UC23(["จัดการสิทธิ์และระงับผู้ใช้งาน\n(User Management & Permissions)"])
        UC24(["ตรวจสอบประวัติ Audit Trail และส่งออกข้อมูล\n(Audit Trail & Master CSV Export)"])
    end

    %% Connections
    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC4
    Guest --> UC5
    Guest --> UC6

    Member --> UC1
    Member --> UC2
    Member --> UC3
    Member --> UC4
    Member --> UC5
    Member --> UC7
    Member --> UC8
    Member --> UC9
    Member --> UC10
    Member --> UC11
    Member --> UC12
    Member --> UC13
    Member --> UC14
    Member --> UC15

    Merchant --> UC15
    Merchant --> UC16
    Merchant --> UC17
    Merchant --> UC18
    Merchant --> UC19
    Merchant --> UC20

    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC24

    UC6 --> ResendAPI
    UC7 --> ResendAPI
    UC4 --> SupabaseService
    UC8 --> SupabaseService
    UC9 --> SupabaseService
    UC12 --> SupabaseService
    UC17 --> SupabaseService
```

---

## 2. Activity Diagram (แผนภาพกิจกรรมการทำงาน)
แผนภาพกิจกรรมแสดงขั้นตอนการทำงานหลักของระบบ ตั้งแต่การเลือกสินค้า, การสร้างคำสั่งซื้อ, การชำระเงิน, การตรวจสลิป, ไปจนถึงการเปิดสิทธิ์ในคลังหนังสือดิจิทัล

```mermaid
flowchart TD
    Start([🟢 เริ่มต้น: ลูกค้าเข้าชมร้านค้า]) --> Browse[ค้นหาและเลือกดูผลงานดิจิทัลตามหมวดหมู่]
    Browse --> SelectItem[เลือกลงตะกร้า หรือกดสั่งซื้อทันที]
    SelectItem --> CheckoutPage[เข้าสู่หน้าชำระเงิน /checkout]
    CheckoutPage --> FillInfo[กรอกชื่อ, อีเมล, และเบอร์โทรศัพท์]
    
    FillInfo --> SubmitOrder[กดยืนยันสร้างคำสั่งซื้อ]
    SubmitOrder --> CreatePending[บันทึกคำสั่งซื้อลงฐานข้อมูล สถานะ PENDING]
    CreatePending --> GenQR[สร้าง PromptPay QR Code และเริ่มนับเวลาชำระเงิน]
    
    GenQR --> PaymentPage[แสดงหน้าชำระเงิน /payment/orderId พร้อมคำเตือนห้ามปิดหน้าต่าง]
    PaymentPage --> ScanPay[ลูกค้าสแกน QR Code โอนเงินผ่าน Mobile Banking]
    ScanPay --> UploadSlip[ลูกค้าอัปโหลดสลิปหลักฐานการโอนเงิน]
    
    UploadSlip --> SaveSlipStorage[อัปโหลดรูปสลิปเข้า Supabase Storage Bucket]
    SaveSlipStorage --> NotifyMerchant[อัปเดตสถานะออเดอร์พร้อม URL สลิปและส่งแจ้งเตือนร้านค้า]
    
    NotifyMerchant --> MerchantReview[ร้านค้าเปิด Merchant Portal /merchant ตรวจสอบสลิป]
    
    MerchantReview --> DecisionSlip{สลิปถูกต้อง\nยอดเงินครบถ้วน?}
    
    DecisionSlip -- ❌ สลิปไม่ถูกต้อง / ปลอมแปลง --> RejectOrder[ปฏิเสธและยกเลิกคำสั่งซื้อ\nแจ้งลูกค้าให้อัปโหลดใหม่]
    RejectOrder --> EndReject([🔴 สิ้นสุด: คำสั่งซื้อถูกยกเลิก])
    
    DecisionSlip -- ✅ สลิปถูกต้อง 100% --> ApproveOrder[ร้านค้ากดยืนยันอนุมัติคำสั่งซื้อ]
    ApproveOrder --> UpdateStatusPaid[ระบบอัปเดตสถานะเป็น PAID และบันทึก paid_at]
    UpdateStatusPaid --> UnlockVault[ปลดล็อกสิทธิ์ดาวน์โหลดและอ่าน E-book ใน My Library]
    
    UnlockVault --> CustVisitsLib[ลูกค้าเปิดหน้าคลังหนังสือดิจิทัล /library]
    CustVisitsLib --> ChooseAction{ลูกค้าต้องการ\nทำรายการใด?}
    
    ChooseAction -- อ่านหนังสือ --> OpenReader[เปิด In-Browser PDF Reader อ่านได้ทันที]
    ChooseAction -- ดาวน์โหลดไฟล์ --> DirectDownload[ดาวน์โหลดไฟล์มาสเตอร์ .pdf / .zip เข้าเครื่อง]
    ChooseAction -- ลบออกจากคลัง --> DangerZone[กดปุ่มถังขยะ และกรอกรหัส Catalog Code ยืนยัน 100%]
    
    DangerZone --> SoftHide[ระบบทำ Soft Hide: ซ่อนจากคลังลูกค้า\nแต่ยังคงยอดขายไว้ใน Report Center ร้านค้า]
    
    OpenReader --> EndSuccess([🏁 ใช้งานสำเร็จ])
    DirectDownload --> EndSuccess
    SoftHide --> EndSuccess
```

---

## 3. Entity-Relationship (ER) Diagram (แผนภาพความสัมพันธ์ข้อมูล)
แผนภาพแสดงโครงสร้างฐานข้อมูลเชิงสัมพันธ์ (PostgreSQL บน Supabase) ของระบบ Book Sangdai พร้อมฟิลด์และคีย์เชื่อมโยง

```mermaid
erDiagram
    PROFILES ||--o{ PRODUCTS : "owns/creates (merchant_id)"
    PROFILES ||--o{ ORDERS : "places as customer (user_id)"
    PROFILES ||--o{ ORDERS : "fulfills as merchant (merchant_id)"
    PROFILES ||--o{ COMMUNITY_COMMENTS : "posts (user_id)"
    ORDERS ||--|{ ORDER_ITEMS : "contains (order_id)"
    PRODUCTS ||--o{ ORDER_ITEMS : "sold as (product_id)"
    PRODUCTS ||--o{ COMMUNITY_COMMENTS : "receives (product_id)"
    PROFILES ||--o{ EMAIL_OTPS : "requests (email)"

    PROFILES {
        uuid id PK "Supabase Auth User ID"
        text email "User Email Address"
        text full_name "Full Name"
        text avatar_url "Profile Picture URL"
        text role "admin | merchant | user"
        text merchant_status "NONE | PENDING | APPROVED | REJECTED"
        timestamptz merchant_applied_at "Timestamp of Application"
        text store_name "Merchant Store Display Name"
        text store_description "Store Bio & Intro"
        text store_logo_url "Brand Icon / Store Logo URL"
        text promptpay_id "Merchant PromptPay National ID / Phone"
        text phone "Contact Phone Number"
        timestamptz terms_accepted_at "EULA/Terms Acceptance Timestamp"
        timestamptz privacy_accepted_at "PDPA Consent Timestamp"
        timestamptz created_at "Account Creation Date"
    }

    PRODUCTS {
        text id PK "Slug ID (e.g. liquid-glass-apple-ui-kit)"
        text title "Product Display Title"
        text subtitle "Short Subtitle / Benefit"
        text category "ebook | figma | notion | code | assets | ฯลฯ"
        text category_name_th "Display Thai Category Name"
        numeric price "Discounted / Selling Price (THB)"
        numeric original_price "Original Cross-out Price (THB)"
        numeric rating "Average Rating (1.0 - 5.0)"
        integer rating_count "Total Number of Reviews"
        text description "Full Product Overview Markdown/HTML"
        text file_name "Deliverable Asset File Name"
        text file_size "Formatted Size (e.g. 48.5 MB)"
        text cover_image "Cover Image URL"
        text curator "Curator / Author Name"
        text badge "Bestseller | New | Flagship"
        boolean is_featured "Highlight on Hero Carousel"
        uuid merchant_id FK "References PROFILES(id)"
        timestamptz created_at "Created Timestamp"
    }

    ORDERS {
        text id PK "Order ID (e.g. ORD-2026-8821)"
        uuid user_id FK "References PROFILES(id) nullable"
        text customer_name "Customer Full Name"
        text customer_email "Customer Email for Delivery"
        text customer_phone "Customer Mobile Phone"
        numeric total_amount "Total Order Sum (THB)"
        text status "PENDING | PAID | EXPIRED"
        text promptpay_ref "Generated PromptPay Reference Code"
        text slip_url "Payment Slip Image Supabase URL"
        uuid merchant_id FK "References PROFILES(id)"
        text merchant_name "Merchant Display Name"
        text merchant_promptpay "Merchant PromptPay Target"
        boolean is_hidden_by_customer "Soft-hide flag for Customer Vault"
        boolean is_deleted_by_merchant "Audit flag for Merchant Reports"
        timestamptz created_at "Order Placed Timestamp"
        timestamptz paid_at "Approval / Payment Timestamp"
    }

    ORDER_ITEMS {
        uuid id PK "Item UUID"
        text order_id FK "References ORDERS(id)"
        text product_id FK "References PRODUCTS(id)"
        text title "Product Title Snapshot"
        numeric price "Price Paid Snapshot (THB)"
        text file_name "Downloadable File Name"
        boolean is_hidden_by_customer "Soft-hide flag"
        timestamptz created_at "Item Created Timestamp"
    }

    EMAIL_OTPS {
        uuid id PK "OTP Record UUID"
        text email "Target Gmail Address"
        varchar_6 otp_code "6-Digit Verification PIN"
        text full_name "User Display Name (if sign up)"
        varchar_20 purpose "signin | signup"
        timestamptz expires_at "Expires in 2 Minutes"
        timestamptz used_at "Timestamp of Successful Verify"
        timestamptz created_at "Issued Timestamp"
    }

    COMMUNITY_COMMENTS {
        uuid id PK "Comment UUID"
        uuid user_id FK "References PROFILES(id)"
        text product_id FK "References PRODUCTS(id)"
        text author "Author Name"
        integer rating "Rating Score (1 - 5)"
        text content "Review Text"
        integer likes "Like Count"
        boolean is_verified_buyer "Verified Buyer Badge"
        timestamptz created_at "Posted Timestamp"
    }
```

---

## 4. Sequence Diagram (แผนภาพลำดับขั้นตอนการทำงาน)
แผนภาพแสดงการรับส่งข้อมูลระหว่างส่วนประกอบต่าง ๆ (Frontend, API Route, Supabase Database & Storage, และร้านค้า) ในกระบวนการสั่งซื้อ, การตรวจสลิป, และการดาวน์โหลดไฟล์

```mermaid
sequenceDiagram
    autonumber
    actor Customer as ลูกค้า (Customer)
    participant UI as Next.js Web Frontend
    participant API as Next.js API Routes (/api)
    participant Storage as Supabase Storage Bucket
    participant DB as Supabase PostgreSQL
    actor Merchant as ร้านค้า (Merchant)

    %% Step 1: Placing Order
    Customer->>UI: เลือกสินค้าและกดยืนยันชำระเงิน (/checkout)
    UI->>API: POST /api/orders (items, customer details, totalAmount)
    API->>DB: INSERT into public.orders (status = 'PENDING')
    API->>DB: INSERT into public.order_items (item list)
    DB-->>API: ยืนยัน Order ID (เช่น ORD-2026-9142)
    API-->>UI: ส่งคืน orderId และ QR PromptPay Payload
    UI->>Customer: แสดงหน้า /payment/ORD-2026-9142 พร้อม QR Code

    %% Step 2: Payment & Slip Upload
    Customer->>Customer: สแกนชำระเงินผ่าน Mobile Banking และเซฟสลิป
    Customer->>UI: อัปโหลดรูปสลิปหลักฐาน
    UI->>Storage: อัปโหลดไฟล์สลิป (slips/ORD-2026-9142.jpg)
    Storage-->>UI: ได้รับ Public Slip URL
    UI->>API: POST /api/payment/verify-slip (orderId, slipUrl)
    API->>DB: UPDATE public.orders SET slip_url = slipUrl WHERE id = orderId
    DB-->>API: บันทึกข้อมูลสำเร็จ
    API-->>UI: แจ้งเตือน "ส่งหลักฐานสำเร็จ รอร้านค้าตรวจสอบ"

    %% Step 3: Merchant Review & Approval
    Merchant->>UI: เปิดหน้า Merchant Portal (/merchant)
    UI->>API: GET /api/merchant/orders
    API->>DB: SELECT * FROM orders WHERE merchant_id = current_user
    DB-->>API: รายการออเดอร์พร้อมรูปสลิป
    API-->>UI: แสดงรายการในแท็บ "รอตรวจสอบสลิป"
    Merchant->>UI: ตรวจสอบรูปสลิปและกดยืนยัน "อนุมัติปล่อยไฟล์"
    UI->>API: PATCH /api/orders (orderId, status = 'PAID')
    API->>DB: UPDATE orders SET status = 'PAID', paid_at = NOW() WHERE id = orderId
    DB-->>API: อัปเดตสำเร็จ
    API-->>UI: แจ้งเตือนร้านค้า "อนุมัติเรียบร้อยแล้ว"

    %% Step 4: Access Digital Library
    Customer->>UI: เข้าสู่หน้าคลังหนังสือดิจิทัล (/library)
    UI->>API: GET /api/orders?email=customer_email
    API->>DB: SELECT * FROM orders WHERE customer_email AND is_hidden_by_customer = false
    DB-->>API: ข้อมูลออเดอร์สถานะ PAID
    API-->>UI: แสดงการ์ดผลงานในแท็บ "คลังหนังสือพร้อมอ่าน"
    Customer->>UI: กดปุ่ม "อ่าน E-book" หรือ "ดาวน์โหลดไฟล์"
    UI->>API: GET /api/download/[productId]
    API->>Storage: สตรีมไฟล์ PDF / ดิจิทัลมาสเตอร์
    Storage-->>API: ไบนารีไฟล์
    API-->>UI: ส่งข้อมูลไฟล์สู่เบราว์เซอร์
    UI-->>Customer: แสดงหน้าอ่านใน Reader หรือบันทึกไฟล์ลงเครื่องสำเร็จ
```

---

## 5. Class Diagram (แผนภาพโครงสร้างคลาสและออบเจกต์)
แผนภาพแสดงโครงสร้างข้อมูล (Interfaces & Types), Controllers, Context Providers, และ Services ในโปรเจกต์ Next.js

```mermaid
classDiagram
    %% Core Entities
    class DigitalProduct {
        +string id
        +string title
        +string subtitle
        +ProductCategory category
        +string categoryNameTh
        +number price
        +number originalPrice
        +number rating
        +number ratingCount
        +string description
        +string[] highlights
        +string fileName
        +string fileSize
        +string coverImage
        +string curator
        +string badge
        +boolean isFeatured
        +string merchantId
        +string merchantName
        +getDiscountPercent() number
    }

    class Order {
        +string id
        +string userId
        +string customerName
        +string customerEmail
        +string customerPhone
        +number totalAmount
        +OrderStatus status
        +OrderItem[] items
        +string promptpayRef
        +string slipUrl
        +string merchantId
        +boolean isHiddenByCustomer
        +boolean isDeletedByMerchant
        +string createdAt
        +string paidAt
        +isPaid() boolean
    }

    class OrderItem {
        +string id
        +string orderId
        +string productId
        +string title
        +number price
        +string fileName
        +boolean isHiddenByCustomer
    }

    class UserProfile {
        +string id
        +string email
        +string fullName
        +string avatarUrl
        +string role
        +string merchantStatus
        +string storeName
        +string storeLogoUrl
        +string promptPayId
        +string termsAcceptedAt
        +string privacyAcceptedAt
        +hasAcceptedTerms() boolean
        +isMerchant() boolean
        +isAdmin() boolean
    }

    class EmailOtp {
        +string id
        +string email
        +string otpCode
        +string fullName
        +string purpose
        +Date expiresAt
        +Date usedAt
        +isExpired() boolean
    }

    %% System Controllers & Handlers
    class AuthContext {
        +UserProfile profile
        +User user
        +boolean isLoading
        +boolean isProfileSyncing
        +sendOtp(email, purpose, fullName) Promise
        +verifyOtp(email, otpCode) Promise
        +signInWithGoogle() Promise
        +acceptTerms() Promise
        +signOut() Promise
    }

    class OrderService {
        +createOrder(orderPayload) Promise
        +getOrderById(orderId) Promise
        +getOrdersByEmail(email) Promise
        +verifyPaymentSlip(orderId, slipUrl) Promise
        +approveOrder(orderId) Promise
        +deleteOrderCustomerVault(orderId, productId) Promise
        +deleteTransactionMerchant(orderId) Promise
    }

    class MerchantReportEngine {
        +calculateGrossRevenue(orders) number
        +calculateSalesByPeriod(orders, period) object
        +calculateProductLeaderboard(orders) array
        +calculateFunnelRatios(orders) object
        +exportOrdersToCSV(orders) string
    }

    class CartContext {
        +CartItem[] items
        +addToCart(product) void
        +removeFromCart(productId) void
        +clearCart() void
        +getTotalPrice() number
        +getItemCount() number
    }

    %% Relationships
    Order "1" *-- "many" OrderItem : contains
    UserProfile "1" -- "many" Order : places / fulfills
    UserProfile "1" -- "many" DigitalProduct : creates
    DigitalProduct "1" -- "many" OrderItem : represented in
    AuthContext ..> UserProfile : manages
    OrderService ..> Order : operates on
    CartContext ..> DigitalProduct : holds
    MerchantReportEngine ..> Order : analyzes
```

---

## 6. Site Map & UI Flow (แผนผังเว็บไซต์และการเชื่อมโยงหน้าจอ)
แผนผังโครงสร้างหน้าเว็บ (Page Routes) และการเชื่อมต่อระหว่างหน้าจอ (Navigation & Modal Flows) ในระบบ Book Sangdai

```mermaid
flowchart TD
    %% Root Navigation
    Home["🏠 หน้าแรก / Storefront\nURL: /"]
    
    %% Primary Branches
    CatalogSection["📑 หมวดหมู่ผลงาน 8 หมวดหมู่\n(Category Filter Bar)"]
    ProductModal["🔍 ดูรายละเอียดสินค้า\n(Product Detail Modal /products/[id])"]
    CartModal["🛒 ตะกร้าสินค้า\n(Cart Drawer Modal)"]
    CheckoutPage["💳 หน้าชำระเงิน\nURL: /checkout"]
    PaymentPage["📱 หน้าสแกน QR & แนบสลิป\nURL: /payment/[orderId]"]
    OrderReceipt["🧾 หน้ายืนยันคำสั่งซื้อ\nURL: /order/[orderId]"]
    
    LibraryPage["📚 คลังหนังสือดิจิทัลส่วนตัว\nURL: /library"]
    ReaderModal["📖 In-Browser PDF Reader\n(อ่านไฟล์ในระบบ)"]
    DeleteVaultModal["🗑️ ลบจากคลังส่วนตัว\n(Danger Zone + Catalog Code)"]
    
    AuthModal["🔐 เข้าสู่ระบบ / สมัครสมาชิก\n(AuthModal & URL: /auth/login)"]
    ConsentModal["📜 อ่านข้อตกลงและนโยบาย 100%\n(PDPA / EULA Consent Modal)"]
    
    ProfilePage["👤 ตั้งค่าโปรไฟล์ส่วนตัว\nURL: /profile"]
    MerchantApply["📝 แบบฟอร์มยื่นขอเปิดร้านค้า\n(Apply for Merchant)"]
    
    MerchantPortal["🏪 ศูนย์จัดการร้านค้า\nURL: /merchant"]
    OrdersTab["📋 รายการคำสั่งซื้อ & ตรวจสอบสลิป"]
    ProductsTab["📦 เพิ่มและแก้ไขสินค้า (8 หมวด)"]
    ReportTab["📊 ศูนย์รายงานสถิติ (Report Center)"]
    DeleteOrderModal["⚠️ ลบรายการธุรกรรม (Order ID Gate)"]
    
    AdminPortal["👑 ผู้ดูแลระบบส่วนกลาง\nURL: /admin"]
    AdminOverview["📈 แดชบอร์ดภาพรวม GMV"]
    AdminStores["🏬 อนุมัติและจัดการร้านค้า"]
    AdminUsers["👥 จัดการผู้ใช้และสิทธิ์"]
    AdminAudit["🛡️ ตรวจสอบระบบและส่งออก Master CSV"]

    LegalTerms["📄 เงื่อนไขและข้อกำหนด\nURL: /terms"]
    LegalPrivacy["🔒 นโยบายความเป็นส่วนตัว\nURL: /privacy"]

    %% Flow Connections
    Home --> CatalogSection
    Home --> ProductModal
    Home --> CartModal
    Home --> AuthModal
    Home --> LibraryPage
    Home --> ProfilePage
    Home --> LegalTerms
    Home --> LegalPrivacy

    CatalogSection --> ProductModal
    ProductModal --> CartModal
    ProductModal --> CheckoutPage
    CartModal --> CheckoutPage
    
    CheckoutPage --> PaymentPage
    PaymentPage --> OrderReceipt
    OrderReceipt --> LibraryPage

    LibraryPage --> ReaderModal
    LibraryPage --> DeleteVaultModal

    AuthModal --> ConsentModal
    AuthModal --> LibraryPage
    AuthModal --> ProfilePage

    ProfilePage --> MerchantApply
    MerchantApply -- "เมื่ออนุมัติแล้ว" --> MerchantPortal

    Home -- "สิทธิ์ Merchant" --> MerchantPortal
    MerchantPortal --> OrdersTab
    MerchantPortal --> ProductsTab
    MerchantPortal --> ReportTab
    OrdersTab --> DeleteOrderModal
    ReportTab --> DeleteOrderModal

    Home -- "สิทธิ์ Admin" --> AdminPortal
    AdminPortal --> AdminOverview
    AdminPortal --> AdminStores
    AdminPortal --> AdminUsers
    AdminPortal --> AdminAudit
```

---

## 🛠️ เทคนิคและมาตรฐานการนำไปใช้งาน (Usage & Tooling)
- **เครื่องมือแสดงผล (Rendering Engine):** แผนภาพทั้งหมดถูกเขียนด้วยไวยากรณ์ **Mermaid Markdown** มาตรฐานสากล รองรับการแสดงผลอัตโนมัติบน GitHub, GitLab, VS Code, Antigravity IDE, Notion, Obsidian และเครื่องมือ Markdown Viewers ทั่วไป
- **Single Source of Truth:** แผนภาพทั้ง 6 สอดคล้องกับสถาปัตยกรรมโค้ดจริงของ Next.js 14 App Router, โครงสร้างฐานข้อมูล Supabase PostgreSQL ใน [.ai_docs/04_BACKEND_DATABASE_SQL.md](file:///c:/Users/Phums/.gemini/antigravity/scratch/ebook_shop/.ai_docs/04_BACKEND_DATABASE_SQL.md) และข้อกำหนดระบบใน [.ai_docs/](file:///c:/Users/Phums/.gemini/antigravity/scratch/ebook_shop/.ai_docs/) 100%
