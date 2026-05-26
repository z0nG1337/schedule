import { parseBellsCsv, parseScheduleCsv, getWeekForGroup } from "./parse-schedule";
import type { SchedulePayload } from "./types";
import { buildDemoPayload } from "./demo-data";
import { currentWeekStartIso } from "./week";

let cachedUpdatedAt: string | null = null;

function getGidMapFromEnv(): Record<string, string> {
  // Ожидаемый формат:
  //   GOOGLE_SHEET_GID_MAP='{"10А":"12","10Б":"13"}'
  // Или:
  //   GOOGLE_SHEET_GID_MAP='10А=12,10Б=13'
  const raw = process.env.GOOGLE_SHEET_GID_MAP?.trim();
  if (!raw) return {};

  try {
    const json = JSON.parse(raw) as Record<string, string>;
    if (!json || typeof json !== "object") return {};
    return Object.fromEntries(
      Object.entries(json).filter(([, v]) => typeof v === "string" && v.trim()),
    );
  } catch {
    // fallback: 10А=12,10Б=13
    const out: Record<string, string> = {};
    for (const part of raw.split(/[,;\n]/g)) {
      const [k, v] = part.split("=").map((x) => x.trim());
      if (k && v) out[k] = v;
    }
    return out;
  }
}

function resolveGidForGroup(group: string): string | null {
  const map = getGidMapFromEnv();
  if (!group) return null;
  if (map[group]) return map[group];

  // дополнительный fallback по похожим вариантам написания
  const normalized = group
    .replace(/\s+/g, "")
    .replace(/[–—]/g, "-");
  for (const [k, v] of Object.entries(map)) {
    const nk = k.replace(/\s+/g, "").replace(/[–—]/g, "-");
    if (nk === normalized) return v;
  }

  return null;
}

export function getSheetsConfig() {
  const csvUrl = process.env.GOOGLE_SHEETS_CSV_URL?.trim();
  const bellsUrl = process.env.GOOGLE_BELLS_CSV_URL?.trim();
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  const defaultGid = process.env.GOOGLE_SHEET_GID ?? "0";

  let scheduleUrl = csvUrl;
  if (!scheduleUrl && sheetId) {
    // ВАЖНО: если задан GOOGLE_SHEET_GID_MAP, то gid будет динамически подставляться ниже.
    scheduleUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${defaultGid}`;
  }

  return {
    scheduleUrl,
    bellsUrl,
    hasSource: Boolean(scheduleUrl),
    sheetId,
    defaultGid,
  };
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
  const { scheduleUrl, bellsUrl, hasSource, sheetId } = getSheetsConfig();

  if (!hasSource) {
    return buildDemoPayload(weekStart || currentWeekStartIso(), group || "10-А");
  }

  // gid per class: если есть GOOGLE_SHEET_GID_MAP и под выбранный group найден gid — используем вкладку.
  const resolvedGid = sheetId ? resolveGidForGroup(group) : null;
  const scheduleUrlResolved =
    sheetId && resolvedGid
      ? `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${resolvedGid}`
      : scheduleUrl;

  if (!scheduleUrlResolved) {
    return buildDemoPayload(weekStart || currentWeekStartIso(), group || "10-А");
  }

  const [scheduleText, bellsText] = await Promise.all([
    fetchText(scheduleUrlResolved),
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
