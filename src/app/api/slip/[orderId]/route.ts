import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order || !order.slipUrl) {
      return NextResponse.json({ error: "Slip not found for this order" }, { status: 404 });
    }

    const slipUrl = order.slipUrl;

    // Case 1: Base64 Data URL -> Return image buffer directly
    if (slipUrl.startsWith("data:image")) {
      const matches = slipUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
    }

    // Case 2: URL containing storage path in digital-vault (private bucket)
    // Extract path e.g. 'slips/ORD-xxx_123.jpg'
    let storagePath = "";
    if (slipUrl.includes("/digital-vault/")) {
      const parts = slipUrl.split("/digital-vault/");
      storagePath = parts[1]?.split("?")[0] || "";
    } else if (slipUrl.includes("slips/")) {
      const idx = slipUrl.indexOf("slips/");
      storagePath = slipUrl.substring(idx).split("?")[0];
    }

    if (storagePath) {
      const admin = createAdminClient();
      if (admin) {
        // Generate fresh 1-hour signed URL and redirect
        const { data: signedData, error: signErr } = await admin.storage
          .from("digital-vault")
          .createSignedUrl(storagePath, 3600);

        if (!signErr && signedData?.signedUrl) {
          return NextResponse.redirect(signedData.signedUrl, 307);
        }

        // Or download buffer directly and stream
        const { data: fileBlob, error: downloadErr } = await admin.storage
          .from("digital-vault")
          .download(storagePath);

        if (!downloadErr && fileBlob) {
          const arrayBuffer = await fileBlob.arrayBuffer();
          return new NextResponse(Buffer.from(arrayBuffer), {
            status: 200,
            headers: {
              "Content-Type": fileBlob.type || "image/jpeg",
              "Cache-Control": "public, max-age=3600",
            },
          });
        }
      }
    }

    // Case 3: Already an accessible external URL (with token or signed)
    return NextResponse.redirect(slipUrl, 307);
  } catch (error) {
    console.error("Slip delivery error:", error);
    return NextResponse.json({ error: "Failed to retrieve slip" }, { status: 500 });
  }
}
