"use client";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Hackathon } from "@/lib/types";
import { Countdown, StatusBadge } from "@/components/UI";

const cards = [
  {
    href: "/hackathons",
    title: "해커톤",
    desc: "진행 중인 대회를 탐색하세요",
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>,
  },
  {
    href: "/camp",
    title: "팀 찾기",
    desc: "함께할 팀원을 모집하세요",
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
  },
  {
    href: "/rankings",
    title: "랭킹",
    desc: "글로벌 순위를 확인하세요",
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-3.52 1.122 6.023 6.023 0 01-3.52-1.122"/></svg>,
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export default function Home() {
  const [hackathons] = useLocalStorage<Hackathon[]>("hackathons", []);
  const ongoing = hackathons.filter((h) => h.status === "ongoing");
  const nearestDeadline = ongoing.length > 0
    ? ongoing.reduce((a, b) =>
        new Date(a.period.submissionDeadlineAt).getTime() < new Date(b.period.submissionDeadlineAt).getTime() ? a : b
      )
    : null;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="pt-8 pb-12 sm:pt-16 sm:pb-20">
        <h1 className="text-[32px] sm:text-[44px] font-bold leading-tight tracking-tight mb-3">
          해커톤의 모든 것,<br />
          <span className="text-[#5383EC]">Dakerton</span>
        </h1>
        <p className="text-zinc-400 dark:text-zinc-500 text-[15px] sm:text-base max-w-md leading-relaxed">
          대회 탐색부터 팀 빌딩, 제출, 순위 확인까지<br className="hidden sm:block" />
          해커톤 여정을 하나의 플랫폼에서 완결하세요.
        </p>
      </section>

      {/* Countdown banner */}
      {nearestDeadline && (
        <section className="mb-10 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-[#5383EC] mb-1">마감 임박</p>
              <p className="text-sm font-semibold">{nearestDeadline.title}</p>
            </div>
            <Countdown targetDate={nearestDeadline.period.submissionDeadlineAt} />
          </div>
        </section>
      )}

      {/* CTA Cards */}
      <section className="grid sm:grid-cols-3 gap-3 mb-14">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex items-center gap-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 p-5 hover:border-[#5383EC]/40 dark:hover:border-[#5383EC]/30 hover:bg-[#F5F7FE] dark:hover:bg-[#5383EC]/5 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:text-[#5383EC] transition-colors shrink-0">
              {c.icon}
            </div>
            <div>
              <p className="text-[15px] font-semibold mb-0.5">{c.title}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{c.desc}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Hackathon list */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">전체 해커톤</h2>
          <Link href="/hackathons" className="text-sm text-[#5383EC] font-medium hover:underline">
            전체 보기
          </Link>
        </div>
        <div className="space-y-3">
          {hackathons.map((h) => (
            <Link
              key={h.slug}
              href={`/hackathons/${h.slug}`}
              className="group flex items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/40 transition-all"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 mb-2">
                  <StatusBadge status={h.status} />
                  <h3 className="text-[15px] font-semibold truncate group-hover:text-[#5383EC] transition-colors">{h.title}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span>{formatDate(h.period.submissionDeadlineAt)} ~ {formatDate(h.period.endAt)}</span>
                  <span>{h.participantCount ?? 0}명 참가</span>
                  <div className="flex gap-1">
                    {h.tags.slice(0, 3).map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-zinc-300 dark:text-zinc-600 shrink-0 group-hover:text-[#5383EC] transition-colors"><path d="M9 5l7 7-7 7"/></svg>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
