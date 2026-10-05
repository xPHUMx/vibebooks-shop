import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { CommunityComment } from "@/types";

export const dynamic = "force-dynamic";

function mapDbCommentToComment(row: any): CommunityComment {
  return {
    id: row.id,
    userId: row.user_id,
    author: row.author,
    avatarUrl: row.avatar_url,
    avatarColor: "from-[#2c2c2e] to-[#1c1c1e]",
    role: row.role || "สมาชิกคอมมูนิตี้",
    isAuthor: row.author?.includes("เกียรติภูมิ"),
    bookId: row.book_id || "all",
    bookTitle: row.book_title || "ทั่วไป (General Discussion)",
    rating: Number(row.rating || 5),
    content: row.content,
    likes: Number(row.likes || 0),
    isVerifiedBuyer: row.is_verified_buyer !== undefined ? Boolean(row.is_verified_buyer) : true,
    createdAt: row.created_at,
  };
}

export async function GET(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const serverClient = createClient();
    const client = admin || serverClient;

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");

    let query = client.from("comments").select("*");

    if (bookId && bookId !== "all") {
      query = query.eq("book_id", bookId);
    }

    const { data: dbComments, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.warn("Notice querying Supabase comments:", error.message);
      return NextResponse.json({
        success: true,
        comments: [],
      });
    }

    const comments = (dbComments || []).map(mapDbCommentToComment);

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json(
      { success: false, comments: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const serverClient = createClient();
    const admin = createAdminClient();
    const client = admin || serverClient;

    // 1. Check user authentication (Bearer token or cookie session)
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.replace(/^Bearer\s+/i, "") || null;

    let user: any = null;
    if (bearerToken && admin) {
      try {
        const { data: tokenUser } = await admin.auth.getUser(bearerToken);
        if (tokenUser?.user) user = tokenUser.user;
      } catch (e) {}
    }
    if (!user) {
      try {
        const { data: cookieUser } = await serverClient.auth.getUser();
        if (cookieUser?.user) user = cookieUser.user;
      } catch (e) {}
    }

    const body = await req.json();
    const { author, content, bookId, bookTitle, rating, avatarUrl } = body;

    // Reject unauthenticated requests
    if (!user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนร่วมแสดงความคิดเห็นหรือให้คะแนนสินค้า" },
        { status: 401 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุข้อความความคิดเห็น" },
        { status: 400 }
      );
    }

    // 2. Fetch user profile from database
    let authorName = author?.trim() || "สมาชิกคอมมูนิตี้";
    let authorAvatar = avatarUrl || "";
    let userRole = "สมาชิกคอมมูนิตี้";
    let isAdmin = false;

    if (user.id) {
      const { data: profile } = await client
        .from("profiles")
        .select("full_name, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        authorName = profile.full_name || user.email?.split("@")[0] || authorName;
        authorAvatar = profile.avatar_url || authorAvatar;
        userRole = profile.role === "admin" ? "ผู้ดูแลระบบ (Admin)" : profile.role === "merchant" ? "ผู้ขาย (Merchant)" : "สมาชิกคอมมูนิตี้";
        if (profile.role === "admin") isAdmin = true;
      }
    }

    // 3. Verified Purchase Requirement:
    // Non-admin users can ONLY review products that they have purchased and paid for
    const targetBookId = bookId && bookId !== "all" ? bookId : null;

    if (!isAdmin) {
      if (!targetBookId) {
        return NextResponse.json(
          { error: "กรุณาเลือกสินค้าที่คุณสั่งซื้อแล้วเพื่อทำการเขียนรีวิว" },
          { status: 400 }
        );
      }

      // Check if user has an order with status 'PAID' for this bookId
      let hasPurchased = false;

      // Query paid orders for this user by user_id or email
      let orderQuery = client.from("orders").select("id, book_id, status").eq("status", "PAID");
      if (user.id && user.email) {
        orderQuery = orderQuery.or(`user_id.eq.${user.id},customer_email.eq.${user.email.trim().toLowerCase()}`);
      } else if (user.id) {
        orderQuery = orderQuery.eq("user_id", user.id);
      } else if (user.email) {
        orderQuery = orderQuery.eq("customer_email", user.email.trim().toLowerCase());
      }

      const { data: paidOrders } = await orderQuery;

      if (paidOrders && paidOrders.length > 0) {
        // Direct match on orders.book_id
        if (paidOrders.some((o: any) => o.book_id === targetBookId)) {
          hasPurchased = true;
        } else {
          // Check order_items table
          const paidOrderIds = paidOrders.map((o: any) => o.id);
          const { data: matchingItems } = await client
            .from("order_items")
            .select("id")
            .in("order_id", paidOrderIds)
            .eq("product_id", targetBookId)
            .limit(1);

          if (matchingItems && matchingItems.length > 0) {
            hasPurchased = true;
          }
        }
      }

      if (!hasPurchased) {
        return NextResponse.json(
          {
            error: "ไม่สามารถเขียนรีวิวได้: คุณสามารถรีวิวได้เฉพาะสินค้าที่คุณสั่งซื้อและชำระเงินเรียบร้อยแล้วเท่านั้น (Verified Purchase)",
          },
          { status: 403 }
        );
      }
    }

    const commentId = `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRow = {
      id: commentId,
      user_id: user.id,
      author: authorName,
      avatar_url: authorAvatar,
      role: userRole,
      book_id: targetBookId || "all",
      book_title: bookTitle || "ทั่วไป (General Discussion)",
      rating: Number(rating) || 5,
      content: content.trim(),
      likes: 0,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await client
      .from("comments")
      .insert(newRow)
      .select()
      .maybeSingle();

    if (insertError) {
      console.warn("Direct DB insert comments notice:", insertError.message);
      // Fallback response with the generated comment
      return NextResponse.json({
        success: true,
        comment: {
          ...mapDbCommentToComment(newRow),
          isVerifiedBuyer: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      comment: {
        ...mapDbCommentToComment(inserted || newRow),
        isVerifiedBuyer: true,
      },
    });
  } catch (error) {
    console.error("Comments POST error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถบันทึกความคิดเห็นได้" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const serverClient = createClient();
    const client = admin || serverClient;

    const body = await req.json();
    const { commentId, increment } = body;

    if (!commentId) {
      return NextResponse.json({ error: "Missing commentId" }, { status: 400 });
    }

    const incValue = increment === false ? -1 : 1;

    // Fetch current likes
    const { data: current } = await client
      .from("comments")
      .select("likes")
      .eq("id", commentId)
      .maybeSingle();

    const newLikes = Math.max(0, (current?.likes || 0) + incValue);

    await client
      .from("comments")
      .update({ likes: newLikes })
      .eq("id", commentId);

    return NextResponse.json({ success: true, likes: newLikes });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
  }
}
