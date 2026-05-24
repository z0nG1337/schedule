import type { BellSlot, DayKey, WeekSchedule } from "@/lib/types";
import { DAY_LABELS, DAY_ORDER } from "@/lib/types";

type Props = {
  schedule: WeekSchedule;
  bells: BellSlot[];
};

function bellForSlot(bells: BellSlot[], slot: number): { start: string; end: string } | undefined {
  const b = bells.find((x) => x.slot === slot);
  return b ? { start: b.start, end: b.end } : undefined;
}

type DayGroup = {
  day: DayKey;
  lessons: { slot: number; subject: string; room?: string; teacher?: string }[];
};

function groupByDay(schedule: WeekSchedule): DayGroup[] {
  const byDay = new Map(schedule.days.map((d) => [d.day, d.lessons]));
  const groups: DayGroup[] = [];
  for (const day of DAY_ORDER) {
    const lessons = byDay.get(day);
    if (!lessons || lessons.length === 0) continue;
    groups.push({
      day,
      lessons: [...lessons].sort((a, b) => a.slot - b.slot),
    });
  }
  return groups;
}

function isToday(day: DayKey): boolean {
  const today = new Date().getDay();
  const dayMap: Record<DayKey, number> = {
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };
  return dayMap[day] === today;
}

export function ScheduleGrid({ schedule, bells }: Props) {
  const dayGroups = groupByDay(schedule);

  if (dayGroups.length === 0) {
    return (
      <p className="py-8 text-center text-[var(--muted)]">
        Нет уроков в расписании этого класса.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
      {dayGroups.map((group) => {
        const today = isToday(group.day);

        return (
          <section
            key={group.day}
            className={`rounded-xl border overflow-hidden ${
              today
                ? "border-[var(--accent)]/40 shadow-md"
                : "border-[var(--border)] shadow-sm"
            } bg-[var(--surface)]`}
          >
            {/* Day header */}
            <div
              className={`px-4 py-2.5 border-b ${
                today
                  ? "bg-[var(--accent)]/5 border-[var(--accent)]/20"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {DAY_LABELS[group.day]}
                </h3>
                {today && (
                  <span className="inline-flex items-center rounded-full bg-[var(--green-light)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--green-color)]">
                    Сегодня
                  </span>
                )}
              </div>
            </div>

            {/* Lessons */}
            <div className="p-3 space-y-2.5">
              {group.lessons.map((lesson, index) => {
                const time = bellForSlot(bells, lesson.slot);

                return (
                  <div
                    key={`${group.day}-${lesson.slot}-${index}`}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 transition-shadow hover:shadow-sm"
                  >
                    {/* Top row: slot badge + time */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-2 py-0.5 text-[11px] font-semibold text-white leading-tight">
                        {lesson.slot} урок
                      </span>
                      {time && (
                        <span className="text-[11px] text-[var(--muted)] font-medium">
                          {time.start}–{time.end}
                        </span>
                      )}
                    </div>

                    {/* Subject */}
                    <p className="text-sm font-semibold leading-snug mb-1">
                      {lesson.subject}
                    </p>

                    {/* Room + Teacher */}
                    {(lesson.room || lesson.teacher) && (
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-[var(--muted)]">
                        {lesson.room && (
                          <span className="inline-flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            каб. {lesson.room}
                          </span>
                        )}
                        {lesson.teacher && (
                          <span className="inline-flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {lesson.teacher}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}