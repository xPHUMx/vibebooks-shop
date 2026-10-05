'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Order, DigitalProduct } from '@/types';
import Link from 'next/link';
import ProductPreviewModal from '@/components/ProductPreviewModal';
import DeleteProductModal from '@/components/DeleteProductModal';
import { createClient } from '@/lib/supabase/client';

const COVER_PRESETS = [
  { name: 'Apple Glass', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80' },
  { name: 'Cyber Neon', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80' },
  { name: 'Fluid Abstract', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80' },
  { name: 'Dark Code UI', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80' },
  { name: 'Minimalist Book', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Engineering Core', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80' },
];

export default function MerchantDashboardPage() {
  const { user, profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [selectedSlipOrder, setSelectedSlipOrder] = useState<Order | null>(null);
  const [isApprovingId, setIsApprovingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  
  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState<any>('ebook');
  const [newPrice, setNewPrice] = useState(199);
  const [newOriginalPrice, setNewOriginalPrice] = useState(350);
  const [newFormat, setNewFormat] = useState('PDF Master');
  const [newFileName, setNewFileName] = useState('My_Digital_Product.pdf');
  const [newFileSize, setNewFileSize] = useState('15 MB');
  const [newCover, setNewCover] = useState(COVER_PRESETS[0].url);
  const [newDescription, setNewDescription] = useState('สินค้าดิจิทัลลิขสิทธิ์แท้พร้อมสิทธิ์ใช้งานและการส่งมอบไฟล์อัตโนมัติทันทีหลังชำระเงิน');
  const [newBadge, setNewBadge] = useState('New Release');
  const [newSamples, setNewSamples] = useState<string[]>([]);
  const [isUploadingNewCover, setIsUploadingNewCover] = useState(false);
  const [isUploadingNewSample, setIsUploadingNewSample] = useState(false);
  const [isUploadingNewFile, setIsUploadingNewFile] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Edit Product Modal State
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCategory, setEditCategory] = useState<any>('ebook');
  const [editPrice, setEditPrice] = useState(199);
  const [editOriginalPrice, setEditOriginalPrice] = useState(350);
  const [editFormat, setEditFormat] = useState('PDF Master');
  const [editFileName, setEditFileName] = useState('');
  const [editFileSize, setEditFileSize] = useState('15 MB');
  const [editCover, setEditCover] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBadge, setEditBadge] = useState('');
  const [editSamples, setEditSamples] = useState<string[]>([]);
  const [isUploadingEditCover, setIsUploadingEditCover] = useState(false);
  const [isUploadingEditSample, setIsUploadingEditSample] = useState(false);
  const [isUploadingEditFile, setIsUploadingEditFile] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewProductData, setPreviewProductData] = useState<any>(null);
  const [previewConfirmCallback, setPreviewConfirmCallback] = useState<(() => void) | null>(null);
  const [previewConfirmLabel, setPreviewConfirmLabel] = useState('ยืนยันและสร้างสินค้า');

  // Merchant Store Settings State
  const [storeName, setStoreName] = useState(profile?.storeName || '');
  const [promptPayId, setPromptPayId] = useState(profile?.promptPayId || '');
  const [storeDesc, setStoreDesc] = useState(profile?.storeDescription || '');
  const [storeLogoUrl, setStoreLogoUrl] = useState(profile?.storeLogoUrl || '');
  const [isUploadingStoreLogo, setIsUploadingStoreLogo] = useState(false);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isDemoMerchant, setIsDemoMerchant] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.storeName) setStoreName(profile.storeName);
      if (profile.promptPayId) setPromptPayId(profile.promptPayId);
      if (profile.storeDescription) setStoreDesc(profile.storeDescription);
      if (profile.storeLogoUrl) setStoreLogoUrl(profile.storeLogoUrl);
    }
  }, [profile]);

  useEffect(() => {
    const targetMerchantId = user?.id || (isDemoMerchant ? '6d9320a0-53ce-4cbf-a9e3-c62b4102c959' : null);
    if (targetMerchantId && (profile?.role === 'merchant' || profile?.role === 'admin' || isDemoMerchant)) {
      fetchOrders();
      fetchMerchantProducts(targetMerchantId);
    }
  }, [user, profile, isDemoMerchant]);

  const fetchMerchantProducts = async (overrideId?: string) => {
    const targetMerchantId = overrideId || user?.id || (isDemoMerchant ? '6d9320a0-53ce-4cbf-a9e3-c62b4102c959' : null);
    if (!targetMerchantId) return;
    try {
      const activeStoreName = storeName || profile?.storeName || (isDemoMerchant ? 'Kiattiphun Engineering Studio' : '');
      const storeParam = activeStoreName ? `&merchantName=${encodeURIComponent(activeStoreName)}` : '';
      const res = await fetch(`/api/products?merchantId=${encodeURIComponent(targetMerchantId)}${storeParam}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (e) {
      console.warn('Failed to fetch merchant products:', e);
    }
  };

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return {
          Authorization: `Bearer ${session.access_token}`,
        };
      }
    } catch {}
    return {};
  };

  const fetchOrders = async () => {
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/orders?all=true', {
        headers: {
          ...authHeaders,
        },
      });
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.warn('Failed to fetch merchant orders:', err);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    setIsApprovingId(orderId);
    try {
      const res = await fetch('/api/orders/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: 'PAID' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('✓ ตรวจสอบสลิปสำเร็จ! ระบบได้อนุมัติและเปิดสิทธิ์ส่งมอบไฟล์ให้ลูกค้าเรียบร้อยแล้ว');
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'PAID' as any, paidAt: new Date().toISOString() } : o))
        );
        setSelectedSlipOrder(null);
        setSelectedSlip(null);
      } else {
        alert(data.error || 'ไม่สามารถอนุมัติคำสั่งซื้อได้');
      }
    } catch (err) {
      console.error('Error approving order:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsApprovingId(null);
    }
  };

  // Upload handlers for Create
  const handleUploadNewCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingNewCover(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'cover');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setNewCover(data.url);
      } else {
        alert(data.error || 'ไม่สามารถอัปโหลดภาพปกได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปโหลดภาพปก');
    } finally {
      setIsUploadingNewCover(false);
    }
  };

  const handleUploadNewSample = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingNewSample(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append('file', files[i]);
        fd.append('type', 'sample');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          setNewSamples((prev) => [...prev, data.url]);
        }
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปโหลดตัวอย่างสินค้า');
    } finally {
      setIsUploadingNewSample(false);
    }
  };

  const handleUploadNewFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingNewFile(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'file');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewFileName(data.fileName);
        if (data.fileSize) setNewFileSize(data.fileSize);
        if (data.fileFormat) setNewFormat(data.fileFormat);
        alert(`✓ อัปโหลดไฟล์ส่งมอบลูกค้าสำเร็จ! (${data.fileSize})`);
      } else {
        alert(data.error || 'ไม่สามารถอัปโหลดไฟล์สินค้าได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์สินค้า');
    } finally {
      setIsUploadingNewFile(false);
    }
  };

  // Upload handlers for Edit
  const handleUploadEditCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEditCover(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'cover');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setEditCover(data.url);
      } else {
        alert(data.error || 'ไม่สามารถอัปโหลดภาพปกได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปโหลดภาพปก');
    } finally {
      setIsUploadingEditCover(false);
    }
  };

  const handleUploadEditSample = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingEditSample(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append('file', files[i]);
        fd.append('type', 'sample');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          setEditSamples((prev) => [...prev, data.url]);
        }
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปโหลดตัวอย่างสินค้า');
    } finally {
      setIsUploadingEditSample(false);
    }
  };

  const handleUploadEditFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEditFile(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'file');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditFileName(data.fileName);
        if (data.fileSize) setEditFileSize(data.fileSize);
        if (data.fileFormat) setEditFormat(data.fileFormat);
        alert(`✓ อัปโหลดไฟล์ส่งมอบลูกค้าสำเร็จ! (${data.fileSize})`);
      } else {
        alert(data.error || 'ไม่สามารถอัปโหลดไฟล์สินค้าได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์สินค้า');
    } finally {
      setIsUploadingEditFile(false);
    }
  };

  // Upload handler for Store Logo
  const handleUploadStoreLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingStoreLogo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'store-logo');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setStoreLogoUrl(data.url);
      } else {
        alert(data.error || 'ไม่สามารถอัปโหลดรูปร้านค้าได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปร้านค้า');
    } finally {
      setIsUploadingStoreLogo(false);
    }
  };

  const handleCreateProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) {
      alert('กรุณากรอกชื่อสินค้า');
      return;
    }

    const currentStoreName = storeName.trim() || profile?.storeName || 'ร้านค้าสมาชิก Book Sangdai';
    const currentPromptPay = promptPayId.trim() || profile?.promptPayId || null;
    const effectiveUserId = user?.id || (isDemoMerchant ? '6d9320a0-53ce-4cbf-a9e3-c62b4102c959' : null);

    const payload = {
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'ผลิตภัณฑ์ดิจิทัลระดับพรีเมียม',
      category: newCategory,
      price: Number(newPrice),
      originalPrice: Number(newOriginalPrice),
      fileName: newFileName,
      fileSize: newFileSize,
      fileFormat: newFormat,
      coverImage: newCover,
      description: newDescription,
      merchantId: effectiveUserId,
      merchantName: currentStoreName,
      merchantPromptPay: currentPromptPay,
      curator: profile?.fullName || 'นายเกียรติภูมิ หารศรีนาถ',
      badge: newBadge,
      previewImages: newSamples,
    };

    setIsCreatingProduct(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success && data.product) {
        setIsAddProductOpen(false);
        setIsPreviewModalOpen(false);
        setNewTitle('');
        setNewSubtitle('');
        setNewSamples([]);
        alert('เพิ่มสินค้าใหม่ลงร้านค้าสำเร็จแล้ว!');
        await fetchMerchantProducts();
        return;
      } else {
        alert(data.error || 'ไม่สามารถเพิ่มสินค้าได้');
      }
    } catch (apiErr) {
      console.warn('Create product API notice:', apiErr);
      alert('ไม่สามารถเพิ่มสินค้าได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleStartEditProduct = (prod: DigitalProduct) => {
    setEditingProduct(prod);
    setEditTitle(prod.title);
    setEditSubtitle(prod.subtitle || '');
    setEditCategory(prod.category);
    setEditPrice(prod.price);
    setEditOriginalPrice(prod.originalPrice || Math.round(prod.price * 1.5));
    setEditFormat(prod.fileFormat || 'PDF Master');
    setEditFileName(prod.fileName);
    setEditFileSize(prod.fileSize || '15 MB');
    setEditCover(prod.coverImage);
    setEditDescription(prod.description || '');
    setEditBadge(prod.badge || '');
    setEditSamples(prod.previewImages || []);
    setIsEditProductOpen(true);
  };

  const handleSaveEditProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingProduct || !editTitle.trim()) {
      alert('กรุณากรอกชื่อสินค้า');
      return;
    }

    setIsSavingEdit(true);
    try {
      const payload = {
        title: editTitle.trim(),
        subtitle: editSubtitle.trim(),
        category: editCategory,
        price: Number(editPrice),
        originalPrice: Number(editOriginalPrice),
        description: editDescription.trim(),
        fileName: editFileName.trim(),
        fileSize: editFileSize,
        fileFormat: editFormat,
        coverImage: editCover,
        badge: editBadge,
        previewImages: editSamples,
        merchantName: storeName.trim() || profile?.storeName || editingProduct.merchantName,
        merchantPromptPay: promptPayId.trim() || profile?.promptPayId || editingProduct.merchantPromptPay,
      };

      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(isDemoMerchant ? { 'x-demo-role': 'merchant' } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert(data.message || 'บันทึกการแก้ไขสินค้าเรียบร้อยแล้ว!');
        setIsEditProductOpen(false);
        setIsPreviewModalOpen(false);
        await fetchMerchantProducts();
      } else {
        alert(data.error || 'ไม่สามารถแก้ไขสินค้าได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const [productToDelete, setProductToDelete] = useState<DigitalProduct | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const handleDeleteProduct = (productId: string, productTitle: string) => {
    const prod = products.find((p) => p.id === productId) || ({
      id: productId,
      title: productTitle,
    } as DigitalProduct);
    setProductToDelete(prod);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...(isDemoMerchant ? { 'x-demo-role': 'merchant' } : {}),
        },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert(data.message || 'ลบสินค้าเรียบร้อยแล้ว');
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        setProductToDelete(null);
        await fetchMerchantProducts();
      } else {
        alert(data.error || 'ไม่สามารถลบสินค้านี้ได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateProfile({
        storeName: storeName.trim(),
        promptPayId: promptPayId.trim(),
        storeDescription: storeDesc.trim(),
        storeLogoUrl: storeLogoUrl.trim(),
      });
      setSavedSettingsSuccess(true);
      setTimeout(() => setSavedSettingsSuccess(false), 3000);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลร้านค้า');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Preview triggers
  const openNewProductPreview = () => {
    setPreviewProductData({
      title: newTitle.trim() || 'ชื่อสินค้าดิจิทัลใหม่',
      subtitle: newSubtitle.trim() || 'คำบรรยายสั้นผลิตภัณฑ์',
      category: newCategory,
      price: Number(newPrice),
      originalPrice: Number(newOriginalPrice),
      coverImage: newCover,
      previewImages: newSamples,
      fileName: newFileName,
      fileSize: newFileSize,
      fileFormat: newFormat,
      merchantName: storeName || profile?.storeName || 'ร้านค้าของคุณ',
      description: newDescription,
      badge: newBadge,
    });
    setPreviewConfirmLabel('ยืนยันและสร้างสินค้าทันที');
    setPreviewConfirmCallback(() => () => {
      handleCreateProduct();
    });
    setIsPreviewModalOpen(true);
  };

  const openEditProductPreview = () => {
    setPreviewProductData({
      title: editTitle.trim() || 'ชื่อสินค้าดิจิทัล',
      subtitle: editSubtitle.trim() || '',
      category: editCategory,
      price: Number(editPrice),
      originalPrice: Number(editOriginalPrice),
      coverImage: editCover,
      previewImages: editSamples,
      fileName: editFileName,
      fileSize: editFileSize,
      fileFormat: editFormat,
      merchantName: storeName || profile?.storeName || 'ร้านค้าของคุณ',
      description: editDescription,
      badge: editBadge,
    });
    setPreviewConfirmLabel('ยืนยันบันทึกการแก้ไข');
    setPreviewConfirmCallback(() => () => {
      handleSaveEditProduct();
    });
    setIsPreviewModalOpen(true);
  };

  const isMerchantOrAdmin = profile?.role === 'merchant' || profile?.role === 'admin' || isDemoMerchant;

  if (!isMerchantOrAdmin) {
    if (profile?.merchantStatus === 'PENDING') {
      return (
        <div className="max-w-xl mx-auto py-16 px-4 text-center animate-fade-in">
          <div className="p-8 rounded-squircle bg-white border border-amber-200 shadow-level-2 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center mx-auto text-3xl">
              ⏳
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 text-xs font-bold uppercase tracking-wider">
                รอการอนุมัติ (Pending Approval)
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal mt-3">
                คำขอเปิดร้านค้าของคุณกำลังอยู่ระหว่างการตรวจสอบ
              </h1>
              <p className="text-xs sm:text-sm text-muted-slate mt-2 leading-relaxed">
                ระบบได้รับข้อมูลร้านค้า <strong>{profile.storeName || 'ร้านค้าของคุณ'}</strong> เรียบร้อยแล้ว ขณะนี้กำลังรอผู้ดูแลระบบ (Admin) ตรวจสอบและอนุมัติสิทธิ์พ่อค้า เมื่ออนุมัติแล้ว คุณจะสามารถเข้าใช้งาน Seller Centre ได้ทันที
              </p>
            </div>

            <div className="p-4 rounded-xl bg-porcelain border border-black/[0.06] text-xs text-left space-y-1">
              <div className="flex justify-between text-muted-slate">
                <span>ชื่อร้านค้า:</span>
                <span className="font-bold text-charcoal">{profile.storeName || '-'}</span>
              </div>
              <div className="flex justify-between text-muted-slate">
                <span>เบอร์พร้อมเพย์รับเงิน:</span>
                <span className="font-mono text-charcoal">{profile.promptPayId || '-'}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/profile"
                className="h-11 px-6 rounded-full bg-black text-white hover:bg-charcoal font-semibold text-xs flex items-center justify-center transition-all"
              >
                ดูโปรไฟล์ของคุณ
              </Link>
              <Link
                href="/"
                className="h-11 px-5 rounded-full border border-black/10 hover:bg-black/[0.04] text-charcoal font-semibold text-xs flex items-center justify-center transition-all"
              >
                กลับหน้าร้านค้า
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center animate-fade-in">
        <div className="p-8 rounded-squircle bg-white border border-black/[0.08] shadow-level-2 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mx-auto text-3xl">
            🏪
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal">
              พื้นที่ศูนย์ผู้ขาย (Seller Centre)
            </h1>
            <p className="text-xs sm:text-sm text-muted-slate mt-2 leading-relaxed">
              หน้านี้สำหรับร้านค้าพันธมิตรที่ได้รับการอนุมัติเท่านั้น เพื่อจัดการสินค้า ตรวจสอบสลิป และอนุมัติคำสั่งซื้อ
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="dev-demo-merchant-btn"
              onClick={() => {
                setIsDemoMerchant(true);
                setStoreName('Kiattiphun Engineering Studio');
                setPromptPayId('081-234-5678');
              }}
              className="w-full sm:w-auto h-11 px-5 rounded-full border border-dashed border-amber-500/50 hover:border-amber-600 bg-amber-500/[0.04] text-amber-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>⚡ เข้าใช้งานโหมด Merchant ทดสอบ (Kiattiphun Studio)</span>
            </button>
            <Link
              href="/profile"
              className="w-full sm:w-auto h-11 px-6 rounded-full bg-black text-white hover:bg-charcoal font-semibold text-xs flex items-center justify-center transition-all shadow-sm"
            >
              ยื่นขอเปิดร้านค้าที่หน้าโปรไฟล์
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto h-11 px-5 rounded-full border border-black/10 hover:bg-black/[0.04] text-charcoal font-semibold text-xs flex items-center justify-center transition-all"
            >
              กลับหน้าร้าน
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const targetMerchantId = user?.id || (isDemoMerchant ? '6d9320a0-53ce-4cbf-a9e3-c62b4102c959' : null);
  const currentStore = storeName || profile?.storeName;

  const storeOrders = orders.filter((o) => {
    if (profile?.role === 'admin') return true;
    if (targetMerchantId && o.merchantId === targetMerchantId) return true;
    if (currentStore && o.merchantName === currentStore) return true;
    if (products.some((p) => p.id === o.bookId || o.items?.some((it) => it.productId === p.id))) return true;
    return false;
  });

  const filteredOrders = storeOrders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  const totalRevenue = storeOrders
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingCount = storeOrders.filter((o) => o.status === 'PENDING').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white rounded-squircle border border-black/[0.06] p-6 shadow-level-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
            {storeLogoUrl ? (
              <img src={storeLogoUrl} alt="Store Logo" className="w-full h-full object-cover" />
            ) : (
              <span>🏪</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-charcoal">
                {storeName || profile?.storeName || 'ศูนย์จัดการร้านค้าพ่อค้า'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                Seller Centre
              </span>
            </div>
            <p className="text-xs text-muted-slate mt-0.5">
              พร้อมเพย์รับเงิน: <strong className="text-charcoal font-mono">{promptPayId || profile?.promptPayId || 'ยังไม่ระบุ'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex-1 sm:flex-none h-10 px-4 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>เพิ่มสินค้าใหม่</span>
          </button>
          <Link
            href="/"
            className="flex-1 sm:flex-none h-10 px-4 rounded-full border border-black/10 hover:bg-black/[0.04] text-xs font-semibold text-charcoal flex items-center justify-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span>ดูหน้าร้านหลัก</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-squircle border border-black/[0.06] p-5 shadow-level-1">
          <div className="text-xs font-semibold text-muted-slate mb-1">ยอดขายที่สำเร็จแล้ว</div>
          <div className="text-2xl sm:text-3xl font-black text-charcoal">
            ฿{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-accent-emerald font-semibold mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>รายได้จริงเข้าบัญชีพร้อมเพย์</span>
          </div>
        </div>

        <div className="bg-white rounded-squircle border border-black/[0.06] p-5 shadow-level-1">
          <div className="text-xs font-semibold text-muted-slate mb-1">ออเดอร์รอยืนยันสลิป</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {pendingCount}
          </div>
          <div className="text-[11px] text-muted-slate mt-1">
            คำสั่งซื้อรอตรวจสอบสลิปและปล่อยไฟล์
          </div>
        </div>

        <div className="bg-white rounded-squircle border border-black/[0.06] p-5 shadow-level-1">
          <div className="text-xs font-semibold text-muted-slate mb-1">สินค้าในร้านค้าของคุณ</div>
          <div className="text-2xl sm:text-3xl font-black text-charcoal">
            {products.length}
          </div>
          <div className="text-[11px] text-muted-slate mt-1">
            ผลิตภัณฑ์ดิจิทัลพร้อมจำหน่าย
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-black/[0.08] gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === 'orders' ? 'text-charcoal' : 'text-muted-slate hover:text-charcoal'
          }`}
        >
          <span>คำสั่งซื้อ & สลิปโอนเงิน ({orders.length})</span>
          {activeTab === 'orders' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === 'products' ? 'text-charcoal' : 'text-muted-slate hover:text-charcoal'
          }`}
        >
          <span>จัดการสินค้าในร้าน ({products.length})</span>
          {activeTab === 'products' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === 'settings' ? 'text-charcoal' : 'text-muted-slate hover:text-charcoal'
          }`}
        >
          <span>ตั้งค่าร้านค้า & บัญชีรับเงิน</span>
          {activeTab === 'settings' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: ORDERS & SLIP VERIFICATION */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(['ALL', 'PENDING', 'PAID'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`h-8 px-3 rounded-full text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-black text-white'
                      : 'bg-white border border-black/10 text-muted-slate hover:text-charcoal'
                  }`}
                >
                  {st === 'ALL' ? 'ทั้งหมด' : st === 'PENDING' ? 'รอยืนยัน' : 'ชำระแล้ว'}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-slate">
              พบ {filteredOrders.length} รายการ
            </span>
          </div>

          <div className="bg-white rounded-squircle border border-black/[0.06] overflow-hidden shadow-level-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-porcelain text-muted-slate font-bold uppercase tracking-wider border-b border-black/[0.06]">
                  <tr>
                    <th className="p-4">รหัสคำสั่งซื้อ</th>
                    <th className="p-4">ลูกค้า</th>
                    <th className="p-4">สินค้า</th>
                    <th className="p-4">ยอดเงิน</th>
                    <th className="p-4">สลิป</th>
                    <th className="p-4">สถานะ</th>
                    <th className="p-4 text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-slate">
                        ไม่พบรายการคำสั่งซื้อในหมวดนี้
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-black/[0.02] transition-colors">
                        <td className="p-4 font-mono font-bold text-charcoal">
                          {order.id}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-charcoal">{order.customerName}</div>
                          <div className="text-[11px] text-muted-slate">{order.customerEmail}</div>
                        </td>
                        <td className="p-4">
                          {order.items && order.items.length > 0 ? (
                            <div>
                              <div className="font-semibold text-charcoal">{order.items[0].title}</div>
                              {order.items.length > 1 && (
                                <div className="text-[11px] text-muted-slate">
                                  +{order.items.length - 1} รายการเพิ่มเติม
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-slate">{order.bookTitle || '-'}</span>
                          )}
                        </td>
                        <td className="p-4 font-black text-charcoal">
                          ฿{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="p-4">
                          {order.slipUrl ? (
                            <button
                              onClick={() => {
                                setSelectedSlipOrder(order);
                                setSelectedSlip(order.slipUrl || null);
                              }}
                              className="h-7 px-2.5 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary font-semibold text-[11px] flex items-center gap-1 transition-all"
                            >
                              <span className="material-symbols-outlined text-[13px]">image</span>
                              <span>ตรวจสลิป</span>
                            </button>
                          ) : (
                            <span className="text-muted-slate text-[11px]">ยังไม่แนบสลิป</span>
                          )}
                        </td>
                        <td className="p-4">
                          {order.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-emerald/10 text-accent-emerald font-bold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald"></span>
                              <span>ชำระสำเร็จ • ปล่อยไฟล์แล้ว</span>
                            </span>
                          ) : order.slipUrl ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 font-bold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                              <span>มีสลิปใหม่ • รออนุมัติ</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/[0.05] text-muted-slate font-medium text-[11px]">
                              <span>รอการโอนเงิน</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {order.status !== 'PAID' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {order.slipUrl && (
                                <button
                                  onClick={() => {
                                    setSelectedSlipOrder(order);
                                    setSelectedSlip(order.slipUrl || null);
                                  }}
                                  className="h-8 px-2.5 rounded-full bg-black/[0.05] hover:bg-black/10 text-charcoal font-semibold text-xs inline-flex items-center gap-1 transition-all"
                                  title="ดูสลิปและข้อมูลตรวจสอบ"
                                >
                                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                                  <span>เช็ค</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleApproveOrder(order.id)}
                                disabled={isApprovingId === order.id}
                                className="h-8 px-3 rounded-full bg-accent-emerald hover:bg-green-600 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                              >
                                <span className={`material-symbols-outlined text-[14px] ${isApprovingId === order.id ? 'animate-spin' : ''}`}>
                                  {isApprovingId === order.id ? 'progress_activity' : 'check_circle'}
                                </span>
                                <span>{isApprovingId === order.id ? 'กำลังปล่อยไฟล์...' : 'อนุมัติ & ปล่อยไฟล์'}</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-accent-emerald font-semibold flex items-center justify-end gap-1">
                              <span className="material-symbols-outlined text-[14px]">task_alt</span>
                              <span>ส่งมอบเรียบร้อย</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-squircle border border-black/[0.06]">
            <div>
              <h2 className="text-base font-bold text-charcoal">คลังผลิตภัณฑ์ดิจิทัลของร้านค้า</h2>
              <p className="text-xs text-muted-slate">จัดการราคาสินค้า รูปปก ตัวอย่างสินค้า และแก้ไขรายละเอียดของร้านคุณ</p>
            </div>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="h-10 px-4 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>เพิ่มสินค้าดิจิทัลใหม่</span>
            </button>
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center rounded-squircle-lg bg-white border border-black/[0.06] shadow-level-1 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-black/[0.04] text-muted-slate flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">inventory_2</span>
              </div>
              <p className="text-sm font-bold text-charcoal">ยังไม่มีสินค้าในร้านค้าของคุณ</p>
              <p className="text-xs text-muted-slate">
                คลิกปุ่ม &quot;เพิ่มสินค้าดิจิทัลใหม่&quot; เพื่อเริ่มต้นวางจำหน่าย E-book, UI Kit หรือโค้ดของคุณ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-squircle border border-black/[0.06] p-4 flex flex-col justify-between shadow-level-1 hover:border-black/20 transition-all space-y-3"
                >
                  <div className="flex gap-4 items-start">
                    <img
                      src={prod.coverImage}
                      alt={prod.title}
                      className="w-20 h-24 object-cover rounded-xl border border-black/[0.06] shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="inline-block px-2 py-0.5 rounded-full bg-black/[0.04] text-[10px] font-bold text-muted-slate uppercase">
                        {prod.category} • {prod.fileFormat || 'PDF'}
                      </div>
                      <h3 className="text-sm font-bold text-charcoal truncate">{prod.title}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-charcoal">฿{prod.price}</span>
                        <span className="text-xs text-muted-slate line-through">฿{prod.originalPrice}</span>
                      </div>
                      <div className="text-[11px] text-muted-slate font-mono truncate">
                        📁 {prod.fileName}
                      </div>
                      {prod.previewImages && prod.previewImages.length > 0 && (
                        <div className="text-[10px] text-secondary font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">collections</span>
                          <span>{prod.previewImages.length} ตัวอย่าง</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between gap-2">
                    <Link
                      href={`/products/${prod.id}`}
                      className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
                    >
                      <span>ดูหน้าร้าน</span>
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </Link>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEditProduct(prod)}
                        className="h-8 px-3 rounded-full bg-black/5 hover:bg-black/10 text-xs font-semibold text-charcoal transition-all flex items-center gap-1"
                        title="แก้ไขรายละเอียดสินค้า"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.title)}
                        className="h-8 px-2.5 rounded-full bg-accent-coral/10 hover:bg-accent-coral/20 text-xs font-semibold text-accent-coral transition-all flex items-center gap-1"
                        title="ลบสินค้านี้ (ต้องไม่มีออเดอร์ค้างส่งมอบ)"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STORE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-squircle border border-black/[0.06] p-6 sm:p-8 shadow-level-1 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-charcoal">ตั้งค่าร้านค้า & บัญชีรับเงินพร้อมเพย์</h2>
            <p className="text-xs text-muted-slate mt-0.5">
              ข้อมูลนี้เป็นของร้านคุณโดยเฉพาะ จะแสดงต่อผู้ซื้อและใช้สำหรับสร้าง Dynamic PromptPay QR Code อัตโนมัติในหน้าเช็คเอาท์
            </p>
          </div>

          {savedSettingsSuccess && (
            <div className="p-3 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>บันทึกการตั้งค่าร้านค้าของคุณเรียบร้อยแล้ว!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                ชื่อร้านค้าของคุณ (Store Name) *
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="เช่น My Creative Studio"
                required
                className="w-full h-11 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs sm:text-sm text-charcoal outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Store Logo Section (SEPARATE from personal avatar) */}
            <div className="p-4 rounded-2xl bg-porcelain border border-black/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-charcoal">
                    รูปร้านค้า / โลโก้ร้านค้า (Store Logo)
                  </label>
                  <p className="text-[11px] text-muted-slate">
                    ตราสัญลักษณ์ร้านค้าของคุณที่จะแสดงที่หน้าร้าน (แยกจากรูปโปรไฟล์ส่วนตัว)
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-black/10 shrink-0 bg-white shadow-sm flex items-center justify-center">
                  {storeLogoUrl ? (
                    <img src={storeLogoUrl} alt="Store Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[24px] text-amber-700">storefront</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label className="h-9 px-3.5 rounded-full bg-white hover:bg-black/[0.04] text-charcoal border border-black/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
                  {isUploadingStoreLogo ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      <span>กำลังอัปโหลด...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">upload</span>
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
                placeholder="หรือใส่ลิงก์ URL รูปร้านค้า..."
                className="w-full h-9 rounded-full bg-white border border-black/[0.08] px-3.5 text-xs text-charcoal outline-none focus:border-secondary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                เบอร์พร้อมเพย์รับเงิน (PromptPay ID) *
              </label>
              <input
                type="text"
                value={promptPayId}
                onChange={(e) => setPromptPayId(e.target.value)}
                placeholder="เช่น 081-234-5678 หรือ 1-XXXX-XXXXX-XX-X"
                required
                className="w-full h-11 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs sm:text-sm text-charcoal font-mono outline-none focus:border-secondary transition-all"
              />
              <p className="text-[11px] text-muted-slate mt-1">
                * รองรับทั้งเบอร์โทรศัพท์ (10 หลัก) และเลขประจำตัวประชาชน (13 หลัก)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                คำอธิบายร้านค้า
              </label>
              <textarea
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
                rows={3}
                placeholder="บอกเล่าเกี่ยวกับผลิตภัณฑ์และจุดเด่นของร้านค้าคุณ..."
                className="w-full rounded-2xl bg-porcelain border border-black/[0.08] p-3 text-xs sm:text-sm text-charcoal outline-none focus:border-secondary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="h-11 px-6 rounded-full bg-black hover:bg-charcoal text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              {isSavingSettings ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </form>
        </div>
      )}

      {/* SLIP & ORDER VERIFICATION MODAL */}
      {(selectedSlip || selectedSlipOrder) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-squircle p-5 sm:p-6 max-w-lg w-full border border-black/10 shadow-level-3 space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <h3 className="font-bold text-base text-charcoal">ตรวจสอบสลิป & ปล่อยไฟล์ให้ลูกค้า</h3>
                <p className="text-xs text-muted-slate">
                  คำสั่งซื้อ: <span className="font-mono font-bold text-charcoal">{selectedSlipOrder?.id || 'ORD-VERIFY'}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedSlip(null);
                  setSelectedSlipOrder(null);
                }}
                className="p-1 rounded-full hover:bg-black/[0.06] text-muted-slate"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Merchant Account Check Info Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-700">account_balance_wallet</span>
                <span>ข้อมูลสำหรับตรวจเช็คกับแอปธนาคาร / บัญชีร้านค้า:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-muted-slate block">เบอร์พร้อมเพย์รับเงินของร้าน:</span>
                  <span className="font-mono font-bold text-charcoal">{promptPayId || profile?.promptPayId || selectedSlipOrder?.merchantPromptPay || '0808685989'}</span>
                </div>
                <div>
                  <span className="text-muted-slate block">ยอดเงินที่ต้องได้รับ:</span>
                  <span className="font-bold text-accent-emerald text-sm">฿{selectedSlipOrder ? selectedSlipOrder.totalAmount.toLocaleString() : '0'}.00</span>
                </div>
                <div>
                  <span className="text-muted-slate block">ลูกค้า:</span>
                  <span className="font-semibold text-charcoal truncate block">{selectedSlipOrder?.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-slate block">สินค้า:</span>
                  <span className="font-semibold text-charcoal truncate block">{selectedSlipOrder?.items?.[0]?.title || selectedSlipOrder?.bookTitle || 'สินค้าดิจิทัล'}</span>
                </div>
              </div>
            </div>

            {/* Slip Image Display */}
            <div className="rounded-xl overflow-hidden border border-black/[0.08] bg-black/5 max-h-[50vh] flex flex-col items-center justify-center p-2 relative group">
              {selectedSlip || selectedSlipOrder?.slipUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedSlip || selectedSlipOrder?.slipUrl || (selectedSlipOrder ? `/api/slip/${selectedSlipOrder.id}` : '')}
                    alt="Payment Slip"
                    onError={(e) => {
                      if (selectedSlipOrder && !e.currentTarget.src.includes('/api/slip/')) {
                        e.currentTarget.src = `/api/slip/${selectedSlipOrder.id}`;
                      }
                    }}
                    className="max-h-[44vh] w-auto object-contain rounded-lg shadow-sm"
                  />
                  {selectedSlipOrder && (
                    <a
                      href={selectedSlip?.startsWith('data:') ? selectedSlip : `/api/slip/${selectedSlipOrder.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 text-[11px] font-medium text-secondary hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      <span>เปิดดูสลิปขนาดเต็มในแท็บใหม่</span>
                    </a>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-muted-slate text-xs">
                  ไม่พบรูปภาพสลิป
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedSlip(null);
                  setSelectedSlipOrder(null);
                }}
                className="h-10 px-4 rounded-full border border-black/10 text-xs font-semibold text-charcoal hover:bg-black/[0.04]"
              >
                ปิดหน้าต่าง
              </button>

              {selectedSlipOrder && selectedSlipOrder.status !== 'PAID' ? (
                <button
                  type="button"
                  onClick={() => handleApproveOrder(selectedSlipOrder.id)}
                  disabled={isApprovingId === selectedSlipOrder.id}
                  className="flex-1 h-11 rounded-full bg-accent-emerald hover:bg-green-600 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isApprovingId === selectedSlipOrder.id ? 'animate-spin' : ''}`}>
                    {isApprovingId === selectedSlipOrder.id ? 'progress_activity' : 'verified'}
                  </span>
                  <span>{isApprovingId === selectedSlipOrder.id ? 'กำลังอนุมัติ...' : '✓ ยืนยันยอดเงิน & อนุมัติปล่อยไฟล์ทันที'}</span>
                </button>
              ) : (
                <div className="flex-1 h-10 rounded-full bg-accent-emerald/10 text-accent-emerald text-xs font-bold flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>คำสั่งซื้อนี้ได้รับการอนุมัติเรียบร้อยแล้ว</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-squircle p-5 sm:p-6 max-w-xl w-full border border-black/10 shadow-level-3 space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <h3 className="font-bold text-base text-charcoal">เพิ่มสินค้าดิจิทัลใหม่ลงร้านค้า</h3>
                <p className="text-xs text-muted-slate">อัปโหลดภาพปก ตัวอย่างสินค้า และไฟล์ส่งมอบลูกค้า</p>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/[0.06] text-muted-slate"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Product Basic Info */}
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">ชื่อสินค้าดิจิทัล *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น Ultimate React Native E-Book & Code"
                  className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">คำบรรยายสั้น (Subtitle)</label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="เช่น คู่มือสร้างแอปพลิเคชันฉบับเต็ม พร้อมชุดซอร์สโค้ด"
                  className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">หมวดหมู่</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-3 text-xs text-charcoal outline-none"
                  >
                    <option value="ebook">E-Books & Manuals</option>
                    <option value="figma">Figma UI Kits</option>
                    <option value="notion">Notion Systems</option>
                    <option value="code">Source Code & SaaS</option>
                    <option value="assets">3D & Visual Assets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">ป้ายกำกับ (Badge)</label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    placeholder="เช่น New Release, Best Seller"
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">ราคาจำหน่าย (บาท) *</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">ราคาเต็ม (ขีดฆ่า)</label>
                  <input
                    type="number"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(Number(e.target.value))}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none"
                  />
                </div>
              </div>

              {/* SECTION: COVER IMAGE (Upload & Presets) */}
              <div className="p-3.5 rounded-2xl bg-porcelain border border-black/[0.06] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-charcoal">
                    ภาพปกสินค้า (Product Cover Image) *
                  </label>
                  <div className="w-10 h-12 rounded-lg overflow-hidden border border-black/10 shrink-0 bg-white">
                    <img src={newCover} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="h-9 px-3.5 rounded-full bg-white hover:bg-black/[0.04] text-charcoal border border-black/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
                    {isUploadingNewCover ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        <span>กำลังอัปโหลด...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">upload</span>
                        <span>อัปโหลดภาพปก</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadNewCover}
                      disabled={isUploadingNewCover}
                      className="hidden"
                    />
                  </label>

                  <span className="text-[11px] text-muted-slate">หรือเลือกภาพปกสไตล์โมเดิร์น:</span>
                </div>

                {/* Preset covers picker */}
                <div className="grid grid-cols-6 gap-1.5">
                  {COVER_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewCover(p.url)}
                      className={`h-11 rounded-lg border-2 overflow-hidden transition-all relative ${
                        newCover === p.url ? 'border-secondary ring-2 ring-secondary/20 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={p.name}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  value={newCover}
                  onChange={(e) => setNewCover(e.target.value)}
                  placeholder="หรือวางลิงก์ URL รูปภาพหน้าปก..."
                  className="w-full h-8 rounded-full bg-white border border-black/[0.08] px-3 text-xs text-charcoal outline-none"
                />
              </div>

              {/* SECTION: PRODUCT SAMPLES (ตัวอย่างสินค้า) */}
              <div className="p-3.5 rounded-2xl bg-porcelain border border-black/[0.06] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-charcoal">
                      ตัวอย่างสินค้า (Sample Previews)
                    </label>
                    <p className="text-[11px] text-muted-slate">
                      อัปโหลดภาพตัวอย่างเนื้อหา สกรีนช็อต หรือตัวอย่างสินค้า เพื่อให้ลูกค้าได้ดูหน้าตัวอย่าง
                    </p>
                  </div>
                  <span className="text-xs font-bold text-secondary">
                    {newSamples.length} ภาพ
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="h-9 px-3.5 rounded-full bg-white hover:bg-black/[0.04] text-charcoal border border-black/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
                    {isUploadingNewSample ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        <span>กำลังอัปโหลด...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                        <span>อัปโหลดภาพตัวอย่างสินค้า</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleUploadNewSample}
                      disabled={isUploadingNewSample}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Samples Thumbnails list with delete */}
                {newSamples.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {newSamples.map((sUrl, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-xl border border-black/10 overflow-hidden shrink-0 group">
                        <img src={sUrl} alt={`Sample ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewSamples((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: MASTER PRODUCT FILE (VAULT) */}
              <div className="p-3.5 rounded-2xl bg-porcelain border border-black/[0.06] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-charcoal">
                      ไฟล์สินค้าดิจิทัลส่งมอบลูกค้า (Master File) *
                    </label>
                    <p className="text-[11px] text-muted-slate">
                      อัปโหลดไฟล์ที่ผู้ซื้อจะได้รับหลังชำระเงิน (PDF, ZIP, FIG ฯลฯ)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="h-9 px-4 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
                    {isUploadingNewFile ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>กำลังอัปโหลดไฟล์...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                        <span>อัปโหลดไฟล์ Master ส่งมอบลูกค้า</span>
                      </>
                    )}
                    <input
                      type="file"
                      onChange={handleUploadNewFile}
                      disabled={isUploadingNewFile}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-muted-slate font-mono">
                    ขนาด: {newFileSize} • {newFormat}
                  </span>
                </div>

                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="ชื่อไฟล์ในคลัง เช่น FastPlayer_PRO_Engineering.pdf"
                  className="w-full h-8 rounded-full bg-white border border-black/[0.08] px-3.5 text-xs text-charcoal font-mono outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">รายละเอียดสินค้า (Description)</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="อธิบายคุณสมบัติ สิ่งที่ผู้ซื้อจะได้รับ..."
                  className="w-full rounded-2xl bg-porcelain border border-black/[0.08] p-3 text-xs text-charcoal outline-none focus:border-secondary"
                />
              </div>

              {/* Action Buttons with Preview Popup */}
              <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={openNewProductPreview}
                  className="h-10 px-4 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>ดูหน้าตัวอย่างสินค้า</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="h-10 px-4 rounded-full border border-black/10 text-xs font-semibold text-charcoal hover:bg-black/[0.04]"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingProduct}
                    className="h-10 px-6 rounded-full bg-black text-white text-xs font-bold shadow-md hover:bg-charcoal transition-all disabled:opacity-50"
                  >
                    {isCreatingProduct ? 'กำลังสร้าง...' : 'บันทึกสร้างสินค้า'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRODUCT MODAL */}
      {isEditProductOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-squircle p-5 sm:p-6 max-w-xl w-full border border-black/10 shadow-level-3 space-y-4 animate-scale-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <h3 className="font-bold text-base text-charcoal">แก้ไขข้อมูลสินค้าดิจิทัล</h3>
                <p className="text-xs text-muted-slate">ID: {editingProduct.id}</p>
              </div>
              <button
                onClick={() => setIsEditProductOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/[0.06] text-muted-slate"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">ชื่อสินค้าดิจิทัล *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">คำบรรยายสั้น (Subtitle)</label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">หมวดหมู่</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-3 text-xs text-charcoal outline-none"
                  >
                    <option value="ebook">E-Books & Manuals</option>
                    <option value="figma">Figma UI Kits</option>
                    <option value="notion">Notion Systems</option>
                    <option value="code">Source Code & SaaS</option>
                    <option value="assets">3D & Visual Assets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">ป้ายกำกับ (Badge)</label>
                  <input
                    type="text"
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value)}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">ราคาจำหน่าย (บาท) *</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">ราคาเต็ม (ขีดฆ่า)</label>
                  <input
                    type="number"
                    value={editOriginalPrice}
                    onChange={(e) => setEditOriginalPrice(Number(e.target.value))}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none"
                  />
                </div>
              </div>

              {/* Cover Image in Edit */}
              <div className="p-3.5 rounded-2xl bg-porcelain border border-black/[0.06] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-charcoal">
                    ภาพปกสินค้า (Cover Image)
                  </label>
                  <div className="w-10 h-12 rounded-lg overflow-hidden border border-black/10 shrink-0 bg-white">
                    <img src={editCover} alt="Edit Cover" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="h-9 px-3.5 rounded-full bg-white hover:bg-black/[0.04] text-charcoal border border-black/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
                    {isUploadingEditCover ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        <span>กำลังอัปโหลด...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">upload</span>
                        <span>อัปโหลดภาพปกใหม่</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadEditCover}
                      disabled={isUploadingEditCover}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {COVER_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditCover(p.url)}
                      className={`h-11 rounded-lg border-2 overflow-hidden transition-all relative ${
                        editCover === p.url ? 'border-secondary ring-2 ring-secondary/20 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={p.name}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  className="w-full h-8 rounded-full bg-white border border-black/[0.08] px-3 text-xs text-charcoal outline-none"
                />
              </div>

              {/* Product Samples in Edit */}
              <div className="p-3.5 rounded-2xl bg-porcelain border border-black/[0.06] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-charcoal">
                    ตัวอย่างสินค้า ({editSamples.length} ภาพ)
                  </label>
                  <label className="h-8 px-3 rounded-full bg-white hover:bg-black/[0.04] text-charcoal border border-black/10 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-sm">
                    {isUploadingEditSample ? (
                      <span>กำลังอัปโหลด...</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        <span>เพิ่มภาพตัวอย่าง</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleUploadEditSample}
                      disabled={isUploadingEditSample}
                      className="hidden"
                    />
                  </label>
                </div>

                {editSamples.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {editSamples.map((sUrl, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-xl border border-black/10 overflow-hidden shrink-0 group">
                        <img src={sUrl} alt={`Edit Sample ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditSamples((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Master File in Edit */}
              <div className="p-3.5 rounded-2xl bg-porcelain border border-black/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-charcoal">
                    ไฟล์ Master ส่งมอบลูกค้า
                  </label>
                  <label className="h-8 px-3 rounded-full bg-black text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all">
                    {isUploadingEditFile ? (
                      <span>กำลังอัปโหลด...</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                        <span>อัปโหลดไฟล์ใหม่</span>
                      </>
                    )}
                    <input
                      type="file"
                      onChange={handleUploadEditFile}
                      disabled={isUploadingEditFile}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={editFileName}
                  onChange={(e) => setEditFileName(e.target.value)}
                  className="w-full h-8 rounded-full bg-white border border-black/[0.08] px-3.5 text-xs text-charcoal font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">รายละเอียดสินค้า</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-2xl bg-porcelain border border-black/[0.08] p-3 text-xs text-charcoal outline-none focus:border-secondary"
                />
              </div>

              <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={openEditProductPreview}
                  className="h-10 px-4 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>ดูหน้าตัวอย่างสินค้า</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditProductOpen(false)}
                    className="h-10 px-4 rounded-full border border-black/10 text-xs font-semibold text-charcoal hover:bg-black/[0.04]"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="h-10 px-6 rounded-full bg-black text-white text-xs font-bold shadow-md hover:bg-charcoal transition-all disabled:opacity-50"
                  >
                    {isSavingEdit ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP PREVIEW MODAL */}
      {isPreviewModalOpen && previewProductData && (
        <ProductPreviewModal
          product={previewProductData}
          confirmLabel={previewConfirmLabel}
          onClose={() => setIsPreviewModalOpen(false)}
          onConfirm={() => {
            if (previewConfirmCallback) {
              previewConfirmCallback();
            }
          }}
        />
      )}

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      <DeleteProductModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDeleteProduct}
        product={productToDelete}
        isDeleting={isDeletingProduct}
      />
    </div>
  );
}
