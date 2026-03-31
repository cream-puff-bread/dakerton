'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Edit3, Save, Trophy, Users, Check, X, Clock, ChevronDown, ChevronUp, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Submission, RankingEntry, Team, TeamApplication, Hackathon, HackathonDetail, User as UserType } from '@/lib/types';
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, loaded, logout, updateProfile } = useAuth();
  const { toast } = useToast();
  const [submissions] = useLocalStorage<Submission[]>('submissions', []);
  const [rankings] = useLocalStorage<RankingEntry[]>('rankings', []);
  const [teams, setTeams] = useLocalStorage<Team[]>('teams', []);
  const [applications, setApplications] = useLocalStorage<TeamApplication[]>('team_applications', []);
  const [hackathons] = useLocalStorage<Hackathon[]>('hackathons', []);
  const [details] = useLocalStorage<HackathonDetail[]>('hackathon_details', []);
  const [allUsers] = useLocalStorage<UserType[]>('users', []);
  const [editing, setEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPositions, setEditPositions] = useState<string[]>([]);

  // 팀 편집 모달
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formName, setFormName] = useState('');
  const [formIntro, setFormIntro] = useState('');
  const [formLooking, setFormLooking] = useState<string[]>([]);
  const [formContact, setFormContact] = useState('');
  const [formIsOpen, setFormIsOpen] = useState(true);
  const [formOwnerRole, setFormOwnerRole] = useState('');

  // 팀 상세 토글
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const mySubmissions = useMemo(
    () => submissions.filter((s) => s.teamName === '내 팀'),
    [submissions],
  );

  const myRanking = useMemo(
    () => rankings.find((r) => r.nickname === user?.nickname),
    [rankings, user],
  );

  // 내가 만든 팀
  const myOwnedTeams = useMemo(
    () => teams.filter((t) => t.ownerUserId === user?.id),
    [teams, user],
  );

  // 내가 참여중인 팀 (수락된 지원)
  const myAcceptedTeams = useMemo(
    () => {
      const accepted = applications.filter((a) => a.userId === user?.id && a.status === 'accepted');
      return accepted.map((a) => ({ ...a, team: teams.find((t) => t.teamCode === a.teamCode) }));
    },
    [applications, teams, user],
  );

  // 내가 지원중인 팀 (대기중)
  const myPendingApplications = useMemo(
    () => {
      const pending = applications.filter((a) => a.userId === user?.id && a.status === 'pending');
      return pending.map((a) => ({ ...a, team: teams.find((t) => t.teamCode === a.teamCode) }));
    },
    [applications, teams, user],
  );

  // 내 팀에 들어온 지원자들
  const incomingApplications = useMemo(
    () => {
      const myTeamCodes = myOwnedTeams.map((t) => t.teamCode);
      return applications.filter((a) => myTeamCodes.includes(a.teamCode) && a.status === 'pending');
    },
    [applications, myOwnedTeams],
  );

  if (!loaded) return <Loading />;

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const startEdit = () => {
    setEditNickname(user.nickname);
    setEditBio(user.bio || '');
    setEditPositions([...user.preferredPositions]);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!editNickname.trim()) {
      toast('닉네임을 입력해 주세요.', 'error');
      return;
    }
    updateProfile({
      nickname: editNickname.trim(),
      bio: editBio.trim(),
      preferredPositions: editPositions,
    });
    setEditing(false);
    toast('프로필이 업데이트되었습니다.');
  };

  const handleLogout = () => {
    logout();
    toast('로그아웃되었습니다.', 'info');
    router.push('/');
  };

  const toggleTeamOpen = (teamCode: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.teamCode === teamCode ? { ...t, isOpen: !t.isOpen } : t,
      ),
    );
    const team = teams.find((t) => t.teamCode === teamCode);
    toast(team?.isOpen ? '모집을 마감했습니다.' : '모집을 다시 시작했습니다.', 'success');
  };

  const handleApplication = (applicationId: string, action: 'accepted' | 'rejected') => {
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: action } : a)),
    );
    toast(action === 'accepted' ? '지원을 수락했습니다.' : '지원을 거절했습니다.', 'success');
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setFormName(team.name);
    setFormIntro(team.intro);
    setFormLooking([...team.lookingFor]);
    setFormContact(team.contact.url);
    setFormIsOpen(team.isOpen);
    setFormOwnerRole(team.ownerRole || '');
  };

  const closeEditModal = () => {
    setEditingTeam(null);
    setFormName('');
    setFormIntro('');
    setFormLooking([]);
    setFormContact('');
    setFormIsOpen(true);
    setFormOwnerRole('');
  };

  const saveTeamEdit = () => {
    if (!editingTeam) return;
    if (!formName.trim()) { toast('팀 이름을 입력해 주세요.', 'error'); return; }
    if (!formIntro.trim()) { toast('소개를 입력해 주세요.', 'error'); return; }
    setTeams((prev) =>
      prev.map((t) =>
        t.teamCode === editingTeam.teamCode
          ? { ...t, name: formName.trim(), intro: formIntro.trim(), lookingFor: formLooking, contact: { type: 'link', url: formContact.trim() || '#' }, isOpen: formIsOpen, ownerRole: formOwnerRole || undefined }
          : t,
      ),
    );
    toast('팀 정보가 수정되었습니다.');
    closeEditModal();
  };

  const toggleExpand = (teamCode: string) => {
    setExpandedTeam((prev) => (prev === teamCode ? null : teamCode));
  };

  // 특정 팀의 멤버 목록 (수락된 지원)
  const getTeamMembers = (teamCode: string) =>
    applications.filter((a) => a.teamCode === teamCode && a.status === 'accepted');

  // 특정 팀의 대기중 지원자
  const getTeamPending = (teamCode: string) =>
    applications.filter((a) => a.teamCode === teamCode && a.status === 'pending');

  const getOwnerNickname = (ownerUserId: string) => {
    const u = allUsers.find((u) => u.id === ownerUserId);
    return u?.nickname || '팀장';
  };

  const getMaxTeamSize = (hackSlug: string) => {
    const d = details.find((dt) => dt.slug === hackSlug);
    return d?.sections.overview.teamPolicy.maxTeamSize || 5;
  };

  const inputCls =
    'w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';
  const cardCls =
    'rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">프로필</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cardCls + ' mb-6'}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={24} className="text-primary" />
              </div>
              <div>
                {editing ? (
                  <input
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    className={inputCls + ' !w-48 !py-2'}
                  />
                ) : (
                  <h2 className="text-xl font-bold">{user.nickname}</h2>
                )}
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {editing ? (
              <button
                onClick={saveEdit}
                className="flex items-center gap-1.5 text-[13px] px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <Save size={14} />
                저장
              </button>
            ) : (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 text-[13px] px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Edit3 size={14} />
                수정
              </button>
            )}
          </div>

          {/* Bio */}
          <div className="mt-5">
            <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
              소개
            </label>
            {editing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={2}
                className={inputCls + ' resize-none'}
                placeholder="자기소개를 입력하세요"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {user.bio || '소개가 없습니다.'}
              </p>
            )}
          </div>

          {/* Preferred Positions */}
          <div className="mt-5">
            <label className="text-sm font-medium mb-2 block text-muted-foreground">
              관심 포지션
            </label>
            {editing ? (
              <div className="flex flex-wrap gap-2">
                {positions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setEditPositions((prev) =>
                        prev.includes(p)
                          ? prev.filter((x) => x !== p)
                          : [...prev, p],
                      )
                    }
                    className={`text-xs px-3 py-2 rounded-xl font-semibold transition-colors ${
                      editPositions.includes(p)
                        ? 'bg-primary text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {user.preferredPositions.length > 0 ? (
                  user.preferredPositions.map((p) => (
                    <Badge key={p} variant="outline" className="text-[#3b7cde] border-[#3b7cde]">
                      {p}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    설정된 포지션이 없습니다
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            가입일:{' '}
            {new Date(user.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </motion.div>

        {/* Ranking */}
        {myRanking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cardCls + ' mb-6'}
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-primary" />
              <h3 className="font-bold">내 랭킹</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  #{myRanking.rank}
                </p>
                <p className="text-xs text-muted-foreground">순위</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {myRanking.points.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">포인트</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {myRanking.participationCount}
                </p>
                <p className="text-xs text-muted-foreground">참가 횟수</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={cardCls + ' mb-6'}
        >
          <h3 className="font-bold mb-4">제출 내역</h3>
          {mySubmissions.length === 0 ? (
            <Empty message="아직 제출 내역이 없습니다." />
          ) : (
            <div className="space-y-2">
              {mySubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between text-sm p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{sub.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.hackathonSlug} · {sub.type}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-3">
                    {new Date(sub.submittedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* My Teams */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cardCls + ' mb-6'}
        >
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-primary" />
            <h3 className="font-bold">내 팀</h3>
          </div>
          {myOwnedTeams.length === 0 && myAcceptedTeams.length === 0 ? (
            <Empty message="참여 중인 팀이 없습니다." />
          ) : (
            <div className="space-y-3">
              {myOwnedTeams.map((t) => {
                const isExpanded = expandedTeam === t.teamCode;
                const members = getTeamMembers(t.teamCode);
                const pending = getTeamPending(t.teamCode);
                return (
                  <div key={t.teamCode} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden">
                    <div className="flex items-center justify-between p-3">
                      <button onClick={() => toggleExpand(t.teamCode)} className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm">{t.name}</p>
                          <Badge variant="default" className="text-[10px]">팀장</Badge>
                          <Badge variant={t.isOpen ? 'default' : 'secondary'} className={`text-[10px] ${t.isOpen ? 'bg-emerald-500 hover:bg-emerald-500 border-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-transparent'}`}>
                            {t.isOpen ? '모집중' : '모집완료'}
                          </Badge>
                          {pending.length > 0 && (
                            <span className="relative inline-flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{hackathons.find((h) => h.slug === t.hackathonSlug)?.title || t.hackathonSlug}</p>
                      </button>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-xs text-muted-foreground">{1 + members.length}/{getMaxTeamSize(t.hackathonSlug)}</span>
                        <button
                          onClick={() => openEditModal(t)}
                          className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                        >
                          편집
                        </button>
                        <button onClick={() => toggleExpand(t.teamCode)} className="text-muted-foreground hover:text-foreground transition-colors">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 space-y-3">
                            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
                              <p className="text-xs font-semibold text-muted-foreground mb-2">팀원</p>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-500 shrink-0">{user.nickname[0]}</div>
                                    <span className="font-medium">나 ({user.nickname})</span>
                                    <Crown size={14} className="text-[#3b7cde] shrink-0" />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {t.ownerRole && <Badge variant="outline" className="text-[10px] text-[#3b7cde] border-[#3b7cde]">{t.ownerRole}</Badge>}
                                  </div>
                                </div>
                                {members.map((m) => (
                                  <div key={m.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-500 shrink-0">{m.nickname[0]}</div>
                                      <span className="font-medium">{m.nickname}</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] text-[#3b7cde] border-[#3b7cde]">{m.role}</Badge>
                                  </div>
                                ))}
                                {members.length === 0 && (
                                  <p className="text-xs text-muted-foreground">아직 팀원이 없습니다.</p>
                                )}
                              </div>
                            </div>
                            {pending.length > 0 && (
                              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">대기중인 지원자</p>
                                <div className="space-y-2">
                                  <AnimatePresence>
                                    {pending.map((a) => (
                                      <motion.div
                                        key={a.id}
                                        layout
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-900/60"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-500 shrink-0">{a.nickname[0]}</div>
                                          <span className="text-sm font-medium">{a.nickname}</span>
                                          <Badge variant="outline" className="text-[10px] text-[#3b7cde] border-[#3b7cde]">{a.role}</Badge>
                                        </div>
                                        <div className="flex gap-1.5 shrink-0 ml-3">
                                          <button
                                            onClick={() => handleApplication(a.id, 'accepted')}
                                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
                                          >
                                            <Check size={12} /> 수락
                                          </button>
                                          <button
                                            onClick={() => handleApplication(a.id, 'rejected')}
                                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                                          >
                                            <X size={12} /> 거절
                                          </button>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              {myAcceptedTeams.map((a) => {
                const teamCode = a.teamCode;
                const team = a.team;
                const isExpanded = expandedTeam === teamCode;
                const members = getTeamMembers(teamCode);
                const owner = team ? teams.find((t) => t.teamCode === teamCode) : null;
                return (
                  <div key={a.id} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden">
                    <div className="flex items-center justify-between p-3">
                      <button onClick={() => toggleExpand(teamCode)} className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm">{a.teamName}</p>
                          <Badge variant="secondary" className="text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-transparent">팀원</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {a.role} · {hackathons.find((h) => h.slug === a.team?.hackathonSlug)?.title || a.team?.hackathonSlug || ''}
                        </p>
                      </button>
                      <button onClick={() => toggleExpand(teamCode)} className="shrink-0 ml-3 text-muted-foreground hover:text-foreground transition-colors">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3">
                            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
                              <p className="text-xs font-semibold text-muted-foreground mb-2">팀원</p>
                              <div className="space-y-1.5">
                                {owner && (
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-500 shrink-0">{owner.ownerUserId === user.id ? user.nickname[0] : getOwnerNickname(owner.ownerUserId ?? '')[0]}</div>
                                      <span className="font-medium">{owner.ownerUserId === user.id ? `나 (${user.nickname})` : getOwnerNickname(owner.ownerUserId ?? '')}</span>
                                      <Crown size={14} className="text-[#3b7cde] shrink-0" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {owner.ownerRole && <Badge variant="outline" className="text-[10px] text-[#3b7cde] border-[#3b7cde]">{owner.ownerRole}</Badge>}
                                    </div>
                                  </div>
                                )}
                                {members.filter((m) => m.userId !== user.id).map((m) => (
                                  <div key={m.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-500 shrink-0">{m.nickname[0]}</div>
                                      <span className="font-medium">{m.nickname}</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] text-[#3b7cde] border-[#3b7cde]">{m.role}</Badge>
                                  </div>
                                ))}
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-500 shrink-0">{user.nickname[0]}</div>
                                    <span className="font-medium">나 ({user.nickname})</span>
                                  </div>
                                  <Badge variant="outline" className="text-[10px] text-[#3b7cde] border-[#3b7cde]">{a.role}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Pending Applications */}
        {myPendingApplications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={cardCls + ' mb-6'}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-amber-500" />
              <h3 className="font-bold">지원중인 팀</h3>
            </div>
            <div className="space-y-2">
              {myPendingApplications.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm">{a.teamName}</p>
                      <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500">대기중</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {a.role}(으)로 지원 · {hackathons.find((h) => h.slug === a.team?.hackathonSlug)?.title || a.team?.hackathonSlug || ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    <button
                      onClick={() => {
                        const updated = applications.filter((app) => app.id !== a.id);
                        setApplications(updated);
                        const appliedTeams: Record<string, string> = JSON.parse(localStorage.getItem('applied_teams') || '{}');
                        const key = Object.keys(appliedTeams).find((k) => k.includes(a.teamCode));
                        if (key) {
                          delete appliedTeams[key];
                          localStorage.setItem('applied_teams', JSON.stringify(appliedTeams));
                        }
                        toast(`${a.teamName} 지원을 취소했습니다.`, 'success');
                      }}
                      className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                    >
                      지원 취소
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Team Edit Modal */}
        <AnimatePresence>
          {editingTeam && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="absolute inset-0 bg-black/50" onClick={closeEditModal} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">팀 편집</h3>
                  <button onClick={closeEditModal} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* 모집 상태 토글 */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <div>
                    <p className="text-sm font-medium">모집 상태</p>
                    <p className="text-xs text-muted-foreground">
                      {formIsOpen ? '현재 팀원을 모집하고 있습니다.' : '모집이 마감된 상태입니다.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setFormIsOpen(!formIsOpen)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${formIsOpen ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${formIsOpen ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">팀명 <span className="text-red-400">*</span></label>
                  <input value={formName} onChange={(e) => setFormName(e.target.value)} className={inputCls} placeholder="팀 이름" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">소개 <span className="text-red-400">*</span></label>
                  <textarea value={formIntro} onChange={(e) => setFormIntro(e.target.value)} rows={3} className={inputCls + ' resize-none'} placeholder="팀을 소개해주세요" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">내 포지션</label>
                  <div className="flex flex-wrap gap-2">
                    {positions.map((p) => (
                      <button
                        key={p}
                        onClick={() => setFormOwnerRole(formOwnerRole === p ? '' : p)}
                        className={`text-xs px-3 py-2 rounded-xl font-semibold transition-colors ${formOwnerRole === p ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">모집 포지션</label>
                  <div className="flex flex-wrap gap-2">
                    {positions.map((p) => (
                      <button
                        key={p}
                        onClick={() =>
                          setFormLooking((prev) =>
                            prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
                          )
                        }
                        className={`text-xs px-3 py-2 rounded-xl font-semibold transition-colors ${formLooking.includes(p) ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">해커톤</label>
                  <p className="text-sm text-muted-foreground">{hackathons.find((h) => h.slug === editingTeam.hackathonSlug)?.title || '연결 없음'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">연락 링크</label>
                  <input value={formContact} onChange={(e) => setFormContact(e.target.value)} className={inputCls} placeholder="https://open.kakao.com/..." />
                </div>
                <button
                  onClick={saveTeamEdit}
                  className="w-full text-[13px] px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  수정 완료
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
