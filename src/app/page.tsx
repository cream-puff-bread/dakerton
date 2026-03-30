'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Trophy,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import CountUp from '@/components/CountUp';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Hackathon } from '@/lib/types';

const ctaCards = [
  {
    icon: Zap,
    title: '해커톤 보러가기',
    desc: '다양한 해커톤을 탐색하고 참가하세요',
    path: '/hackathons',
  },
  {
    icon: Users,
    title: '팀 찾기',
    desc: '나에게 맞는 팀원을 찾아보세요',
    path: '/camp',
  },
  {
    icon: Trophy,
    title: '랭킹 보기',
    desc: '글로벌 랭킹에서 실력을 확인하세요',
    path: '/rankings',
  },
];

const carouselSlides = [
  {
    img: '/carousel-1.jpg',
    title: '팀 협업',
    desc: '함께 아이디어를 실현하세요',
  },
  {
    img: '/carousel-2.jpg',
    title: '수상의 순간',
    desc: '최고의 팀에게 주어지는 영광',
  },
  {
    img: '/carousel-3.jpg',
    title: '몰입 개발',
    desc: '한계를 넘는 코딩의 즐거움',
  },
];

const HackathonSearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/hackathons?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-lg mx-auto w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="해커톤 대회를 검색하세요..."
        className="w-full h-12 pl-12 pr-24 rounded-full border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        검색
      </button>
    </form>
  );
};

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [hackathons] = useLocalStorage<Hackathon[]>('hackathons', []);

  const next = useCallback(
    () => setCurrent((p) => (p + 1) % carouselSlides.length),
    [],
  );
  const prev = useCallback(
    () =>
      setCurrent(
        (p) => (p - 1 + carouselSlides.length) % carouselSlides.length,
      ),
    [],
  );

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <video
          src="/dakerton.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero-overlay" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-16 text-white tracking-tight">
            아이디어가 현실이 되는
            <br />
            나만의 해커톤
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link
              href="/hackathons"
              className="inline-block px-10 py-4 bg-white text-black text-sm font-semibold tracking-wide hover:bg-white/90 transition-colors"
            >
              시작하기
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-white/60 text-sm"
          >
            팀을 찾고, 해커톤에 참가하고, 성과를 기록하세요.
          </motion.p>
        </motion.div>
      </section>

      {/* Carousel */}
      <section
        className="relative -mt-60 z-10 pb-12"
        style={{ perspective: '1200px' }}
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="relative flex items-center justify-center h-[420px] md:h-[520px]">
            {carouselSlides.map((slide, i) => {
              const offset = i - current;
              const isCenter = offset === 0;
              const isLeft =
                offset === -1 ||
                (current === 0 && i === carouselSlides.length - 1);
              const isRight =
                offset === 1 ||
                (current === carouselSlides.length - 1 && i === 0);

              if (!isCenter && !isLeft && !isRight) return null;

              let x = '0%';
              let rotateY = 0;
              let scale = 1;
              let zIndex = 10;
              let opacity = 1;

              if (isLeft && !isCenter) {
                x = '-65%';
                rotateY = 35;
                scale = 0.8;
                zIndex = 5;
                opacity = 0.7;
              } else if (isRight && !isCenter) {
                x = '65%';
                rotateY = -35;
                scale = 0.8;
                zIndex = 5;
                opacity = 0.7;
              }

              return (
                <motion.div
                  key={i}
                  animate={{
                    x,
                    rotateY,
                    scale,
                    opacity,
                  }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="absolute w-[65%] md:w-[55%] cursor-pointer"
                  style={{ zIndex, transformStyle: 'preserve-3d' }}
                  onClick={() => {
                    if (isLeft) prev();
                    if (isRight) next();
                  }}
                >
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={slide.img}
                      alt={slide.title}
                      loading="lazy"
                      width={800}
                      height={512}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {isCenter && (
                      <div className="absolute bottom-5 left-5 text-white">
                        <h3 className="text-lg font-bold">{slide.title}</h3>
                        <p className="text-sm text-white/70">{slide.desc}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Nav buttons */}
            <button
              onClick={prev}
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 hover:bg-background text-foreground shadow-md transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 hover:bg-background text-foreground shadow-md transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {carouselSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-12"
          >
            {[
              { end: 150, suffix: '+', label: '해커톤' },
              { end: 3200, suffix: '+', label: '참가자' },
              { end: 800, suffix: '+', label: '팀' },
              { end: 5, prefix: '₩', suffix: '억+', label: '총 상금' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <CountUp
                  end={stat.end}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
                <div className="text-sm text-muted-foreground mt-2 tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature section */}
      <section className="py-24 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              해커톤의 모든 것,
              <br />한 곳에서.
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              하나의 플랫폼에서 해커톤 탐색, 팀 빌딩, 성과 관리까지.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-px bg-border">
            {ctaCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={card.path}
                  className="block p-10 bg-background hover:bg-secondary transition-colors group"
                >
                  <card.icon
                    size={24}
                    className="text-muted-foreground mb-6 group-hover:text-foreground transition-colors"
                  />
                  <h3 className="text-lg font-semibold mb-3">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {card.desc}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    자세히 보기 <ArrowRight size={14} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-32 px-4 bg-background text-foreground border-t border-border">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              지금 시작하세요
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Dakerton에서 당신의 아이디어를 현실로 만들어보세요.
            </p>

            <HackathonSearchBar />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold text-primary">Dakerton</span>
          <span className="text-xs text-muted-foreground">
            © 2026 Dakerton. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
