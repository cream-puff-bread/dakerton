"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Hackathon } from "@/lib/types";
import { Loading, Empty, StatusBadge } from "@/components/UI";

const statusFilters = [
  { value: "all", label: "전체" },
  { value: "ongoing", label: "진행중" },
  { value: "upcoming", label: "예정" },
  { value: "ended", label: "종료" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export default function HackathonsPage() {
  const [hackathons, , loaded] = useLocalStorage<Hackathon[]>("hackathons", []);
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allTags = useMemo(() => Array.from(new Set(hackathons.flatMap((h) => h.tags))), [hackathons]);

  const filtered = useMemo(
    () => hackathons.filter((h) => {
      if (statusFilter !== "all" && h.status !== statusFilter) return false;
      if (tagFilter && !h.tags.includes(tagFilter)) return false;
      return true;
    }),
    [hackathons, statusFilter, tagFilter]
  );

  if (!loaded) return <Loading />;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-8">해커톤</h1>

      <div className="flex gap-2 mb-4">
        {statusFilters.map((f) => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)}
            className={`text-[13px] px-3.5 py-2 rounded-xl font-semibold transition-colors ${
              statusFilter === f.value
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-8">
        <button onClick={() => setTagFilter(null)}
          className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${!tagFilter ? "bg-[#EBF0FD] text-[#5383EC] dark:bg-[#5383EC]/15 dark:text-[#7BA0F0]" : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400"}`}>
          전체
        </button>
        {allTags.map((t) => (
          <button key={t} onClick={() => setTagFilter(tagFilter === t ? null : t)}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${tagFilter === t ? "bg-[#EBF0FD] text-[#5383EC] dark:bg-[#5383EC]/15 dark:text-[#7BA0F0]" : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400"}`}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty message="조건에 맞는 해커톤이 없습니다." />
      ) : (
        <div className="space-y-3">
          {filtered.map((h) => (
            <Link key={h.slug} href={`/hackathons/${h.slug}`}
              className="group flex items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/40 transition-all">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 mb-2">
                  <StatusBadge status={h.status} />
                  <h2 className="text-[15px] font-semibold truncate group-hover:text-[#5383EC] transition-colors">{h.title}</h2>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span>{formatDate(h.period.submissionDeadlineAt)} ~ {formatDate(h.period.endAt)}</span>
                  <span>{h.participantCount ?? 0}명</span>
                  <div className="flex gap-1">
                    {h.tags.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-zinc-300 dark:text-zinc-600 shrink-0 group-hover:text-[#5383EC] transition-colors"><path d="M9 5l7 7-7 7"/></svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
