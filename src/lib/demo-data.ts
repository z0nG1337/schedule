import type { BellSlot, SchedulePayload } from "./types";
import { currentWeekStartIso, formatWeekRange } from "./week";

const DEMO_BELLS: BellSlot[] = [
  { slot: 1, start: "08:30", end: "09:15" },
  { slot: 2, start: "09:25", end: "10:10" },
  { slot: 3, start: "10:20", end: "11:05" },
  { slot: 4, start: "11:25", end: "12:10" },
  { slot: 5, start: "12:20", end: "13:05" },
  { slot: 6, start: "13:15", end: "14:00" },
  { slot: 7, start: "14:10", end: "14:55" },
];

export function buildDemoPayload(
  weekStart: string,
  group: string,
): SchedulePayload {
  const weekEnd = weekStart;
  return {
    schoolName: process.env.SCHOOL_NAME ?? "Школа",
    groups: ["10-А", "10-Б", "11-А"],
    bells: DEMO_BELLS,
    weeks: [{ weekStart, weekEnd }],
    schedule: {
      weekStart,
      weekEnd,
      group,
      days: [
        {
          day: "mon",
          lessons: [
            { slot: 1, subject: "Алгебра", room: "201", teacher: "Иванова" },
            { slot: 2, subject: "Русский язык", room: "105" },
            { slot: 3, subject: "Физика", room: "312", teacher: "Петров" },
            { slot: 4, subject: "История", room: "210" },
            { slot: 5, subject: "Физкультура", room: "спортзал" },
          ],
        },
        {
          day: "tue",
          lessons: [
            { slot: 1, subject: "Геометрия", room: "201" },
            { slot: 2, subject: "Литература", room: "105" },
            { slot: 3, subject: "Информатика", room: "404" },
            { slot: 4, subject: "Английский", room: "301" },
          ],
        },
        {
          day: "wed",
          lessons: [
            { slot: 1, subject: "Химия", room: "315" },
            { slot: 2, subject: "Биология", room: "218" },
            { slot: 3, subject: "Обществознание", room: "210" },
          ],
        },
        {
          day: "thu",
          lessons: [
            { slot: 1, subject: "Алгебра", room: "201" },
            { slot: 2, subject: "География", room: "212" },
            { slot: 3, subject: "ОБЖ", room: "101" },
            { slot: 4, subject: "Музыка", room: "муз.зал" },
          ],
        },
        {
          day: "fri",
          lessons: [
            { slot: 1, subject: "Русский язык", room: "105" },
            { slot: 2, subject: "Физика", room: "312" },
            { slot: 3, subject: "Труд", room: "мастерская" },
          ],
        },
      ],
    },
    updatedAt: new Date().toISOString(),
    source: "demo",
  };
}

export function demoWeekLabel(): string {
  const w = currentWeekStartIso();
  return formatWeekRange(w);
}
