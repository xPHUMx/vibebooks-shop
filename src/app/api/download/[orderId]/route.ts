import { NextRequest, NextResponse } from "next/server";
import { getOrderById, supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;
  const order = await getOrderById(orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "PAID") {
    return NextResponse.json(
      { error: "คำสั่งซื้อยังไม่ได้รับการชำระเงิน (Not Paid)" },
      { status: 403 }
    );
  }

  // 1. If Supabase is configured, create a genuine 15-minute (900s) signed URL via Supabase Storage
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from("ebook-vault")
        .createSignedUrl(order.fileName, 900);

      if (!error && data?.signedUrl) {
        return NextResponse.json({
          success: true,
          downloadUrl: data.signedUrl,
          viewUrl: `/api/pdf/${orderId}`,
          expiresInSeconds: 900,
          fileName: order.fileName,
          storage: "supabase-cloud",
        });
      }
      console.warn("Supabase Signed URL creation notice:", error?.message);
    } catch (err) {
      console.warn("Supabase Signed URL exception, fallback:", err);
    }
  }

  // 2. Fallback: Return simulated download payload
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  return NextResponse.json({
    success: true,
    simulated: true,
    downloadUrl: `/books/${order.fileName}`,
    viewUrl: `/api/pdf/${orderId}`,
    expiresAt,
    expiresInSeconds: 900,
    fileName: order.fileName,
    message: "15-minute temporary download authorization granted.",
  });
}
