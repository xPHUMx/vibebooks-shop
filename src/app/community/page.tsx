"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { CommunityComment, DigitalProduct, Order } from "@/types";
import { STUDENT_INFO } from "@/lib/booksData";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function CommunityPage() {
  const { user, profile, openAuthModal } = useAuth();

  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [userPaidOrders, setUserPaidOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "likes" | "rating">("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Form State
  const [targetBook, setTargetBook] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Fetch comments & products on mount
  useEffect(() => {
    fetchComments();
    fetchProducts();
  }, []);

  // When user is authenticated, fetch their paid orders to detect purchased products
  useEffect(() => {
    if (user?.email) {
      fetchUserPaidOrders(user.email);
    } else {
      setUserPaidOrders([]);
    }
  }, [user]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/comments");
      const data = await res.json();
      if (data.success && Array.isArray(data.comments)) {
        setComments(data.comments);
      }
    } catch (e) {
      console.warn("Could not load comments from API", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (e) {
      console.warn("Could not load products from API", e);
    }
  };

  const fetchUserPaidOrders = async (email: string) => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const paidOnly = data.orders.filter((o: Order) => o.status === "PAID");
        setUserPaidOrders(paidOnly);
      }
    } catch (e) {
      console.warn("Could not load user orders", e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Determine list of products that this user has actually purchased
  const purchasedProducts = useMemo(() => {
    const purchasedIds = new Set<string>();
    userPaidOrders.forEach((order) => {
      if (order.bookId) purchasedIds.add(order.bookId);
      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (item.productId) purchasedIds.add(item.productId);
        });
      }
    });

    return products.filter((p) => purchasedIds.has(p.id));
  }, [userPaidOrders, products]);

  const isAdmin = profile?.role === "admin";
  const canReviewProducts = isAdmin ? products : purchasedProducts;

  // Auto-select first available product when list changes and none selected
  useEffect(() => {
    if (canReviewProducts.length > 0 && (!targetBook || !canReviewProducts.some((p) => p.id === targetBook))) {
      setTargetBook(canReviewProducts[0].id);
    }
  }, [canReviewProducts, targetBook]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user) {
      openAuthModal();
      return;
    }

    if (!targetBook) {
      alert("กรุณาเลือกสินค้าที่คุณสั่งซื้อแล้วเพื่อทำการเขียนรีวิว");
      return;
    }

    setIsSubmitting(true);

    const productObj = products.find((p) => p.id === targetBook);
    const bookTitle = productObj ? productObj.title : "สินค้าดิจิทัล";

    try {
      // Retrieve active access token for bearer auth
      let authHeaders: Record<string, string> = {};
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          authHeaders.Authorization = `Bearer ${session.access_token}`;
        }
      } catch {}

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          author: profile?.fullName || user.email?.split("@")[0] || "สมาชิก",
          avatarUrl: profile?.avatarUrl || "",
          content: commentText.trim(),
          bookId: targetBook,
          bookTitle,
          rating,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentText("");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการบันทึกความคิดเห็น");
      }
    } catch (err) {
      console.error("Post comment error:", err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    const target = comments.find((c) => c.id === id);
    if (!target) return;

    const newLiked = !target.likedByMe;

    // Optimistic UI update
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            likes: newLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
            likedByMe: newLiked,
          };
        }
        return c;
      })
    );

    try {
      await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: id, increment: newLiked }),
      });
    } catch (err) {
      console.warn("Update like error:", err);
    }
  };

  const filteredComments = useMemo(() => {
    return comments
      .filter((c) => {
        const matchTopic = selectedTopic === "all" || c.bookId === selectedTopic;
        const matchSearch =
          c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.bookTitle && c.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchTopic && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === "likes") return b.likes - a.likes;
        if (sortBy === "rating") return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [comments, selectedTopic, searchQuery, sortBy]);

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8 animate-fade pb-20 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in bg-white text-charcoal px-5 py-3.5 rounded-2xl shadow-level-3 flex items-center gap-2.5 border border-black/10">
          <span className="material-symbols-outlined text-[20px] text-accent-emerald">check_circle</span>
          <div>
            <p className="text-xs font-bold text-charcoal">โพสต์รีวิวสำเร็จเรียบร้อย</p>
            <p className="text-[11px] text-muted-slate">ขอบคุณสำหรับรีวิวการใช้งานสินค้าของคุณ</p>
          </div>
        </div>
      )}

      {/* Hero Header (Minimal Apple Light Style) */}
      <section className="text-center pt-4 sm:pt-8 pb-4 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-black/[0.08] shadow-sm mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span className="text-[11px] font-bold text-muted-slate uppercase tracking-[0.18em]">
            Verified Customer Reviews
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-charcoal mb-2">
          คอมมูนิตี้และรีวิวจากผู้ใช้จริง
        </h1>

        <p className="text-xs sm:text-sm text-muted-slate max-w-xl leading-relaxed mb-4">
          พื้นที่แบ่งปันประสบการณ์การใช้งาน สถาปัตยกรรมโค้ด และรีวิวคุณภาพจากผู้สั่งซื้อสินค้าจริงบน Book Sangdai (บุ๊คสั่งได้)
        </p>

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center text-xs text-muted-slate font-medium">
          <span className="px-3 py-1 rounded-full bg-white border border-black/[0.06] shadow-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-charcoal">reviews</span>
            <span className="font-bold text-charcoal">{comments.length}</span> รีวิวทั้งหมด
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-black/[0.06] shadow-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-amber-500 fill-current">star</span>
            <span className="font-bold text-charcoal">Verified Purchase</span> 100%
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-black/[0.06] shadow-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-accent-emerald">verified</span>
            <span>{STUDENT_INFO.authorFull}</span>
          </span>
        </div>
      </section>

      {/* Review Section Guard & Form (Clean Minimal White Cards) */}
      {!user ? (
        /* 1. Unauthenticated Prompt */
        <div className="rounded-squircle bg-white p-7 sm:p-9 border border-black/[0.08] shadow-level-1 text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-porcelain text-charcoal flex items-center justify-center mx-auto shadow-sm border border-black/[0.06]">
            <span className="material-symbols-outlined text-[24px]">lock</span>
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-base font-bold text-charcoal">เข้าสู่ระบบเพื่อเขียนรีวิวสินค้าที่คุณสั่งซื้อ</h2>
            <p className="text-xs text-muted-slate mt-1.5 leading-relaxed">
              ระบบรีวิวสงวนสิทธิ์เฉพาะผู้ใช้ที่สั่งซื้อสินค้าและชำระเงินเรียบร้อยแล้ว เพื่อความน่าเชื่อถือและความโปร่งใสสูงสุด
            </p>
          </div>
          <button
            onClick={openAuthModal}
            className="h-11 px-7 rounded-full bg-black hover:bg-charcoal text-white text-xs font-bold shadow-md inline-flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[17px]">login</span>
            <span>เข้าสู่ระบบเพื่อเขียนรีวิว</span>
          </button>
        </div>
      ) : !isAdmin && purchasedProducts.length === 0 ? (
        /* 2. Authenticated but Has NOT purchased any product yet */
        <div className="rounded-squircle bg-white p-7 sm:p-9 border border-black/[0.08] shadow-level-1 text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm border border-amber-200/80">
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-base font-bold text-charcoal">คุณยังไม่มีรายการสั่งซื้อสินค้าที่สามารถรีวิวได้</h2>
            <p className="text-xs text-muted-slate leading-relaxed">
              ระบบรีวิวเปิดให้เฉพาะผู้ที่สั่งซื้อสินค้าและชำระเงินเรียบร้อยแล้วเท่านั้น เพื่อให้ทุกคะแนนและความคิดเห็นเป็นรีวิวจากผู้ใช้งานจริง (Verified Purchase)
            </p>
          </div>
          <div className="pt-1">
            <Link
              href="/"
              className="h-11 px-6 rounded-full bg-black hover:bg-charcoal text-white text-xs font-bold shadow-md inline-flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              <span>เลือกดูและสั่งซื้อสินค้าในร้านค้า</span>
            </Link>
          </div>
        </div>
      ) : (
        /* 3. Verified Buyer / Admin Review Form */
        <div className="rounded-squircle bg-white p-6 sm:p-8 border border-black/[0.08] shadow-level-1 animate-fade-in space-y-5">
          {/* User Info Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-porcelain border border-black/10 flex items-center justify-center text-charcoal font-bold text-sm shrink-0">
                {profile?.fullName?.charAt(0) || user.email?.charAt(0) || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-charcoal">{profile?.fullName || "สมาชิก"}</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    {isAdmin ? "ผู้ดูแลระบบ (Admin Review)" : "ผู้ซื้อที่ผ่านการยืนยัน (Verified Buyer)"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-slate truncate">{user.email}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-accent-emerald flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                <span>มีสิทธิ์เขียนรีวิว ({canReviewProducts.length} รายการที่สั่งซื้อ)</span>
              </span>
            </div>
          </div>

          <form onSubmit={handlePostComment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Select from Purchased Items */}
              <div>
                <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  เลือกสินค้าที่คุณสั่งซื้อแล้ว <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={targetBook}
                  onChange={(e) => setTargetBook(e.target.value)}
                  className="w-full h-11 rounded-xl bg-porcelain border border-black/[0.08] px-3.5 text-xs text-charcoal outline-none focus:border-black/30 focus:bg-white transition-all cursor-pointer font-medium"
                >
                  {canReviewProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      ✓ {p.title} (฿{p.price})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-muted-slate mt-1 block">
                  {isAdmin
                    ? "โหมดแอดมิน: สามารถรีวิวได้ทุกผลิตภัณฑ์ในคลัง"
                    : "แสดงเฉพาะผลิตภัณฑ์ที่คุณได้ชำระเงินเรียบร้อยแล้ว"}
                </span>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  คะแนนความพึงพอใจ
                </label>
                <div className="flex items-center gap-1 h-11 px-3 bg-porcelain rounded-xl border border-black/[0.08]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 rounded-lg transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                    >
                      <span
                        className={`material-symbols-outlined text-[22px] transition-colors ${
                          star <= rating ? "text-amber-500 fill-current" : "text-black/15"
                        }`}
                      >
                        star
                      </span>
                    </button>
                  ))}
                  <span className="text-xs text-charcoal font-bold ml-2 font-mono">{rating} / 5</span>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div>
              <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1.5">
                ข้อความรีวิวและข้อเสนอแนะ <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="แบ่งปันความคิดเห็น การนำไปประยุกต์ใช้งานจริง หรือข้อดีของสินค้านี้..."
                className="w-full rounded-xl bg-porcelain border border-black/[0.08] p-3.5 text-xs text-charcoal placeholder:text-muted-slate/60 outline-none focus:border-black/30 focus:bg-white transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Submit Action */}
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-muted-slate flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-accent-emerald">verified</span>
                รีวิวของคุณจะได้รับป้ายผู้ซื้อตัวจริง
              </span>

              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="h-11 px-7 rounded-full bg-black hover:bg-charcoal disabled:bg-black/20 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <span>โพสต์รีวิวสินค้า</span>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search Bar (Minimal White Pill Style) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 flex items-center rounded-2xl bg-white px-4 py-2 border border-black/[0.08] shadow-sm">
            <span className="material-symbols-outlined text-muted-slate text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารีวิว, ชื่อสินค้า หรือผู้เขียน..."
              className="w-full bg-transparent border-none outline-none text-xs text-charcoal placeholder:text-muted-slate/50 ml-2.5 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="w-5 h-5 rounded-full bg-black/[0.06] flex items-center justify-center text-muted-slate hover:text-charcoal cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-muted-slate">เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 rounded-xl bg-white border border-black/[0.08] px-3 text-xs text-charcoal outline-none shadow-sm cursor-pointer font-medium"
            >
              <option value="newest">ใหม่ล่าสุด</option>
              <option value="likes">ยอดไลก์สูงสุด</option>
              <option value="rating">คะแนนสูงสุด</option>
            </select>
          </div>
        </div>

        {/* Topic Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setSelectedTopic("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedTopic === "all"
                ? "bg-black text-white shadow-sm"
                : "bg-white text-muted-slate hover:text-charcoal border border-black/[0.08]"
            }`}
          >
            ทั้งหมด ({comments.length})
          </button>
          {products.map((p) => {
            const count = comments.filter((c) => c.bookId === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedTopic(p.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer truncate max-w-[220px] ${
                  selectedTopic === p.id
                    ? "bg-black text-white shadow-sm"
                    : "bg-white text-muted-slate hover:text-charcoal border border-black/[0.08]"
                }`}
              >
                {p.title} {count > 0 ? `(${count})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews Feed: Minimalist Pure White Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
            <p className="text-xs text-muted-slate mt-3 font-medium">กำลังโหลดรีวิวจากผู้ใช้จริง...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-16 rounded-squircle bg-white border border-black/[0.08] shadow-sm space-y-2">
            <span className="material-symbols-outlined text-[36px] text-muted-slate mb-1">
              chat_bubble_outline
            </span>
            <h3 className="text-sm font-bold text-charcoal">ยังไม่มีรีวิวในหมวดหมู่นี้</h3>
            <p className="text-xs text-muted-slate max-w-sm mx-auto">
              สั่งซื้อสินค้าเพื่อเป็นคนแรกที่รีวิวและให้คะแนนสินค้านี้ในคอมมูนิตี้
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-squircle bg-white p-5 sm:p-6 border border-black/[0.08] hover:border-black/20 hover:shadow-level-2 transition-all space-y-3.5 shadow-level-1"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-porcelain border border-black/10 flex items-center justify-center text-charcoal font-bold text-sm shrink-0">
                    {comment.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-charcoal">
                        {comment.author}
                      </span>
                      {comment.isVerifiedBuyer && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          ผู้ซื้อตัวจริง (Verified Buyer)
                        </span>
                      )}
                      {comment.isAuthor && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          Lead Architect
                        </span>
                      )}
                      {comment.role && !comment.isAuthor && (
                        <span className="px-2 py-0.5 rounded-full bg-porcelain text-muted-slate text-[10px] font-medium border border-black/[0.06]">
                          {comment.role}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-slate">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 shrink-0 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`material-symbols-outlined text-[14px] ${
                        s <= comment.rating ? "text-amber-500 fill-current" : "text-black/15"
                      }`}
                    >
                      star
                    </span>
                  ))}
                  <span className="text-[11px] font-bold text-amber-900 ml-1 font-mono">
                    {comment.rating}.0
                  </span>
                </div>
              </div>

              {/* Product Reference Pill */}
              {comment.bookTitle && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-porcelain border border-black/[0.06] text-[11px] text-charcoal font-semibold">
                  <span className="material-symbols-outlined text-[13px] text-secondary">bookmark</span>
                  <span>{comment.bookTitle}</span>
                </div>
              )}

              {/* Review Content */}
              <p className="text-xs sm:text-[13px] text-charcoal leading-relaxed font-normal whitespace-pre-line">
                {comment.content}
              </p>

              {/* Card Footer: Likes & Product Link */}
              <div className="pt-3 flex items-center justify-between border-t border-black/[0.06] text-xs">
                <button
                  type="button"
                  onClick={() => handleLike(comment.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    comment.likedByMe
                      ? "bg-rose-50 text-rose-600 border border-rose-200"
                      : "bg-black/[0.03] hover:bg-black/[0.06] text-muted-slate hover:text-charcoal border border-black/[0.06]"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[14px] ${comment.likedByMe ? "fill-current text-rose-600" : ""}`}>
                    favorite
                  </span>
                  <span>{comment.likes} ไลก์</span>
                </button>

                {comment.bookId && comment.bookId !== "all" && (
                  <Link
                    href={`/products/${comment.bookId}`}
                    className="text-xs text-secondary font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>ดูรายละเอียดสินค้า</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </Link>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
