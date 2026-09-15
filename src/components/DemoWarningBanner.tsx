import React from "react";

export default function DemoWarningBanner() {
  return (
    <div className="w-full bg-error-container/85 backdrop-blur-xl rounded-2xl p-4 shadow-xl flex items-start gap-3 border-2 border-error/50 relative overflow-hidden animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-on-error flex items-center justify-center shrink-0 shadow-md">
        <span className="material-symbols-outlined text-error text-[24px]">warning</span>
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black text-on-error-container tracking-tight uppercase">
            ⚠️ DEMO ONLY — ระบบจำลองเพื่อการศึกษา
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-on-error/20 text-on-error-container text-[9px] uppercase tracking-wider font-bold">
            No Real Payment
          </span>
        </div>
        <p className="text-[11px] text-on-error-container/90 mt-0.5 leading-snug">
          ระบบนี้สร้างขึ้นเพื่อการศึกษาโดย นายเกียรติภูมิ หารศรีนาถ (64332110242-2) <strong className="underline">ห้ามโอนเงินจริงเด็ดขาด</strong> ไม่มีการเรียกเก็บเงินหรือเชื่อมต่อบัญชีธนาคารจริง
        </p>
      </div>
    </div>
  );
}
