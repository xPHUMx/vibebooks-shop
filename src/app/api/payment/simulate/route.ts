import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, getOrderById } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await updateOrderStatus(orderId, "PAID");
    return NextResponse.json({
      success: true,
      message: "จำลองการชำระเงินสำเร็จ (Simulated Payment Verified)",
      order: updated,
    });
  } catch (error) {
    console.error("Payment simulation error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการจำลองการชำระเงิน" },
      { status: 500 }
    );
  }
}
