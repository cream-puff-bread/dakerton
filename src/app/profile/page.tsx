'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, LogOut, Edit3, Save, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Submission, RankingEntry } from '@/lib/types';
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
  const [editing, setEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPositions, setEditPositions] = useState<string[]>([]);

  const mySubmissions = useMemo(
    () => submissions.filter((s) => s.teamName === '내 팀'),
    [submissions],
  );

  const myRanking = useMemo(
    () => rankings.find((r) => r.nickname === user?.nickname),
    [rankings, user],
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
                    <Badge key={p} variant="outline">
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
          className={cardCls}
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
      </div>
    </div>
  );
}
