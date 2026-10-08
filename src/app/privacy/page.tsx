import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'นโยบายความเป็นส่วนตัว (Privacy Policy) | Book Sangdai',
  description: 'นโยบายการคุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ของ Book Sangdai',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-charcoal py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-black/[0.06]">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            กลับสู่หน้าหลัก Book Sangdai
          </Link>
          <span className="text-xs text-muted-slate">อัปเดตล่าสุด: 8 ตุลาคม 2026</span>
        </div>

        {/* Header */}
        <div className="border-b border-black/[0.08] pb-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            มาตรฐานความคุ้มครองข้อมูลส่วนบุคคล (PDPA Compliant)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-charcoal">
            นโยบายความเป็นส่วนตัว (Privacy Policy)
          </h1>
          <p className="mt-2 text-sm text-muted-slate leading-relaxed">
            Book Sangdai ให้ความสำคัญอย่างยิ่งต่อการคุ้มครองข้อมูลส่วนบุคคลของท่าน เอกสารฉบับนี้อธิบายถึงวิธีการที่เราเก็บรวบรวม ใช้ เปิดเผย และปกป้องข้อมูลส่วนบุคคลของท่าน ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm leading-relaxed text-charcoal/90">
          
          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">1</span>
              ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม
            </h2>
            <p className="mb-2">เราอาจเก็บรวบรวมข้อมูลส่วนบุคคลที่ท่านมอบให้โดยตรงหรือเกิดขึ้นจากการใช้งานแพลตฟอร์ม ได้แก่:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>ข้อมูลระบุตัวตนและการติดต่อ:</strong> ชื่อ-นามสกุล, ที่อยู่อีเมล (Email), รูปภาพประจำตัว (Profile Picture)</li>
              <li><strong>ข้อมูลธุรกรรมและการชำระเงิน:</strong> ประวัติคำสั่งซื้อ, สลิปหลักฐานการโอนเงิน (Slip Image), วันและเวลาที่ทำรายการ, หมายเลขพร้อมเพย์ (กรณีร้านค้า)</li>
              <li><strong>ข้อมูลทางเทคนิค:</strong> ที่อยู่ไอพี (IP Address), บันทึกการเข้าสู่ระบบ (Log Data), วันเวลาและรหัสการยืนยันตัวตน OTP</li>
              <li><strong>ข้อมูลการใช้งาน:</strong> คลังดิจิทัลที่ดาวน์โหลด, สินค้าที่เข้าชม และความคิดเห็น/รีวิวที่ท่านโพสต์</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">2</span>
              วัตถุประสงค์ในการเก็บรวบรวมและประมวลผลข้อมูล
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>การยืนยันตัวตนและการเข้าสู่ระบบ:</strong> เพื่อส่งรหัสยืนยันตัวตนแบบใช้ครั้งเดียว (Email OTP) และระบุตัวตนในการเข้าใช้งาน</li>
              <li><strong>การให้บริการคำสั่งซื้อและส่งมอบสินค้า:</strong> เพื่อประมวลผลการสั่งซื้อ จัดส่งไฟล์ดิจิทัลไปยังคลังส่วนตัวของผู้ซื้อ และให้ร้านค้าตรวจสอบสลิปยอดเงิน</li>
              <li><strong>การสื่อสารและการแจ้งเตือน:</strong> แจ้งสถานะคำสั่งซื้อ การอนุมัติการชำระเงิน หรือการเปลี่ยนแปลงนโยบายสำคัญ</li>
              <li><strong>การปฏิบัติตามกฎหมายและความปลอดภัย:</strong> ป้องกันการฉ้อโกง ตรวจสอบความถูกต้องของสลิปการโอนเงิน และปฏิบัติตามข้อกำหนดทางกฎหมาย</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">3</span>
              การเปิดเผยข้อมูลแก่บุคคลภายนอก
            </h2>
            <p className="mb-2">เราไม่มีนโยบายจำหน่ายหรือแบ่งปันข้อมูลส่วนบุคคลของท่านให้บุคคลภายนอกเพื่อผลประโยชน์ทางการค้า เว้นแต่ในกรณีดังต่อไปนี้:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>ร้านค้าคู่ค้า:</strong> เปิดเผยข้อมูลสลิปและชื่อผู้สั่งซื้อแก่ร้านค้าที่ท่านทำการซื้อ เพื่อให้ร้านค้าตรวจสอบและอนุมัติการปล่อยไฟล์สินค้า</li>
              <li><strong>ผู้ให้บริการโครงสร้างพื้นฐาน:</strong> ผู้ให้บริการคลาวด์ ฐานข้อมูล (Supabase) และบริการส่งอีเมลแจ้งเตือน (Resend) ภายใต้สัญญารักษาความลับที่เข้มงวด</li>
              <li><strong>หน่วยงานรัฐหรือเจ้าหน้าที่ตามกฎหมาย:</strong> เมื่อมีคำสั่งศาล หมายเรียก หรือข้อบังคับตามกฎหมายที่เกี่ยวข้อง</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">4</span>
              ระยะเวลาในการจัดเก็บข้อมูล (Data Retention)
            </h2>
            <p>
              เราจะจัดเก็บข้อมูลส่วนบุคคลของท่านไว้ตราบเท่าที่บัญชีผู้ใช้งานของท่านยังคงเปิดใช้งานอยู่ หรือตามระยะเวลาที่จำเป็นเพื่อปฏิบัติตามวัตถุประสงค์ทางธุรกิจและข้อกำหนดทางกฎหมาย (เช่น ข้อมูลหลักฐานทางบัญชีและธุรกรรมทางการเงินเป็นเวลาไม่น้อยกว่า 5-10 ปี ตามกฎหมายที่เกี่ยวข้อง)
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">5</span>
              สิทธิของเจ้าของข้อมูลส่วนบุคคล (Your Rights)
            </h2>
            <p className="mb-2">ภายใต้กฎหมาย PDPA ท่านมีสิทธิตามกฎหมายดังต่อไปนี้:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>สิทธิในการเข้าถึงและขอรับสำเนาข้อมูลส่วนบุคคลของตนเอง</li>
              <li>สิทธิในการขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่เป็นปัจจุบัน</li>
              <li>สิทธิในการขอลบ ทำลาย หรือทำให้ข้อมูลไม่สามารถระบุตัวตนได้ (เช่น การขอลบบัญชีผ่านระบบ)</li>
              <li>สิทธิในการขอระงับการใช้ข้อมูล</li>
              <li>สิทธิในการเพิกถอนความยินยอมที่เคยให้ไว้</li>
              <li>สิทธิในการยื่นข้อร้องเรียนต่อคณะกรรมการผู้เชี่ยวชาญตามกฎหมาย PDPA</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">6</span>
              มาตรการรักษาความปลอดภัยของข้อมูล
            </h2>
            <p>
              เราใช้มาตรการทางเทคนิคและการบริหารจัดการที่มีมาตรฐานสูงเพื่อปกป้องข้อมูลส่วนบุคคล เช่น การเข้ารหัสข้อมูลด้วย SSL/TLS, การกำหนดสิทธิ์การเข้าถึงข้อมูลอย่างเคร่งครัด (Row Level Security), และระบบรหัสผ่านครั้งเดียว OTP เพื่อป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">7</span>
              ช่องทางการติดต่อเกี่ยวกับข้อมูลส่วนบุคคล
            </h2>
            <p>
              หากท่านมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ หรือต้องการใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล สามารถติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO) ได้ที่อีเมล: <strong>support@booksangdai.store</strong>
            </p>
          </section>

        </div>

        {/* Footer actions */}
        <div className="mt-10 pt-6 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-slate">
            นโยบายความเป็นส่วนตัวฉบับนี้มีผลบังคับใช้ตั้งแต่วันที่ระบุข้างต้นเป็นต้นไป
          </p>
          <Link
            href="/terms"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
          >
            อ่านข้อตกลงและเงื่อนไขการใช้งาน (Terms of Service) &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
