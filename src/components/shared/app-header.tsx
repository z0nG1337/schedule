"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  schoolName?: string;
  weekLabel?: string;
};

export function AppHeader({ schoolName, weekLabel }: Props) {
  const pathname = usePathname();
  const isStudent = pathname === "/student" || pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
            Расписание
          </p>
          <h1 className="text-xl font-bold">{schoolName ?? "Школа"}</h1>
          {weekLabel && (
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              Текущая неделя · {weekLabel}
            </p>
          )}
        </div>
        <nav className="flex gap-2 text-sm">
          <Link
            href="/student"
            className={`rounded-lg px-3 py-1.5 font-medium ${
              isStudent
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            Ученикам
          </Link>
          <Link
            href="/teacher"
            className={`rounded-lg px-3 py-1.5 font-medium ${
              !isStudent
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            Учителям
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
