import type { DayKey } from "./types";

const DAY_ALIASES: Record<string, DayKey> = {
  mon: "mon",
  monday: "mon",
  пн: "mon",
  понедельник: "mon",
  tue: "tue",
  tuesday: "tue",
  вт: "tue",
  вторник: "tue",
  wed: "wed",
  wednesday: "wed",
  ср: "wed",
  среда: "wed",
  thu: "thu",
  thursday: "thu",
  чт: "thu",
  четверг: "thu",
  fri: "fri",
  friday: "fri",
  пт: "fri",
  пятница: "fri",
  sat: "sat",
  saturday: "sat",
  сб: "sat",
  суббота: "sat",
};

export function parseDay(raw: string): DayKey | null {
  const key = raw.trim().toLowerCase().replace(/\./g, "");
  return DAY_ALIASES[key] ?? null;
}
