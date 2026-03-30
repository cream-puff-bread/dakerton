'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    const result = login(email, password);
    if (result.ok) {
      toast('로그인 성공!');
      router.push('/');
    } else {
      setError(result.error || '로그인에 실패했습니다.');
    }
  };

  const inputCls =
    'w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">로그인</h1>
          <p className="text-muted-foreground text-sm">
            DAKERTON 계정으로 로그인하세요
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-4"
        >
          <div>
            <label className="text-sm font-medium mb-1.5 block">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="demo@dakerton.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="demo1234"
              autoComplete="current-password"
            />
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
            로그인
          </button>
          <p className="text-center text-sm text-muted-foreground">
            계정이 없으신가요?{' '}
            <Link
              href="/auth/signup"
              className="text-primary font-medium hover:underline"
            >
              회원가입
            </Link>
          </p>
        </form>


      </motion.div>
    </div>
  );
}
