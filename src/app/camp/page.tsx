'use client';
import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import { Team, Hackathon, HackathonDetail } from '@/lib/types';
import { Loading, Empty } from '@/components/UI';
import { Badge } from '@/components/ui/badge';

const positions = [
  'Frontend',
  'Backend',
  'Designer',
  'ML Engineer',
  'PM',
  'DevOps',
];

function CampContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hackathonFilter = searchParams.get('hackathon');
  const [teams, setTeams, loaded] = useLocalStorage<Team[]>('teams', []);
  const [hackathons] = useLocalStorage<Hackathon[]>('hackathons', []);
  const [details] = useLocalStorage<HackathonDetail[]>('hackathon_details', []);
  const [appliedTeams, setAppliedTeams] = useLocalStorage<
    Record<string, string>
  >('applied_teams', {});
  const { user } = useAuth();
  const { toast } = useToast();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [posFilter, setPosFilter] = useState<string | null>(null);
  const [hackFilter, setHackFilter] = useState<string | null>(hackathonFilter);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCode, setEditCode] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formIntro, setFormIntro] = useState('');
  const [formLooking, setFormLooking] = useState<string[]>([]);
  const [formContact, setFormContact] = useState('');
  const [formHackathon, setFormHackathon] = useState(hackathonFilter || '');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [applyTarget, setApplyTarget] = useState<Team | null>(null);
  const [applyRole, setApplyRole] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      teams.filter((t) => {
        if (hackFilter && t.hackathonSlug !== hackFilter) return false;
        if (posFilter && !t.lookingFor.includes(posFilter)) return false;
        if (
          search &&
          !t.name.toLowerCase().includes(search.toLowerCase()) &&
          !t.intro.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [teams, hackFilter, posFilter, search],
  );

  const recommended = useMemo(() => {
    if (!user?.preferredPositions?.length) return [];
    return teams
      .filter(
        (t) =>
          t.isOpen &&
          t.lookingFor.some((lf) => user.preferredPositions.includes(lf)),
      )
      .slice(0, 3);
  }, [teams, user]);

  const getMaxTeamSize = (hackSlug: string) => {
    const d = details.find((dt) => dt.slug === hackSlug);
    return d?.sections.overview.teamPolicy.maxTeamSize || 5;
  };

  const resetForm = () => {
    setFormName('');
    setFormIntro('');
    setFormLooking([]);
    setFormContact('');
    setFormHackathon(hackathonFilter || '');
    setFormErrors({});
    setEditCode(null);
  };

  const openEditForm = (team: Team) => {
    setEditCode(team.teamCode);
    setFormName(team.name);
    setFormIntro(team.intro);
    setFormLooking([...team.lookingFor]);
    setFormContact(team.contact.url);
    setFormHackathon(team.hackathonSlug);
    setShowForm(true);
  };

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = '필수 항목입니다';
    if (!formIntro.trim()) errors.intro = '필수 항목입니다';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editCode) {
      setTeams((prev) =>
        prev.map((t) =>
          t.teamCode === editCode
            ? {
                ...t,
                name: formName.trim(),
                intro: formIntro.trim(),
                lookingFor: formLooking,
                contact: { type: 'link', url: formContact.trim() || '#' },
              }
            : t,
        ),
      );
      toast('수정 완료');
    } else {
      setTeams((prev) => [
        {
          teamCode: `T-${Date.now()}`,
          hackathonSlug: formHackathon || 'general',
          name: formName.trim(),
          isOpen: true,
          memberCount: 1,
          lookingFor: formLooking,
          intro: formIntro.trim(),
          contact: { type: 'link', url: formContact.trim() || '#' },
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      toast('등록 완료!');
    }
    resetForm();
    setShowForm(false);
  };

  const toggleClose = (teamCode: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.teamCode === teamCode ? { ...t, isOpen: !t.isOpen } : t,
      ),
    );
    toast('모집 상태가 변경되었습니다.', 'info');
  };

  const inputCls =
    'w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

  if (!loaded) return <Loading />;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              팀 찾기
            </h1>
            <p className="text-muted-foreground">함께 할 팀원을 찾아보세요</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 text-[13px] px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            {showForm ? (
              <>
                <X size={16} /> 닫기
              </>
            ) : (
              <>
                <Plus size={16} /> 모집글 작성
              </>
            )}
          </button>
        </motion.div>

        {hackFilter && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground mt-4"
          >
            {hackathons.find((h) => h.slug === hackFilter)?.title}
            <button
              onClick={() => setHackFilter(null)}
              className="ml-2 text-primary font-medium hover:underline"
            >
              전체 보기
            </button>
          </motion.p>
        )}

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 mb-6"
        >
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="팀 이름 또는 소개로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </motion.div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-4">
                <h3 className="font-bold text-lg">
                  {editCode ? '모집글 수정' : '새 모집글'}
                </h3>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    팀명 <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      setFormErrors((p) => ({ ...p, name: '' }));
                    }}
                    className={inputCls}
                    placeholder="팀 이름"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-400 mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    소개 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formIntro}
                    onChange={(e) => {
                      setFormIntro(e.target.value);
                      setFormErrors((p) => ({ ...p, intro: '' }));
                    }}
                    rows={3}
                    className={inputCls + ' resize-none'}
                    placeholder="팀을 소개해주세요"
                  />
                  {formErrors.intro && (
                    <p className="text-xs text-red-400 mt-1">
                      {formErrors.intro}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    모집 포지션
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {positions.map((p) => (
                      <button
                        key={p}
                        onClick={() =>
                          setFormLooking((prev) =>
                            prev.includes(p)
                              ? prev.filter((x) => x !== p)
                              : [...prev, p],
                          )
                        }
                        className={`text-xs px-3 py-2 rounded-xl font-semibold transition-colors ${formLooking.includes(p) ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                {!editCode && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      해커톤 연결
                    </label>
                    <select
                      value={formHackathon}
                      onChange={(e) => setFormHackathon(e.target.value)}
                      className={inputCls}
                    >
                      <option value="">없음</option>
                      {hackathons.map((h) => (
                        <option key={h.slug} value={h.slug}>
                          {h.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    연락 링크
                  </label>
                  <input
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className={inputCls}
                    placeholder="https://open.kakao.com/..."
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full text-[13px] px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  {editCode ? '수정 완료' : '등록'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smart team matching */}
        {recommended.length > 0 && !hackFilter && !posFilter && !search && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-8 rounded-2xl border-2 border-primary/20 bg-primary/5 p-5"
          >
            <h3 className="font-bold text-sm text-primary mb-3">
              ✨ 나에게 맞는 팀 추천
            </h3>
            <div className="space-y-2">
              {recommended.map((t) => (
                <div
                  key={t.teamCode}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-white dark:bg-zinc-900/60"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{t.name}</p>
                    <div className="flex gap-1 mt-1">
                      {t.lookingFor
                        .filter((lf) => user!.preferredPositions.includes(lf))
                        .map((lf) => (
                          <Badge
                            key={lf}
                            variant="default"
                            className="text-[10px] !bg-zinc-100 !text-[#3b7cde] dark:!bg-zinc-800 !border-[#3b7cde]"
                          >
                            {lf}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        setShowLoginPrompt(true);
                        return;
                      }
                      const key = `${user.id}__${t.teamCode}`;
                      if (appliedTeams[key]) {
                        toast('이미 지원한 팀입니다.', 'error');
                        return;
                      }
                      setApplyTarget(t);
                      setApplyRole(null);
                    }}
                    className="text-xs px-3 py-2 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity shrink-0"
                  >
                    지원하기
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Position filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          <button
            onClick={() => setPosFilter(null)}
            className={`text-[13px] px-3.5 py-2 rounded-xl font-semibold transition-colors ${!posFilter ? 'bg-primary text-primary-foreground' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}
          >
            전체
          </button>
          {positions.map((p) => (
            <button
              key={p}
              onClick={() => setPosFilter(posFilter === p ? null : p)}
              className={`text-[13px] px-3.5 py-2 rounded-xl font-semibold transition-colors ${posFilter === p ? 'bg-primary text-primary-foreground' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}
            >
              {p}
            </button>
          ))}
        </motion.div>

        {/* Team cards */}
        {filtered.length === 0 ? (
          <Empty message="조건에 맞는 팀이 없습니다." />
        ) : (
          <div className="space-y-3">
            {filtered.map((t, i) => (
              <motion.div
                key={t.teamCode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Users
                        size={16}
                        className="text-muted-foreground shrink-0"
                      />
                      <h3 className="font-bold text-[15px]">{t.name}</h3>
                      <Badge variant={t.isOpen ? 'default' : 'secondary'}>
                        {t.isOpen ? '모집중' : '완료'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2.5">
                      {t.intro}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {t.lookingFor.map((lf) => (
                        <Badge
                          key={lf}
                          variant="outline"
                          className="text-[#3b7cde] border-[#3b7cde]"
                        >
                          {lf}
                        </Badge>
                      ))}
                    </div>
                    {t.hackathonSlug && t.hackathonSlug !== 'general' && (
                      <Link
                        href={`/hackathons/${t.hackathonSlug}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {hackathons.find((h) => h.slug === t.hackathonSlug)
                          ?.title || t.hackathonSlug}
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between shrink-0 self-stretch">
                    <span className="text-sm font-semibold">
                      {t.memberCount}/{getMaxTeamSize(t.hackathonSlug)}
                    </span>
                    <button
                      onClick={() => {
                        if (!t.isOpen) {
                          toast('모집이 마감된 팀입니다.', 'error');
                          return;
                        }
                        if (!user) {
                          setShowLoginPrompt(true);
                          return;
                        }
                        const key = `${user.id}__${t.teamCode}`;
                        if (appliedTeams[key]) {
                          toast('이미 지원한 팀입니다.', 'error');
                          return;
                        }
                        setApplyTarget(t);
                        setApplyRole(null);
                      }}
                      disabled={!t.isOpen}
                      className="text-xs px-3 py-2 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      지원하기
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {/* 지원 역할 선택 모달 */}
        <AnimatePresence>
          {applyTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-7 max-w-sm w-full mx-4 shadow-2xl"
              >
                <h3 className="font-bold text-lg mb-1">역할 선택</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  <span className="font-semibold text-foreground">
                    {applyTarget.name}
                  </span>
                  에 어떤 역할로 지원하시겠어요?
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {applyTarget.lookingFor.map((role) => (
                    <button
                      key={role}
                      onClick={() => setApplyRole(role)}
                      className={`text-xs px-4 py-2.5 rounded-xl font-semibold transition-colors ${
                        applyRole === role
                          ? 'bg-primary text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setApplyTarget(null);
                      setApplyRole(null);
                    }}
                    className="flex-1 text-[13px] px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      if (!applyRole) {
                        toast('역할을 선택해 주세요.', 'error');
                        return;
                      }
                      const key = `${user!.id}__${applyTarget.teamCode}`;
                      if (appliedTeams[key]) {
                        toast('이미 지원한 팀입니다.', 'error');
                        setApplyTarget(null);
                        setApplyRole(null);
                        return;
                      }
                      setAppliedTeams((prev) => ({
                        ...prev,
                        [key]: applyRole,
                      }));
                      toast(
                        `${applyTarget.name}에 ${applyRole}(으)로 지원했습니다!`,
                      );
                      setApplyTarget(null);
                      setApplyRole(null);
                    }}
                    disabled={!applyRole}
                    className="flex-1 text-[13px] px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    지원하기
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 로그인 필요 모달 */}
        <AnimatePresence>
          {showLoginPrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-7 max-w-sm w-full mx-4 shadow-2xl"
              >
                <h3 className="font-bold text-lg mb-1">로그인이 필요합니다</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  팀에 지원하려면 먼저 로그인해 주세요.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="flex-1 text-[13px] px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginPrompt(false);
                      router.push('/auth/login');
                    }}
                    className="flex-1 text-[13px] px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                  >
                    로그인하기
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CampPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CampContent />
    </Suspense>
  );
}
