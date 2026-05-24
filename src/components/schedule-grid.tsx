import type { BellSlot, DayKey, WeekSchedule } from "@/lib/types";
import { DAY_LABELS, DAY_ORDER } from "@/lib/types";

type Props = {
  schedule: WeekSchedule;
  bells: BellSlot[];
};

function bellForSlot(bells: BellSlot[], slot: number): string | undefined {
  const b = bells.find((x) => x.slot === slot);
  return b ? `${b.start}${b.end ? `–${b.end}` : ""}` : undefined;
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
    <div className="mx-auto max-w-2xl space-y-6">
      {dayGroups.map((group) => (
        <section key={group.day}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            {DAY_LABELS[group.day]}
          </h3>
          <ul className="space-y-3">
            {group.lessons.map((lesson, index) => (
              <li
                key={`${group.day}-${lesson.slot}-${index}`}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-[var(--accent)]">
                    {lesson.slot} урок
                  </span>
                  {bellForSlot(bells, lesson.slot) && (
                    <span className="text-xs text-[var(--muted)]">
                      {bellForSlot(bells, lesson.slot)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-lg font-medium leading-snug">
                  {lesson.subject}
                </p>
                {(lesson.room || lesson.teacher) && (
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {[lesson.room && `каб. ${lesson.room}`, lesson.teacher]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
