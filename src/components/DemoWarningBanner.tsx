import React from "react";

export default function DemoWarningBanner() {
  return (
    <div className="w-full bg-[#1c1417] rounded-[18px] p-4 flex items-start gap-3 border border-rose-500/30 relative overflow-hidden shadow-lg">
      <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[20px]">warning</span>
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-rose-300 tracking-tight uppercase">
            DEMO ONLY — ระบบจำลองเพื่อการศึกษา
          </span>
          <span className="px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[9px] uppercase tracking-wider font-semibold">
            No Real Payment
          </span>
        </div>
        <p className="text-[11px] text-rose-200/80 mt-0.5 leading-relaxed">
          ระบบนี้สร้างขึ้นเพื่อการศึกษาโดย นายเกียรติภูมิ หารศรีนาถ (64332110242-2) <strong className="underline text-rose-200">ห้ามโอนเงินจริงเด็ดขาด</strong> ไม่มีการเรียกเก็บเงินหรือเชื่อมต่อบัญชีธนาคารจริง
        </p>
      </div>
    </div>
  );
}
