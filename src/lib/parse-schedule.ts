import { parseCsv, rowsToObjects } from "./csv";
import { parseDay } from "./day-map";
import type { BellSlot, DayKey, DaySchedule, Lesson, WeekSchedule } from "./types";
import { DAY_ORDER } from "./types";
import { currentWeekStartIso, endOfSchoolWeek, parseIsoDate, toIsoDate } from "./week";

function defaultWeekStart(): string {
  const fromEnv = process.env.SCHEDULE_WEEK_START?.trim();
  if (fromEnv && parseWeekStart(fromEnv)) return parseWeekStart(fromEnv)!;
  return currentWeekStartIso();
}

function isGarbageRow(subject: string, group: string): boolean {
  if (!subject || subject === ":") return true;
  if (/^[\s:,]+$/.test(subject)) return true;
  if (group && /^[\s:,]+$/.test(group)) return true;
  return false;
}

function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v) return v;
  }
  return "";
}

function parseWeekStart(raw: string): string | null {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const m = raw.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2,4})$/);
  if (!m) return null;
  const d = Number(m[1]);
  const mo = Number(m[2]);
  let y = Number(m[3]);
  if (y < 100) y += 2000;
  return toIsoDate(new Date(y, mo - 1, d));
}

export function parseBellsCsv(text: string): BellSlot[] {
  const rows = rowsToObjects(parseCsv(text));
  return rows
    .map((row) => {
      const slot = Number(pick(row, ["пара", "slot", "lesson", "номер"]));
      const start = pick(row, ["начало", "start", "время_начала"]);
      const end = pick(row, ["конец", "end", "время_конца"]);
      if (!slot || !start) return null;
      return { slot, start, end: end || "" };
    })
    .filter((b): b is BellSlot => b !== null)
    .sort((a, b) => a.slot - b.slot);
}

export type ParsedSchedule = {
  groups: string[];
  weeks: { weekStart: string; weekEnd: string }[];
  byWeekAndGroup: Map<string, WeekSchedule>;
};

function weekKey(weekStart: string, group: string) {
  return `${weekStart}::${group}`;
}

export function parseScheduleCsv(text: string): ParsedSchedule {
  const rows = rowsToObjects(parseCsv(text));
  const groupsSet = new Set<string>();
  const weeksSet = new Map<string, string>();
  const bucket = new Map<string, Map<DayKey, Map<number, Lesson>>>();

  let lastDayRaw = "";
  let lastGroup = "";
  const slotByDayGroup = new Map<string, number>();

  for (const row of rows) {
    const dayRaw =
      pick(row, ["день", "day", "день_недели"]) || lastDayRaw;
    const group =
      pick(row, ["класс", "class", "группа", "group"]) || lastGroup;
    const weekRaw = pick(row, ["неделя", "week", "week_start", "дата_недели"]);
    const subject = pick(row, ["предмет", "subject", "дисциплина"]);
    const room = pick(row, ["кабинет", "room", "аудитория"]);
    const teacher = pick(row, ["учитель", "teacher", "преподаватель"]);
    let slot = Number(pick(row, ["пара", "slot", "lesson", "урок"]));

    if (dayRaw) lastDayRaw = dayRaw;
    if (group) lastGroup = group;

    if (!group || !subject || isGarbageRow(subject, group)) continue;

    const day = parseDay(dayRaw);
    const weekStart = parseWeekStart(weekRaw) ?? defaultWeekStart();
    if (!day) continue;

    if (!slot) {
      const counterKey = `${weekStart}::${group}::${day}`;
      slot = (slotByDayGroup.get(counterKey) ?? 0) + 1;
      slotByDayGroup.set(counterKey, slot);
    }

    groupsSet.add(group);
    const weekEnd = toIsoDate(endOfSchoolWeek(parseIsoDate(weekStart)));
    weeksSet.set(weekStart, weekEnd);

    const key = weekKey(weekStart, group);
    if (!bucket.has(key)) bucket.set(key, new Map());
    const days = bucket.get(key)!;
    if (!days.has(day)) days.set(day, new Map());
    const slots = days.get(day)!;
    slots.set(slot, {
      slot,
      subject,
      room: room || undefined,
      teacher: teacher || undefined,
    });
  }

  const byWeekAndGroup = new Map<string, WeekSchedule>();
  for (const [key, daysMap] of bucket) {
    const [weekStart, group] = key.split("::");
    const weekEnd = weeksSet.get(weekStart) ?? weekStart;
    const days: DaySchedule[] = DAY_ORDER.map((day) => {
      const slots = daysMap.get(day);
      const lessons = slots
        ? [...slots.values()].sort((a, b) => a.slot - b.slot)
        : [];
      return { day, lessons };
    }).filter((d) => d.lessons.length > 0);

    byWeekAndGroup.set(key, { weekStart, weekEnd, group, days });
  }

  const weeks = [...weeksSet.entries()]
    .map(([weekStart, weekEnd]) => ({ weekStart, weekEnd }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  return {
    groups: [...groupsSet].sort((a, b) => a.localeCompare(b, "ru")),
    weeks,
    byWeekAndGroup,
  };
}

export function getWeekForGroup(
  parsed: ParsedSchedule,
  weekStart: string,
  group: string,
): WeekSchedule | null {
  return parsed.byWeekAndGroup.get(weekKey(weekStart, group)) ?? null;
}
