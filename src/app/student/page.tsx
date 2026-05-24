import { ScheduleApp } from "@/components/schedule-app";

export const metadata = {
  title: "Расписание — ученикам",
  description: "Расписание уроков на текущую неделю",
};

export default function StudentPage() {
  return <ScheduleApp />;
}
