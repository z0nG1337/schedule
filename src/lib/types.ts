export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export const DAY_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat"];

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Понедельник",
  tue: "Вторник",
  wed: "Среда",
  thu: "Четверг",
  fri: "Пятница",
  sat: "Суббота",
};

export type BellSlot = {
  slot: number;
  start: string;
  end: string;
};

export type Lesson = {
  slot: number;
  subject: string;
  room?: string;
  teacher?: string;
};

export type DaySchedule = {
  day: DayKey;
  lessons: Lesson[];
};

export type WeekSchedule = {
  weekStart: string;
  weekEnd: string;
  group: string;
  days: DaySchedule[];
};

export type SchedulePayload = {
  schoolName: string;
  groups: string[];
  bells: BellSlot[];
  weeks: { weekStart: string; weekEnd: string }[];
  schedule: WeekSchedule | null;
  updatedAt: string | null;
  source: "demo" | "sheets";
};
