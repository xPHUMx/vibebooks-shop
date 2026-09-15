import { NextRequest, NextResponse } from "next/server";
import { saveOrder, getOrderById, lookupOrders } from "@/lib/supabase";
import { getBookById } from "@/lib/booksData";
import { Order } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookId, customerName, customerEmail } = body;

    if (!bookId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน (bookId, customerName, customerEmail)" },
        { status: 400 }
      );
    }

    const book = getBookById(bookId);
    if (!book) {
      return NextResponse.json({ error: "ไม่พบหนังสือที่ระบุ" }, { status: 404 });
    }

    // Generate unique Order ID e.g. ORD-2026-8821
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-2026-${randomSuffix}`;

    const newOrder: Order = {
      id: orderId,
      bookId: book.id,
      bookTitle: book.title,
      bookPrice: book.price,
      fileName: book.fileName,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    const saved = await saveOrder(newOrder);
    return NextResponse.json({ success: true, order: saved });
  } catch (error) {
    console.error("Order creation API error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const email = searchParams.get("email");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  if (email) {
    const order = await lookupOrders(orderId, email);
    if (!order) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลคำสั่งซื้อที่ตรงกับ Order ID และ Email นี้" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, order });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, order });
}
