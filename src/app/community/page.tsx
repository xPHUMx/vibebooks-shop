"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { CommunityComment, DigitalProduct } from "@/types";
import { STUDENT_INFO } from "@/lib/booksData";
import { useAuth } from "@/context/AuthContext";

export default function CommunityPage() {
  const { user, profile, openAuthModal } = useAuth();

  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "likes" | "rating">("newest");
  const [searchQuery, setSearchQuery] = useState<string>("" );

  // Form State
  const [targetBook, setTargetBook] = useState<string>("all");
  const [rating, setRating] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Fetch real comments & products on mount
  useEffect(() => {
    fetchComments();
    fetchProducts();
  }, []);

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

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user) {
      openAuthModal();
      return;
    }

    setIsSubmitting(true);

    const productObj = products.find((p) => p.id === targetBook);
    const bookTitle = productObj ? productObj.title : "ทั่วไป (General Discussion)";

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-demo-role": profile?.role || "",
        },
        body: JSON.stringify({
          author: profile?.fullName || user.email?.split("@")[0] || "สมาชิก",
          avatarUrl: profile?.avatarUrl || "",
          content: commentText.trim(),
          bookId: targetBook,
          bookTitle,
          rating,
          demoUserId: user?.id,
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
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
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
    <div className="space-y-8 animate-fade pb-16">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-16 right-4 z-50 animate-fade-in-up bg-[#1c1c1e] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-white/15">
          <span className="material-symbols-outlined text-[18px] text-[#2997ff]">check_circle</span>
          <span className="text-xs font-semibold">โพสต์ความคิดเห็นสำเร็จเรียบร้อย</span>
        </div>
      )}

      {/* Apple-style Hero Header */}
      <section className="text-center pt-2 sm:pt-6 pb-2 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
          <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-[0.2em]">
            Developer Community & Reviews
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          <span className="bg-gradient-to-b from-white via-[#f5f5f7] to-[#86868b] bg-clip-text text-transparent">
            Book Sangdai Community.
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-[#86868b] max-w-lg leading-relaxed mb-4">
          พื้นที่แลกเปลี่ยนความคิดเห็น สถาปัตยกรรมซอฟต์แวร์ และรีวิวผลิตภัณฑ์ดิจิทัล Book Sangdai (บุ๊คสั่งได้)
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center text-xs text-[#86868b] font-medium">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-white">forum</span>
            <span>{comments.length} ความคิดเห็น</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-amber-400 fill-current">star</span>
            <span>คะแนนเฉลี่ย 5.0 / 5.0</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2997ff]">verified</span>
            <span>{STUDENT_INFO.authorFull}</span>
          </span>
        </div>
      </section>

      {/* Comment Submission Section: Login Required Guard */}
      {!user ? (
        <div className="rounded-[24px] bg-[#161617] p-6 sm:p-8 border border-white/[0.08] shadow-xl text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-[24px]">lock</span>
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-base font-bold text-[#f5f5f7]">เข้าสู่ระบบเพื่อร่วมแสดงความคิดเห็น</h2>
            <p className="text-xs text-[#86868b] mt-1.5 leading-relaxed">
              กรุณาเข้าสู่ระบบด้วย Google หรือบัญชีอีเมลของคุณ เพื่อโพสต์ข้อความรีวิว แลกเปลี่ยน หรือให้คะแนนผลิตภัณฑ์ในคอมมูนิตี้
            </p>
          </div>
          <button
            onClick={openAuthModal}
            className="apple-btn-primary px-6 py-2.5 text-xs font-semibold shadow-md inline-flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
          </button>
        </div>
      ) : (
        /* Logged-In User Comment Form */
        <div className="rounded-[24px] bg-[#161617] p-5 sm:p-7 border border-white/[0.08] shadow-xl animate-fade-in">
          <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary font-bold text-xs shrink-0">
                {profile?.fullName?.charAt(0) || user.email?.charAt(0) || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[#f5f5f7]">{profile?.fullName || "สมาชิก"}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-[10px] font-semibold text-white/70 uppercase">
                    {profile?.role || "user"}
                  </span>
                </div>
                <p className="text-[11px] text-[#86868b] truncate">{user.email}</p>
              </div>
            </div>
            <span className="text-[11px] text-accent-emerald flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>เข้าสู่ระบบแล้ว</span>
            </span>
          </div>

          <form onSubmit={handlePostComment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Book / Topic */}
              <div>
                <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
                  หัวข้อ / ผลิตภัณฑ์ที่ต้องการรีวิว
                </label>
                <select
                  value={targetBook}
                  onChange={(e) => setTargetBook(e.target.value)}
                  className="w-full rounded-xl bg-black border border-white/[0.08] px-3.5 py-2.5 text-xs text-[#f5f5f7] outline-none focus:border-white/25 transition-all cursor-pointer"
                >
                  <option value="all">🌟 ทั่วไป / ภาพรวมระบบ (General Discussion)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
                  คะแนนความพึงพอใจ
                </label>
                <div className="flex items-center gap-1 h-[41px]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 rounded-lg transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                    >
                      <span
                        className={`material-symbols-outlined text-[22px] transition-colors ${
                          star <= rating ? "text-amber-400 fill-current" : "text-white/20"
                        }`}
                      >
                        star
                      </span>
                    </button>
                  ))}
                  <span className="text-xs text-[#f5f5f7] font-semibold ml-2 font-mono">{rating} / 5</span>
                </div>
              </div>
            </div>

            {/* Text Area */}
            <div>
              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
                ข้อความความคิดเห็น
              </label>
              <textarea
                required
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="พิมพ์ข้อความรีวิว สถาปัตยกรรมโค้ด หรือข้อสงสัยทางเทคนิคที่นี่..."
                className="w-full rounded-xl bg-black border border-white/[0.08] p-3 text-xs text-[#f5f5f7] placeholder:text-[#86868b]/50 outline-none focus:border-white/25 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="apple-btn-primary px-6 py-2.5 text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}</span>
                <span className="material-symbols-outlined text-[15px]">send</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 flex items-center rounded-2xl bg-[#161617] px-4 py-2 border border-white/[0.08]">
            <span className="material-symbols-outlined text-[#86868b] text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาข้อความ หรือผู้เขียนรีวิว..."
              className="w-full bg-transparent border-none outline-none text-xs text-[#f5f5f7] placeholder:text-[#86868b]/50 ml-2.5"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[#86868b] hover:text-white"
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#86868b]">เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl bg-[#161617] border border-white/[0.08] px-3 py-1.5 text-xs text-[#f5f5f7] outline-none cursor-pointer"
            >
              <option value="newest">ใหม่ล่าสุด</option>
              <option value="likes">ยอดไลก์สูงสุด</option>
              <option value="rating">คะแนนสูงสุด</option>
            </select>
          </div>
        </div>

        {/* Topic Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setSelectedTopic("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedTopic === "all"
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-[#161617] text-[#86868b] hover:text-white border border-white/[0.06]"
            }`}
          >
            ทั้งหมด
          </button>
          {products.slice(0, 5).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedTopic(p.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer truncate max-w-[200px] ${
                selectedTopic === p.id
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-[#161617] text-[#86868b] hover:text-white border border-white/[0.06]"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Comments Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-12 rounded-[24px] bg-[#161617] border border-white/[0.06]">
            <span className="material-symbols-outlined text-[32px] text-[#86868b] mb-2">
              chat_bubble_outline
            </span>
            <p className="text-xs text-[#86868b]">ยังไม่พบความคิดเห็นในระบบ ร่วมเป็นคนแรกที่ร่วมแสดงความคิดเห็น!</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-[24px] bg-[#161617] p-5 sm:p-6 border border-white/[0.08] hover:border-white/[0.16] transition-all space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#2c2c2e] border border-white/10 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                    {comment.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-semibold text-[#f5f5f7]">
                        {comment.author}
                      </span>
                      {comment.isAuthor && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-[#0071e3]/20 text-[#2997ff] border border-[#0071e3]/30 text-[9px] font-semibold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[10px]">verified</span>
                          Lead Architect
                        </span>
                      )}
                      {comment.role && !comment.isAuthor && (
                        <span className="px-2 py-0.2 rounded-full bg-white/[0.06] text-[#86868b] text-[9px] font-medium">
                          {comment.role}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#86868b]">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`material-symbols-outlined text-[13px] ${
                        s <= comment.rating ? "text-amber-400 fill-current" : "text-white/15"
                      }`}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>

              {/* Tag / Topic */}
              {comment.bookTitle && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] text-[#a1a1a6] font-medium">
                  <span className="material-symbols-outlined text-[12px] text-[#2997ff]">bookmark</span>
                  <span>{comment.bookTitle}</span>
                </div>
              )}

              {/* Content Body */}
              <p className="text-xs sm:text-[13px] text-[#d1d1d6] leading-relaxed font-normal whitespace-pre-line">
                {comment.content}
              </p>

              {/* Footer: Likes and Product Link */}
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] text-xs">
                <button
                  type="button"
                  onClick={() => handleLike(comment.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                    comment.likedByMe
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-white/[0.04] text-[#86868b] hover:text-white border border-white/[0.06]"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[13px] ${comment.likedByMe ? "fill-current" : ""}`}>
                    favorite
                  </span>
                  <span>{comment.likes} ไลก์</span>
                </button>

                {comment.bookId && comment.bookId !== "all" && (
                  <Link
                    href={`/products/${comment.bookId}`}
                    className="text-[11px] text-[#2997ff] hover:underline flex items-center gap-1"
                  >
                    <span>ดูรายละเอียดสินค้านี้</span>
                    <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
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
