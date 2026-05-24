import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { loadScheduleFromSheets } from "@/lib/sheets";
import { currentWeekStartIso } from "@/lib/week";


export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const week = currentWeekStartIso();
  const group = searchParams.get("group") ?? searchParams.get("class") ?? "";
  const refresh = searchParams.get("refresh") === "1";

  if (refresh) {
    revalidateTag("schedule", "max");
  }

  try {
    const data = await loadScheduleFromSheets(week, group);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка загрузки расписания";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
