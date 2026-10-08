'use client';

import React from 'react';

interface LegalDocumentModalProps {
  isOpen: boolean;
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
  onAccept?: () => void;
}

export default function LegalDocumentModal({
  isOpen,
  type,
  onClose,
  onAccept,
}: LegalDocumentModalProps) {
  if (!isOpen || !type) return null;

  const isTerms = type === 'terms';
  const title = isTerms
    ? 'ข้อตกลงและเงื่อนไขการใช้งาน (Terms and Conditions / EULA)'
    : 'นโยบายความเป็นส่วนตัว (Privacy Policy - PDPA)';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/10 z-10 overflow-hidden flex flex-col max-h-[88vh] animate-fade-in-up">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-black/[0.08] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
              isTerms ? 'bg-charcoal' : 'bg-charcoal'
            }`}>
              <span className="material-symbols-outlined text-[20px]">
                {isTerms ? 'gavel' : 'verified_user'}
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-charcoal">
                {isTerms ? 'ข้อตกลงและเงื่อนไขการใช้งาน' : 'นโยบายความเป็นส่วนตัว'}
              </h3>
              <p className="text-[11px] text-muted-slate">
                {isTerms ? 'Terms of Service & EULA' : 'PDPA Privacy Policy'} • VIBEBooks Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/10 flex items-center justify-center text-charcoal transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-charcoal/90 leading-relaxed max-h-[60vh]">
          {isTerms ? (
            <>
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-xs font-medium">
                💡 ข้อตกลงนี้มีผลผูกพันทางกฎหมายระหว่างผู้ใช้งานกับ VIBEBooks โปรดอ่านก่อนกดยอมรับ
              </div>

              <div>
                <h4 className="font-bold text-charcoal mb-1">1. บัญชีผู้ใช้งานและคุณสมบัติ</h4>
                <p className="text-muted-slate">ผู้ใช้งานต้องมีอายุไม่ต่ำกว่า 13 ปีบริบูรณ์ หรือได้รับความยินยอมจากผู้ปกครอง ท่านมีหน้าที่รักษาความลับของบัญชีและรหัส OTP ที่ใช้เข้าสู่ระบบอย่างปลอดภัย</p>
              </div>

              <div>
                <h4 className="font-bold text-charcoal mb-1">2. สิทธิและใบอนุญาตการใช้งานคอนเทนต์ (EULA)</h4>
                <p className="text-muted-slate">เมื่อสั่งซื้ออีบุ๊ก ท่านจะได้รับสิทธิการอ่านและใช้งานส่วนบุคคลเท่านั้น (Personal License) ห้ามคัดลอก ดัดแปลง แจกจ่าย หรือเผยแพร่ต่อสาธารณะโดยไม่ได้รับอนุญาต ลิขสิทธิ์ทั้งหมดยังคงเป็นของผู้สร้างสรรค์</p>
              </div>

              <div>
                <h4 className="font-bold text-charcoal mb-1">3. การชำระเงินและนโยบายไม่รับคืนเงิน</h4>
                <p className="text-muted-slate">การชำระเงินผ่านพร้อมเพย์ต้องตรงตามเบอร์และยอดของร้านค้า สินค้าดิจิทัลที่ได้รับการอนุมัติและดาวน์โหลดแล้วไม่สามารถขอคืนเงินได้ ยกเว้นไฟล์ชำรุดเสียหายจริง</p>
              </div>

              <div>
                <h4 className="font-bold text-charcoal mb-1">4. ความรับผิดชอบของร้านค้า</h4>
                <p className="text-muted-slate">ร้านค้าต้องเป็นเจ้าของลิขสิทธิ์หรือมีสิทธิในการจำหน่ายสินค้าอย่างถูกต้องตามกฎหมาย และยินยอมรับผิดชอบต่อข้อพิพาทด้านลิขสิทธิ์แต่เพียงผู้เดียว</p>
              </div>

              <div>
                <h4 className="font-bold text-charcoal mb-1">5. การระงับการใช้งานและกฎหมายที่ใช้บังคับ</h4>
                <p className="text-muted-slate">แพลตฟอร์มมีสิทธิ์ระงับบัญชีที่ทำผิดกฎหมายหรือข้อตกลงนี้ทันที โดยอยู่ภายใต้บังคับใช้ตามกฎหมายแห่งราชอาณาจักรไทย</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-900 text-xs font-medium">
                🛡️ VIBEBooks ปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) อย่างเคร่งครัด
              </div>

              <div>
                <h4 className="font-bold text-charcoal mb-1">1. ข้อมูลที่เราเก็บรวบรวม</h4>
                <p className="text-muted-slate">ชื่อ-นามสกุล, ที่อยู่อีเมล, ข้อมูลคำสั่งซื้อ, สลิปหลักฐานการโอนเงิน, หมายเลขพร้อมเพย์ร้านค้า, และบันทึกประวัติการยืนยันรหัส OTP</p>
              </div>

              <div>
                <h4 className="font-bold text-charcoal mb-1">2. วัตถุประสงค์ในการประมวลผลข้อมูล</h4>
                <p className="text-muted-slate">ใช้เพื่อยืนยันตัวตน (Authentication), ประมวลผลคำสั่งซื้อและส่งมอบไฟล์ดิจิทัล, ให้ร้านค้าตรวจสอบสลิปยอดเงิน, และการปฏิบัติตามระเบียบกฎหมาย</p>
              </div>

              <div>
                <h4 className="font-bold text-charcoal mb-1">3. การเปิดเผยข้อมูล</h4>
                <p className="text-muted-slate">เปิดเผยต่อร้านค้าคู่ค้าเพื่อตรวจสอบสลิป และผู้ให้บริการโครงสร้างพื้นฐาน (Supabase, Resend) โดยไม่มีการขายข้อมูลส่วนบุคคลเพื่อการค้าใดๆ ทั้งสิ้น</p>
              </div>

              <div>
                <h4 className="font-bold text-charcoal mb-1">4. สิทธิของเจ้าของข้อมูล (PDPA Rights)</h4>
                <p className="text-muted-slate">ท่านมีสิทธิขอเข้าถึง แก้ไข ลบ ถอนความยินยอม หรือขอสำเนาข้อมูลส่วนบุคคลของท่านได้ตลอดเวลาผ่านระบบหรือติดต่อ DPO: privacy@vibebooks.com</p>
              </div>

              <div>
                <h4 className="font-bold text-charcoal mb-1">5. การรักษาความปลอดภัย</h4>
                <p className="text-muted-slate">ข้อมูลถูกเข้ารหัสด้วยมาตรฐาน SSL/TLS และจัดเก็บบนระบบคลาวด์ที่มีการควบคุมสิทธิ์เข้มงวดตามมาตรฐานสากล</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-black/[0.08] bg-[#FDFBF7] flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={isTerms ? '/terms' : '/privacy'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
          >
            <span>เปิดอ่านเอกสารฉบับเต็มแบบละเอียดในหน้าใหม่</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-full border border-black/10 text-charcoal hover:bg-black/[0.04] transition-all cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-full text-white bg-charcoal hover:bg-black transition-all shadow-sm cursor-pointer"
              >
                ฉันได้อ่านและยอมรับ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
