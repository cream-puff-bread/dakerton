"use client";
import { useEffect, useState } from "react";

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-zinc-300 dark:text-zinc-600">
      <div className="w-7 h-7 border-[2.5px] border-zinc-200 dark:border-zinc-700 border-t-[#5383EC] rounded-full animate-spin mb-3" />
      <p className="text-sm">불러오는 중...</p>
    </div>
  );
}

export function Empty({ message = "데이터가 없습니다." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-zinc-300 dark:text-zinc-600">
      <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3 opacity-40">
        <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"/>
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({ message = "오류가 발생했습니다." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-zinc-300 dark:text-zinc-600">
      <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3 text-red-300">
        <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  ongoing: { label: "진행중", cls: "bg-[#EBF0FD] text-[#5383EC] dark:bg-[#5383EC]/15 dark:text-[#7BA0F0]" },
  ended: { label: "종료", cls: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
  upcoming: { label: "예정", cls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.ended;
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${cfg.cls}`}>{cfg.label}</span>;
}

export function Tag({ label }: { label: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 font-medium">
      {label}
    </span>
  );
}

export function Countdown({ targetDate }: { targetDate: string }) {
  const [remaining, setRemaining] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setRemaining("마감됨"); return; }
      setUrgent(diff < 86400000);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(d > 0 ? `D-${d} ${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}` : `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <span className={`font-mono text-sm font-bold ${urgent ? "text-red-500" : "text-[#5383EC]"}`}>
      {remaining}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
      <div className="h-full bg-[#5383EC] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
