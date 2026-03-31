'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: '해커톤', path: '/hackathons' },
  { label: '팀 찾기', path: '/camp' },
  { label: '랭킹', path: '/rankings' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const isHero = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : ''}`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link
          href="/"
          className={`font-bold tracking-tight ${
            isHero && !scrolled ? 'text-white' : 'text-primary'
          }`}
          style={{ fontSize: '20px' }}
        >
          DAKERTON
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`text-base font-medium tracking-wide transition-colors ${
                isHero && !scrolled
                  ? pathname === item.path
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                  : pathname === item.path
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link
              href="/profile"
              className={`flex items-center gap-2 px-5 py-2 text-sm font-medium transition-colors border ${
                isHero && !scrolled
                  ? 'text-white border-white/50 hover:bg-white/10'
                  : 'text-foreground border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <User size={16} />
              {user.nickname}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className={`px-5 py-2 text-sm font-medium transition-colors border ${
                isHero && !scrolled
                  ? 'text-white border-white hover:bg-white hover:text-black'
                  : 'text-primary border-primary hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              로그인
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden p-2 ${isHero && !scrolled ? 'text-white' : 'text-foreground'}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 top-16 bg-background z-40"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-semibold text-foreground hover:opacity-60 transition-opacity"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={user ? '/profile' : '/auth/login'}
                onClick={() => setMobileOpen(false)}
                className="mt-4 px-8 py-3 text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {user ? user.nickname : '로그인'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
