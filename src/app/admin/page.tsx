'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DIGITAL_PRODUCTS } from '@/lib/productsData';
import { DigitalProduct, Order } from '@/types';
import { useAuth } from '@/context/AuthContext';
import DeleteProductModal from '@/components/DeleteProductModal';
import { createClient } from '@/lib/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'user' | 'merchant' | 'admin';
  merchant_status?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  merchant_applied_at?: string;
  store_name?: string;
  store_description?: string;
  promptpay_id?: string;
  created_at: string;
}

export default function AdminPage() {
  const { profile, signInWithGoogle, openAuthModal } = useAuth();

  const [products, setProducts] = useState<DigitalProduct[]>(DIGITAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [merchantApps, setMerchantApps] = useState<any[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isDemoAdmin, setIsDemoAdmin] = useState(false);
  
  const [isLoadingMerchants, setIsLoadingMerchants] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [processingAppId, setProcessingAppId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'merchants' | 'users'>('analytics');
  
  // Store-by-store filtering & search
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [productSearch, setProductSearch] = useState<string>('');
  const [userSearch, setUserSearch] = useState<string>('');

  // Product Add / Edit modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // User Edit Modal state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalRole, setUserModalRole] = useState<'user' | 'merchant' | 'admin'>('user');
  const [userModalMerchantStatus, setUserModalMerchantStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE');
  const [userModalStoreName, setUserModalStoreName] = useState('');
  const [userModalStoreDesc, setUserModalStoreDesc] = useState('');
  const [userModalPromptPay, setUserModalPromptPay] = useState('');

  // Product form fields
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState<'ebook' | 'figma' | 'notion' | 'code' | 'assets'>('ebook');
  const [formPrice, setFormPrice] = useState(199);
  const [formOriginalPrice, setFormOriginalPrice] = useState(390);
  const [formFileName, setFormFileName] = useState('New_Master_Asset.zip');
  const [formFormat, setFormFormat] = useState('ZIP + License');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('/products/apex-pro.png');
  const [formMerchantName, setFormMerchantName] = useState('Book Sangdai Official');
  const [formMerchantPromptPay, setFormMerchantPromptPay] = useState('081-234-5678');
  const [formCurator, setFormCurator] = useState('นายเกียรติภูมิ หารศรีนาถ');

  useEffect(() => {
    // Initial fetch of products
    fetchProducts();

    if (profile?.role === 'admin' || isDemoAdmin) {
      fetchOrders();
      fetchMerchants();
      fetchUsers();
    }
  }, [profile, isDemoAdmin]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders?all=true', {
        headers: { 'x-demo-role': 'admin' },
      });
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.warn('Failed to fetch orders:', err);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.products && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (err) {
      console.warn('Failed to fetch products from DB:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchMerchants = async () => {
    setIsLoadingMerchants(true);
    try {
      const res = await fetch('/api/admin/merchants', {
        headers: { 'x-demo-role': 'admin' },
      });
      const data = await res.json();
      if (data.success && data.applications) {
        setMerchantApps(data.applications);
      }
    } catch (err) {
      console.warn('Failed to fetch merchant applications:', err);
    } finally {
      setIsLoadingMerchants(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-demo-role': 'admin' },
      });
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.warn('Failed to fetch users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Distinct stores computed from products
  const stores = useMemo(() => {
    const map = new Map<string, { name: string; count: number; curator: string; promptPay?: string }>();
    products.forEach((p) => {
      const storeName = p.merchantName || 'Book Sangdai Official';
      const existing = map.get(storeName);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(storeName, {
          name: storeName,
          count: 1,
          curator: p.curator || 'ร้านค้าพาร์ทเนอร์',
          promptPay: p.merchantPromptPay,
        });
      }
    });
    return Array.from(map.values());
  }, [products]);

  // Filtered products based on search and selected store
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesStore = selectedStore === 'all' || (p.merchantName || 'Book Sangdai Official') === selectedStore;
      const matchesSearch =
        !productSearch.trim() ||
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.merchantName && p.merchantName.toLowerCase().includes(productSearch.toLowerCase())) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase());
      return matchesStore && matchesSearch;
    });
  }, [products, selectedStore, productSearch]);

  // Group filtered products by store
  const groupedProducts = useMemo(() => {
    const groups: { [storeName: string]: DigitalProduct[] } = {};
    filteredProducts.forEach((p) => {
      const sName = p.merchantName || 'Book Sangdai Official';
      if (!groups[sName]) groups[sName] = [];
      groups[sName].push(p);
    });
    return groups;
  }, [filteredProducts]);

  // Filtered users for User Management tab
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.store_name && u.store_name.toLowerCase().includes(q)) ||
        u.role.toLowerCase().includes(q)
      );
    });
  }, [users, userSearch]);

  const handleMerchantAction = async (userId: string, action: 'approve' | 'reject') => {
    setProcessingAppId(userId);
    try {
      const res = await fetch('/api/admin/merchants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': 'admin',
        },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || (action === 'approve' ? 'อนุมัติเรียบร้อยแล้ว' : 'ปฏิเสธคำขอเรียบร้อยแล้ว'));
        await fetchMerchants();
        await fetchUsers();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการดำเนินการ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setProcessingAppId(null);
    }
  };

  const handleToggleOrderStatus = async (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    try {
      const res = await fetch('/api/orders/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
      }
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
    }
  };

  // Open modal to add product in a specific store
  const handleOpenAddProduct = (storeName?: string, promptPay?: string, curator?: string) => {
    resetForm();
    if (storeName) setFormMerchantName(storeName);
    if (promptPay) setFormMerchantPromptPay(promptPay);
    if (curator) setFormCurator(curator);
    setIsProductModalOpen(true);
  };

  // Open modal to edit existing product
  const handleEditProduct = (prod: DigitalProduct) => {
    setEditingProduct(prod);
    setFormTitle(prod.title);
    setFormSubtitle(prod.subtitle || '');
    setFormCategory(prod.category as any);
    setFormPrice(prod.price);
    setFormOriginalPrice(prod.originalPrice);
    setFormFileName(prod.fileName);
    setFormFormat(prod.fileFormat || 'ZIP + License');
    setFormDescription(prod.description);
    setFormCoverImage(prod.coverImage || '/products/apex-pro.png');
    setFormMerchantName(prod.merchantName || 'Book Sangdai Official');
    setFormMerchantPromptPay(prod.merchantPromptPay || '081-234-5678');
    setFormCurator(prod.curator || 'นายเกียรติภูมิ หารศรีนาถ');
    setIsProductModalOpen(true);
  };

  // Save product (Add or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProduct(true);

    try {
      if (editingProduct) {
        // Edit existing product via PUT
        const payload = {
          title: formTitle,
          subtitle: formSubtitle,
          category: formCategory,
          price: Number(formPrice),
          originalPrice: Number(formOriginalPrice),
          fileName: formFileName,
          fileFormat: formFormat,
          description: formDescription,
          coverImage: formCoverImage,
          merchantName: formMerchantName,
          merchantPromptPay: formMerchantPromptPay,
          curator: formCurator,
        };

        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-demo-role': 'admin',
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? data.product : p))
          );
          alert('บันทึกการแก้ไขผลิตภัณฑ์เรียบร้อยแล้ว');
        } else {
          // Local optimistic update if API had warning
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editingProduct.id
                ? {
                    ...p,
                    title: formTitle,
                    subtitle: formSubtitle,
                    category: formCategory,
                    price: Number(formPrice),
                    originalPrice: Number(formOriginalPrice),
                    fileName: formFileName,
                    fileFormat: formFormat,
                    description: formDescription,
                    coverImage: formCoverImage,
                    merchantName: formMerchantName,
                    merchantPromptPay: formMerchantPromptPay,
                    curator: formCurator,
                  }
                : p
            )
          );
          alert(data.message || 'บันทึกข้อมูลเรียบร้อยแล้ว');
        }
      } else {
        // Create new product
        const newProd: DigitalProduct = {
          id: `prod-${Date.now()}`,
          title: formTitle,
          subtitle: formSubtitle || `${formFormat} Edition`,
          category: formCategory,
          categoryNameTh:
            formCategory === 'ebook'
              ? 'อีบุ๊ค & คู่มือ'
              : formCategory === 'figma'
              ? 'ดีไซน์ซิสเต็ม & Figma'
              : formCategory === 'notion'
              ? 'เทมเพลต Notion'
              : formCategory === 'code'
              ? 'ซอร์สโค้ด SaaS'
              : 'กราฟิก 3D',
          price: Number(formPrice),
          originalPrice: Number(formOriginalPrice),
          rating: 5.0,
          ratingCount: 1,
          description: formDescription,
          highlights: ['High-Performance Architecture', 'Commercial License Included'],
          features: ['Full Master Files', 'Lifetime Updates'],
          fileName: formFileName,
          fileSize: '15.4 MB',
          fileFormat: formFormat,
          coverImage: formCoverImage || '/products/apex-pro.png',
          curator: formCurator,
          merchantId: profile?.id,
          merchantName: formMerchantName,
          merchantPromptPay: formMerchantPromptPay,
        };

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProd),
        });

        const data = await res.json();
        if (data.success && data.product) {
          setProducts((prev) => [data.product, ...prev]);
        } else {
          setProducts((prev) => [newProd, ...prev]);
        }
        alert('เพิ่มผลิตภัณฑ์ดิจิทัลใหม่สำเร็จ');
      }

      setIsProductModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Save product error:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกผลิตภัณฑ์');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const [productToDelete, setProductToDelete] = useState<DigitalProduct | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Delete product with API confirmation
  const handleDeleteProduct = (id: string, title: string) => {
    const prod = products.find((p) => p.id === id) || ({ id, title } as DigitalProduct);
    setProductToDelete(prod);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      let authHeaders: Record<string, string> = {};
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          authHeaders.Authorization = `Bearer ${session.access_token}`;
        }
      } catch {}

      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        setProductToDelete(null);
        alert(data.message || 'ลบผลิตภัณฑ์ออกจากคลังเรียบร้อยแล้ว');
      } else {
        alert(data.error || 'ไม่สามารถลบผลิตภัณฑ์ได้');
      }
    } catch (e) {
      console.warn('Delete product API warning:', e);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormSubtitle('');
    setFormCategory('ebook');
    setFormPrice(199);
    setFormOriginalPrice(390);
    setFormFileName('New_Master_Asset.zip');
    setFormFormat('ZIP + License');
    setFormDescription('');
    setFormCoverImage('/products/apex-pro.png');
    setFormMerchantName('Book Sangdai Official');
    setFormMerchantPromptPay('081-234-5678');
    setFormCurator('นายเกียรติภูมิ หารศรีนาถ');
    setEditingProduct(null);
  };

  // User Management: Quick Role update
  const handleQuickRoleChange = async (userId: string, newRole: 'user' | 'merchant' | 'admin') => {
    if (!confirm(`ต้องการเปลี่ยนสิทธิ์ผู้ใช้นี้เป็น "${newRole.toUpperCase()}" หรือไม่?`)) {
      return;
    }

    setUpdatingUserId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': 'admin',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        alert(data.message || `เปลี่ยนบทบาทเป็น ${newRole} เรียบร้อยแล้ว`);
      } else {
        alert(data.error || 'ไม่สามารถเปลี่ยนบทบาทได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // User Management: Open Detailed Edit Modal
  const handleOpenEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setUserModalRole(user.role);
    setUserModalMerchantStatus(user.merchant_status || 'NONE');
    setUserModalStoreName(user.store_name || '');
    setUserModalStoreDesc(user.store_description || '');
    setUserModalPromptPay(user.promptpay_id || '');
    setIsUserModalOpen(true);
  };

  // User Management: Save Detailed User Changes
  const handleSaveUserDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdatingUserId(editingUser.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': 'admin',
        },
        body: JSON.stringify({
          userId: editingUser.id,
          role: userModalRole,
          merchantStatus: userModalMerchantStatus,
          storeName: userModalStoreName,
          storeDescription: userModalStoreDesc,
          promptPayId: userModalPromptPay,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  role: userModalRole,
                  merchant_status: userModalMerchantStatus,
                  store_name: userModalStoreName,
                  store_description: userModalStoreDesc,
                  promptpay_id: userModalPromptPay,
                }
              : u
          )
        );
        alert(data.message || 'อัปเดตข้อมูลผู้ใช้งานและสิทธิ์เรียบร้อยแล้ว');
        setIsUserModalOpen(false);
      } else {
        alert(data.error || 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // CSV Export with formula injection protection
  const exportOrdersCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Email', 'Amount (THB)', 'Status', 'Date'];
    const sanitizeCsvCell = (val: any) => {
      let str = String(val ?? '');
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = orders.map((o) => [
      sanitizeCsvCell(o.id),
      sanitizeCsvCell(o.customerName),
      sanitizeCsvCell(o.customerEmail),
      sanitizeCsvCell(o.totalAmount),
      sanitizeCsvCell(o.status),
      sanitizeCsvCell(new Date(o.createdAt).toLocaleString('th-TH')),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `book_sangdai_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export
  const exportProductsJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(products, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `book_sangdai_products_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Import
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setProducts(parsed);
            alert(`นำเข้าผลิตภัณฑ์สำเร็จ ${parsed.length} รายการ`);
          }
        } catch {
          alert('ไฟล์ JSON ไม่ถูกต้อง');
        }
      };
      reader.readAsText(file);
    }
  };

  // RBAC ACCESS CONTROL: If not authenticated or not an admin, show restricted screen
  if ((!profile || profile.role !== 'admin') && !isDemoAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 animate-fade-in">
        <div className="w-full max-w-md bg-white rounded-squircle-lg p-8 border border-black/[0.08] shadow-level-3 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-accent-coral/10 text-accent-coral flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-[36px]">lock</span>
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-accent-coral/10 text-accent-coral text-[11px] font-bold uppercase tracking-wider">
              Access Restricted
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal tracking-tight mt-2">
              Admin Authorization Required
            </h2>
            <p className="text-xs sm:text-sm text-muted-slate mt-2 leading-relaxed">
              หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ Book Sangdai กรุณาเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลเพื่อเข้าถึงคอนโซล Seller Centre
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={openAuthModal}
              className="w-full h-12 rounded-full bg-black text-white hover:bg-charcoal text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>เข้าสู่ระบบด้วยบัญชี Admin</span>
            </button>

            <button
              onClick={() => signInWithGoogle('/admin')}
              className="w-full h-12 rounded-full border border-black/10 bg-white hover:bg-black/[0.02] text-xs sm:text-sm font-semibold text-charcoal flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
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
              <span>Sign in with Google Admin</span>
            </button>

            <button
              id="dev-demo-admin-btn"
              onClick={() => setIsDemoAdmin(true)}
              className="w-full h-11 rounded-full border border-dashed border-accent-coral/40 hover:border-accent-coral bg-accent-coral/[0.04] hover:bg-accent-coral/[0.08] text-xs font-bold text-accent-coral flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <span className="material-symbols-outlined text-[17px]">shield_person</span>
              <span>เข้าใช้งานในฐานะ Admin (Dev / Demo Mode)</span>
            </button>
          </div>

          <div className="pt-2 border-t border-black/[0.06]">
            <Link
              href="/"
              className="text-xs text-secondary hover:underline font-medium inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              กลับสู่หน้าร้าน Book Sangdai
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pending merchants count
  const pendingMerchantsCount = merchantApps.filter((a) => a.merchant_status === 'PENDING').length;

  // Revenue Metrics
  const totalRevenue = orders
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const paidOrdersCount = orders.filter((o) => o.status === 'PAID').length;
  const avgOrderValue = paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0;

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Admin Top Header */}
      <div className="p-6 rounded-squircle bg-white border border-black/[0.06] shadow-level-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-coral/10 text-accent-coral text-xs font-bold mb-2">
            <span className="material-symbols-outlined text-[15px]">shield_person</span>
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal">
            Book Sangdai Seller Centre
          </h1>
          <p className="text-xs sm:text-sm text-muted-slate mt-1">
            ศูนย์จัดการยอดจำหน่าย คลังสินค้าแยกร้านค้า รายชื่อและสิทธิ์ผู้ใช้งาน (Curator: {profile?.fullName || 'ผู้ดูแลระบบ'})
          </p>
        </div>

        {/* Action Buttons: Import / Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="h-10 px-4 rounded-full border border-black/10 bg-white hover:bg-black/[0.04] text-xs font-semibold text-charcoal flex items-center gap-1.5 cursor-pointer transition-all">
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={exportProductsJSON}
            className="h-10 px-4 rounded-full border border-black/10 bg-white hover:bg-black/[0.04] text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export Products</span>
          </button>

          <button
            onClick={exportOrdersCSV}
            className="h-10 px-4 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">table_chart</span>
            <span>Export Orders (CSV)</span>
          </button>
        </div>
      </div>

      {/* Tabs Capsule Selector */}
      <div className="flex items-center gap-2 p-1.5 rounded-full bg-white border border-black/[0.06] shadow-level-1 w-fit flex-wrap">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-black text-white shadow-sm'
              : 'text-muted-slate hover:text-charcoal'
          }`}
        >
          แดชบอร์ดรายได้
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'bg-black text-white shadow-sm'
              : 'text-muted-slate hover:text-charcoal'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">storefront</span>
          <span>จัดการสินค้าตามร้านค้า ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-black text-white shadow-sm'
              : 'text-muted-slate hover:text-charcoal'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">manage_accounts</span>
          <span>จัดการผู้ใช้และสิทธิ์ ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'orders'
              ? 'bg-black text-white shadow-sm'
              : 'text-muted-slate hover:text-charcoal'
          }`}
        >
          คำสั่งซื้อ ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('merchants')}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'merchants'
              ? 'bg-black text-white shadow-sm'
              : 'text-muted-slate hover:text-charcoal'
          }`}
        >
          <span>คำขอเปิดร้านค้า</span>
          {pendingMerchantsCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-accent-coral text-white text-[10px] font-bold">
              {pendingMerchantsCount}
            </span>
          ) : (
            <span className="text-[11px] text-muted-slate">({merchantApps.length})</span>
          )}
        </button>
      </div>

      {/* TAB 1: ANALYTICS & REVENUE */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Metrics Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-squircle bg-white border border-black/[0.06] shadow-level-1">
              <span className="text-[11px] font-bold text-muted-slate uppercase tracking-wider block mb-1">
                รายได้รวมทั้งหมด
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-charcoal tabular-nums">
                ฿{totalRevenue.toLocaleString()}
              </div>
              <div className="mt-2 text-[11px] text-[#248a3d] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">trending_up</span>
                <span>+24.8% สัปดาห์นี้</span>
              </div>
            </div>

            <div className="p-5 rounded-squircle bg-white border border-black/[0.06] shadow-level-1">
              <span className="text-[11px] font-bold text-muted-slate uppercase tracking-wider block mb-1">
                คำสั่งซื้อที่ชำระแล้ว
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-charcoal tabular-nums">
                {paidOrdersCount}
              </div>
              <div className="mt-2 text-[11px] text-muted-slate">
                จากทั้งหมด {orders.length} รายการ
              </div>
            </div>

            <div className="p-5 rounded-squircle bg-white border border-black/[0.06] shadow-level-1">
              <span className="text-[11px] font-bold text-muted-slate uppercase tracking-wider block mb-1">
                ยอดเฉลี่ยต่อออเดอร์
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-charcoal tabular-nums">
                ฿{avgOrderValue.toLocaleString()}
              </div>
              <div className="mt-2 text-[11px] text-secondary font-semibold">
                Average Order Value
              </div>
            </div>

            <div className="p-5 rounded-squircle bg-white border border-black/[0.06] shadow-level-1">
              <span className="text-[11px] font-bold text-muted-slate uppercase tracking-wider block mb-1">
                ร้านค้าพาร์ทเนอร์
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-charcoal tabular-nums">
                {stores.length} ร้าน
              </div>
              <div className="mt-2 text-[11px] text-accent-emerald font-semibold">
                {products.length} ผลิตภัณฑ์ในระบบ
              </div>
            </div>
          </div>

          {/* Revenue Sparkline Visual Card */}
          <div className="p-6 sm:p-7 rounded-squircle-lg bg-white border border-black/[0.06] shadow-level-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-charcoal">Real-time Revenue Sparkline</h3>
                <p className="text-xs text-muted-slate">ยอดขายและแนวโน้มการเติบโตรายวัน</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-accent-emerald/10 text-[#248a3d] text-xs font-bold">
                Live Stream
              </span>
            </div>

            <div className="relative h-48 w-full bg-porcelain rounded-squircle p-4 border border-black/[0.06] flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0071e3" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0071e3" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,100 Q60,85 120,70 T240,40 T360,65 T440,20 T500,10 L500,120 L0,120 Z"
                  fill="url(#revenueGlow)"
                />
                <path
                  d="M0,100 Q60,85 120,70 T240,40 T360,65 T440,20 T500,10"
                  fill="none"
                  stroke="#0071e3"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORE-BY-STORE PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Controls Bar: Search & Actions */}
          <div className="p-5 rounded-squircle bg-white border border-black/[0.06] shadow-level-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                <span>จัดการสินค้าแบบแยกร้านค้า (Store-by-Store Catalog)</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
                  {stores.length} ร้านค้า
                </span>
              </h3>
              <p className="text-xs text-muted-slate">
                เลือกดูสินค้าเฉพาะร้าน เข้าไปแก้ไขหรือลบสินค้าของร้านนั้นๆ ได้อย่างอิสระ
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-muted-slate">
                  search
                </span>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อสินค้า, หมวด..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-porcelain border border-black/[0.08] text-xs text-charcoal outline-none focus:border-secondary transition-all"
                />
              </div>

              <button
                onClick={() => handleOpenAddProduct()}
                className="h-10 px-5 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>เพิ่มสินค้าใหม่</span>
              </button>
            </div>
          </div>

          {/* Store Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedStore('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedStore === 'all'
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'bg-white border border-black/[0.08] text-muted-slate hover:text-charcoal'
              }`}
            >
              <span>🏪 ทุกร้านค้า</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedStore === 'all' ? 'bg-white/20 text-white' : 'bg-black/[0.06] text-charcoal'
              }`}>
                {products.length}
              </span>
            </button>

            {stores.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelectedStore(s.name)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedStore === s.name
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-white border border-black/[0.08] text-muted-slate hover:text-charcoal'
                }`}
              >
                <span>{s.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedStore === s.name ? 'bg-white/20 text-white' : 'bg-black/[0.06] text-charcoal'
                }`}>
                  {s.count}
                </span>
              </button>
            ))}
          </div>

          {/* Store Sections */}
          {isLoadingProducts ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
            </div>
          ) : Object.keys(groupedProducts).length === 0 ? (
            <div className="p-12 text-center rounded-squircle-lg bg-white border border-black/[0.06] shadow-level-1 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-black/[0.04] text-muted-slate flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">search_off</span>
              </div>
              <p className="text-sm font-bold text-charcoal">ไม่พบผลิตภัณฑ์ตามเงื่อนไขที่ค้นหา</p>
              <p className="text-xs text-muted-slate">ลองค้นหาด้วยคำอื่น หรือเลือกแสดงร้านค้าทั้งหมด</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedProducts).map(([storeName, storeProds]) => {
                const storeInfo = stores.find((s) => s.name === storeName);
                return (
                  <div
                    key={storeName}
                    className="p-6 rounded-squircle-lg bg-white border border-black/[0.06] shadow-level-1 space-y-5"
                  >
                    {/* Store Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-charcoal text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                          <span className="material-symbols-outlined text-[24px]">storefront</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-extrabold text-charcoal">{storeName}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-bold">
                              {storeProds.length} สินค้า
                            </span>
                          </div>
                          <div className="text-xs text-muted-slate flex items-center gap-3 mt-1 flex-wrap">
                            <span>ผู้ดูแล: <strong className="text-charcoal">{storeInfo?.curator || 'นายเกียรติภูมิ หารศรีนาถ'}</strong></span>
                            {storeInfo?.promptPay && (
                              <span className="font-mono">พร้อมเพย์: <strong className="text-charcoal">{storeInfo.promptPay}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenAddProduct(storeName, storeInfo?.promptPay, storeInfo?.curator)}
                        className="h-9 px-4 rounded-full border border-black/10 hover:bg-black hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        <span>เพิ่มสินค้าในร้านนี้</span>
                      </button>
                    </div>

                    {/* Store Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {storeProds.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-porcelain/60 hover:bg-white rounded-squircle p-4 border border-black/[0.06] hover:shadow-level-2 transition-all flex flex-col justify-between space-y-4 group"
                        >
                          <div className="flex gap-3.5">
                            <div className="w-20 h-20 rounded-xl bg-porcelain border border-black/[0.08] relative overflow-hidden shrink-0 shadow-sm">
                              <Image
                                src={prod.coverImage || '/products/apex-pro.png'}
                                alt={prod.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase tracking-wider">
                                  {prod.category}
                                </span>
                                {prod.fileFormat && (
                                  <span className="text-[10px] text-muted-slate truncate">
                                    {prod.fileFormat}
                                  </span>
                                )}
                              </div>
                              <h5 className="text-xs font-bold text-charcoal truncate mt-1.5 group-hover:text-secondary transition-colors">
                                {prod.title}
                              </h5>
                              <p className="text-[11px] font-mono text-muted-slate truncate mt-0.5">
                                📁 {prod.fileName}
                              </p>
                              <div className="text-sm font-extrabold text-charcoal tabular-nums mt-1 flex items-baseline gap-1.5">
                                ฿{prod.price}
                                {prod.originalPrice > prod.price && (
                                  <span className="text-xs text-muted-slate line-through font-normal">
                                    ฿{prod.originalPrice}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/[0.05]">
                            <Link
                              href={`/products/${prod.id}`}
                              target="_blank"
                              className="h-8 px-2.5 rounded-full text-muted-slate hover:text-charcoal hover:bg-black/[0.04] text-[11px] font-semibold flex items-center gap-1 transition-all"
                              title="ดูหน้าร้านจริง"
                            >
                              <span className="material-symbols-outlined text-[15px]">visibility</span>
                              <span>ดูสินค้า</span>
                            </Link>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleEditProduct(prod)}
                                className="h-8 px-3 rounded-full border border-black/10 hover:border-black/20 bg-white hover:bg-black/[0.02] text-xs font-semibold text-charcoal flex items-center gap-1 transition-all shadow-2xs"
                              >
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                                <span>แก้ไข</span>
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.title)}
                                disabled={deletingProductId === prod.id}
                                className="h-8 px-3 rounded-full bg-accent-coral/10 hover:bg-accent-coral/20 text-xs font-semibold text-accent-coral flex items-center gap-1 transition-all disabled:opacity-50"
                              >
                                {deletingProductId === prod.id ? (
                                  <span className="w-3.5 h-3.5 border-2 border-accent-coral/30 border-t-accent-coral rounded-full animate-spin" />
                                ) : (
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                )}
                                <span>ลบ</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="p-5 rounded-squircle bg-white border border-black/[0.06] shadow-level-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                <span>รายชื่อผู้ใช้งานและการจัดการสิทธิ์ (User & Role Management)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-charcoal text-white text-xs font-bold">
                  {users.length} สมาชิก
                </span>
              </h3>
              <p className="text-xs text-muted-slate mt-0.5">
                ดูรายชื่อผู้ใช้งานทั้งหมด เลื่อนขั้นเป็น Merchant (ผู้ขาย) หรือ Admin (ผู้ดูแลระบบ) พร้อมแก้ไขข้อมูลร้านค้า
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted-slate">
                  search
                </span>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, อีเมล, สิทธิ์..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-full bg-porcelain border border-black/[0.08] text-xs text-charcoal outline-none focus:border-secondary transition-all"
                />
              </div>

              <button
                onClick={fetchUsers}
                className="h-9 px-4 rounded-full border border-black/10 bg-white hover:bg-black/[0.03] text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>รีเฟรช</span>
              </button>
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center rounded-squircle-lg bg-white border border-black/[0.06] shadow-level-1 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-black/[0.04] text-muted-slate flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">group_off</span>
              </div>
              <p className="text-sm font-bold text-charcoal">ไม่พบผู้ใช้งานตามเงื่อนไขค้นหา</p>
            </div>
          ) : (
            <div className="bg-white rounded-squircle-lg border border-black/[0.06] shadow-level-1 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-porcelain/60 text-muted-slate font-semibold">
                    <th className="py-3 px-4">ผู้ใช้งาน</th>
                    <th className="py-3 px-4">บทบาท (Role)</th>
                    <th className="py-3 px-4">สถานะร้านค้า (Merchant)</th>
                    <th className="py-3 px-4">ชื่อร้านค้า / พร้อมเพย์</th>
                    <th className="py-3 px-4">วันที่สมัคร</th>
                    <th className="py-3 px-4 text-right">การจัดการสิทธิ์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-porcelain/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-charcoal text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {u.full_name?.charAt(0) || u.email?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-charcoal">{u.full_name || 'ไม่ระบุชื่อ'}</div>
                            <div className="text-[11px] text-muted-slate font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-coral/10 text-accent-coral border border-accent-coral/20 font-bold text-[11px]">
                            <span className="material-symbols-outlined text-[13px]">shield_person</span>
                            <span>Admin</span>
                          </span>
                        ) : u.role === 'merchant' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold text-[11px]">
                            <span className="material-symbols-outlined text-[13px]">storefront</span>
                            <span>Merchant</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/[0.05] text-charcoal border border-black/10 font-bold text-[11px]">
                            <span className="material-symbols-outlined text-[13px]">person</span>
                            <span>User</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {u.merchant_status === 'APPROVED' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-bold">
                            อนุมัติแล้ว (Approved)
                          </span>
                        ) : u.merchant_status === 'PENDING' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-bold">
                            รออนุมัติ (Pending)
                          </span>
                        ) : u.merchant_status === 'REJECTED' ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 text-[10px] font-bold">
                            ปฏิเสธ (Rejected)
                          </span>
                        ) : (
                          <span className="text-muted-slate text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {u.store_name ? (
                          <div>
                            <div className="font-semibold text-charcoal">{u.store_name}</div>
                            {u.promptpay_id && (
                              <div className="text-[11px] text-muted-slate font-mono">
                                พร้อมเพย์: {u.promptpay_id}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-slate text-[11px]">ไม่มีร้านค้า</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-muted-slate">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('th-TH') : '-'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Role Switcher */}
                          <select
                            value={u.role}
                            disabled={updatingUserId === u.id}
                            onChange={(e) =>
                              handleQuickRoleChange(u.id, e.target.value as 'user' | 'merchant' | 'admin')
                            }
                            className="h-8 px-2 rounded-full border border-black/10 bg-white text-[11px] font-semibold text-charcoal outline-none cursor-pointer hover:border-black/20"
                          >
                            <option value="user">User (ลูกค้า)</option>
                            <option value="merchant">Merchant (ผู้ขาย)</option>
                            <option value="admin">Admin (ผู้ดูแล)</option>
                          </select>

                          {/* Full Edit Modal Button */}
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="h-8 px-3 rounded-full border border-black/10 hover:bg-black hover:text-white text-[11px] font-semibold text-charcoal transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[13px]">edit</span>
                            <span>แก้ไข</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-charcoal">รายการสั่งซื้อทั้งหมด (Order History)</h3>
            <span className="text-xs text-muted-slate">{orders.length} คำสั่งซื้อ</span>
          </div>

          <div className="bg-white rounded-squircle-lg border border-black/[0.06] shadow-level-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] bg-porcelain/60 text-muted-slate font-semibold">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">ลูกค้า</th>
                  <th className="py-3 px-4">ยอดเงิน</th>
                  <th className="py-3 px-4">วันที่</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-slate">
                      ยังไม่มีรายการสั่งซื้อ
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-porcelain/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-charcoal">{o.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-charcoal">{o.customerName}</div>
                        <div className="text-[11px] text-muted-slate">{o.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-charcoal tabular-nums">฿{o.totalAmount}</td>
                      <td className="py-3 px-4 text-muted-slate">
                        {new Date(o.createdAt).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'PAID'
                              ? 'bg-accent-emerald/10 text-accent-emerald'
                              : 'bg-amber-500/10 text-amber-700'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleOrderStatus(o.id, o.status)}
                          className="px-3 py-1 rounded-full border border-black/10 hover:bg-black hover:text-white transition-all text-[11px] font-semibold"
                        >
                          {o.status === 'PAID' ? 'ตั้งเป็น PENDING' : 'อนุมัติ PAID'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: MERCHANT APPLICATIONS */}
      {activeTab === 'merchants' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-squircle bg-white border border-black/[0.06] shadow-level-1">
            <div>
              <h2 className="text-lg font-bold text-charcoal">คำขอเปิดร้านค้า (Merchant Applications)</h2>
              <p className="text-xs text-muted-slate mt-0.5">
                ตรวจสอบและอนุมัติผู้ใช้งานที่ต้องการเป็นพ่อค้าจำหน่ายสินค้าดิจิทัลในระบบ Book Sangdai
              </p>
            </div>
            <button
              onClick={fetchMerchants}
              className="h-9 px-4 rounded-full border border-black/10 bg-white hover:bg-black/[0.03] text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>

          {isLoadingMerchants ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
            </div>
          ) : merchantApps.length === 0 ? (
            <div className="p-12 text-center rounded-squircle-lg bg-white border border-black/[0.06] shadow-level-1 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-black/[0.04] text-muted-slate flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">storefront</span>
              </div>
              <p className="text-sm font-bold text-charcoal">ไม่มีคำขอเปิดร้านค้าในขณะนี้</p>
              <p className="text-xs text-muted-slate">
                เมื่อผู้ใช้งานส่งแบบฟอร์มขอเป็นพ่อค้าจากหน้าโปรไฟล์ รายการจะปรากฏที่นี่เพื่อให้ Admin พิจารณาอนุมัติ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {merchantApps.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-squircle-lg bg-white border border-black/[0.06] shadow-level-1 space-y-4 hover:shadow-level-2 transition-all relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-charcoal text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {app.full_name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-charcoal">{app.full_name || 'ไม่ระบุชื่อ'}</h3>
                        <p className="text-xs text-muted-slate">{app.email}</p>
                      </div>
                    </div>
                    <div>
                      {app.merchant_status === 'PENDING' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[11px] font-bold">
                          รออนุมัติ (Pending)
                        </span>
                      )}
                      {app.merchant_status === 'APPROVED' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[11px] font-bold">
                          อนุมัติแล้ว (Approved)
                        </span>
                      )}
                      {app.merchant_status === 'REJECTED' && (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-700 border border-red-500/20 text-[11px] font-bold">
                          ปฏิเสธ (Rejected)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-porcelain border border-black/[0.04] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-slate font-medium">ชื่อร้านค้า:</span>
                      <span className="font-bold text-charcoal">{app.store_name || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-slate font-medium">พร้อมเพย์ร้านค้า:</span>
                      <span className="font-mono font-semibold text-charcoal">{app.promptpay_id || '-'}</span>
                    </div>
                    {app.store_description && (
                      <div className="pt-1.5 border-t border-black/[0.05]">
                        <span className="text-muted-slate block mb-0.5">คำอธิบายร้านค้า:</span>
                        <p className="text-charcoal leading-relaxed">{app.store_description}</p>
                      </div>
                    )}
                    {app.merchant_applied_at && (
                      <div className="pt-1 text-[11px] text-muted-slate flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        <span>ยื่นคำขอเมื่อ: {new Date(app.merchant_applied_at).toLocaleString('th-TH')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleMerchantAction(app.id, 'approve')}
                      disabled={processingAppId === app.id || app.merchant_status === 'APPROVED'}
                      className="flex-1 h-9 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px] text-accent-emerald">verified</span>
                      <span>{app.merchant_status === 'APPROVED' ? 'อนุมัติแล้ว' : 'อนุมัติเปิดร้าน'}</span>
                    </button>
                    <button
                      onClick={() => handleMerchantAction(app.id, 'reject')}
                      disabled={processingAppId === app.id || app.merchant_status === 'REJECTED'}
                      className="h-9 px-4 rounded-full border border-red-200 bg-red-50/50 hover:bg-red-50 text-xs font-semibold text-red-600 transition-all disabled:opacity-50"
                    >
                      ปฏิเสธ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsProductModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-squircle-lg p-6 shadow-level-3 border border-black/[0.08] z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-charcoal mb-4">
              {editingProduct ? 'แก้ไขข้อมูลผลิตภัณฑ์ดิจิทัล' : 'เพิ่มผลิตภัณฑ์ดิจิทัลใหม่'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">ชื่อผลิตภัณฑ์</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none focus:border-secondary"
                  placeholder="เช่น iOS 18 Design System Master"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">คำบรรยายสั้น (Subtitle)</label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none focus:border-secondary"
                  placeholder="เช่น Ultimate Figma Component Library"
                />
              </div>

              {/* Store & Curator Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">ชื่อร้านค้า (Store Name)</label>
                  <input
                    type="text"
                    required
                    value={formMerchantName}
                    onChange={(e) => setFormMerchantName(e.target.value)}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none"
                    placeholder="เช่น Apple Design System Official"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">พร้อมเพย์ร้านค้า (PromptPay)</label>
                  <input
                    type="text"
                    required
                    value={formMerchantPromptPay}
                    onChange={(e) => setFormMerchantPromptPay(e.target.value)}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none font-mono"
                    placeholder="081-234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">หมวดหมู่</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-3 text-xs text-charcoal outline-none"
                  >
                    <option value="ebook">E-Book & คู่มือ</option>
                    <option value="figma">Figma UI Kit</option>
                    <option value="notion">Notion Template</option>
                    <option value="code">Source Code SaaS</option>
                    <option value="assets">3D Assets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">รูปแบบไฟล์ (Format)</label>
                  <input
                    type="text"
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value)}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none"
                    placeholder="Figma (.fig) / PDF"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">ราคาจำหน่าย (฿)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">ราคาเต็มก่อนลด (฿)</label>
                  <input
                    type="number"
                    required
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                    className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  ชื่อไฟล์ใน Storage Bucket (digital-vault)
                </label>
                <input
                  type="text"
                  required
                  value={formFileName}
                  onChange={(e) => setFormFileName(e.target.value)}
                  className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none font-mono"
                  placeholder="เช่น iOS18_Master_Tokens.zip หรือ clean-architecture-guide.pdf"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">รูปหน้าปก (Cover Image URL)</label>
                <input
                  type="text"
                  value={formCoverImage}
                  onChange={(e) => setFormCoverImage(e.target.value)}
                  className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none"
                  placeholder="/products/apex-pro.png หรือ https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">รายละเอียดสินค้า</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-2xl bg-porcelain border border-black/[0.08] p-3 text-xs text-charcoal outline-none"
                  placeholder="อธิบายประโยชน์และฟังก์ชันการใช้งาน..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="h-10 px-5 rounded-full border border-black/10 text-xs font-semibold text-charcoal hover:bg-black/[0.04]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="h-10 px-6 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingProduct && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER EDIT MODAL */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsUserModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-squircle-lg p-6 shadow-level-3 border border-black/[0.08] z-10 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-charcoal text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {editingUser.full_name?.charAt(0) || editingUser.email?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal">
                  แก้ไขข้อมูลสิทธิ์และร้านค้า
                </h3>
                <p className="text-xs text-muted-slate font-mono">{editingUser.email}</p>
              </div>
            </div>

            <form onSubmit={handleSaveUserDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  บทบาทในระบบ (System Role)
                </label>
                <select
                  value={userModalRole}
                  onChange={(e) => setUserModalRole(e.target.value as 'user' | 'merchant' | 'admin')}
                  className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-3 text-xs text-charcoal outline-none font-semibold"
                >
                  <option value="user">User (ลูกค้าทั่วไป)</option>
                  <option value="merchant">Merchant (ผู้ขาย/เจ้าของร้านค้า)</option>
                  <option value="admin">Admin (ผู้ดูแลระบบสูงสุด)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  สถานะคำขอเปิดร้าน (Merchant Status)
                </label>
                <select
                  value={userModalMerchantStatus}
                  onChange={(e) =>
                    setUserModalMerchantStatus(e.target.value as 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED')
                  }
                  className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-3 text-xs text-charcoal outline-none"
                >
                  <option value="NONE">NONE (ไม่มีคำขอ)</option>
                  <option value="PENDING">PENDING (รอพิจารณาอนุมัติ)</option>
                  <option value="APPROVED">APPROVED (อนุมัติเป็นผู้ขายแล้ว)</option>
                  <option value="REJECTED">REJECTED (ปฏิเสธคำขอ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  ชื่อร้านค้า (Store Name)
                </label>
                <input
                  type="text"
                  value={userModalStoreName}
                  onChange={(e) => setUserModalStoreName(e.target.value)}
                  className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none"
                  placeholder="เช่น Kiattiphun Engineering Studio"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  พร้อมเพย์ร้านค้า (PromptPay ID)
                </label>
                <input
                  type="text"
                  value={userModalPromptPay}
                  onChange={(e) => setUserModalPromptPay(e.target.value)}
                  className="w-full h-10 rounded-full bg-porcelain border border-black/[0.08] px-4 text-xs text-charcoal outline-none font-mono"
                  placeholder="เช่น 081-234-5678 หรือ เลขบัตร ปชช."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  คำอธิบายร้านค้า (Store Description)
                </label>
                <textarea
                  rows={2}
                  value={userModalStoreDesc}
                  onChange={(e) => setUserModalStoreDesc(e.target.value)}
                  className="w-full rounded-2xl bg-porcelain border border-black/[0.08] p-3 text-xs text-charcoal outline-none"
                  placeholder="เกี่ยวกับร้านค้าและผลงานดิจิทัล..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="h-10 px-5 rounded-full border border-black/10 text-xs font-semibold text-charcoal hover:bg-black/[0.04]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={updatingUserId === editingUser.id}
                  className="h-10 px-6 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updatingUserId === editingUser.id && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>บันทึกการเปลี่ยนแปลง</span>
                </button>
              </div>
            </form>
          </div>
        </div>
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
