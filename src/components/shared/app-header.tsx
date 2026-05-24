"use client";

import { ThemeToggle } from "@/components/theme-toggle";

type Props = {
  schoolName?: string;
  weekLabel?: string;
};

export function AppHeader({ schoolName, weekLabel }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <span className="text-[var(--accent)] font-bold text-2xl tracking-tight select-none">
          197
        </span>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {weekLabel && (
            <span className="hidden sm:block text-xs text-[var(--muted)]">
              {weekLabel}
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}