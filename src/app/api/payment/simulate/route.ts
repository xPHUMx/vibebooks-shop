import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "ระบบจำลองการชำระเงินถูกปิดการใช้งานอย่างถาวร (Demo Payment Disabled) กรุณาชำระเงินผ่าน PromptPay จริงและแนบสลิปโอนเงินเพื่อให้ร้านค้าตรวจสอบและอนุมัติ",
    },
    { status: 410 }
  );
}

