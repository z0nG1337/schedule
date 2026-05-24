import type { BellSlot } from "@/lib/types";

type Props = {
  bells: BellSlot[];
  open: boolean;
  onClose: () => void;
};

export function BellsPanel({ bells, open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Расписание звонков"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Расписание звонков</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:bg-[var(--surface-hover)]"
          >
            Закрыть
          </button>
        </div>
        {bells.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Добавьте лист «Звонки» в таблицу или укажите GOOGLE_BELLS_CSV_URL.
          </p>
        ) : (
          <ul className="space-y-2">
            {bells.map((b) => (
              <li
                key={b.slot}
                className="flex items-center justify-between rounded-xl bg-[var(--surface-hover)] px-4 py-3"
              >
                <span className="font-medium">{b.slot} пара</span>
                <span className="text-sm text-[var(--muted)]">
                  {b.start}
                  {b.end ? ` – ${b.end}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
