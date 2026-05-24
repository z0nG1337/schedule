import { parseBellsCsv, parseScheduleCsv, getWeekForGroup } from "./parse-schedule";
import type { SchedulePayload } from "./types";
import { buildDemoPayload } from "./demo-data";
import { currentWeekStartIso } from "./week";

let cachedUpdatedAt: string | null = null;

export function getSheetsConfig() {
  const csvUrl = process.env.GOOGLE_SHEETS_CSV_URL?.trim();
  const bellsUrl = process.env.GOOGLE_BELLS_CSV_URL?.trim();
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  const gid = process.env.GOOGLE_SHEET_GID ?? "0";

  let scheduleUrl = csvUrl;
  if (!scheduleUrl && sheetId) {
    scheduleUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  }

  return { scheduleUrl, bellsUrl, hasSource: Boolean(scheduleUrl) };
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    next: { revalidate: 300, tags: ["schedule"] },
    headers: { "User-Agent": "school-schedule/1.0" },
  });
  if (!res.ok) {
    throw new Error(`Не удалось загрузить таблицу (${res.status})`);
  }
  return res.text();
}

export async function loadScheduleFromSheets(
  weekStart: string,
  group: string,
): Promise<SchedulePayload> {
  const { scheduleUrl, bellsUrl, hasSource } = getSheetsConfig();

  if (!hasSource || !scheduleUrl) {
    return buildDemoPayload(weekStart || currentWeekStartIso(), group || "10-А");
  }

  const [scheduleText, bellsText] = await Promise.all([
    fetchText(scheduleUrl),
    bellsUrl ? fetchText(bellsUrl) : Promise.resolve(""),
  ]);

  const parsed = parseScheduleCsv(scheduleText);
  const bells = bellsText ? parseBellsCsv(bellsText) : [];
  const resolvedWeek =
    parsed.weeks.find((w) => w.weekStart === weekStart)?.weekStart ??
    parsed.weeks.at(-1)?.weekStart ??
    weekStart;
  const resolvedGroup =
    parsed.groups.includes(group) ? group : (parsed.groups[0] ?? group);

  cachedUpdatedAt = new Date().toISOString();

  return {
    schoolName: process.env.SCHOOL_NAME ?? "Школа",
    groups: parsed.groups,
    bells,
    weeks: parsed.weeks,
    schedule: getWeekForGroup(parsed, resolvedWeek, resolvedGroup),
    updatedAt: cachedUpdatedAt,
    source: "sheets",
  };
}

export function getLastUpdatedAt(): string | null {
  return cachedUpdatedAt;
}
