'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ConsentReaderModal from '@/components/ConsentReaderModal';

export default function FirstTimeConsentModal() {
  const { user, profile, isLoading, isProfileSyncing, updateProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissedInSession, setHasDismissedInSession] = useState(false);

  useEffect(() => {
    // 1. รอให้กระบวนการ Auth และ API ซิงค์เชื่อมต่อกับ Database เสร็จสิ้น Callback กลับมาก่อน 100%
    if (isLoading || isProfileSyncing) {
      return;
    }

    // 2. หากยังไม่ได้ล็อกอิน (Guest / ผู้เยี่ยมชมทั่วไป) ปิดเสมอ ไม่เด้งบังหน้าแรก
    if (!user) {
      setIsOpen(false);
      return;
    }

    // 3. หากล็อกอินแล้วแต่ข้อมูล profile ยังโหลดไม่เสร็จ ให้รอจนกว่าจะได้ข้อมูลจริงจาก Database
    if (!profile) {
      return;
    }

    // 4. หากกดยอมรับไปแล้วในเซสชันนี้ ไม่เด้งซ้ำอีกเด็ดขาด
    if (hasDismissedInSession) {
      setIsOpen(false);
      return;
    }

    // 5. ตรวจสอบสถานะการยินยอมจริงจากฐานข้อมูล Supabase
    const hasAcceptedProfile = Boolean(profile.termsAcceptedAt);
    const hasAcceptedMetadata = Boolean(user.user_metadata?.terms_accepted_at);
    const hasAccepted = hasAcceptedProfile || hasAcceptedMetadata;

    if (!hasAccepted) {
      // ผู้ใช้ล็อกอินผ่าน Gmail ครั้งแรกที่ยังไม่เคยยินยอมข้อตกลง -> เด้ง Modal ขึ้นมา
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user, profile, isLoading, isProfileSyncing, hasDismissedInSession]);

  const handleAccept = async () => {
    // ปิดทันทีและล็อกสถานะในเซสชัน เพื่อไม่ให้เด้งซ้ำหลายรอบระหว่างรอ API
    setHasDismissedInSession(true);
    setIsOpen(false);

    const nowIso = new Date().toISOString();
    if (user?.id) {
      try {
        await updateProfile({
          termsAcceptedAt: nowIso,
          privacyAcceptedAt: nowIso,
        });
      } catch (err) {
        console.warn('Failed to update consent in profile:', err);
      }
    }
  };

  return (
    <ConsentReaderModal
      isOpen={isOpen}
      onAccept={handleAccept}
      title="ยินดีต้อนรับสู่ Book Sangdai"
      subtitle="เนื่องจากท่านเข้าสู่ระบบเป็นครั้งแรก โปรดเลื่อนอ่านและยอมรับข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัวทั้ง 2 ส่วนให้จบเพื่อเริ่มใช้งาน"
      showCloseButton={false}
    />
  );
}
