'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface ConsentReaderModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAccept: () => void | Promise<void>;
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
}

export default function ConsentReaderModal({
  isOpen,
  onClose,
  onAccept,
  title = 'ข้อตกลงและนโยบายความเป็นส่วนตัว',
  subtitle = 'โปรดเลื่อนอ่านข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัวทั้ง 2 ส่วนให้จบเพื่อดำเนินการต่อ',
  showCloseButton = false,
}: ConsentReaderModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setScrollProgress(0);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) {
      setHasScrolledToBottom(true);
      setScrollProgress(100);
      return;
    }

    const progress = Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));
    setScrollProgress(progress);

    // If within 35px from bottom, trigger unlock
    if (maxScroll - scrollTop <= 35) {
      setHasScrolledToBottom(true);
    }
  };

  const handleScrollToBottom = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
    setTimeout(() => {
      setHasScrolledToBottom(true);
      setScrollProgress(100);
    }, 350);
  };

  const handleConfirmAccept = async () => {
    if (!hasScrolledToBottom || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAccept();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop with frosted blur */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={showCloseButton ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 z-10 flex flex-col max-h-[90vh] animate-fade-in-up overflow-hidden">
        
        {/* Close Button (if enabled) */}
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-charcoal/70 hover:text-black transition-all cursor-pointer z-20"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}

        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] bg-white text-center relative shrink-0">
          <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-charcoal flex items-center justify-center text-white shadow-sm overflow-hidden border border-black/10">
            <img src="/icon.jpg" alt="Book Sangdai" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-charcoal">
            {title}
          </h2>
          <p className="text-xs text-muted-slate mt-1 max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>

          {/* Scrolling Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal mb-1.5 px-1">
              <span className="flex items-center gap-1.5 text-muted-slate">
                <span className="material-symbols-outlined text-[15px]">import_contacts</span>
                ความคืบหน้าในการอ่าน
              </span>
              <span className={hasScrolledToBottom ? 'text-emerald-600 font-bold' : 'text-charcoal font-bold'}>
                {hasScrolledToBottom ? '✓ อ่านครบ 100%' : `${scrollProgress}%`}
              </span>
            </div>

            {/* Progress Bar with smooth animation */}
            <div className="w-full h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  hasScrolledToBottom ? 'bg-emerald-500' : 'bg-charcoal'
                }`}
                style={{ width: `${hasScrolledToBottom ? 100 : scrollProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Terms & Privacy Content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-charcoal/90 leading-relaxed max-h-[50vh] divide-y divide-black/[0.06] select-text"
        >
          {/* ════════ PART 1: ข้อตกลงการใช้งาน (Terms of Service / EULA) ════════ */}
          <section className="space-y-4 pt-1 first:pt-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-bold">ส่วนที่ 1</span>
              <h3 className="text-sm sm:text-base font-extrabold text-charcoal">
                ข้อตกลงและเงื่อนไขการใช้งาน (Terms and Conditions / EULA)
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-charcoal/80">
              <p>
                ยินดีต้อนรับสู่ <strong>Book Sangdai (บุ๊คสร้างได้)</strong> การสมัครสมาชิกหรือสั่งซื้อผลงานดิจิทัล ถือว่าท่านตกลงผูกพันตามข้อกำหนดและเงื่อนไขต่อไปนี้อย่างเคร่งครัด
              </p>

              <div className="p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl space-y-1.5">
                <p className="font-bold text-charcoal">1. สิทธิ์การใช้งานและการครอบครอง (Digital License)</p>
                <p>
                  เมื่อท่านสั่งซื้ออีบุ๊กหรือผลงานดิจิทัล ท่านจะได้รับสิทธิ์ในการอ่านและใช้งานส่วนบุคคลเท่านั้น (Personal License) ห้ามมิให้ทำซ้ำ ดัดแปลง เผยแพร่ แจกจ่ายต่อสาธารณะ หรือนำไปใช้ในเชิงพาณิชย์โดยไม่ได้รับอนุญาต ลิขสิทธิ์ทั้งหมดยังคงเป็นของผู้สร้างสรรค์ต้นฉบับ
                </p>
              </div>

              <div className="p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl space-y-1.5">
                <p className="font-bold text-charcoal">2. การชำระเงินและนโยบายไม่รับคืนเงิน (Payment & Refund)</p>
                <p>
                  การสั่งซื้อผ่านพร้อมเพย์ต้องโอนยอดเงินและแนบสลิปที่ถูกต้อง เนื่องจากสินค้าดิจิทัลสามารถดาวน์โหลดและเปิดอ่านได้ทันทีหลังร้านค้าอนุมัติ <strong>การสั่งซื้อจึงไม่สามารถขอคืนเงินได้ (Non-refundable)</strong> เว้นแต่ไฟล์ชำรุดเสียหายและไม่สามารถแก้ไขได้จริง
                </p>
              </div>

              <div className="p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl space-y-1.5">
                <p className="font-bold text-charcoal">3. บัญชีผู้ใช้งานและความปลอดภัย (Account Security)</p>
                <p>
                  ผู้ใช้งานมีหน้าที่รักษาความลับของอีเมลและรหัส OTP ของตนเอง กิจกรรมใดๆ ที่เกิดขึ้นภายใต้บัญชีของท่านถือเป็นความรับผิดชอบของท่าน แพลตฟอร์มขอสงวนสิทธิ์ในการระงับบัญชีที่พบการละเมิดลิขสิทธิ์หรือการทุจริต
                </p>
              </div>
            </div>
          </section>

          {/* ════════ PART 2: นโยบายความเป็นส่วนตัว (Privacy Policy - PDPA) ════════ */}
          <section className="space-y-4 pt-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-bold">ส่วนที่ 2</span>
              <h3 className="text-sm sm:text-base font-extrabold text-charcoal">
                นโยบายความเป็นส่วนตัว (Privacy Policy — PDPA Compliant)
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-charcoal/80">
              <p>
                Book Sangdai ปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) เพื่อให้ท่านมั่นใจว่าข้อมูลส่วนบุคคลของท่านได้รับการคุ้มครองอย่างปลอดภัยสูงสุด
              </p>

              <div className="p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl space-y-1.5">
                <p className="font-bold text-charcoal">1. ข้อมูลส่วนบุคคลที่เราจัดเก็บ</p>
                <p>
                  เราเก็บรวบรวมข้อมูลที่จำเป็น เช่น ชื่อ-นามสกุล, ที่อยู่อีเมล (Gmail), ข้อมูลคำสั่งซื้อ, สลิปหลักฐานการชำระเงิน, หมายเลขพร้อมเพย์ร้านค้า และประวัติการเข้าใช้งาน เพื่อใช้ในการยืนยันตัวตนและให้บริการ
                </p>
              </div>

              <div className="p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl space-y-1.5">
                <p className="font-bold text-charcoal">2. วัตถุประสงค์ในการประมวลผลข้อมูล</p>
                <p>
                  ข้อมูลของท่านจะถูกนำไปใช้เพื่อ: (1) การยืนยันตัวตนผ่านรหัส OTP (2) จัดส่งไฟล์ดิจิทัลไปยังคลังของคุณ (3) ให้ร้านค้าตรวจสอบยอดเงินจากสลิป และ (4) ปฏิบัติตามข้อกำหนดทางกฎหมาย โดยไม่มีการจำหน่ายข้อมูลให้บุคคลภายนอกเด็ดขาด
                </p>
              </div>

              <div className="p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl space-y-1.5">
                <p className="font-bold text-charcoal">3. สิทธิของท่านตามกฎหมาย PDPA</p>
                <p>
                  ท่านมีสิทธิในการขอเข้าถึง, ขอรับสำเนา, ขอแก้ไข, หรือขอลบข้อมูลส่วนบุคคลของท่าน รวมถึงสิทธิในการถอนความยินยอมได้ตลอดเวลา โดยสามารถติดต่อเจ้าหน้าที่คุ้มครองข้อมูลได้ที่ support@booksangdai.com
                </p>
              </div>

              {/* End of content anchor */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">task_alt</span>
                <span>ท่านได้เลื่อนอ่านข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัวครบถ้วนแล้ว</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer with Unlockable Accept Button */}
        <div className="p-4 sm:p-5 border-t border-black/[0.08] bg-white flex flex-col gap-3 shrink-0">
          
          {/* Scroll status helper / Quick Scroll */}
          <div className="flex items-center justify-between text-xs">
            {!hasScrolledToBottom ? (
              <button
                type="button"
                onClick={handleScrollToBottom}
                className="inline-flex items-center gap-1.5 text-xs text-charcoal hover:underline font-semibold cursor-pointer animate-pulse"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                <span>คลิกเพื่อเลื่อนลงล่างสุด ({scrollProgress}%)</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>อ่านครบถ้วนแล้ว พร้อมกดยอมรับ</span>
              </span>
            )}

            <div className="flex items-center gap-2 text-[11px] text-muted-slate">
              <Link href="/terms" target="_blank" className="hover:underline text-blue-600 font-medium">
                อ่านฉบับเต็ม
              </Link>
            </div>
          </div>

          {/* Accept Button - Enabled only after scrolling */}
          <button
            type="button"
            disabled={!hasScrolledToBottom || isSubmitting}
            onClick={handleConfirmAccept}
            className={`w-full h-12 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer ${
              hasScrolledToBottom
                ? 'bg-black hover:bg-charcoal text-white active:scale-[0.98] ring-2 ring-black/10 animate-fade-in'
                : 'bg-black/10 text-muted-slate cursor-not-allowed opacity-70'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>กำลังบันทึกข้อตกลง...</span>
              </>
            ) : hasScrolledToBottom ? (
              <>
                <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
                <span>ฉันได้อ่านและยอมรับข้อตกลงทั้งหมด</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>โปรดเลื่อนอ่านให้จบก่อนกดตกลง</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
