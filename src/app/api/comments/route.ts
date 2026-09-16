import { NextResponse } from "next/server";
import { INITIAL_COMMENTS } from "@/lib/commentsData";
import { CommunityComment } from "@/types";

// In-memory comments store for the server instance
let serverComments: CommunityComment[] = [...INITIAL_COMMENTS];

export async function GET() {
  return NextResponse.json({
    success: true,
    comments: serverComments,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { author, content, bookId, bookTitle, rating } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุข้อความความคิดเห็น" },
        { status: 400 }
      );
    }

    const newComment: CommunityComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: author?.trim() || "นักศึกษา / ผู้เยี่ยมชม",
      avatarColor: "from-cyan-500 to-indigo-600",
      role: "Community Member",
      isAuthor: false,
      bookId: bookId || "all",
      bookTitle: bookTitle || "General Discussion",
      rating: Number(rating) || 5,
      content: content.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    serverComments = [newComment, ...serverComments];

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process comment" },
      { status: 500 }
    );
  }
}
