import Link from "next/link";

export const metadata = {
  title: "Расписание — преподавателям",
};

export default function TeacherPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[var(--bg)] px-4 text-[var(--text)]">
      <h1 className="text-2xl font-bold">Расписание преподавателей</h1>
      <p className="max-w-md text-center text-[var(--muted)]">
        Раздел в разработке. Пока используйте ту же Google Таблицу с колонкой
        «учитель» — фильтр можно добавить по запросу.
      </p>
      <Link
        href="/student"
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
      >
        К расписанию студентов
      </Link>
    </div>
  );
}
