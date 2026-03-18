"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/hackathons", label: "해커톤" },
  { href: "/camp", label: "팀 찾기" },
  { href: "/rankings", label: "랭킹" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-[#0D1117]/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-[17px] font-bold tracking-tight text-zinc-900 dark:text-white">
            Dakerton
          </Link>
          <div className="hidden sm:flex items-center gap-8">
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-[15px] font-medium transition-colors ${
                    active
                      ? "text-zinc-900 dark:text-white"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
        <button onClick={() => setOpen(!open)} className="sm:hidden p-2 -mr-2 text-zinc-500">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
      {open && (
        <div className="sm:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0D1117] px-5 pb-4 pt-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block py-2.5 text-[15px] font-medium text-zinc-600 dark:text-zinc-300">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
