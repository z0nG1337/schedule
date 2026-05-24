"use client";

import { useMemo, useState } from "react";
import type { BellSlot, SchedulePayload } from "@/lib/types";
import { currentWeekStartIso, formatWeekRange } from "@/lib/week";
import { AppHeader } from "./shared/app-header";
import { BellsPanel } from "./bells-panel";

export function TeacherApp() {
  const weekStart = useMemo(() => currentWeekStartIso(), []);
  const weekLabel = useMemo(() => formatWeekRange(weekStart), [weekStart]);
  const [teacherName, setTeacherName] = useState("");
  const [data, setData] = useState<SchedulePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bellsOpen, setBellsOpen] = useState(false);

  return (
    <div className="min-h-full bg-[var(--bg)] text-[var(--text)]">
      <AppHeader schoolName="Школа" weekLabel={weekLabel} />

      {/* Hero Banner */}
      <section
        className="relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/images/bg-banner.png')",
          backgroundColor: "var(--accent)",
        }}
      >
        <div className="flex items-center justify-center py-10 md:py-14">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Расписание
          </h1>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Расписание преподавателей
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Введите фамилию преподавателя, чтобы увидеть его расписание.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="Фамилия преподавателя"
              className="flex-1 min-w-[200px] rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button
              type="button"
              onClick={() => setBellsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-hover)] transition-colors"
            >
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                <path fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32" d="M256 64C150 64 64 150 64 256s86 192 192 192 192-86 192-192S362 64 256 64z" />
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M256 128v144h96" />
              </svg>
              Звонки
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          )}

          {loading && (
            <p className="mt-8 py-12 text-center text-[var(--muted)]">
              Загрузка расписания…
            </p>
          )}

          {!loading && !error && !teacherName && (
            <div className="mt-8 rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
              <p className="text-[var(--muted)]">
                Начните вводить фамилию преподавателя для поиска
              </p>
            </div>
          )}
        </section>
      </main>

      <BellsPanel
        bells={data?.bells ?? []}
        open={bellsOpen}
        onClose={() => setBellsOpen(false)}
      />
    </div>
  );
}