"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SchedulePayload } from "@/lib/types";
import { currentWeekStartIso, formatWeekRange } from "@/lib/week";
import { BellsPanel } from "./bells-panel";
import { ScheduleGrid } from "./schedule-grid";
import { ThemeToggle } from "./theme-toggle";

const CLASS_KEY = "schedule-class";

export function ScheduleApp() {
  const weekStart = useMemo(() => currentWeekStartIso(), []);
  const [className, setClassName] = useState("");
  const [data, setData] = useState<SchedulePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bellsOpen, setBellsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const weekLabel = useMemo(() => formatWeekRange(weekStart), [weekStart]);

  const load = useCallback(
    async (refresh = false) => {
      setLoading(!refresh);
      if (refresh) setRefreshing(true);
      setError(null);
      try {
        const params = new URLSearchParams({ week: weekStart });
        if (className) params.set("group", className);
        if (refresh) params.set("refresh", "1");
        const res = await fetch(`/api/schedule?${params}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Ошибка загрузки");
        setData(json);
        if (!className && json.groups?.[0]) {
          const saved = localStorage.getItem(CLASS_KEY);
          const pick =
            saved && json.groups.includes(saved) ? saved : json.groups[0];
          setClassName(pick);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [weekStart, className],
  );

  useEffect(() => {
    const saved = localStorage.getItem(CLASS_KEY);
    if (saved) setClassName(saved);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (className) localStorage.setItem(CLASS_KEY, className);
  }, [className]);

  const isDemo = data?.source === "demo";

  return (
    <div className="min-h-full bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
              Расписание
            </p>
            <h1 className="text-xl font-bold">{data?.schoolName ?? "Школа"}</h1>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              Текущая неделя · {weekLabel}
            </p>
          </div>
          <nav className="flex gap-2 text-sm">
            <span className="rounded-lg bg-[var(--accent)] px-3 py-1.5 font-medium text-white">
              Ученикам
            </span>
            <a
              href="/teacher"
              className="rounded-lg px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--surface-hover)]"
            >
              Учителям
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {isDemo && (
          <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
            Демо-режим: подключите Google Таблицу через{" "}
            <code className="rounded bg-black/10 px-1">GOOGLE_SHEETS_CSV_URL</code>{" "}
            в настройках Vercel.
          </div>
        )}

        <aside className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <label htmlFor="class" className="text-xs text-[var(--muted)]">
            Класс
          </label>
          <select
            id="class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="mt-1 w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            {(data?.groups ?? []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setBellsOpen(true)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-hover)]"
            >
              Звонки
            </button>
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {refreshing ? "Обновление…" : "Обновить"}
            </button>
            <ThemeToggle />
          </div>
          {data?.updatedAt && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              Обновлено: {new Date(data.updatedAt).toLocaleString("ru-RU")}
            </p>
          )}
        </aside>

        {loading && (
          <p className="py-12 text-center text-[var(--muted)]">
            Загрузка расписания…
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        )}
        {!loading && !error && data?.schedule && (
          <ScheduleGrid schedule={data.schedule} bells={data.bells} />
        )}
        {!loading && !error && data && !data.schedule && (
          <p className="py-12 text-center text-[var(--muted)]">
            Нет расписания для этого класса. Проверьте данные в таблице.
          </p>
        )}
      </main>

      <BellsPanel
        bells={data?.bells ?? []}
        open={bellsOpen}
        onClose={() => setBellsOpen(false)}
      />
    </div>
  );
}
