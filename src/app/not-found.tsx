"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-in">
      <p className="text-6xl font-bold text-zinc-200 dark:text-zinc-800 mb-4">404</p>
      <p className="text-lg font-bold mb-2">페이지를 찾을 수 없습니다</p>
      <p className="text-sm text-zinc-400 mb-8">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link href="/" className="text-[13px] px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
        메인으로 돌아가기
      </Link>
    </div>
  );
}
