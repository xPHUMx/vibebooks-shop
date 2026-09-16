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
      avatarColor: "from-cyan-500 to-indigo-600",
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
    setTimeout(() => setShowSuccessToast(false), 3500);
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
        <div className="fixed top-20 right-4 z-50 animate-fade-in-up bg-emerald-500/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/40">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="text-xs font-bold">โพสต์ความคิดเห็นสำเร็จเรียบร้อย!</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-low/80 backdrop-blur-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
              Community & Reviews Hub
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            ชุมชนนักพัฒนาและรีวิว E-book VibeBooks
          </h1>

          <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            พื้นที่แลกเปลี่ยนความคิดเห็น เทคนิคการเขียนโค้ด Python, PyQt6, QtMultimedia, สถาปัตยกรรม Bento Grid และระบบทำนายไพ่ทาโรต์ 432Hz ตามเกณฑ์ใบงานที่ 1 - 4
          </p>

          <div className="pt-2 flex items-center gap-4 flex-wrap text-xs text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">forum</span>
              <span>{comments.length} ความคิดเห็น</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-400 text-[16px]">star</span>
              <span>คะแนนเฉลี่ย 4.95 / 5.0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
              <span>Lead Architect: {STUDENT_INFO.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Comment Submission Card */}
      <div className="rounded-3xl bg-surface-container-low/60 backdrop-blur-xl p-5 sm:p-7 border border-white/[0.08] shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-slate-950 font-bold text-sm shadow-md">
            +
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">เขียนรีวิวหรือแสดงความคิดเห็น</h2>
            <p className="text-[11px] text-on-surface-variant">ร่วมเป็นส่วนหนึ่งของชุมชน VibeBooks</p>
          </div>
        </div>

        <form onSubmit={handlePostComment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Author Name */}
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1.5">
                ชื่อของคุณ หรือ นามแฝง
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="เช่น วิศวกรซอฟต์แวร์, นศ. 643321..."
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-secondary/50 focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Target Book / Topic */}
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1.5">
                หัวข้อ / เล่มหนังสือที่ต้องการรีวิว
              </label>
              <select
                value={targetBook}
                onChange={(e) => setTargetBook(e.target.value)}
                className="w-full rounded-xl bg-[#14121d] border border-white/[0.08] px-3.5 py-2.5 text-xs text-on-surface outline-none focus:border-secondary/50 transition-all cursor-pointer"
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
            <label className="block text-[11px] font-semibold text-on-surface-variant mb-1.5">
              คะแนนความพึงพอใจ
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none"
                >
                  <span
                    className={`material-symbols-outlined text-[24px] transition-colors ${
                      star <= rating ? "text-amber-400 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "text-white/20"
                    }`}
                  >
                    star
                  </span>
                </button>
              ))}
              <span className="text-xs text-amber-300 font-bold ml-2 font-mono">{rating} / 5</span>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant mb-1.5">
              ความคิดเห็นของคุณ
            </label>
            <textarea
              required
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="พิมพ์ข้อความรีวิว สถาปัตยกรรมโค้ด หรือสอบถามแนวคิดการออกแบบซอฟต์แวร์ที่นี่..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] p-3 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-secondary/50 focus:bg-white/[0.07] transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="btn-spring inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-secondary via-cyan-400 to-primary text-slate-950 text-xs font-bold shadow-lg hover:shadow-[0_0_20px_rgba(76,215,246,0.35)] disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>{isSubmitting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 flex items-center rounded-2xl bg-white/[0.03] backdrop-blur-md px-4 py-2.5 border border-white/[0.08]">
          <span className="material-symbols-outlined text-secondary text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาข้อความ หรือผู้เขียนรีวิว..."
            className="w-full bg-transparent border-none outline-none text-xs text-on-surface placeholder:text-on-surface-variant/40 ml-2"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-white"
            >
              <span className="material-symbols-outlined text-[12px]">close</span>
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-on-surface-variant">เรียงตาม:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl bg-[#14121d] border border-white/[0.08] px-3 py-2 text-xs text-on-surface outline-none cursor-pointer"
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
          className={`filter-chip shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all btn-spring ${
            selectedTopic === "all"
              ? "bg-secondary/20 text-secondary border border-secondary/40 font-bold shadow-[0_0_12px_rgba(76,215,246,0.25)]"
              : "bg-white/[0.03] text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
          }`}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setSelectedTopic("media-player-pro")}
          className={`filter-chip shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all btn-spring ${
            selectedTopic === "media-player-pro"
              ? "bg-secondary/20 text-secondary border border-secondary/40 font-bold shadow-[0_0_12px_rgba(76,215,246,0.25)]"
              : "bg-white/[0.03] text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
          }`}
        >
          FastPlayer (Lab 1)
        </button>
        <button
          onClick={() => setSelectedTopic("mystic-tarot-altar")}
          className={`filter-chip shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all btn-spring ${
            selectedTopic === "mystic-tarot-altar"
              ? "bg-secondary/20 text-secondary border border-secondary/40 font-bold shadow-[0_0_12px_rgba(76,215,246,0.25)]"
              : "bg-white/[0.03] text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
          }`}
        >
          Mystic Tarot (Lab 2)
        </button>
        <button
          onClick={() => setSelectedTopic("taskmaster-pro")}
          className={`filter-chip shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all btn-spring ${
            selectedTopic === "taskmaster-pro"
              ? "bg-secondary/20 text-secondary border border-secondary/40 font-bold shadow-[0_0_12px_rgba(76,215,246,0.25)]"
              : "bg-white/[0.03] text-on-surface-variant hover:text-on-surface border border-white/[0.04]"
          }`}
        >
          TaskManager (Lab 3 & 4)
        </button>
      </div>

      {/* Comments Feed */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
            <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">
              chat_bubble_outline
            </span>
            <p className="text-xs text-on-surface-variant">ยังไม่พบความคิดเห็นในหมวดนี้ เป็นคนแรกที่เริ่มเขียนรีวิว!</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-3xl bg-surface-container-low/70 backdrop-blur-xl p-5 sm:p-6 border border-white/[0.08] shadow-lg transition-all hover:border-white/[0.15] space-y-3"
            >
              {/* Header: Author Info & Rating */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${
                      comment.avatarColor || "from-cyan-500 to-indigo-600"
                    } flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}
                  >
                    {comment.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-on-surface">
                        {comment.author}
                      </span>
                      {comment.isAuthor && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[10px]">verified</span>
                          Lead Architect
                        </span>
                      )}
                      {comment.role && !comment.isAuthor && (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-on-surface-variant text-[9px] font-medium">
                          {comment.role}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-on-surface-variant/60">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`material-symbols-outlined text-[14px] ${
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-secondary font-medium">
                  <span className="material-symbols-outlined text-[12px]">bookmark</span>
                  <span>{comment.bookTitle}</span>
                </div>
              )}

              {/* Content Body */}
              <p className="text-xs sm:text-[13px] text-on-surface/90 leading-relaxed font-normal whitespace-pre-line">
                {comment.content}
              </p>

              {/* Footer: Likes and Action */}
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] text-xs">
                <button
                  type="button"
                  onClick={() => handleLike(comment.id)}
                  className={`btn-spring inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                    comment.likedByMe
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                      : "bg-white/[0.04] text-on-surface-variant hover:text-white border border-white/[0.06]"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[14px] ${comment.likedByMe ? "fill-current" : ""}`}>
                    favorite
                  </span>
                  <span>{comment.likes} ไลก์</span>
                </button>

                {comment.bookId && comment.bookId !== "all" && (
                  <Link
                    href={`/checkout/${comment.bookId}`}
                    className="text-[11px] text-secondary hover:underline flex items-center gap-1"
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
