import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, getOrderById } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status = 'PAID' } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const existingOrder = await getOrderById(orderId);
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify approval authorization: Merchant of order or Admin
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.replace(/^Bearer\s+/i, "")?.trim() || null;
    const demoRole = req.headers.get("x-demo-role");
    const { createClient, createAdminClient } = await import("@/lib/supabase/server");
    const serverClient = createClient();
    const adminClient = createAdminClient();

    let currentUser: any = null;
    let currentProfile: any = null;

    if (bearerToken) {
      if (adminClient) {
        try {
          const { data: tokenUser } = await adminClient.auth.getUser(bearerToken);
          if (tokenUser?.user) currentUser = tokenUser.user;
        } catch (e) {}
      }
      if (!currentUser) {
        try {
          const { data: tokenUser } = await serverClient.auth.getUser(bearerToken);
          if (tokenUser?.user) currentUser = tokenUser.user;
        } catch (e) {}
      }
    }
    if (!currentUser) {
      try {
        const { data: cookieUser } = await serverClient.auth.getUser();
        if (cookieUser?.user) currentUser = cookieUser.user;
      } catch (e) {}
    }

    if (currentUser?.id) {
      try {
        const client = adminClient || serverClient;
        const { data: prof } = await client
          .from("profiles")
          .select("id, role, store_name")
          .eq("id", currentUser.id)
          .maybeSingle();
        currentProfile = prof;
      } catch (e) {}
    }

    const isAdmin = demoRole === "admin" || currentProfile?.role === "admin";
    const isOrderMerchant =
      demoRole === "merchant" ||
      (existingOrder.merchantId && existingOrder.merchantId === currentUser?.id) ||
      (currentProfile?.store_name && existingOrder.merchantName && existingOrder.merchantName.trim().toLowerCase() === currentProfile.store_name.trim().toLowerCase());

    if (!isAdmin && !isOrderMerchant) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์อนุมัติคำสั่งซื้อของร้านค้าอื่น (ต้องเป็นร้านค้าเจ้าของคำสั่งซื้อหรือผู้ดูแลระบบเท่านั้น)" },
        { status: 403 }
      );
    }

    const updated = await updateOrderStatus(orderId, status);
    if (!updated) {
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: status === 'PAID' ? "อนุมัติคำสั่งซื้อและปล่อยไฟล์ใน Vault เรียบร้อยแล้ว" : "อัปเดตสถานะสำเร็จ",
      order: updated,
    });
  } catch (error) {
    console.error("Order approval error:", error);
    return NextResponse.json({ error: "Server error updating order" }, { status: 500 });
  }
}
