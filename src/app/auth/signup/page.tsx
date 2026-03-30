'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';

const positions = [
  'Frontend',
  'Backend',
  'Designer',
  'ML Engineer',
  'PM',
  'DevOps',
];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim() || !nickname.trim()) {
      setError('모든 필수 항목을 입력해 주세요.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    const result = signup({
      email,
      password,
      nickname,
      preferredPositions: selectedPositions,
    });
    if (result.ok) {
      toast('회원가입 완료!');
      router.push('/');
    } else {
      setError(result.error || '회원가입에 실패했습니다.');
    }
  };

  const inputCls =
    'w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">회원가입</h1>
          <p className="text-muted-foreground text-sm">
            DAKERTON에 가입하고 해커톤에 참가하세요
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-4"
        >
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              이메일 <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              닉네임 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={inputCls}
              placeholder="닉네임"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              비밀번호 <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="6자 이상"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              비밀번호 확인 <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputCls}
              placeholder="비밀번호 재입력"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              관심 포지션
            </label>
            <div className="flex flex-wrap gap-2">
              {positions.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setSelectedPositions((prev) =>
                      prev.includes(p)
                        ? prev.filter((x) => x !== p)
                        : [...prev, p],
                    )
                  }
                  className={`text-xs px-3 py-2 rounded-xl font-semibold transition-colors ${
                    selectedPositions.includes(p)
                      ? 'bg-primary text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full text-[13px] px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            가입하기
          </button>
          <p className="text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/auth/login"
              className="text-primary font-medium hover:underline"
            >
              로그인
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
