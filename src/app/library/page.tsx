'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderItem } from '@/types';
import ApplePdfReader from '@/components/ApplePdfReader';
import confetti from 'canvas-confetti';

export default function MyLibraryPage() {
  const { user, profile, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'paid' | 'pending'>('paid');
  const [checkingOrderId, setCheckingOrderId] = useState<string | null>(null);
  const [activeReading, setActiveReading] = useState<{
    orderId: string;
    bookTitle: string;
    fileName: string;
  } | null>(null);

  useEffect(() => {
    fetchUserOrders();
  }, [user, profile]);

  const fetchUserOrders = async (emailOverride?: string) => {
    setLoading(true);
    try {
      const storedGuestEmail = typeof window !== 'undefined' ? localStorage.getItem('vibebooks_customer_email') : null;
      const targetEmail = emailOverride || profile?.email || user?.email || storedGuestEmail || '';

      let fetchedOrders: Order[] = [];

      if (targetEmail) {
        const res = await fetch(`/api/orders?email=${encodeURIComponent(targetEmail)}`);
        const data = await res.json();
        if (data.success && data.orders) {
          fetchedOrders = data.orders;
        }
      }

      // Check if there's a recent pending order in localStorage that wasn't included yet
      const lastPendingId = typeof window !== 'undefined' ? localStorage.getItem('vibebooks_last_pending_order_id') : null;
      if (lastPendingId && !fetchedOrders.some(o => o.id === lastPendingId)) {
        try {
          const res = await fetch(`/api/orders?orderId=${lastPendingId}`);
          const data = await res.json();
          if (data.success && data.order) {
            fetchedOrders = [data.order, ...fetchedOrders];
          }
        } catch {}
      }

      setOrders(fetchedOrders);

      // Auto-switch to pending tab if customer has pending orders and no paid orders
      const hasPaid = fetchedOrders.some(o => o.status === 'PAID');
      const hasPending = fetchedOrders.some(o => o.status !== 'PAID');
      if (!hasPaid && hasPending) {
        setActiveTab('pending');
      }
    } catch (err) {
      console.warn('Error fetching library orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchEmail.trim()) {
      fetchUserOrders(searchEmail.trim());
    }
  };

  const handleCheckOrderApproval = async (orderId: string) => {
    setCheckingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders?orderId=${orderId}`);
      const data = await res.json();
      if (data.success && data.order) {
        if (data.order.status === 'PAID') {
          try {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          } catch {}
          alert('🎉 ยินดีด้วยครับ! พ่อค้าได้ตรวจสอบและอนุมัติสลิปเรียบร้อยแล้ว ไฟล์ถูกปลดล็อคให้ดาวน์โหลดและอ่านได้ทันที');
          setOrders(prev => prev.map(o => (o.id === orderId ? data.order : o)));
          setActiveTab('paid');
        } else {
          alert('⏳ ออเดอร์นี้กำลังรอพ่อค้าตรวจสอบยอดเงินในบัญชี กรุณารอสักครู่ (หรือกดเปิดหน้ารออนุมัติเพื่อติดตามสถานะสด)');
        }
      }
    } catch {
      alert('ไม่สามารถตรวจสอบสถานะได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setCheckingOrderId(null);
    }
  };

  const paidOrders = orders.filter((o) => o.status === 'PAID');
  const pendingOrders = orders.filter((o) => o.status !== 'PAID');

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-squircle bg-white border border-black/[0.06] shadow-level-1">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold mb-2">
            <span className="material-symbols-outlined text-[15px]">folder_special</span>
            <span>My Purchased Items</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal">
            My Library (คลังดิจิทัลของฉัน)
          </h1>
          <p className="text-xs sm:text-sm text-muted-slate mt-1">
            รวมรายการคำสั่งซื้อ E-books ดิจิทัลแอสเสท และสถานะการอนุมัติสลิปโอนเงินของคุณ
          </p>
        </div>

        {user ? (
          <div className="flex items-center gap-3 p-2 pl-3 rounded-full bg-porcelain border border-black/[0.06]">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-charcoal">{profile?.fullName}</p>
              <p className="text-[11px] text-muted-slate">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-sm">
              {profile?.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="h-10 px-5 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>เข้าสู่ระบบด้วย Google</span>
          </button>
        )}
      </div>

      {/* Manual Email Lookup Bar (for guest buyers or switched devices) */}
      <div className="p-4 rounded-squircle bg-white border border-black/[0.06] shadow-level-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-slate">
          <span className="material-symbols-outlined text-[18px] text-secondary">search</span>
          <span>ค้นหาคำสั่งซื้อด้วยอีเมล:</span>
        </div>
        <form onSubmit={handleManualSearch} className="flex-1 max-w-md flex items-center gap-2">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="กรอกอีเมลที่ใช้สั่งซื้อ (เช่น buyer@example.com)"
            className="flex-1 h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none focus:border-secondary transition-all"
          />
          <button
            type="submit"
            className="h-10 px-5 rounded-full bg-black text-white text-xs font-semibold hover:bg-charcoal transition-all shrink-0 cursor-pointer"
          >
            ค้นหา
          </button>
        </form>
      </div>

      {/* TABS SWITCHER: Approved Vault vs Pending Slip Approval */}
      <div className="flex items-center gap-3 border-b border-black/[0.08] pb-3">
        <button
          onClick={() => setActiveTab('paid')}
          className={`h-11 px-5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'paid'
              ? 'bg-black text-white shadow-sm'
              : 'bg-white hover:bg-black/[0.04] text-charcoal border border-black/[0.08]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">verified</span>
          <span>คลังหนังสือพร้อมอ่าน & ดาวน์โหลด</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'paid' ? 'bg-white/20 text-white' : 'bg-black/5 text-muted-slate'
          }`}>
            {paidOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`h-11 px-5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer relative ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white hover:bg-amber-50/50 text-amber-900 border border-amber-300/60'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">schedule</span>
          <span>รายการรอร้านค้าอนุมัติสลิป</span>
          {pendingOrders.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
          )}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'pending' ? 'bg-black/20 text-white' : 'bg-amber-500/15 text-amber-800'
          }`}>
            {pendingOrders.length}
          </span>
        </button>
      </div>

      {/* Orders & Vault Products Content */}
      {loading ? (
        <div className="p-16 text-center">
          <span className="material-symbols-outlined text-[32px] text-secondary animate-spin">
            progress_activity
          </span>
          <p className="text-xs text-muted-slate mt-2 font-mono">กำลังตรวจสอบสิทธิ์การเข้าถึงไฟล์...</p>
        </div>
      ) : activeTab === 'pending' ? (
        /* PENDING ORDERS TAB: Awaiting Merchant Approval */
        <div className="space-y-4">
          {pendingOrders.length === 0 ? (
            <div className="p-12 rounded-squircle bg-white border border-black/[0.06] shadow-level-1 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <h3 className="text-base font-bold text-charcoal">ไม่มีรายการที่รออนุมัติ</h3>
              <p className="text-xs text-muted-slate max-w-sm mx-auto">
                คำสั่งซื้อของคุณทั้งหมดได้รับการตรวจสอบและอนุมัติเรียบร้อยแล้ว สามารถดูและเปิดอ่านได้ที่แท็บ &quot;คลังหนังสือพร้อมอ่าน&quot;
              </p>
              <button
                onClick={() => setActiveTab('paid')}
                className="mt-2 px-5 py-2 rounded-full bg-black text-white text-xs font-semibold cursor-pointer"
              >
                ดูคลังหนังสือพร้อมอ่าน
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Informative Banner */}
              <div className="p-4 rounded-squircle bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
                  info
                </span>
                <div className="text-xs space-y-1">
                  <span className="font-bold block">
                    รายการด้านล่างนี้ได้แนบสลิปแล้ว กำลังรอพ่อค้าตรวจสอบยอดเงินในบัญชี
                  </span>
                  <p className="text-amber-800/80 leading-relaxed">
                    คุณสามารถกดปุ่ม <strong>&quot;เปิดหน้ารออนุมัติ (ติดตามสถานะสด)&quot;</strong> เพื่อกลับเข้าสู่หน้าห้องรอ หรือกดปุ่ม <strong>&quot;เช็คสถานะการอนุมัติ&quot;</strong> เพื่อตรวจสอบได้ตลอดเวลา เมื่อพ่อค้ากดยืนยัน รายการจะถูกย้ายเข้าสู่คลังพร้อมอ่านและดาวน์โหลดอัตโนมัติ
                  </p>
                </div>
              </div>

              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-squircle p-5 sm:p-6 border border-amber-300/40 shadow-level-1 space-y-4 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-black/[0.06] gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-charcoal">{order.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        <span>รอพ่อค้าตรวจสอบสลิป & ปล่อยไฟล์</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-slate font-mono">
                      วันที่สั่งซื้อ: {new Date(order.createdAt).toLocaleDateString('th-TH')}
                    </div>
                  </div>

                  {/* Merchant & Transfer info summary */}
                  <div className="p-3.5 rounded-2xl bg-porcelain border border-black/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <span className="text-muted-slate text-[11px] block">ร้านค้าผู้จำหน่าย:</span>
                      <span className="font-bold text-charcoal">{order.merchantName || 'Book Sangdai Official'}</span>
                    </div>
                    <div>
                      <span className="text-muted-slate text-[11px] block">บัญชีพร้อมเพย์ที่โอนเข้า:</span>
                      <span className="font-mono font-semibold text-charcoal">{order.merchantPromptPay || '-'}</span>
                    </div>
                    <div>
                      <span className="text-muted-slate text-[11px] block">ยอดเงินโอน:</span>
                      <span className="font-mono font-bold text-charcoal text-sm">฿{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Attached Slip Preview Tile */}
                  {order.slipUrl && (
                    <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded-lg bg-black/10 border border-black/10 overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={order.slipUrl || `/api/slip/${order.id}`}
                            onError={(e) => {
                              if (!e.currentTarget.src.includes('/api/slip/')) {
                                e.currentTarget.src = `/api/slip/${order.id}`;
                              }
                            }}
                            alt="Slip"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-charcoal block">สลิปที่แนบให้ร้านค้า</span>
                          <span className="text-[11px] text-muted-slate">สถานะ: พ่อค้ากำลังตรวจสอบรายการ</span>
                        </div>
                      </div>

                      <a
                        href={order.slipUrl.startsWith('data:') ? order.slipUrl : `/api/slip/${order.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-black/[0.04] text-charcoal border border-black/10 text-[11px] font-semibold flex items-center gap-1 transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        <span>ดูสลิปเต็ม</span>
                      </a>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items?.map((item: OrderItem, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-porcelain border border-black/[0.04] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="material-symbols-outlined text-amber-700 text-[22px]">
                            lock
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-charcoal truncate">{item.title}</h4>
                            <p className="text-[10px] text-muted-slate font-mono">ไฟล์: {item.fileName}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-300 text-amber-800 text-[10px] font-bold shrink-0">
                          🔒 รออนุมัติปล่อยไฟล์
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Quick Action Navigation Buttons */}
                  <div className="pt-2 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleCheckOrderApproval(order.id)}
                      disabled={checkingOrderId === order.id}
                      className="w-full sm:w-auto h-10 px-4 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-amber-300/60"
                    >
                      <span className={`material-symbols-outlined text-[15px] ${checkingOrderId === order.id ? 'animate-spin' : ''}`}>
                        sync
                      </span>
                      <span>{checkingOrderId === order.id ? 'กำลังเช็ค...' : 'เช็คสถานะการอนุมัติ'}</span>
                    </button>

                    <Link
                      href={`/order/${order.id}`}
                      className="w-full sm:w-auto h-10 px-5 rounded-full bg-black text-white hover:bg-charcoal text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                      <span>เปิดหน้ารออนุมัติ (ติดตามสถานะสด)</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* APPROVED PAID ORDERS TAB */
        paidOrders.length === 0 ? (
          <div className="p-12 rounded-squircle bg-white border border-black/[0.06] shadow-level-1 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-porcelain border border-black/[0.06] flex items-center justify-center text-muted-slate mx-auto">
              <span className="material-symbols-outlined text-[32px]">folder_open</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal">ยังไม่มีรายการที่ชำระเงินสำเร็จ</h3>
              <p className="text-xs text-muted-slate mt-1 max-w-sm mx-auto">
                {pendingOrders.length > 0
                  ? `คุณมี ${pendingOrders.length} รายการที่กำลังรอพ่อค้าตรวจสอบสลิป สามารถคลิกแท็บ "รายการรอร้านค้าอนุมัติสลิป" ด้านบนเพื่อดูรายละเอียด`
                  : 'ยังไม่พบคำสั่งซื้อสำหรับบัญชีนี้ คุณสามารถเลือกสั่งซื้อ E-book หรือ UI Kit เพื่อเริ่มต้นได้'}
              </p>
            </div>
            {pendingOrders.length > 0 ? (
              <button
                onClick={() => setActiveTab('pending')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-sm hover:bg-amber-600 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                ดูรายการรออนุมัติสลิป ({pendingOrders.length})
              </button>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-semibold shadow-sm hover:bg-charcoal transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">storefront</span>
                สำรวจแคตตาล็อกสินค้า
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {paidOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-squircle p-5 sm:p-6 border border-black/[0.06] shadow-level-1 space-y-4"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-black/[0.06] gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-charcoal">{order.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-accent-emerald/10 text-[#248a3d] text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#248a3d]" />
                      <span>PAID • ชำระเรียบร้อย & ปลดล็อกแล้ว</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-slate font-mono">
                    วันที่สั่งซื้อ: {new Date(order.createdAt).toLocaleDateString('th-TH')}
                  </div>
                </div>

                {/* Items List in this order */}
                <div className="space-y-3">
                  {order.items?.map((item: OrderItem, idx: number) => {
                    const isEbook =
                      item.fileName.endsWith('.pdf') ||
                      item.productId.includes('player') ||
                      item.productId.includes('tarot') ||
                      item.productId.includes('taskmaster');

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-squircle bg-porcelain border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-charcoal shrink-0 shadow-sm">
                            <span className="material-symbols-outlined text-[24px] text-secondary">
                              {isEbook ? 'picture_as_pdf' : 'folder_zip'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-charcoal truncate">{item.title}</h4>
                            <p className="text-[11px] text-muted-slate mt-0.5 font-mono">
                              ไฟล์: {item.fileName} {item.fileSize ? `• ${item.fileSize}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Download & View Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          {isEbook && (
                            <button
                              onClick={() =>
                                setActiveReading({
                                  orderId: order.id,
                                  bookTitle: item.title,
                                  fileName: item.fileName,
                                })
                              }
                              className="flex-1 sm:flex-initial h-10 px-4 rounded-full border border-black/10 bg-white hover:bg-black/[0.03] text-charcoal text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">menu_book</span>
                              <span>เปิดอ่าน</span>
                            </button>
                          )}

                          <a
                            href={`/api/download/${order.id}?productId=${item.productId}`}
                            className="flex-1 sm:flex-initial h-10 px-5 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            <span>ดาวน์โหลดไฟล์ Master</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Security info footer */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-muted-slate">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-accent-emerald">verified</span>
                    <span>ส่งมอบไฟล์สำเร็จ พร้อมเปิดสิทธิ์เข้าถึงตลอดเวลา</span>
                  </span>
                  <span className="font-mono font-semibold text-charcoal">
                    ฿{order.totalAmount.toLocaleString()}.00
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* In-Browser PDF Reader Modal */}
      {activeReading && (
        <ApplePdfReader
          orderId={activeReading.orderId}
          bookTitle={activeReading.bookTitle}
          fileName={activeReading.fileName}
          onClose={() => setActiveReading(null)}
        />
      )}
    </div>
  );
}
