"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { CommunityComment } from "@/types";
import { INITIAL_COMMENTS } from "@/lib/commentsData";
import { STUDENT_INFO, BOOKS } from "@/lib/booksData";

export default function CommunityPage() {
  const [comments, setComments] = useState<CommunityComment[]>(INITIAL_COMMENTS);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "likes" | "rating">("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Form State
  const [authorName, setAuthorName] = useState<string>("");
  const [targetBook, setTargetBook] = useState<string>("all");
  const [rating, setRating] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vibebooks_community_comments");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setComments(parsed);
        }
      }
      const savedName = localStorage.getItem("vibebooks_author_name");
      if (savedName) {
        setAuthorName(savedName);
      }
    } catch (e) {
      console.warn("Could not load comments from localStorage", e);
    }
  }, []);

  // Save to localStorage when comments change
  const saveComments = (newComments: CommunityComment[]) => {
    setComments(newComments);
    try {
      localStorage.setItem("vibebooks_community_comments", JSON.stringify(newComments));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);

    const bookObj = BOOKS.find((b) => b.id === targetBook);
    const bookTitle = bookObj ? bookObj.title : "ทั่วไป (General Discussion)";

    const newComment: CommunityComment = {
      id: `cmt-${Date.now()}`,
      author: authorName.trim() || "นักศึกษา / ผู้เยี่ยมชม",
      avatarColor: "from-[#2c2c2e] to-[#1c1c1e]",
      role: "Community Member",
      isAuthor: authorName.trim().includes("เกียรติภูมิ"),
      bookId: targetBook,
      bookTitle,
      rating,
      content: commentText.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [newComment, ...comments];
    saveComments(updated);

    if (authorName.trim()) {
      try {
        localStorage.setItem("vibebooks_author_name", authorName.trim());
      } catch (e) {}
    }

    setCommentText("");
    setIsSubmitting(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleLike = (id: string) => {
    const updated = comments.map((c) => {
      if (c.id === id) {
        const currentlyLiked = Boolean(c.likedByMe);
        return {
          ...c,
          likes: currentlyLiked ? c.likes - 1 : c.likes + 1,
          likedByMe: !currentlyLiked,
        };
      }
      return c;
    });
    saveComments(updated);
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
            VibeBooks Community.
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-[#86868b] max-w-lg leading-relaxed mb-4">
          พื้นที่แลกเปลี่ยนความคิดเห็น สถาปัตยกรรมซอฟต์แวร์ Python, PyQt6 และผลงานวิจัยเชิงวิศวกรรม
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center text-xs text-[#86868b] font-medium">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-white">forum</span>
            <span>{comments.length} ความคิดเห็น</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-amber-400 fill-current">star</span>
            <span>คะแนนเฉลี่ย 4.9 / 5.0</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2997ff]">verified</span>
            <span>Lead Architect: {STUDENT_INFO.name}</span>
          </span>
        </div>
      </section>

      {/* New Comment Submission Card (Apple Style) */}
      <div className="rounded-[24px] bg-[#161617] p-5 sm:p-7 border border-white/[0.08] shadow-xl">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-xs">
            +
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#f5f5f7]">เขียนรีวิวหรือตั้งคำถาม</h2>
            <p className="text-[11px] text-[#86868b]">ร่วมแลกเปลี่ยนในชุมชน VibeBooks</p>
          </div>
        </div>

        <form onSubmit={handlePostComment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Author Name */}
            <div>
              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
                ชื่อของคุณ หรือ นามแฝง
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="เช่น วิศวกรซอฟต์แวร์, นศ. 643321..."
                className="w-full rounded-xl bg-black border border-white/[0.08] px-3.5 py-2.5 text-xs text-[#f5f5f7] placeholder:text-[#86868b]/50 outline-none focus:border-white/25 transition-all"
              />
            </div>

            {/* Target Book / Topic */}
            <div>
              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
                หัวข้อ / เล่มหนังสือที่ต้องการรีวิว
              </label>
              <select
                value={targetBook}
                onChange={(e) => setTargetBook(e.target.value)}
                className="w-full rounded-xl bg-black border border-white/[0.08] px-3.5 py-2.5 text-xs text-[#f5f5f7] outline-none focus:border-white/25 transition-all cursor-pointer"
              >
                <option value="all">🌟 ทั่วไป / ภาพรวมระบบ (General Discussion)</option>
                <option value="media-player-pro">🎵 FastPlayer PRO (Lab 1: Multimedia)</option>
                <option value="mystic-tarot-altar">🔮 Mystic Tarot 3-Card Oracle (Lab 2: Creative AI)</option>
                <option value="taskmaster-pro">📋 TaskManagerPRO & Bento (Lab 3 & 4: Productivity)</option>
              </select>
            </div>
          </div>

          {/* Star Rating Picker */}
          <div>
            <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
              คะแนนความพึงพอใจ
            </label>
            <div className="flex items-center gap-1">
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
              className="apple-btn-primary px-6 py-2 text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}</span>
              <span className="material-symbols-outlined text-[15px]">send</span>
            </button>
          </div>
        </form>
      </div>

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

        {/* Topic Filter Chips (Apple Segmented Style) */}
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
          <button
            onClick={() => setSelectedTopic("media-player-pro")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedTopic === "media-player-pro"
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-[#161617] text-[#86868b] hover:text-white border border-white/[0.06]"
            }`}
          >
            FastPlayer (Lab 1)
          </button>
          <button
            onClick={() => setSelectedTopic("mystic-tarot-altar")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedTopic === "mystic-tarot-altar"
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-[#161617] text-[#86868b] hover:text-white border border-white/[0.06]"
            }`}
          >
            Mystic Tarot (Lab 2)
          </button>
          <button
            onClick={() => setSelectedTopic("taskmaster-pro")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedTopic === "taskmaster-pro"
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-[#161617] text-[#86868b] hover:text-white border border-white/[0.06]"
            }`}
          >
            TaskManager (Lab 3 & 4)
          </button>
        </div>
      </div>

      {/* Comments Feed */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-12 rounded-[24px] bg-[#161617] border border-white/[0.06]">
            <span className="material-symbols-outlined text-[32px] text-[#86868b] mb-2">
              chat_bubble_outline
            </span>
            <p className="text-xs text-[#86868b]">ยังไม่พบความคิดเห็นในหมวดนี้ เป็นคนแรกที่ร่วมแสดงความคิดเห็น!</p>
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

              {/* Footer: Likes and Book link */}
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
                    href={`/checkout/${comment.bookId}`}
                    className="text-[11px] text-[#2997ff] hover:underline flex items-center gap-1"
                  >
                    <span>ดู E-book เล่มนี้</span>
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
