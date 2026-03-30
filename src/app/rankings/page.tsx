'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Search } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { RankingEntry } from '@/lib/types';
import { Loading, Empty } from '@/components/UI';

const filters = [
  { value: 'all', label: '전체' },
  { value: '30', label: '30일' },
  { value: '7', label: '7일' },
];

export default function RankingsPage() {
  const [rankings, , loaded] = useLocalStorage<RankingEntry[]>('rankings', []);
  const [period, setPeriod] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = rankings;
    if (period === '7') result = rankings.slice(0, 4);
    else if (period === '30') result = rankings.slice(0, 6);
    if (search)
      result = result.filter((r) =>
        r.nickname.toLowerCase().includes(search.toLowerCase()),
      );
    return result;
  }, [rankings, period, search]);

  if (!loaded) return <Loading />;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">랭킹</h1>
          <p className="text-muted-foreground mb-8">글로벌 해커톤 랭킹</p>
        </motion.div>

        {/* Top 3 podium */}
        {filtered.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
            {[filtered[1], filtered[0], filtered[2]].map((r, i) => {
              const heights = ['h-28', 'h-36', 'h-24'];
              const icons = [Medal, Trophy, Medal];
              const Icon = icons[i];
              return (
                <motion.div
                  key={r.nickname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col items-center justify-end ${i === 1 ? 'order-first md:order-none' : ''}`}
                >
                  <Icon
                    size={i === 1 ? 28 : 20}
                    className={
                      i === 1
                        ? 'text-primary mb-2'
                        : 'text-muted-foreground mb-2'
                    }
                  />
                  <span className="text-sm font-bold mb-1">{r.nickname}</span>
                  <span className="text-xs text-muted-foreground mb-2">
                    {r.points.toLocaleString()}pt
                  </span>
                  <div
                    className={`w-full ${heights[i]} rounded-t-xl ${i === 1 ? 'gradient-green-bg' : 'bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800'} flex items-end justify-center pb-3`}
                  >
                    <span
                      className={`text-2xl font-black ${i === 1 ? 'text-white' : 'text-muted-foreground'}`}
                    >
                      {r.rank}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setPeriod(f.value)}
                className={`text-[13px] px-3.5 py-2 rounded-xl font-semibold transition-colors ${
                  period === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative max-w-sm flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="닉네임 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <Empty message="검색 결과가 없습니다." />
        ) : (
          <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_100px_80px] md:grid-cols-[80px_1fr_120px_100px_100px] items-center px-4 py-3 bg-zinc-50 dark:bg-zinc-800/30 text-xs font-semibold text-muted-foreground">
              <span>순위</span>
              <span>닉네임</span>
              <span className="text-right">포인트</span>
              <span className="text-right hidden md:block">참가</span>
              <span className="text-right">배지</span>
            </div>
            {filtered.map((r, i) => (
              <motion.div
                key={r.nickname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-[60px_1fr_100px_80px] md:grid-cols-[80px_1fr_120px_100px_100px] items-center px-4 py-3.5 border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors"
              >
                <span
                  className={`font-bold ${r.rank <= 3 ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {r.rank}
                </span>
                <span className="font-semibold text-sm">{r.nickname}</span>
                <span className="text-right text-sm font-medium">
                  {r.points.toLocaleString()}
                </span>
                <span className="text-right text-sm text-muted-foreground hidden md:block">
                  {r.participationCount}회
                </span>
                <span className="text-right">
                  {r.rank <= 3 ? ['🏆', '🥈', '🥉'][r.rank - 1] : '—'}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
