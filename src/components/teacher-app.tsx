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

      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
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
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-hover)]"
            >
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
