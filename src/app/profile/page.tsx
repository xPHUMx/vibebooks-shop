'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const { user, profile, isRealUser, isLoading, updateProfile, signOut, signInWithGoogle, openAuthModal } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [storeLogoUrl, setStoreLogoUrl] = useState('');
  const [role, setRole] = useState<'user' | 'merchant' | 'admin'>('user');
  const [storeName, setStoreName] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [promptPayId, setPromptPayId] = useState('');
  
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingStoreLogo, setIsUploadingStoreLogo] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isDemoProfile, setIsDemoProfile] = useState(false);

  const googleAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    '';

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setAvatarUrl(profile.avatarUrl || '');
      setStoreLogoUrl(profile.storeLogoUrl || '');
      setRole(profile.role || 'user');
      setStoreName(profile.storeName || '');
      setStoreDesc(profile.storeDescription || '');
      setPromptPayId(profile.promptPayId || '');
    } else if (user) {
      const defaultName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        '';
      const defaultAvatar =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        '';
      setFullName(defaultName);
      setAvatarUrl(defaultAvatar);
      setStoreLogoUrl(user.user_metadata?.store_logo_url || '');
    }
  }, [profile, user]);

  useEffect(() => {
    if (user?.email) {
      fetchUserOrders(user.email);
    }
  }, [user]);

  const fetchUserOrders = async (email: string) => {
    try {
      let authHeaders: Record<string, string> = {};
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          authHeaders.Authorization = `Bearer ${session.access_token}`;
        }
      } catch {}

      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`, {
        headers: {
          ...authHeaders,
        },
      });
      const data = await res.json();
      if (data.success && data.orders) {
        setUserOrders(data.orders);
      }
    } catch (e) {
      console.warn('Failed to fetch user orders:', e);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setAvatarUrl(data.url);
      } else {
        alert(data.error || 'ไม่สามารถอัปโหลดรูปภาพได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปโปรไฟล์');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUploadStoreLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show immediate preview right away
    const objectUrl = URL.createObjectURL(file);
    setStoreLogoUrl(objectUrl);

    setIsUploadingStoreLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'store-logo');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setStoreLogoUrl(data.url);
        // Auto-save immediately to profile
        try {
          await updateProfile({ storeLogoUrl: data.url });
        } catch (saveErr) {
          console.warn('Auto-save store logo notice:', saveErr);
        }
      } else {
        alert(data.error || 'ไม่สามารถอัปโหลดรูปร้านค้าได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปร้านค้า');
    } finally {
      setIsUploadingStoreLogo(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        fullName,
        avatarUrl,
        role,
        storeName: (role === 'merchant' || role === 'admin') ? storeName : undefined,
        storeDescription: (role === 'merchant' || role === 'admin') ? storeDesc : undefined,
        promptPayId: (role === 'merchant' || role === 'admin') ? promptPayId : undefined,
        storeLogoUrl: (role === 'merchant' || role === 'admin') ? storeLogoUrl : undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const [isApplyingMerchant, setIsApplyingMerchant] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState('');

  const handleApplyMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !promptPayId.trim()) {
      alert('กรุณากรอกชื่อร้านค้าและเบอร์พร้อมเพย์รับเงิน');
      return;
    }

    setIsApplyingMerchant(true);
    try {
      const res = await fetch('/api/merchant/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          storeName: storeName.trim(),
          promptPayId: promptPayId.trim(),
          storeDescription: storeDesc.trim(),
          storeLogoUrl: storeLogoUrl.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApplySuccessMessage('ส่งคำขอเปิดร้านค้าสำเร็จ! กรุณารอผู้ดูแลระบบ (Admin) ตรวจสอบและอนุมัติ');
        await updateProfile({
          merchantStatus: 'PENDING',
          storeName: storeName.trim(),
          promptPayId: promptPayId.trim(),
          storeDescription: storeDesc.trim(),
          storeLogoUrl: storeLogoUrl.trim(),
        });
        setTimeout(() => setApplySuccessMessage(''), 5000);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการส่งคำขอ');
      }
    } catch (err) {
      alert('ไม่สามารถส่งคำขอเปิดร้านค้าได้');
    } finally {
      setIsApplyingMerchant(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-fade-in">
        <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted-slate font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>
    );
  }

  if (!user && !profile && !isDemoProfile) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center animate-fade-in">
        <div className="p-8 rounded-squircle bg-white border border-black/[0.08] shadow-level-2 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white mx-auto text-2xl shadow-md">
            <span className="material-symbols-outlined text-[32px]">account_circle</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal">เข้าสู่ระบบเพื่อจัดการโปรไฟล์</h1>
            <p className="text-xs text-muted-slate mt-1.5 leading-relaxed">
              เข้าสู่ระบบด้วยบัญชี Google หรือสร้างบัญชี Supabase เพื่อดูประวัติคำสั่งซื้อและจัดการสิทธิ์ร้านค้า
            </p>
          </div>
          <button
            onClick={() => signInWithGoogle()}
            className="w-full h-12 rounded-full bg-black text-white hover:bg-charcoal text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <span>Continue with Google</span>
          </button>
          <div className="pt-2">
            <button
              id="dev-demo-profile-btn"
              type="button"
              onClick={() => {
                setIsDemoProfile(true);
                setFullName('เกียรติภูมิ หารศรีนาถ');
                setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
                setRole('merchant');
                setStoreName('Kiattiphun Engineering Studio');
                setPromptPayId('081-234-5678');
                setStoreLogoUrl('https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80');
              }}
              className="w-full h-11 px-4 rounded-full border border-dashed border-amber-500/50 hover:border-amber-600 bg-amber-500/[0.04] text-amber-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>⚡ เข้าสู่โหมดทดสอบโปรไฟล์ (Kiattiphun Studio)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Real Account Status Banner */}
      <div className="p-3.5 px-4 rounded-squircle bg-accent-emerald/10 border border-accent-emerald/20 text-[#248a3d] text-xs flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>เชื่อมต่อกับ Supabase Database สด (Real Profile Active)</span>
        </div>
        <span className="text-[11px] font-mono opacity-80">ID: {user?.id?.substring(0, 8)}...</span>
      </div>

      {/* Main Profile Card (Liquid Glass Elevation 1) */}
      <div className="bg-white rounded-squircle border border-black/[0.06] p-6 sm:p-8 shadow-level-1 space-y-6">
        {/* Profile Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-black/[0.06]">
          <div className="relative group shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName || 'User Avatar'}
                className="w-20 h-20 rounded-full object-cover border-2 border-black/10 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-porcelain border-2 border-black/10 flex items-center justify-center text-3xl font-bold text-charcoal">
                {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm text-white bg-black">
              {role === 'admin' ? '🛡️ Admin' : role === 'merchant' ? '🏪 พ่อค้า' : '👤 สมาชิก'}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-charcoal truncate">
              {fullName || 'บัญชีผู้ใช้งาน'}
            </h1>
            <p className="text-xs text-muted-slate flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-[14px]">mail</span>
              <span>{user?.email || profile?.email}</span>
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-black/[0.04] text-[11px] font-medium text-charcoal">
                คำสั่งซื้อ: {userOrders.length} รายการ
              </span>
              {role === 'merchant' && (
                <Link
                  href="/merchant"
                  className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 text-[11px] font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1"
                >
                  <span>🏪 เข้าแดชบอร์ดพ่อค้า</span>
                  <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                </Link>
              )}
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={signOut}
            className="self-start sm:self-center px-4 py-2 rounded-full border border-black/10 hover:bg-black/[0.04] text-xs font-semibold text-charcoal transition-all shrink-0"
          >
            ออกจากระบบ
          </button>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="font-semibold">บันทึกข้อมูลโปรไฟล์ลงฐานข้อมูล Supabase สำเร็จแล้ว!</span>
          </div>
        )}

        {/* Edit Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <h2 className="text-sm font-bold text-charcoal uppercase tracking-wider">
            ข้อมูลส่วนบุคคล (Profile Information)
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                ชื่อ-นามสกุล (Full Name) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="เช่น เกียรติภูมิ หารศรีนาถ"
                className="w-full h-11 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs sm:text-sm text-charcoal outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Avatar Selector & Upload (Personal Profile) */}
            <div className="p-4 rounded-2xl bg-porcelain border border-black/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-charcoal">
                    รูปโปรไฟล์ส่วนตัว (Personal Profile Picture)
                  </label>
                  <p className="text-[11px] text-muted-slate">
                    เลือกใช้รูปจากบัญชี Google / Email หรืออัปโหลดรูปภาพใหม่ของคุณเอง
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-black/10 shrink-0 bg-white shadow-sm">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-slate">
                      {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Avatar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {googleAvatar && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl(googleAvatar)}
                    className={`h-9 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      avatarUrl === googleAvatar
                        ? 'bg-black text-white border-black'
                        : 'bg-white hover:bg-black/[0.04] text-charcoal border-black/10'
                    }`}
                  >
                    <img
                      src={googleAvatar}
                      alt="Google Avatar"
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>ใช้รูปจาก Google / Email</span>
                    {avatarUrl === googleAvatar && <span className="text-[10px]">✓</span>}
                  </button>
                )}

                <label className="h-9 px-3.5 rounded-full bg-white hover:bg-black/[0.04] text-charcoal border border-black/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
                  {isUploadingAvatar ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      <span>กำลังอัปโหลด...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">upload</span>
                      <span>อัปโหลดรูปใหม่</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadAvatar}
                    disabled={isUploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Manual URL Input */}
              <div className="pt-1">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="หรือวางลิงก์ URL รูปภาพที่นี่..."
                  className="w-full h-9 rounded-full bg-white border border-black/[0.08] px-3.5 text-xs text-charcoal outline-none focus:border-secondary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Role Selection / Upgrade */}
          <div className="p-4 rounded-2xl bg-porcelain border border-black/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-charcoal">
                  บทบาทผู้ใช้งานในระบบ (Account Role)
                </label>
                <p className="text-[11px] text-muted-slate">
                  สิทธิ์การใช้งานปัจจุบันของคุณในระบบ Book Sangdai
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white border border-black/10 text-charcoal">
                {role === 'admin' ? '🛡️ Administrator' : role === 'merchant' ? '🏪 พ่อค้า (Merchant)' : '👤 ผู้ซื้อ (Customer)'}
              </span>
            </div>

            {role === 'user' && (
              <div className="pt-3 border-t border-black/[0.06] space-y-4">
                {applySuccessMessage && (
                  <div className="p-3.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-[#248a3d] text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>{applySuccessMessage}</span>
                  </div>
                )}

                {profile?.merchantStatus === 'PENDING' ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⏳</span>
                      <div>
                        <h4 className="text-xs font-bold text-amber-900">
                          คำขอเปิดร้านค้าของคุณกำลังรอผู้ดูแลระบบ (Admin) ตรวจสอบและอนุมัติ
                        </h4>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          เมื่อแอดมินอนุมัติแล้ว คุณจะได้รับบทบาทพ่อค้าและสามารถจัดการร้านค้าผ่าน Seller Centre ได้ทันที
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-muted-slate block">ชื่อร้านค้าที่ยื่นขอ:</span>
                        <span className="font-bold text-charcoal">{storeName || profile.storeName}</span>
                      </div>
                      <div>
                        <span className="text-muted-slate block">เบอร์พร้อมเพย์รับเงิน:</span>
                        <span className="font-mono text-charcoal font-bold">{promptPayId || profile.promptPayId}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-charcoal font-bold block">
                          ต้องการเปิดร้านขายสินค้าดิจิทัลใน Book Sangdai?
                        </span>
                        <p className="text-[11px] text-muted-slate">
                          กรอกข้อมูลร้านค้าและส่งคำขอ เพื่อให้ผู้ดูแลระบบ (Admin) ตรวจสอบและอนุมัติบทบาทพ่อค้า
                        </p>
                      </div>
                    </div>

                    {profile?.merchantStatus === 'REJECTED' && (
                      <div className="p-3 rounded-xl bg-accent-coral/10 border border-accent-coral/20 text-accent-coral text-xs">
                        ⚠️ คำขอเปิดร้านค้าครั้งก่อนไม่ผ่านการอนุมัติ คุณสามารถปรับปรุงข้อมูลและยื่นคำขอใหม่ได้
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-white border border-black/[0.08] space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal mb-1">
                          ชื่อร้านค้า (Store Name) *
                        </label>
                        <input
                          type="text"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="เช่น Kiattiphun Studio Official"
                          className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none focus:border-amber-600 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal mb-1">
                          เบอร์พร้อมเพย์รับเงิน (Merchant PromptPay ID) *
                        </label>
                        <input
                          type="text"
                          value={promptPayId}
                          onChange={(e) => setPromptPayId(e.target.value)}
                          placeholder="08X-XXX-XXXX หรือ เลขบัตร ปชช"
                          className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs font-mono text-charcoal outline-none focus:border-amber-600 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal mb-1">
                          คำอธิบายร้านค้าสั้นๆ (Store Bio)
                        </label>
                        <textarea
                          value={storeDesc}
                          onChange={(e) => setStoreDesc(e.target.value)}
                          rows={2}
                          placeholder="บอกเล่าประเภทสินค้าที่คุณต้องการวางจำหน่าย..."
                          className="w-full rounded-xl bg-porcelain border border-black/[0.08] p-3 text-xs text-charcoal outline-none focus:border-amber-600 transition-all"
                        />
                      </div>

                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          disabled={isApplyingMerchant}
                          onClick={handleApplyMerchant}
                          className="h-10 px-5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          {isApplyingMerchant ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              <span>กำลังส่งคำขอ...</span>
                            </>
                          ) : (
                            <>
                              <span>🏪</span>
                              <span>ยื่นคำขอเปิดร้านค้า (รอ Admin อนุมัติ)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Merchant Fields (If Merchant or Admin) */}
          {(role === 'merchant' || role === 'admin') && (
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏪 ข้อมูลร้านค้าพ่อค้า (Store Settings)</span>
                </h3>
                <Link
                  href="/merchant"
                  className="text-xs text-amber-800 font-bold hover:underline"
                >
                  เปิด Seller Centre &rarr;
                </Link>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  ชื่อร้านค้า (Store Name)
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="เช่น Kiattiphun Studio Official"
                  className="w-full h-11 rounded-full bg-white border border-black/[0.08] px-4 text-xs sm:text-sm text-charcoal outline-none focus:border-amber-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  เบอร์พร้อมเพย์รับเงิน (Merchant PromptPay ID)
                </label>
                <input
                  type="text"
                  value={promptPayId}
                  onChange={(e) => setPromptPayId(e.target.value)}
                  placeholder="08X-XXX-XXXX หรือ เลขบัตร ปชช"
                  className="w-full h-11 rounded-full bg-white border border-black/[0.08] px-4 text-xs sm:text-sm text-charcoal font-mono outline-none focus:border-amber-600 transition-all"
                />
                <p className="text-[10px] text-muted-slate mt-1">
                  * จะถูกนำไปสร้าง PromptPay QR Code อัตโนมัติเมื่อลูกค้าสั่งซื้อสินค้าของร้านนี้
                </p>
              </div>

              {/* Store Logo / Store Picture (SEPARATE from personal avatar) */}
              <div className="p-4 rounded-xl bg-white border border-black/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-charcoal">
                      รูปร้านค้า / โลโก้ร้านค้า (Store Logo)
                    </label>
                    <p className="text-[11px] text-muted-slate">
                      รูปภาพนี้จะใช้เป็นตราสัญลักษณ์ร้านค้าของคุณ (แยกจากรูปโปรไฟล์ส่วนตัว)
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-black/10 shrink-0 bg-porcelain shadow-sm flex items-center justify-center">
                    {storeLogoUrl ? (
                      <img
                        src={storeLogoUrl}
                        alt="Store Logo Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[24px] text-amber-700">storefront</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label className="h-9 px-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
                    {isUploadingStoreLogo ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>กำลังอัปโหลดโลโก้...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                        <span>อัปโหลดรูปร้านค้า</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadStoreLogo}
                      disabled={isUploadingStoreLogo}
                      className="hidden"
                    />
                  </label>

                  {storeLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setStoreLogoUrl('')}
                      className="h-9 px-3 rounded-full border border-black/10 hover:bg-black/[0.04] text-[11px] text-muted-slate font-medium"
                    >
                      ลบรูปร้านค้า
                    </button>
                  )}
                </div>

                <input
                  type="url"
                  value={storeLogoUrl}
                  onChange={(e) => setStoreLogoUrl(e.target.value)}
                  placeholder="หรือวางลิงก์ URL โลโก้ร้านค้าที่นี่..."
                  className="w-full h-9 rounded-full bg-porcelain border border-black/[0.08] px-3.5 text-xs text-charcoal outline-none focus:border-amber-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  คำอธิบายร้านค้า (Store Bio)
                </label>
                <textarea
                  value={storeDesc}
                  onChange={(e) => setStoreDesc(e.target.value)}
                  rows={2}
                  placeholder="แนะนำร้านค้าของคุณและจุดเด่นของไฟล์ดิจิทัล..."
                  className="w-full rounded-2xl bg-white border border-black/[0.08] p-3 text-xs sm:text-sm text-charcoal outline-none focus:border-amber-600 transition-all"
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              href="/"
              className="h-11 px-5 rounded-full border border-black/10 hover:bg-black/[0.04] text-xs font-semibold text-charcoal flex items-center justify-center transition-all"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="h-11 px-8 rounded-full bg-black hover:bg-charcoal text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>บันทึกข้อมูลโปรไฟล์</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Orders Link */}
      <div className="p-5 rounded-squircle bg-white border border-black/[0.06] shadow-level-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-charcoal">คลังดิจิทัลของฉัน (My Library)</h3>
          <p className="text-xs text-muted-slate mt-0.5">
            เข้าถึงไฟล์ Master E-Book และ Asset ทั้งหมดที่คุณเคยซื้อไว้ในบัญชีนี้
          </p>
        </div>
        <Link
          href="/library"
          className="h-10 px-5 rounded-full bg-secondary hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">folder_special</span>
          <span>เปิดคลังของฉัน</span>
        </Link>
      </div>
    </div>
  );
}
