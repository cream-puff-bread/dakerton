'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Users, Search } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Hackathon } from '@/lib/types';
import { Loading, Empty } from '@/components/UI';
import { Badge } from '@/components/ui/badge';

type HackathonStatus = 'all' | 'upcoming' | 'ongoing' | 'ended';

const statusMap: Record<string, { label: string; className: string }> = {
  upcoming: {
    label: '예정',
    className:
      'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  },
  ongoing: {
    label: '진행중',
    className:
      'bg-[#EBF0FD] text-[#5383EC] border-[#5383EC]/30 dark:bg-[#5383EC]/15 dark:text-[#7BA0F0] dark:border-[#5383EC]/30',
  },
  ended: {
    label: '종료',
    className:
      'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
  },
};

const filters: { value: HackathonStatus; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'ongoing', label: '진행중' },
  { value: 'upcoming', label: '예정' },
  { value: 'ended', label: '종료' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}

export default function HackathonsPage() {
  const [hackathons, , loaded] = useLocalStorage<Hackathon[]>('hackathons', []);
  const [activeFilter, setActiveFilter] = useState<HackathonStatus>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      hackathons.filter((h) => {
        if (activeFilter !== 'all' && h.status !== activeFilter) return false;
        if (
          search &&
          !h.title.toLowerCase().includes(search.toLowerCase()) &&
          !h.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
        )
          return false;
        return true;
      }),
    [hackathons, activeFilter, search],
  );

  if (!loaded) return <Loading />;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">해커톤</h1>
          <p className="text-muted-foreground mb-8">
            다양한 해커톤을 탐색하고 참가하세요
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="해커톤 이름 또는 태그 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`text-[13px] px-3.5 py-2 rounded-xl font-semibold transition-colors ${
                  activeFilter === f.value
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <Empty message="검색 결과가 없습니다." />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((h, i) => (
              <motion.div
                key={h.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/hackathons/${h.slug}`}
                  className="flex flex-col h-full p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={statusMap[h.status]?.className}
                    >
                      {statusMap[h.status]?.label}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {h.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {h.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(h.period.submissionDeadlineAt)} ~{' '}
                      {formatDate(h.period.endAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {h.participantCount ?? 0}명
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
