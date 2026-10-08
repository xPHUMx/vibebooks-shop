'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { DIGITAL_PRODUCTS } from '@/lib/productsData';
import { getPromptPayQRUrl } from '@/lib/promptpay';
import { Order } from '@/types';
import { createClient } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, totalItems, clearCart } = useCart();
  const { user, profile, openAuthModal } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);

  // If cart is empty and no fallback items, use flagship product as single item for demo
  const displayItems =
    items.length > 0
      ? items
      : [
          {
            product: DIGITAL_PRODUCTS[0],
            quantity: 1,
          },
        ];

  const checkoutTotal =
    items.length > 0
      ? totalAmount
      : DIGITAL_PRODUCTS[0].price;

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch {}
    return {};
  };

  // Sync profile details when auth changes
  useEffect(() => {
    if (user) {
      setCustomerEmail(user.email || '');
      setCustomerName(profile?.fullName || user.user_metadata?.full_name || '');
      if (profile?.phone) setCustomerPhone(profile.phone);
    } else {
      setCustomerEmail('');
      setCustomerName('');
    }
  }, [profile, user]);

  // Countdown timer for PromptPay step
  useEffect(() => {
    if (step !== 'payment') return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Protect against accidental navigation during QR scanning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (step === 'payment') {
        e.preventDefault();
        e.returnValue = '⚠️ ห้ามปิดหน้านี้เด็ดขาด! คำสั่งซื้อของคุณยังอยู่ในขั้นตอนชำระเงินและแนบสลิป';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step]);

  // Live polling for merchant approval when waiting for file release
  useEffect(() => {
    if (step !== 'success' || !createdOrder || createdOrder.status === 'PAID') return;
    const interval = setInterval(async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`/api/orders?orderId=${createdOrder.id}`, {
          headers: authHeaders,
        });
        const data = await res.json();
        if (data.success && data.order && data.order.status === 'PAID') {
          setCreatedOrder(data.order);
          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.6 },
            });
          } catch {}
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [step, createdOrder]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrorMessage('กรุณาเข้าสู่ระบบก่อนดำเนินการชำระเงินหรือสร้างคำสั่งซื้อ');
      openAuthModal('signin');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          items: displayItems,
          customerName: customerName || user.user_metadata?.full_name || 'ลูกค้าผู้สั่งซื้อ',
          customerEmail: user.email || customerEmail,
          customerPhone,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCreatedOrder(data.order);
        if (typeof window !== 'undefined') {
          localStorage.setItem('booksangdai_customer_email', (user.email || customerEmail).trim());
          localStorage.setItem('booksangdai_last_order_id', data.order.id);
          localStorage.setItem('booksangdai_last_pending_order_id', data.order.id);
        }
        setStep('payment');
      } else {
        if (data.requireLogin) {
          openAuthModal('signin');
        }
        setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
      }
    } catch (err) {
      setErrorMessage('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    } finally {
      setSubmitting(false);
    }
  };

  const copyRefCode = () => {
    if (createdOrder) {
      navigator.clipboard.writeText(createdOrder.promptpayRef || createdOrder.id);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleSlipFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพสลิป (.jpg, .png, .webp)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSlipPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCheckApproval = async () => {
    if (!createdOrder) return;
    setCheckingApproval(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/orders?orderId=${createdOrder.id}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success && data.order) {
        setCreatedOrder(data.order);
        if (data.order.status === 'PAID') {
          alert('✓ พ่อค้าตรวจสอบและอนุมัติปล่อยไฟล์แล้ว! คุณสามารถดาวน์โหลดได้ทันที');
          try {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          } catch {}
        } else {
          alert('⏳ สลิปของคุณกำลังรอทางร้านค้าตรวจสอบยอดเงินในบัญชี กรุณารอสักครู่');
        }
      }
    } catch {
      alert('ไม่สามารถตรวจสอบสถานะได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setCheckingApproval(false);
    }
  };

  const handleUploadAndSubmitSlip = async () => {
    if (!createdOrder || !slipPreview) return;
    setUploadingSlip(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/payment/slip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          orderId: createdOrder.id,
          slipData: slipPreview,
          autoVerify: false, // Require merchant review & approval!
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.order) {
          setCreatedOrder(data.order);
        } else {
          setCreatedOrder((prev) => (prev ? { ...prev, status: 'PENDING', slipUrl: slipPreview } : null));
        }
        clearCart();
        setStep('success');
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการแนบสลิป');
      }
    } catch {
      alert('ไม่สามารถติดต่อเซิร์ฟเวอร์เพื่อแนบสลิปได้');
    } finally {
      setUploadingSlip(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Step Indicator Header (Liquid Glass) */}
      <section className="bg-white rounded-squircle p-5 border border-black/[0.06] shadow-level-1">
        <div className="flex items-center justify-between relative max-w-md mx-auto">
          {/* Progress bar line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-black/[0.06] -z-0">
            <div
              className={`h-full bg-black transition-all duration-500 ${
                step === 'info' ? 'w-1/4' : step === 'payment' ? 'w-3/4' : 'w-full'
              }`}
            />
          </div>

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1 z-10 bg-white px-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'info'
                  ? 'bg-black text-white shadow-sm ring-4 ring-black/10'
                  : 'bg-black text-white'
              }`}
            >
              1
            </div>
            <span className="text-[11px] font-medium text-charcoal">ข้อมูลผู้รับ</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1 z-10 bg-white px-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'payment'
                  ? 'bg-black text-white shadow-sm ring-4 ring-black/10'
                  : step === 'success'
                  ? 'bg-black text-white'
                  : 'bg-black/[0.06] text-muted-slate'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-medium text-charcoal">PromptPay QR</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1 z-10 bg-white px-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'success'
                  ? 'bg-accent-emerald text-white shadow-sm'
                  : 'bg-black/[0.06] text-muted-slate'
              }`}
            >
              3
            </div>
            <span className="text-[11px] font-medium text-charcoal">รับไฟล์ดิจิทัล</span>
          </div>
        </div>
      </section>

      {/* STEP 1: CUSTOMER INFO & ORDER REVIEW */}
      {step === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Order Summary (2 Cols on desktop) */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-squircle p-5 border border-black/[0.06] shadow-level-1 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-slate">
                สรุปคำสั่งซื้อ ({displayItems.length} รายการ)
              </h3>

              <div className="divide-y divide-black/[0.06] max-h-72 overflow-y-auto pr-1">
                {displayItems.map(({ product, quantity }) => (
                  <div key={product.id} className="py-3 flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-xl bg-porcelain border border-black/[0.06] relative overflow-hidden shrink-0">
                      <Image
                        src={product.coverImage}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-charcoal truncate">
                        {product.title}
                      </h4>
                      <p className="text-[10px] text-muted-slate">
                        ฿{product.price} x {quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-charcoal tabular-nums shrink-0">
                      ฿{(product.price * quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="pt-3 border-t border-black/[0.06] space-y-2 text-xs">
                <div className="flex justify-between text-muted-slate">
                  <span>ยอดรวมสินค้า</span>
                  <span className="tabular-nums">฿{checkoutTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#248a3d] font-semibold">
                  <span>จัดส่งไฟล์ดิจิทัลอัตโนมัติ</span>
                  <span>ฟรี (Instant)</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-charcoal pt-2 border-t border-black/[0.06]">
                  <span>ยอดสุทธิ</span>
                  <span className="tabular-nums text-lg">฿{checkoutTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Store & Direct Transfer Destination info */}
              <div className="pt-3 border-t border-black/[0.06] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-muted-slate">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-secondary">storefront</span>
                    <span>ร้านค้าผู้จัดจำหน่าย:</span>
                  </span>
                  <span className="font-bold text-charcoal">{displayItems[0]?.product?.merchantName || 'Book Sangdai Official'}</span>
                </div>
                {displayItems[0]?.product?.merchantPromptPay && (
                  <div className="flex items-center justify-between text-muted-slate">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-accent-emerald">contact_phone</span>
                      <span>เบอร์พร้อมเพย์รับเงิน:</span>
                    </span>
                    <span className="font-mono font-bold text-secondary">{displayItems[0]?.product?.merchantPromptPay}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-squircle bg-accent-emerald/10 border border-accent-emerald/20 text-[#248a3d] text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>ระบบคุ้มครองลิขสิทธิ์ & สิทธิ์ใช้งาน</span>
              </div>
              <p className="text-[11px] opacity-90">
                เมื่อชำระสำเร็จ ระบบจะเปิดสิทธิ์เข้าถึงและดาวน์โหลดไฟล์ให้คุณทันที
              </p>
            </div>
          </div>

          {/* Form (3 Cols on desktop) */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-squircle p-6 sm:p-7 border border-black/[0.06] shadow-level-1 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-charcoal">ข้อมูลผู้สั่งซื้อ</h2>
                <p className="text-xs text-muted-slate mt-0.5">
                  ระบุชื่อและตรวจสอบอีเมลสำหรับรับหลักฐานและสิทธิ์การเข้าถึงไฟล์ Master
                </p>
              </div>

              {/* Login Requirement Banner */}
              {!user ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/[0.08] border border-amber-500/25 text-charcoal space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-700 font-bold text-sm">
                    <span className="material-symbols-outlined text-[22px] text-amber-600">lock</span>
                    <span>กรุณาเข้าสู่ระบบก่อนดำเนินการชำระเงิน</span>
                  </div>
                  <p className="text-xs text-muted-slate leading-relaxed">
                    ระบบต้องบันทึกประวัติคำสั่งซื้อและสิทธิ์การเข้าถึงไฟล์ดิจิทัล (Master Files) ผูกกับบัญชีของคุณโดยอัตโนมัติ เพื่อให้สามารถเปิดอ่านและดาวน์โหลดซ้ำได้ตลอดเวลา
                  </p>
                  <button
                    type="button"
                    onClick={() => openAuthModal('signin')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">login</span>
                    <span>เข้าสู่ระบบด้วย Google ทันที</span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-[#248a3d] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[18px] shrink-0">verified_user</span>
                    <span className="truncate">
                      เข้าสู่ระบบแล้ว: <strong>{user.email}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold bg-[#248a3d]/15 px-2 py-0.5 rounded-full shrink-0">
                    ผูกบัญชีแล้ว
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-accent-coral/10 border border-accent-coral/20 text-accent-coral text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    ชื่อ-นามสกุล (สำหรับระบุในใบส่งมอบ)
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="เช่น เกียรติภูมิ หารศรีนาถ"
                    className="w-full h-11 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs sm:text-sm text-charcoal outline-none focus:border-secondary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5 flex items-center justify-between">
                    <span>อีเมลสำหรับรับสิทธิ์ดาวน์โหลด (ส่งมอบไฟล์อัตโนมัติ)</span>
                    {user && (
                      <span className="text-[10px] text-muted-slate font-normal">
                        ผูกกับบัญชีล็อกอิน
                      </span>
                    )}
                  </label>
                  <input
                    type="email"
                    required
                    readOnly={!!user}
                    value={user ? (user.email || '') : customerEmail}
                    onChange={(e) => !user && setCustomerEmail(e.target.value)}
                    placeholder={user ? user.email || '' : "กรุณาเข้าสู่ระบบก่อน"}
                    className={`w-full h-11 rounded-full border px-4 text-xs sm:text-sm outline-none transition-all ${
                      user
                        ? 'bg-black/[0.03] border-black/[0.08] text-charcoal font-medium cursor-not-allowed'
                        : 'bg-porcelain border-black/[0.08] text-muted-slate'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    เบอร์โทรศัพท์ (ทางเลือก)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full h-11 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs sm:text-sm text-charcoal outline-none focus:border-secondary transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-black/[0.06]">
                  {!user ? (
                    <button
                      type="button"
                      onClick={() => openAuthModal('signin')}
                      className="w-full h-12 rounded-full bg-black text-white hover:bg-charcoal text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      <span>เข้าสู่ระบบก่อนเพื่อดำเนินการชำระเงิน</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-12 rounded-full bg-black text-white hover:bg-charcoal text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <span>{submitting ? 'กำลังจัดเตรียมคำสั่งซื้อ...' : 'ต่อไป: สแกน PromptPay QR'}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PROMPTPAY QR PAYMENT SCREEN */}
      {step === 'payment' && createdOrder && (
        <div className="max-w-md mx-auto bg-white rounded-squircle-lg p-6 sm:p-7 border border-black/[0.06] shadow-level-2 space-y-5 text-center animate-fade-in-up">
          {/* Official PromptPay Header */}
          <div className="p-3.5 rounded-squircle bg-porcelain border border-black/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 px-2 bg-white rounded-xl border border-black/[0.06] flex items-center justify-center shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/prompt-pay-logo.png"
                  alt="PromptPay"
                  className="h-6 w-auto object-contain"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = 'none';
                  }}
                />
                <span className="text-xs font-bold text-secondary ml-1">พร้อมเพย์</span>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-charcoal">Thai QR Payment</div>
                <div className="text-[10px] text-muted-slate">สแกนชำระเงินทุกแอปธนาคาร</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-accent-emerald/10 text-[#248a3d] text-[10px] font-bold">
              Active
            </span>
          </div>

          {/* Amount Due Display */}
          <div>
            <div className="text-xs text-muted-slate font-medium">ยอดชำระสุทธิ</div>
            <div className="text-3xl font-black text-charcoal tabular-nums mt-0.5">
              ฿{createdOrder.totalAmount.toLocaleString()}.00
            </div>
          </div>

          {/* Merchant Store Target Info Card */}
          {(() => {
            const primaryProd = displayItems[0]?.product;
            const activeMerchantName =
              createdOrder.merchantName ||
              primaryProd?.merchantName ||
              'Book Sangdai Official';
            const activePromptPay =
              createdOrder.merchantPromptPay ||
              primaryProd?.merchantPromptPay ||
              process.env.NEXT_PUBLIC_DEFAULT_PROMPTPAY ||
              '081-234-5678';

            return (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-amber-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-700">storefront</span>
                    <span>ร้านค้าผู้รับโอนเงิน:</span>
                  </span>
                  <span className="text-xs font-bold text-charcoal">{activeMerchantName}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-amber-500/15">
                  <span className="text-[11px] font-semibold text-amber-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-700">contact_phone</span>
                    <span>เบอร์พร้อมเพย์ร้านค้า:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-black text-amber-950 tracking-wider">
                      {activePromptPay}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = activePromptPay.replace(/[^0-9]/g, '');
                        navigator.clipboard.writeText(digits || activePromptPay);
                        alert(`คัดลอกเบอร์พร้อมเพย์ร้าน: ${activePromptPay} แล้ว!`);
                      }}
                      className="p-1 rounded bg-amber-200/80 hover:bg-amber-300 text-amber-900 transition-colors"
                      title="คัดลอกเบอร์พร้อมเพย์"
                    >
                      <span className="material-symbols-outlined text-[13px]">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* CRITICAL WARNING BANNER: DO NOT CLOSE OR REFRESH PAGE */}
          <div className="w-full rounded-[20px] bg-gradient-to-r from-rose-950/90 via-red-900/80 to-rose-950/90 border-2 border-rose-500/80 p-4 shadow-[0_0_30px_rgba(244,63,94,0.35)] space-y-2 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-rose-100 tracking-wide">
                    ⚠️ คำเตือนสำคัญ: ห้ามปิดหน้านี้เด็ดขาด!
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider animate-bounce">
                    DO NOT CLOSE
                  </span>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed mt-1">
                  กรุณา <strong>สแกนจ่ายเงินและแนบสลิปในหน้านี้จนเสร็จสมบูรณ์</strong> ห้ามปิดเบราว์เซอร์หรือกดย้อนกลับ เพื่อป้องกันการสูญหายของคำสั่งซื้อ และให้ระบบปลดล็อกไฟล์ E-Book เข้าคลังของคุณโดยอัตโนมัติ
                </p>
              </div>
            </div>
          </div>

          {/* Real Dynamic PromptPay QR Code Container */}
          {(() => {
            const primaryProd = displayItems[0]?.product;
            const activePromptPay =
              createdOrder.merchantPromptPay ||
              primaryProd?.merchantPromptPay ||
              process.env.NEXT_PUBLIC_DEFAULT_PROMPTPAY ||
              '081-234-5678';

            return (
              <div className="p-5 rounded-squircle bg-porcelain border border-black/[0.06] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-56 h-56 bg-white rounded-2xl p-2.5 border border-black/[0.08] shadow-md flex items-center justify-center relative overflow-hidden ring-4 ring-rose-500/30">
                  <img
                    src={getPromptPayQRUrl(activePromptPay, createdOrder.totalAmount)}
                    alt="PromptPay EMVCo QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* PromptPay Info */}
                <div className="mt-3 text-center w-full">
                  <div className="text-[11px] text-muted-slate font-medium">สแกนจ่ายได้ด้วยแอปทุกธนาคาร (PromptPay EMVCo ตรงร้านค้า)</div>
                  <div className="flex items-center justify-center gap-2 mt-1.5 text-xs font-mono">
                    <span className="text-muted-slate">พร้อมเพย์ร้าน:</span>
                    <span className="font-bold text-charcoal">{activePromptPay}</span>
                    <span className="text-muted-slate">• Ref:</span>
                    <span className="font-bold text-charcoal">{createdOrder.promptpayRef || createdOrder.id}</span>
                    <button
                      onClick={copyRefCode}
                      className="p-1 rounded hover:bg-black/[0.06] text-muted-slate hover:text-charcoal"
                      title="คัดลอก Ref"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedRef ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 w-full py-1.5 px-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-center">
                  <span className="text-[11px] font-bold text-rose-700 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span>กำลังรอการสแกนและแนบสลิป — ห้ามปิดหน้านี้เด็ดขาด</span>
                  </span>
                </div>

                {/* Countdown Timer */}
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-slate font-mono">
                  <span className="material-symbols-outlined text-[15px] text-accent-coral">timer</span>
                  <span>รอดำเนินการภายใน:</span>
                  <span className="font-bold text-charcoal">{formatTimer(countdown)}</span>
                </div>
              </div>
            );
          })()}

          {/* Payment Slip Upload Box */}
          <div className="p-5 rounded-squircle bg-white border border-black/[0.08] shadow-level-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-charcoal flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">upload_file</span>
                  <span>แนบสลิปการโอนเงิน (Upload Payment Slip)</span>
                </h3>
                <p className="text-[11px] text-muted-slate mt-0.5">
                  เมื่อโอนเงินแล้ว กรุณาแนบรูปภาพสลิปเพื่อยืนยันรายการและปลดล็อกไฟล์
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-secondary text-[10px] font-bold">
                แนะนำ
              </span>
            </div>

            {slipPreview ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-black/[0.08] bg-black/5 max-h-56 flex items-center justify-center p-2">
                  <img
                    src={slipPreview}
                    alt="Slip Preview"
                    className="max-h-52 w-auto object-contain rounded-lg"
                  />
                  <button
                    onClick={() => setSlipPreview(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black text-xs"
                    title="เปลี่ยนรูปภาพ"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                <button
                  onClick={handleUploadAndSubmitSlip}
                  disabled={uploadingSlip}
                  className="w-full h-12 rounded-full bg-secondary hover:bg-blue-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {uploadingSlip ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      <span>กำลังส่งสลิปและยืนยันสิทธิ์ดาวน์โหลด...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>ยืนยันการแนบสลิป & ส่งให้พ่อค้าตรวจสอบ</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <label className="border-2 border-dashed border-black/15 hover:border-secondary/50 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-porcelain/50">
                  <span className="material-symbols-outlined text-3xl text-muted-slate mb-1">
                    add_photo_alternate
                  </span>
                  <span className="text-xs font-semibold text-charcoal">
                    คลิกเพื่อเลือกไฟล์สลิป หรือลากไฟล์มาวางที่นี่
                  </span>
                  <span className="text-[10px] text-muted-slate mt-1">
                    รองรับ JPG, PNG, WEBP (สลิปจาก Mobile Banking ทุกธนาคาร)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSlipFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Action Trigger: Edit info or Back */}
          <div className="pt-2 text-center">
            <button
              onClick={() => setStep('info')}
              className="text-xs text-muted-slate hover:text-charcoal transition-colors py-1 inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>แก้ไขข้อมูลการสั่งซื้อ</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ORDER SUCCESS OR AWAITING MERCHANT APPROVAL */}
      {step === 'success' && createdOrder && (
        <div className="max-w-md mx-auto bg-white rounded-squircle-lg p-6 sm:p-8 border border-black/[0.06] shadow-level-3 space-y-6 text-center animate-scale-in">
          {createdOrder.status === 'PAID' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-accent-emerald/15 text-[#248a3d] flex items-center justify-center mx-auto shadow-sm">
                <span className="material-symbols-outlined text-[36px]">verified</span>
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-accent-emerald/10 text-accent-emerald text-xs font-bold uppercase tracking-wider">
                  อนุมัติ & ปล่อยไฟล์เรียบร้อย
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal mt-2">
                  ชำระเงินสำเร็จเรียบร้อย!
                </h2>
                <p className="text-xs text-muted-slate mt-1">
                  คำสั่งซื้อ <span className="font-mono font-bold text-charcoal">{createdOrder.id}</span> ได้รับการอนุมัติและเปิดสิทธิ์ดาวน์โหลดเรียบร้อยแล้ว
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
                <span className="material-symbols-outlined text-[36px] animate-pulse">hourglass_top</span>
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-bold uppercase tracking-wider">
                  รอพ่อค้าตรวจสอบสลิป
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal mt-2">
                  ส่งสลิปโอนเงินเรียบร้อยแล้ว
                </h2>
                <p className="text-xs text-muted-slate mt-1.5 leading-relaxed">
                  คำสั่งซื้อ <span className="font-mono font-bold text-charcoal">{createdOrder.id}</span> อยู่ระหว่างรอพ่อค้าตรวจสอบสลิปและยอดเงินในบัญชี เมื่อพ่อค้าอนุมัติ ระบบจะเปิดสิทธิ์ดาวน์โหลดไฟล์ให้คุณทันที
                </p>
              </div>

              {/* Status Tracker */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-left space-y-2">
                <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-amber-700">fact_check</span>
                  <span>สถานะการตรวจสอบรายการ:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-white border border-amber-200/60">
                    <span className="text-muted-slate block text-[10px]">ร้านค้าผู้จัดจำหน่าย:</span>
                    <strong className="text-charcoal truncate block">{createdOrder.merchantName || displayItems[0]?.product?.merchantName || 'Book Sangdai Official'}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-amber-200/60">
                    <span className="text-muted-slate block text-[10px]">เบอร์พร้อมเพย์รับเงิน:</span>
                    <strong className="text-secondary font-mono block">{createdOrder.merchantPromptPay || displayItems[0]?.product?.merchantPromptPay || '0808685989'}</strong>
                  </div>
                </div>
                <div className="pt-1 text-[11px] text-amber-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <span>ระบบจะรีเฟรชตรวจสอบการอนุมัติจากพ่อค้าให้อัตโนมัติทุกๆ 4 วินาที</span>
                </div>
              </div>
            </>
          )}

          {/* Purchased Items List */}
          <div className="p-4 rounded-squircle bg-porcelain border border-black/[0.06] text-left space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                รายการไฟล์ในคำสั่งซื้อ:
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                createdOrder.status === 'PAID' ? 'bg-accent-emerald/10 text-[#248a3d]' : 'bg-amber-500/10 text-amber-800'
              }`}>
                {createdOrder.status === 'PAID' ? 'ปลดล็อกแล้ว' : 'รอการอนุมัติ'}
              </span>
            </div>
            <div className="space-y-2">
              {createdOrder.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-black/[0.06]"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-charcoal truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-slate">{item.fileName}</p>
                  </div>
                  {createdOrder.status === 'PAID' ? (
                    <a
                      href={`/api/download/${createdOrder.id}?productId=${item.productId}`}
                      className="px-3.5 py-1.5 rounded-full bg-black text-white text-[11px] font-semibold flex items-center gap-1 hover:bg-charcoal shrink-0 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      ดาวน์โหลด
                    </a>
                  ) : (
                    <div
                      className="px-3 py-1.5 rounded-full bg-black/[0.05] text-muted-slate text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-not-allowed"
                      title="รอพ่อค้าอนุมัติสลิปก่อนดาวน์โหลด"
                    >
                      <span className="material-symbols-outlined text-[13px] text-amber-700">lock</span>
                      <span className="text-amber-800 font-bold">รอพ่อค้าอนุมัติ</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action and Refresh Buttons */}
          <div className="space-y-2.5 pt-2">
            {createdOrder.status !== 'PAID' && (
              <button
                type="button"
                onClick={handleCheckApproval}
                disabled={checkingApproval}
                className="w-full h-11 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold flex items-center justify-center gap-2 border border-secondary/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[16px] ${checkingApproval ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{checkingApproval ? 'กำลังตรวจสอบสถานะการอนุมัติ...' : 'รีเฟรชตรวจสอบสถานะการอนุมัติ'}</span>
              </button>
            )}

            <Link
              href="/library"
              className="w-full h-12 rounded-full bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-charcoal transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">folder_special</span>
              ไปที่คลังของฉัน (My Library)
            </Link>

            <Link
              href="/"
              className="block text-xs text-secondary hover:underline font-medium py-1"
            >
              กลับสู่หน้าร้าน Book Sangdai
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
