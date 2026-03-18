"use client";
import { useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RankingEntry } from "@/lib/types";
import { Loading, Empty } from "@/components/UI";

const filters = [
  { value: "all", label: "전체" },
  { value: "30", label: "30일" },
  { value: "7", label: "7일" },
];

export default function RankingsPage() {
  const [rankings, , loaded] = useLocalStorage<RankingEntry[]>("rankings", []);
  const [period, setPeriod] = useState("all");

  const filtered = useMemo(() => {
    if (period === "7") return rankings.slice(0, 4);
    if (period === "30") return rankings.slice(0, 6);
    return rankings;
  }, [rankings, period]);

  if (!loaded) return <Loading />;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-8">랭킹</h1>

      <div className="flex gap-2 mb-8">
        {filters.map((f) => (
          <button key={f.value} onClick={() => setPeriod(f.value)}
            className={`text-[13px] px-3.5 py-2 rounded-xl font-semibold transition-colors ${
              period === f.value
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? <Empty message="아직 랭킹 데이터가 없습니다." /> : (
        <>
          {/* Top 3 */}
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            {filtered.slice(0, 3).map((r, i) => {
              const icons = ["🥇", "🥈", "🥉"];
              return (
                <div key={r.nickname} className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 text-center">
                  <p className="text-3xl mb-2">{icons[i]}</p>
                  <p className="font-bold text-[15px] mb-1">{r.nickname}</p>
                  <p className="text-2xl font-bold text-[#5383EC]">{r.points.toLocaleString()}</p>
                  <p className="text-xs text-zinc-400 mt-2">{r.participationCount}회 참가</p>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/30">
                <tr>
                  <th className="px-5 py-3.5 text-left font-medium text-zinc-400 text-xs w-16">순위</th>
                  <th className="px-5 py-3.5 text-left font-medium text-zinc-400 text-xs">닉네임</th>
                  <th className="px-5 py-3.5 text-right font-medium text-zinc-400 text-xs">포인트</th>
                  <th className="px-5 py-3.5 text-right font-medium text-zinc-400 text-xs">참가</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((r) => (
                  <tr key={r.nickname} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-4"><span className={`font-bold ${r.rank <= 3 ? "text-[#5383EC]" : ""}`}>#{r.rank}</span></td>
                    <td className="px-5 py-4 font-medium">{r.nickname}</td>
                    <td className="px-5 py-4 text-right font-mono font-bold">{r.points.toLocaleString()}</td>
                    <td className="px-5 py-4 text-right text-zinc-400">{r.participationCount}회</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
