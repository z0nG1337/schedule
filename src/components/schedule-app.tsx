"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SchedulePayload } from "@/lib/types";
import { currentWeekStartIso, formatWeekRange } from "@/lib/week";
import { AppHeader } from "./shared/app-header";
import { BellsPanel } from "./bells-panel";
import { ScheduleGrid } from "./schedule-grid";

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
      <AppHeader schoolName={data?.schoolName} weekLabel={weekLabel} />

      {/* Hero Banner */}
      <section
        className="relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/images/bg-banner.png')",
          backgroundColor: "var(--accent-light)",

        }}
      >
        <div className="flex items-center justify-center py-10 md:py-14">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Расписание
          </h1>
        </div>
      </section>

      {/* Demo notice */}
      {isDemo && (
        <div className="mx-auto max-w-7xl px-4 mt-4">
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
            Демо-режим: подключите Google Таблицу через{" "}
            <code className="rounded bg-black/10 px-1">GOOGLE_SHEETS_CSV_URL</code>{" "}
            в настройках Vercel.
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Class selector */}
        <aside className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="class" className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-1 block">
                Группа
              </label>
              <select
                id="class"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {(data?.groups ?? []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
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
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {refreshing ? "Обновление…" : "Обновить"}
            </button>
          </div>
          {data?.updatedAt && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              Обновлено: {new Date(data.updatedAt).toLocaleString("ru-RU")}
            </p>
          )}
        </aside>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            <div className="skeleton-animation h-10 w-full max-w-sm rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
                  <div className="skeleton-animation h-6 w-3/4 rounded-md" />
                  <div className="skeleton-animation h-4 w-1/2 rounded-md" />
                  <div className="skeleton-animation h-20 w-full rounded-lg" />
                  <div className="skeleton-animation h-20 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Schedule */}
        {!loading && !error && data?.schedule && (
          <ScheduleGrid schedule={data.schedule} bells={data.bells} />
        )}

        {/* Empty state */}
        {!loading && !error && data && !data.schedule && (
          <div className="py-12 text-center">
            <p className="text-[var(--muted)]">
              Нет расписания для этого класса. Проверьте данные в таблице.
            </p>
          </div>
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