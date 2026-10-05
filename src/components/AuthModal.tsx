'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleTabSwitch = (newTab: 'signin' | 'signup') => {
    setTab(newTab);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (tab === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('กรุณาระบุชื่อ-นามสกุล');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }

      setIsSubmitting(true);
      const res = await signUpWithEmail(fullName.trim(), email.trim(), password);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      } else {
        if (res.requiresEmailConfirmation) {
          setSuccessMsg('สมัครสมาชิกสำเร็จ! โปรดตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ');
        } else {
          setSuccessMsg('สมัครสมาชิกสำเร็จและเข้าสู่ระบบเรียบร้อยแล้ว!');
          setTimeout(() => {
            closeAuthModal();
          }, 1200);
        }
      }
    } else {
      setIsSubmitting(true);
      const res = await signInWithEmail(email.trim(), password);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        setSuccessMsg('เข้าสู่ระบบสำเร็จ กำลังเชื่อมต่อคลังดิจิทัล...');
        setTimeout(() => {
          closeAuthModal();
        }, 800);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Liquid Glass Ambient Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog Card (Level 3 Elevation) */}
      <div className="relative w-full max-w-md bg-white rounded-squircle-lg p-6 sm:p-8 shadow-level-3 border border-black/[0.06] z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-charcoal/70 hover:text-black transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-black flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[24px]">local_library</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-charcoal">
            Book Sangdai Account
          </h2>
          <p className="text-xs text-muted-slate mt-1">
            {tab === 'signin'
              ? 'เข้าสู่ระบบคลังดิจิทัล & จัดการคำสั่งซื้อของคุณ'
              : 'สร้างบัญชีผู้ใช้ใหม่เพื่อเริ่มต้นสะสมและดาวน์โหลดผลงานดิจิทัล'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-porcelain rounded-full border border-black/[0.06] mb-5">
          <button
            type="button"
            onClick={() => handleTabSwitch('signin')}
            className={`py-2 text-xs font-semibold rounded-full transition-all ${
              tab === 'signin'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-muted-slate hover:text-charcoal'
            }`}
          >
            เข้าสู่ระบบ (Sign In)
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('signup')}
            className={`py-2 text-xs font-semibold rounded-full transition-all ${
              tab === 'signup'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-muted-slate hover:text-charcoal'
            }`}
          >
            สมัครสมาชิก (Sign Up)
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[18px] text-accent-emerald shrink-0">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mb-5">
          {tab === 'signup' && (
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
                className="w-full h-11 px-3.5 rounded-xl border border-black/10 bg-porcelain text-xs text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">
              อีเมล (Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-11 px-3.5 rounded-xl border border-black/10 bg-porcelain text-xs text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === 'signup' ? 'อย่างน้อย 6 ตัวอักษร' : '••••••••'}
              className="w-full h-11 px-3.5 rounded-xl border border-black/10 bg-porcelain text-xs text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
            />
          </div>

          {tab === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">
                ยืนยันรหัสผ่าน (Confirm Password)
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                className="w-full h-11 px-3.5 rounded-xl border border-black/10 bg-porcelain text-xs text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>กำลังดำเนินการ...</span>
              </>
            ) : tab === 'signin' ? (
              <>
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>เข้าสู่ระบบ</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>สมัครสมาชิก</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/[0.08]" />
          </div>
          <span className="relative bg-white px-3 text-[11px] text-muted-slate uppercase font-medium tracking-wider">
            หรือดำเนินการด้วย
          </span>
        </div>

        {/* OAuth Button: Continue with Google */}
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="w-full h-11 rounded-full border border-black/10 bg-white hover:bg-black/[0.02] flex items-center justify-center gap-3 text-xs font-semibold text-charcoal transition-all shadow-sm active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Security & Cloud Sync Notice */}
        <div className="mt-5 pt-3.5 border-t border-black/[0.06] text-center">
          <div className="inline-flex items-center gap-1 text-[10px] text-muted-slate">
            <span className="material-symbols-outlined text-[13px] text-accent-emerald">lock</span>
            <span>Supabase Auth Protected • 100% Encrypted Sessions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
