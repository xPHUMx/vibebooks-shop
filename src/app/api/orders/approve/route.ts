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
