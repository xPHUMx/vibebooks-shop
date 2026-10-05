import { NextRequest, NextResponse } from "next/server";
import { getOrderById, supabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;
  const order = await getOrderById(orderId);

  if (!order) {
    return new NextResponse("Order not found", { status: 404 });
  }

  if (order.status !== "PAID") {
    return new NextResponse("คำสั่งซื้อยังไม่ได้รับการชำระเงิน (Order Not Paid)", {
      status: 403,
    });
  }

  const rawFileName = order.fileName || order.items?.[0]?.fileName || "Media_Player_PRO_Engineering.pdf";
  const safeFileName = path.basename(rawFileName);

  // 1. Try reading strictly from local vault storage paths (private storage_vault_files)
  const vaultDir = path.resolve(process.cwd(), "supabase", "storage_vault_files");
  const localCandidates = [
    path.join(vaultDir, safeFileName),
    path.join(vaultDir, "Media_Player_PRO_Engineering.pdf"),
  ];

  for (const localPath of localCandidates) {
    try {
      if (fs.existsSync(localPath)) {
        const fileBuffer = fs.readFileSync(localPath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${safeFileName}"`,
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    } catch (fsErr) {
      console.warn("Local PDF read warning:", fsErr);
    }
  }

  // 2. Try fetching from Supabase Storage 'digital-vault' or 'ebook-vault'
  if (supabaseAdmin) {
    try {
      let { data, error } = await supabaseAdmin.storage
        .from("digital-vault")
        .download(safeFileName);

      if (error || !data) {
        const ebookRes = await supabaseAdmin.storage
          .from("ebook-vault")
          .download(safeFileName);
        if (!ebookRes.error && ebookRes.data) {
          data = ebookRes.data;
          error = null;
        }
      }

      if (!error && data) {
        const arrayBuffer = await data.arrayBuffer();
        return new NextResponse(Buffer.from(arrayBuffer), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${safeFileName}"`,
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    } catch (storageErr) {
      console.warn("Supabase Storage exception:", storageErr);
    }
  }

  // 3. Fallback: Generate basic PDF stream on the fly if needed
  const fallbackPdf = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 120 >>\nstream\nBT\n/F1 18 Tf\n50 780 Td\n(Book Sangdai - Academic Master Edition) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\n0000000210 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n380\n%%EOF`;

  return new NextResponse(Buffer.from(fallbackPdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeFileName}"`,
    },
  });
}
