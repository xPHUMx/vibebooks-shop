import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'ข้อตกลงและเงื่อนไขการใช้งาน (Terms of Service & EULA) | Book Sangdai',
  description: 'ข้อตกลงและเงื่อนไขการใช้บริการ แพลตฟอร์มจำหน่ายอีบุ๊กและคอนเทนต์ดิจิทัล Book Sangdai',
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3">
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            เอกสารสัญญาทางกฎหมาย
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-charcoal">
            ข้อตกลงและเงื่อนไขการใช้งาน (Terms and Conditions / EULA)
          </h1>
          <p className="mt-2 text-sm text-muted-slate leading-relaxed">
            ยินดีต้อนรับสู่ Book Sangdai โปรดอ่านข้อตกลงและเงื่อนไขการใช้งานเหล่านี้อย่างละเอียดถี่ถ้วนก่อนสมัครสมาชิกหรือใช้งานแพลตฟอร์ม
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm leading-relaxed text-charcoal/90">
          
          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">1</span>
              บทนำและขอบเขตการบังคับใช้
            </h2>
            <p>
              ข้อตกลงและเงื่อนไขการใช้งานนี้ (ต่อไปนี้เรียกว่า &quot;ข้อตกลง&quot;) ถือเป็นสัญญาผูกพันตามกฎหมายระหว่างท่าน (ต่อไปนี้เรียกว่า &quot;ผู้ใช้งาน&quot; หรือ &quot;ท่าน&quot;) กับ Book Sangdai (ต่อไปนี้เรียกว่า &quot;เรา&quot; หรือ &quot;แพลตฟอร์ม&quot;) การสมัครสมาชิก การเข้าสู่ระบบ หรือการใช้งานส่วนใดส่วนหนึ่งของแพลตฟอร์ม ถือว่าท่านได้รับทราบ ทำความเข้าใจ และตกลงที่จะผูกพันตามข้อตกลงนี้ในทุกประการ
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">2</span>
              คุณสมบัติและการสมัครสมาชิก (Account Registration)
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>ผู้ใช้งานต้องมีอายุไม่ต่ำกว่า 13 ปีบริบูรณ์ หรือได้รับความยินยอมจากผู้ปกครองตามกฎหมาย</li>
              <li>ข้อมูลที่ใช้ในการสมัครสมาชิก (เช่น ชื่อ-นามสกุล, อีเมล) ต้องเป็นข้อมูลจริง ถูกต้อง และเป็นปัจจุบัน</li>
              <li>ผู้ใช้งานมีหน้าที่รักษาความลับของบัญชี รหัส OTP หรืออุปกรณ์ที่ใช้เข้าสู่ระบบ และต้องรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของท่าน</li>
              <li>ห้ามมิให้โอน ขาย หรือให้ผู้อื่นยืมใช้บัญชีโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากแพลตฟอร์ม</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">3</span>
              ใบอนุญาตการใช้งานคอนเทนต์ดิจิทัล (EULA & License)
            </h2>
            <p className="mb-2">
              เมื่อท่านสั่งซื้อหรือดาวน์โหลดไฟล์อีบุ๊ก (E-Book) หรือสื่อดิจิทัลผ่าน Book Sangdai:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>สิทธิส่วนบุคคล:</strong> ท่านจะได้รับใบอนุญาตแบบจำกัด ไม่สามารถโอนสิทธิ์ได้ เพื่อการอ่านและใช้งานเพื่อประโยชน์ส่วนบุคคลเท่านั้น (Personal, Non-commercial use)</li>
              <li><strong>ห้ามละเมิดลิขสิทธิ์:</strong> ห้ามทำการทำซ้ำ ดัดแปลง เผยแพร่ แจกจ่าย ขายต่อ หรือปล่อยให้ดาวน์โหลดบนเว็บไซต์/ช่องทางสาธารณะใดๆ โดยเด็ดขาด</li>
              <li><strong>กรรมสิทธิ์:</strong> ลิขสิทธิ์และทรัพย์สินทางปัญญาทั้งหมดยังคงเป็นของผู้สร้างสรรค์หรือร้านค้าต้นฉบับอย่างสมบูรณ์</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">4</span>
              การชำระเงินและการยืนยันสลิป (Payment & Verification)
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>การสั่งซื้อผ่านระบบพร้อมเพย์ ผู้ซื้อต้องโอนเงินไปยังบัญชีพร้อมเพย์ที่ระบบแสดงของร้านค้านั้นๆ และแนบสลิปการโอนเงินที่ถูกต้องตรงตามยอด</li>
              <li>การปล่อยไฟล์ดาวน์โหลดจะเกิดขึ้นหลังจากทางร้านค้าหรือระบบได้ทำการตรวจสอบความถูกต้องของยอดเงินและหลักฐานการโอนเสร็จสิ้น</li>
              <li>เนื่องจากสินค้าเป็นไฟล์ดิจิทัลที่สามารถเข้าถึงได้ทันทีหลังได้รับอนุมัติ <strong>การสั่งซื้อจึงไม่สามารถขอคืนเงินได้ (Non-refundable)</strong> เว้นแต่กรณีที่ไฟล์เสียหายหรือไม่สามารถเปิดใช้งานได้จริงและร้านค้าไม่สามารถแก้ไขได้</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">5</span>
              ข้อกำหนดสำหรับร้านค้าและผู้สร้างสรรค์ (Merchants)
            </h2>
            <p>
              ร้านค้าที่ลงจำหน่ายสินค้าบนแพลตฟอร์มต้องยืนยันว่ามีกรรมสิทธิ์หรือสิทธิในการจัดจำหน่ายตามกฎหมายอย่างถูกต้อง ไม่ละเมิดลิขสิทธิ์ เครื่องหมายการค้า หรือสิทธิในทรัพย์สินทางปัญญาของบุคคลภายนอก หากเกิดข้อพิพาท ร้านค้าตกลงที่จะรับผิดชอบทางกฎหมายแต่เพียงผู้เดียว
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">6</span>
              การระงับและการยกเลิกการให้บริการ (Termination)
            </h2>
            <p>
              แพลตฟอร์มขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีผู้ใช้งานทันทีโดยไม่ต้องแจ้งล่วงหน้า หากพบว่ามีการกระทำที่ฝ่าฝืนข้อตกลงนี้ ละเมิดลิขสิทธิ์ ปลอมแปลงสลิป หรือพยายามโจมตีความปลอดภัยของระบบ
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">7</span>
              กฎหมายที่ใช้บังคับและการระงับข้อพิพาท
            </h2>
            <p>
              ข้อตกลงนี้ให้อยู่ภายใต้การบังคับใช้และตีความตามกฎหมายแห่งราชอาณาจักรไทย ข้อพิพาทใดๆ ที่เกิดขึ้นให้อยู่ภายใต้เขตอำนาจของศาลในประเทศไทย
            </p>
          </section>

        </div>

        {/* Footer actions */}
        <div className="mt-10 pt-6 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-slate">
            มีคำถามเพิ่มเติมเกี่ยวกับข้อตกลงการใช้งาน? ติดต่อทีมงานที่ support@booksangdai.store
          </p>
          <Link
            href="/privacy"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
          >
            อ่านนโยบายความเป็นส่วนตัว (Privacy Policy) &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
