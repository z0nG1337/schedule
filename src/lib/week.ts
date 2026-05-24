const MS_DAY = 86_400_000;

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Monday of the week containing `date`. */
export function startOfWeekMonday(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function endOfSchoolWeek(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 5);
  return end;
}

export function formatWeekRange(weekStartIso: string): string {
  const start = parseIsoDate(weekStartIso);
  const end = endOfSchoolWeek(start);
  const fmt = (d: Date) =>
    d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function shiftWeek(weekStartIso: string, deltaWeeks: number): string {
  const start = parseIsoDate(weekStartIso);
  start.setDate(start.getDate() + deltaWeeks * 7);
  return toIsoDate(start);
}

export function currentWeekStartIso(): string {
  return toIsoDate(startOfWeekMonday(new Date()));
}

export function isCurrentWeek(weekStartIso: string): boolean {
  return weekStartIso === currentWeekStartIso();
}
