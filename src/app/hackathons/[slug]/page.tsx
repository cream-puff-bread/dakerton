'use client';
import { use, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Users,
  Trophy,
  FileText,
  Send,
  BarChart3,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/components/Toast';
import {
  HackathonDetail,
  Team,
  Leaderboard,
  Submission,
  Invitation,
} from '@/lib/types';
import {
  Loading,
  ErrorState,
  Countdown,
  ProgressBar,
  Empty,
  Tag,
} from '@/components/UI';
import { Badge } from '@/components/ui/badge';

const tabItems = [
  { label: '개요', icon: FileText },
  { label: '평가', icon: BarChart3 },
  { label: '일정', icon: Clock },
  { label: '상금', icon: Trophy },
  { label: '팀', icon: Users },
  { label: '제출', icon: Send },
  { label: '리더보드', icon: Trophy },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
function formatKRW(n: number) {
  return n.toLocaleString('ko-KR') + '원';
}

export default function HackathonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [details, , loaded] = useLocalStorage<HackathonDetail[]>(
    'hackathon_details',
    [],
  );
  const [teams, setTeams] = useLocalStorage<Team[]>('teams', []);
  const [leaderboards] = useLocalStorage<Leaderboard[]>('leaderboards', []);
  const [submissions, setSubmissions] = useLocalStorage<Submission[]>(
    'submissions',
    [],
  );
  const [invitations, setInvitations] = useLocalStorage<Invitation[]>(
    'invitations',
    [],
  );
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [submitMemo, setSubmitMemo] = useState('');
  const [submitContent, setSubmitContent] = useState('');
  const [submitType, setSubmitType] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const detail = useMemo(
    () => details.find((d) => d.slug === slug),
    [details, slug],
  );
  const hackTeams = useMemo(
    () => teams.filter((t) => t.hackathonSlug === slug),
    [teams, slug],
  );
  const leaderboard = useMemo(
    () => leaderboards.find((l) => l.hackathonSlug === slug),
    [leaderboards, slug],
  );
  const hackInvitations = useMemo(
    () => invitations.filter((i) => i.hackathonSlug === slug),
    [invitations, slug],
  );

  useEffect(() => {
    if (detail?.sections.submit.allowedArtifactTypes[0])
      setSubmitType(detail.sections.submit.allowedArtifactTypes[0]);
  }, [detail]);

  if (!loaded) return <Loading />;
  if (!detail)
    return (
      <div className="text-center py-24">
        <ErrorState message="해당 해커톤을 찾을 수 없습니다." />
        <Link
          href="/hackathons"
          className="inline-block mt-4 text-sm text-primary font-medium hover:underline"
        >
          ← 해커톤 목록으로
        </Link>
      </div>
    );

  const s = detail.sections;
  const milestones = s.schedule.milestones;
  const completedMilestones = milestones.filter(
    (m) => new Date(m.at).getTime() < Date.now(),
  ).length;
  const progress =
    milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;
  const nextMilestone = milestones.find(
    (m) => new Date(m.at).getTime() > Date.now(),
  );
  const myPendingInvites = hackInvitations.filter(
    (i) => i.status === 'pending',
  );

  const handleSubmit = () => {
    if (!submitContent.trim()) {
      toast('제출 내용을 입력해 주세요.', 'error');
      return;
    }
    setSubmissions((p) => [
      ...p,
      {
        id: `sub-${Date.now()}`,
        hackathonSlug: slug,
        teamCode: 'MY_TEAM',
        teamName: '내 팀',
        type: submitType,
        content: submitContent,
        memo: submitMemo || undefined,
        submittedAt: new Date().toISOString(),
      },
    ]);
    setSubmitContent('');
    setSubmitMemo('');
    toast('제출 완료!');
  };

  const handleInvite = (teamCode: string, teamName: string) => {
    const team = teams.find((t) => t.teamCode === teamCode);
    if (!team) return;
    if (!team.isOpen) {
      toast('모집이 마감된 팀입니다.', 'error');
      return;
    }
    if (team.memberCount >= (s.overview.teamPolicy.maxTeamSize || 5)) {
      setShowInviteModal(true);
      return;
    }
    setInvitations((p) => [
      ...p,
      {
        id: `inv-${Date.now()}`,
        teamCode,
        teamName,
        hackathonSlug: slug,
        fromUser: '나',
        toUser: '팀장',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ]);
    toast(`${teamName}에 초대를 보냈습니다.`, 'info');
  };

  const handleInviteResponse = (invId: string, accept: boolean) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id !== invId
          ? inv
          : { ...inv, status: accept ? 'accepted' : 'rejected' },
      ),
    );
    if (accept) {
      const inv = invitations.find((i) => i.id === invId);
      if (inv)
        setTeams((prev) =>
          prev.map((t) =>
            t.teamCode === inv.teamCode
              ? { ...t, memberCount: t.memberCount + 1 }
              : t,
          ),
        );
    }
    toast(
      accept ? '초대를 수락했습니다.' : '초대를 거절했습니다.',
      accept ? 'success' : 'info',
    );
  };

  const cardCls =
    'rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6';
  const btnPrimary =
    'text-[13px] px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold hover:opacity-90 transition-opacity';
  const btnSecondary =
    'text-[13px] px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors';
  const inputCls =
    'w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/hackathons"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            해커톤 목록
          </Link>

          <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-2">
            {detail.title}
          </h1>
          {nextMilestone && (
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline">
                <Clock size={12} className="mr-1" />
                {nextMilestone.name}
              </Badge>
              <Countdown targetDate={nextMilestone.at} />
            </div>
          )}
          <ProgressBar value={progress} />
          <p className="text-xs text-muted-foreground mt-2 mb-8">
            {Math.round(progress)}% 진행 ({completedMilestones}/
            {milestones.length})
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative flex gap-1 overflow-x-auto mb-8 -mx-1 px-1"
        >
          {tabItems.map((t, i) => {
            const Icon = t.icon;
            return (
              <button
                key={t.label}
                onClick={() => setActiveTab(i)}
                className="relative px-4 py-2 text-[13px] font-semibold rounded-xl whitespace-nowrap transition-colors z-10"
                style={{ color: activeTab === i ? undefined : undefined }}
              >
                {activeTab === i && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span
                  className={`relative z-10 flex items-center gap-1.5 ${activeTab === i ? 'text-white dark:text-zinc-900' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                >
                  <Icon size={14} />
                  {t.label}
                </span>
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-[300px]"
          >
            {/* 개요 */}
            {activeTab === 0 && (
              <div className="space-y-4">
                <div className={cardCls}>
                  <h3 className="font-bold mb-3">대회 소개</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.overview.summary}
                  </p>
                  <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> 최대{' '}
                      {s.overview.teamPolicy.maxTeamSize}명
                    </span>
                    {s.overview.teamPolicy.allowSolo && (
                      <span>개인 참가 가능</span>
                    )}
                  </div>
                </div>
                <div className={cardCls}>
                  <h3 className="font-bold mb-3">안내사항</h3>
                  <div className="space-y-2.5">
                    {s.info.notice.map((n, i) => (
                      <p
                        key={i}
                        className="text-sm text-muted-foreground flex gap-2.5 leading-relaxed"
                      >
                        <span className="text-primary shrink-0 mt-0.5">
                          <svg
                            width="14"
                            height="14"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        {n}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 평가 */}
            {activeTab === 1 && (
              <div className={cardCls}>
                <h3 className="font-bold mb-1">{s.eval.metricName}</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {s.eval.description}
                </p>
                {s.eval.scoreDisplay && (
                  <div className="space-y-3">
                    {s.eval.scoreDisplay.breakdown.map((b) => (
                      <div key={b.key}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium">{b.label}</span>
                          <span className="text-primary font-bold">
                            {b.weightPercent}%
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${b.weightPercent}%` }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {s.eval.limits && (
                  <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex gap-6 text-sm text-muted-foreground">
                    <span>실행 제한: {s.eval.limits.maxRuntimeSec}초</span>
                    <span>
                      일일 제출: {s.eval.limits.maxSubmissionsPerDay}회
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 일정 */}
            {activeTab === 2 && (
              <div className={cardCls}>
                <h3 className="font-bold mb-6">타임라인</h3>
                <div className="space-y-0">
                  {milestones.map((m, i) => {
                    const passed = new Date(m.at).getTime() < Date.now();
                    const isNext =
                      !passed &&
                      (i === 0 ||
                        new Date(milestones[i - 1].at).getTime() < Date.now());
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${passed ? 'bg-primary' : isNext ? 'bg-primary ring-4 ring-primary/20' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                          />
                          {i < milestones.length - 1 && (
                            <div
                              className={`w-px flex-1 min-h-[44px] ${passed ? 'bg-primary' : 'bg-zinc-100 dark:bg-zinc-800'}`}
                            />
                          )}
                        </div>
                        <div className="pb-7 -mt-1">
                          <p
                            className={`text-sm font-medium ${isNext ? 'text-primary' : passed ? 'text-muted-foreground' : 'text-foreground'}`}
                          >
                            {m.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(m.at)}
                          </p>
                          {isNext && (
                            <div className="mt-1.5">
                              <Countdown targetDate={m.at} />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 상금 */}
            {activeTab === 3 &&
              (s.prize?.items ? (
                <div className="grid sm:grid-cols-3 gap-3">
                  {s.prize.items.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`${cardCls} text-center`}
                    >
                      <p className="text-3xl mb-2">
                        {['🥇', '🥈', '🥉'][i] || '🏅'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">
                        {p.place}
                      </p>
                      <p className="text-xl font-bold">
                        {formatKRW(p.amountKRW)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Empty message="상금 정보가 없습니다." />
              ))}

            {/* 팀 */}
            {activeTab === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">참가 팀 ({hackTeams.length})</h3>
                  <Link href={`/camp?hackathon=${slug}`} className={btnPrimary}>
                    팀 모집글 작성
                  </Link>
                </div>

                {myPendingInvites.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5"
                  >
                    <p className="text-sm font-bold text-primary mb-3">
                      받은 초대 ({myPendingInvites.length})
                    </p>
                    {myPendingInvites.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <span className="text-sm">{inv.teamName}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleInviteResponse(inv.id, true)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white font-semibold"
                          >
                            수락
                          </button>
                          <button
                            onClick={() => handleInviteResponse(inv.id, false)}
                            className={btnSecondary + ' !text-xs !px-3 !py-1.5'}
                          >
                            거절
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {hackTeams.length === 0 ? (
                  <Empty message="아직 등록된 팀이 없습니다." />
                ) : (
                  hackTeams.map((t, i) => (
                    <motion.div
                      key={t.teamCode}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={
                        cardCls +
                        ' hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors'
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="font-bold">{t.name}</h4>
                            <Badge variant={t.isOpen ? 'default' : 'secondary'}>
                              {t.isOpen ? '모집중' : '완료'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {t.intro}
                          </p>
                          <div className="flex gap-1.5 flex-wrap">
                            <p className="text-xs text-muted-foreground">
                              {t.memberCount}/
                              {s.overview.teamPolicy.maxTeamSize}명
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => handleInvite(t.teamCode, t.name)}
                            disabled={!t.isOpen}
                            className="text-xs px-3 py-2 rounded-xl bg-primary text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                          >
                            초대
                          </button>
                          <a
                            href={t.contact.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                          >
                            연락
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}

                {showInviteModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-zinc-900 rounded-3xl p-7 max-w-sm mx-4 shadow-2xl"
                    >
                      <h3 className="font-bold text-lg mb-2">인원 초과</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        이 해커톤의 최대 팀 인원은{' '}
                        {s.overview.teamPolicy.maxTeamSize}명입니다.
                      </p>
                      <button
                        onClick={() => setShowInviteModal(false)}
                        className={btnPrimary + ' w-full'}
                      >
                        확인
                      </button>
                    </motion.div>
                  </div>
                )}
              </div>
            )}

            {/* 제출 */}
            {activeTab === 5 && (
              <div className="space-y-4">
                <div className={cardCls}>
                  <h3 className="font-bold mb-4">제출 가이드</h3>
                  <div className="space-y-2">
                    {s.submit.guide.map((g, i) => (
                      <p
                        key={i}
                        className="text-sm text-muted-foreground flex gap-2"
                      >
                        <span className="text-primary font-bold shrink-0">
                          {i + 1}
                        </span>
                        {g}
                      </p>
                    ))}
                  </div>
                  {s.submit.submissionItems && (
                    <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
                      {s.submit.submissionItems.map((item) => (
                        <p
                          key={item.key}
                          className="text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {item.title}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className={cardCls}>
                  <h3 className="font-bold mb-4">제출하기</h3>
                  <div className="space-y-3">
                    {s.submit.allowedArtifactTypes.length > 1 && (
                      <select
                        value={submitType}
                        onChange={(e) => setSubmitType(e.target.value)}
                        className={inputCls}
                      >
                        {s.submit.allowedArtifactTypes.map((t) => (
                          <option key={t} value={t}>
                            {t.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      type="text"
                      value={submitContent}
                      onChange={(e) => setSubmitContent(e.target.value)}
                      placeholder={
                        submitType === 'url' ? 'https://...' : '제출 내용'
                      }
                      className={inputCls}
                    />
                    <textarea
                      value={submitMemo}
                      onChange={(e) => setSubmitMemo(e.target.value)}
                      rows={2}
                      placeholder="메모 (선택)"
                      className={inputCls + ' resize-none'}
                    />
                    <button
                      onClick={handleSubmit}
                      className={btnPrimary + ' w-full'}
                    >
                      제출
                    </button>
                  </div>
                </div>
                {submissions.filter((sub) => sub.hackathonSlug === slug)
                  .length > 0 && (
                  <div className={cardCls}>
                    <h3 className="font-bold mb-3">제출 내역</h3>
                    {submissions
                      .filter((sub) => sub.hackathonSlug === slug)
                      .map((sub) => (
                        <motion.div
                          key={sub.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between text-sm p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 mb-2 last:mb-0"
                        >
                          <span className="font-medium truncate mr-3">
                            {sub.content}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDate(sub.submittedAt)}
                          </span>
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* 리더보드 */}
            {activeTab === 6 && (
              <div className={cardCls + ' !p-0 overflow-hidden'}>
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-bold">리더보드</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.leaderboard.note}
                  </p>
                </div>
                {!leaderboard || leaderboard.entries.length === 0 ? (
                  <Empty message="리더보드 데이터가 없습니다." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/30">
                        <tr>
                          <th className="px-5 py-3 text-left font-medium text-muted-foreground text-xs w-16">
                            순위
                          </th>
                          <th className="px-5 py-3 text-left font-medium text-muted-foreground text-xs">
                            팀
                          </th>
                          <th className="px-5 py-3 text-right font-medium text-muted-foreground text-xs">
                            점수
                          </th>
                          {leaderboard.entries[0]?.scoreBreakdown && (
                            <>
                              <th className="px-5 py-3 text-right font-medium text-muted-foreground text-xs">
                                참가자
                              </th>
                              <th className="px-5 py-3 text-right font-medium text-muted-foreground text-xs">
                                심사위원
                              </th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {leaderboard.entries.map((e) => (
                          <tr
                            key={e.rank}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors"
                          >
                            <td className="px-5 py-4">
                              <span
                                className={`font-bold ${e.rank <= 3 ? 'text-primary' : ''}`}
                              >
                                #{e.rank}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-medium">
                              {e.teamName}
                            </td>
                            <td className="px-5 py-4 text-right font-mono font-bold">
                              {e.score}
                            </td>
                            {e.scoreBreakdown && (
                              <>
                                <td className="px-5 py-4 text-right text-muted-foreground">
                                  {e.scoreBreakdown.participant}
                                </td>
                                <td className="px-5 py-4 text-right text-muted-foreground">
                                  {e.scoreBreakdown.judge}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
