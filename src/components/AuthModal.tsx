'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ConsentReaderModal from '@/components/ConsentReaderModal';

type AuthView = 'signin' | 'signup' | 'otp-verify';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, sendOtp, verifyOtp, authModalTab } = useAuth();

  const [view, setView] = useState<AuthView>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [showSignupConsent, setShowSignupConsent] = useState(false);
  const [signupConsentAccepted, setSignupConsentAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Load remembered email on component mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('booksangdai_remembered_email');
      const isRemembered = localStorage.getItem('booksangdai_remember_me') !== 'false';
      if (savedEmail && isRemembered) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {}
  }, []);

  const handleSaveRememberMe = (targetEmail: string) => {
    try {
      if (rememberMe && targetEmail) {
        localStorage.setItem('booksangdai_remembered_email', targetEmail);
        localStorage.setItem('booksangdai_remember_me', 'true');
      } else {
        localStorage.removeItem('booksangdai_remembered_email');
        localStorage.setItem('booksangdai_remember_me', 'false');
      }
    } catch {}
  };

  const resetAll = () => {
    setView('signin');
    setFullName('');
    try {
      const savedEmail = localStorage.getItem('booksangdai_remembered_email');
      const isRemembered = localStorage.getItem('booksangdai_remember_me') !== 'false';
      if (savedEmail && isRemembered) {
        setEmail(savedEmail);
      } else {
        setEmail('');
      }
    } catch {
      setEmail('');
    }
    setOtpDigits(['', '', '', '', '', '']);
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(false);
    setCountdown(0);
    setCanResend(false);
    setShowSignupConsent(false);
    setSignupConsentAccepted(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  useEffect(() => {
    if (!isAuthModalOpen) {
      resetAll();
    } else if (authModalTab) {
      setView(authModalTab);
    }
  }, [isAuthModalOpen, authModalTab]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = (seconds = 60) => {
    setCountdown(seconds);
    setCanResend(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (targetEmail?: string, targetPurpose?: 'signin' | 'signup', targetName?: string) => {
    const emailToUse = (targetEmail || email).trim();
    const purposeToUse = targetPurpose || (view === 'signup' ? 'signup' : 'signin');
    const nameToUse = (targetName || fullName).trim();

    if (!emailToUse || !emailToUse.includes('@')) {
      setErrorMsg('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    const res = await sendOtp(emailToUse, nameToUse, purposeToUse);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่');
      return;
    }

    setSuccessMsg(`ส่งรหัส OTP ไปยัง ${emailToUse} แล้ว`);
    setView('otp-verify');
    startCountdown(60);
    setTimeout(() => otpRefs.current[0]?.focus(), 150);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    handleSaveRememberMe(email.trim());

    if (view === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('กรุณากรอกชื่อ-นามสกุล');
        return;
      }

      // Always require reading and accepting terms before first signup!
      if (!signupConsentAccepted) {
        setShowSignupConsent(true);
        return;
      }
    }

    await handleSendOtp(email, view === 'signup' ? 'signup' : 'signin', fullName);
  };

  const handleAcceptSignupConsent = async () => {
    setSignupConsentAccepted(true);
    setShowSignupConsent(false);
    await handleSendOtp(email, 'signup', fullName);
  };

  const handleGoogleSignInClick = async () => {
    setErrorMsg('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);
    setErrorMsg('');

    if (cleaned && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (cleaned && index === 5) {
      const fullOtp = [...newDigits.slice(0, 5), cleaned].join('');
      if (fullOtp.length === 6 && !fullOtp.includes('')) {
        handleVerifyOtp(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = Array.from({ length: 6 }).map((_, i) => pasted[i] || '');
      setOtpDigits(newDigits);
      if (pasted.length === 6) {
        handleVerifyOtp(pasted);
      } else {
        const nextIndex = Math.min(pasted.length, 5);
        otpRefs.current[nextIndex]?.focus();
      }
    }
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    handleVerifyOtp(fullCode);
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    const code = (otpCode || otpDigits.join('')).trim();
    if (code.length !== 6) {
      setErrorMsg('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
      const firstEmpty = otpDigits.findIndex(d => !d);
      if (firstEmpty !== -1) {
        otpRefs.current[firstEmpty]?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const consentInfo = (view === 'signup' && signupConsentAccepted)
      ? { agreedTerms: true, agreedPrivacy: true }
      : undefined;

    const res = await verifyOtp(
      email,
      code,
      fullName,
      view === 'signup' ? 'signup' : 'signin',
      consentInfo
    );
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่');
      return;
    }

    handleSaveRememberMe(email.trim());

    setSuccessMsg(res.isNewUser ? 'สร้างบัญชีสำเร็จ' : 'เข้าสู่ระบบสำเร็จ');
    setTimeout(() => {
      closeAuthModal();
    }, 1000);
  };

  const otpString = otpDigits.join('');

  if (!isAuthModalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={closeAuthModal}
      />

      {/* Modal Card - Clean Black / Minimalist Design */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-black/10 z-10 animate-fade-in-up overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="p-6 sm:p-7">
          
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-charcoal/70 hover:text-black transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          {/* Logo Icon (สี่เหลี่ยมจัตุรัสสีดำทุกหน้า) + Brand Title */}
          <div className="text-center mb-5">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-charcoal flex items-center justify-center text-white shadow-sm overflow-hidden border border-black/10">
              <img src="/icon.jpg" alt="Book Sangdai" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-charcoal">
              Book Sangdai
            </h2>
            <p className="text-xs text-muted-slate mt-1">
              {view === 'otp-verify'
                ? `กรอกรหัส 6 หลักที่ส่งไปยัง ${email}`
                : view === 'signup'
                ? 'สมัครสมาชิกบัญชีใหม่'
                : 'ระบบจัดการคลังหนังสือดิจิทัล'}
            </p>
          </div>

          {/* Status Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-1.5 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-red-500 shrink-0">error</span>
                <span>{errorMsg}</span>
              </div>
              {(errorMsg.includes('ไม่มีเมลนี้ในระบบ') || errorMsg.includes('สมัครสมาชิกก่อน')) && (
                <button
                  type="button"
                  onClick={() => {
                    setView('signup');
                    setErrorMsg('');
                  }}
                  className="text-left font-bold text-black underline pl-6 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  👉 กดที่นี่เพื่อสมัครสมาชิก
                </button>
              )}
              {errorMsg.includes('มีบัญชีในระบบอยู่แล้ว') && (
                <button
                  type="button"
                  onClick={() => {
                    setView('signin');
                    setErrorMsg('');
                  }}
                  className="text-left font-bold text-black underline pl-6 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  👉 กดที่นี่เพื่อเข้าสู่ระบบ
                </button>
              )}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── View 1: Sign In & Sign Up Form (Clean Form without Checkboxes) ── */}
          {view !== 'otp-verify' && (
            <div>
              <form onSubmit={handleSubmitForm} className="space-y-3.5">
                {/* Name field (signup only) */}
                {view === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี"
                      className="w-full h-11 px-3.5 rounded-xl border border-black/10 bg-porcelain text-xs text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                    />
                  </div>
                )}

                {/* Email / Gmail field */}
                <div>
                  <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">
                    อีเมล (Gmail)
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full h-11 px-3.5 rounded-xl border border-black/10 bg-porcelain text-xs text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                  />
                </div>

                {/* Remember Me Checkbox (จดจำฉันไว้ในระบบ) for Sign In */}
                {view === 'signin' && (
                  <div className="flex items-center justify-between text-xs pt-0.5 px-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-black/20 text-black focus:ring-black accent-black cursor-pointer"
                      />
                      <span className="text-[12px] text-charcoal/80 group-hover:text-charcoal transition-colors font-medium">
                        จดจำฉันไว้ในระบบ
                      </span>
                    </label>
                  </div>
                )}

                {/* Terms agreement link notice for signup */}
                {view === 'signup' && (
                  <p className="text-[11px] text-muted-slate text-center leading-relaxed">
                    การสมัครสมาชิกถือว่าท่านยอมรับ{' '}
                    <button
                      type="button"
                      onClick={() => setShowSignupConsent(true)}
                      className="text-black font-semibold underline hover:opacity-80 cursor-pointer"
                    >
                      ข้อตกลงและนโยบายความเป็นส่วนตัว
                    </button>
                  </p>
                )}

                {/* Primary Action Button (เข้าสู่ระบบ / สมัครสมาชิก) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-full text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer bg-black hover:bg-charcoal disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>กำลังส่ง OTP...</span>
                    </>
                  ) : (
                    <span>{view === 'signup' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</span>
                  )}
                </button>
              </form>

              {/* Switch View Button: สลับระหว่างสมัครสมาชิก / เข้าสู่ระบบ */}
              <div className="mt-3.5 text-center">
                {view === 'signin' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setView('signup');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="w-full h-10 rounded-full border border-black/10 text-charcoal hover:bg-black/[0.03] text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
                  >
                    สมัครสมาชิก
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setView('signin');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="w-full h-10 rounded-full border border-black/10 text-charcoal hover:bg-black/[0.03] text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
                  >
                    เข้าสู่ระบบ
                  </button>
                )}
              </div>

              {/* Divider: หรือ */}
              <div className="relative my-3.5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/[0.08]" />
                </div>
                <span className="relative bg-white px-3 text-[11px] text-muted-slate uppercase font-medium tracking-wider">
                  หรือ
                </span>
              </div>

              {/* Continue with Gmail / Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                className="w-full h-11 rounded-full border border-black/10 bg-white hover:bg-black/[0.02] flex items-center justify-center gap-2.5 text-xs font-semibold text-charcoal transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Gmail</span>
              </button>
            </div>
          )}

          {/* ── View 2: OTP Verification Form ── */}
          {view === 'otp-verify' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-black/[0.03] border border-black/10 text-center">
                <p className="text-xs text-charcoal leading-relaxed">
                  ส่งรหัส OTP 6 หลักไปยัง<br />
                  <strong className="text-charcoal font-semibold">{email}</strong>
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[13px]">schedule</span>
                  <span>รหัสมีอายุ 2 นาที</span>
                </div>
              </div>

              {/* OTP Input Grid */}
              <div className="flex items-center justify-center gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={isSubmitting}
                    className={`w-10 h-12 text-center text-lg font-extrabold rounded-xl border-2 bg-porcelain transition-all outline-none focus:bg-white cursor-text
                      ${digit ? 'border-black bg-white text-charcoal' : 'border-black/10 text-charcoal'}
                      ${isSubmitting ? 'opacity-60' : ''}
                      focus:border-black focus:ring-1 focus:ring-black`}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-full bg-black hover:bg-charcoal text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังยืนยัน...</span>
                  </>
                ) : (
                  <span>ยืนยันรหัส OTP</span>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={() => handleSendOtp(email, fullName ? 'signup' : 'signin', fullName)}
                    disabled={isSubmitting}
                    className="text-xs text-charcoal font-semibold hover:underline cursor-pointer"
                  >
                    ส่งรหัสใหม่อีกครั้ง
                  </button>
                ) : (
                  <p className="text-xs text-muted-slate">
                    ขอรหัสใหม่ได้ใน <span className="font-mono text-charcoal">{countdown}</span> วิ
                  </p>
                )}
              </div>

              {/* Back to Email */}
              <button
                type="button"
                onClick={() => {
                  setView('signin');
                  setOtpDigits(['', '', '', '', '', '']);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-full h-9 rounded-full border border-black/10 text-charcoal text-xs font-semibold flex items-center justify-center gap-1 hover:bg-black/[0.03] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                เปลี่ยนอีเมล
              </button>
            </form>
          )}
        </div>
      </div>
    </div>

      {/* Sign Up Legal Consent Reader Modal - rendered at top level outside z-50 card */}
      <ConsentReaderModal
        isOpen={showSignupConsent}
        onClose={() => setShowSignupConsent(false)}
        onAccept={handleAcceptSignupConsent}
        title="ข้อตกลงและนโยบายความเป็นส่วนตัว"
        subtitle="โปรดเลื่อนอ่านข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัวทั้ง 2 ส่วนให้จบ ก่อนยืนยันการสมัครสมาชิก Book Sangdai"
        showCloseButton={true}
      />
    </>
  );
}
