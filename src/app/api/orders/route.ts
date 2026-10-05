import { NextRequest, NextResponse } from "next/server";
import { saveOrder, getOrderById, lookupOrders, getAllOrders, getOrdersByUser } from "@/lib/supabase";
import { getProductById } from "@/lib/productsData";
import { Order, OrderItem } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, bookId, customerName, customerEmail, customerPhone, userId } = body;

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อ-นามสกุล และอีเมลสำหรับรับสิทธิ์ดาวน์โหลด" },
        { status: 400 }
      );
    }

    // Build order items array
    let orderItems: OrderItem[] = [];
    let totalAmount = 0;
    let merchantId: string | undefined = undefined;
    let merchantName: string | undefined = undefined;
    let merchantPromptPay: string | undefined = undefined;

    if (Array.isArray(items) && items.length > 0) {
      orderItems = items.map((it: any) => {
        const prod = it.product || it;
        const qty = it.quantity || 1;
        const price = Number(prod.price || 0) * qty;
        totalAmount += price;

        if (!merchantId && prod.merchantId) merchantId = prod.merchantId;
        if (!merchantName && prod.merchantName) merchantName = prod.merchantName;
        if (!merchantPromptPay && prod.merchantPromptPay) merchantPromptPay = prod.merchantPromptPay;

        return {
          productId: prod.id,
          title: prod.title,
          price: Number(prod.price || 0),
          fileName: prod.fileName || 'file.zip',
          fileSize: prod.fileSize,
          fileFormat: prod.fileFormat,
        };
      });
    } else if (bookId) {
      const prod = getProductById(bookId);
      if (!prod) {
        return NextResponse.json({ error: "ไม่พบสินค้าดิจิทัลที่ระบุ" }, { status: 404 });
      }
      totalAmount = prod.price;
      merchantId = prod.merchantId;
      merchantName = prod.merchantName;
      merchantPromptPay = prod.merchantPromptPay;
      orderItems = [
        {
          productId: prod.id,
          title: prod.title,
          price: prod.price,
          fileName: prod.fileName,
          fileSize: prod.fileSize,
          fileFormat: prod.fileFormat,
        },
      ];
    } else {
      return NextResponse.json(
        { error: "ไม่มีรายการสินค้าในคำสั่งซื้อ" },
        { status: 400 }
      );
    }

    // Always fetch latest merchant profile info from database if merchantId is available
    if (merchantId) {
      try {
        const { createAdminClient, createClient: createServerClient } = await import("@/lib/supabase/server");
        const admin = createAdminClient();
        const client = admin || createServerClient();
        const { data: mProfile } = await client
          .from("profiles")
          .select("store_name, promptpay_id")
          .eq("id", merchantId)
          .maybeSingle();

        if (mProfile) {
          if (mProfile.store_name) merchantName = mProfile.store_name;
          if (mProfile.promptpay_id) merchantPromptPay = mProfile.promptpay_id;
        }
      } catch (err) {
        console.warn("Notice: could not fetch merchant profile for promptpay:", err);
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-2026-${randomSuffix}`;
    const promptpayRef = `PPAY-${randomSuffix}`;

    const newOrder: Order = {
      id: orderId,
      userId: userId || undefined,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : undefined,
      totalAmount,
      status: "PENDING",
      items: orderItems,
      promptpayRef,
      createdAt: new Date().toISOString(),
      merchantId: merchantId || undefined,
      merchantName: merchantName || undefined,
      merchantPromptPay: merchantPromptPay || undefined,
      // Legacy compatibility
      bookId: orderItems[0]?.productId,
      bookTitle: orderItems[0]?.title,
      bookPrice: orderItems[0]?.price,
      fileName: orderItems[0]?.fileName,
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
  const all = searchParams.get("all");

  // If requesting all orders (Admin operation) -> Verify Admin Authorization
  if (all === "true") {
    let isAdmin = false;
    const adminKey = req.headers.get("x-admin-key");
    const demoRole = req.headers.get("x-demo-role");

    // Check service role key or demo role
    if ((adminKey && adminKey === process.env.SUPABASE_SERVICE_ROLE_KEY) || demoRole === "admin") {
      isAdmin = true;
    }

    // Check Supabase session (Bearer token first, then cookie)
    if (!isAdmin) {
      try {
        const authHeader = req.headers.get("authorization");
        const bearerToken = authHeader?.replace(/^Bearer\s+/i, "") || null;
        const { createAdminClient, createClient } = await import("@/lib/supabase/server");
        const adminClient = createAdminClient();
        const serverClient = createClient();

        let user: any = null;
        if (bearerToken && adminClient) {
          const { data: tokenUser } = await adminClient.auth.getUser(bearerToken);
          user = tokenUser?.user;
        }
        if (!user) {
          const { data: cookieUser } = await serverClient.auth.getUser();
          user = cookieUser?.user;
        }

        if (user) {
          const client = adminClient || serverClient;
          const { data: profile } = await client
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.role === "admin" || profile?.role === "merchant") {
            isAdmin = true;
          }
        }
      } catch (authErr) {
        // ignore
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Administrator or Merchant authorization required" },
        { status: 403 }
      );
    }

    const orders = await getAllOrders();
    return NextResponse.json({ success: true, orders });
  }

  // User Library querying orders by email
  if (email && !orderId) {
    const userOrders = await getOrdersByUser(email);
    return NextResponse.json({ success: true, orders: userOrders });
  }

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
