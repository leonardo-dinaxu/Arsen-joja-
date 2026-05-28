"use client";

// Смена статуса матча
import { updateMatchStatusAction } from "@/app/actions/adminMatch";

const STATUSES = [
  { value: "DRAFT",       label: "Черновик",       style: "bg-zinc-800 text-zinc-400" },
  { value: "OPEN",        label: "Идёт набор",      style: "bg-green-950 text-green-400 border-green-800" },
  { value: "HOT",         label: "Почти заполнен",  style: "bg-orange-950 text-orange-400 border-orange-800" },
  { value: "FULL",        label: "Заполнен",        style: "bg-red-950 text-red-400 border-red-800" },
  { value: "IN_PROGRESS", label: "Идёт матч",       style: "bg-blue-950 text-blue-400 border-blue-800" },
  { value: "COMPLETED",   label: "Завершён",        style: "bg-zinc-800 text-zinc-400" },
  { value: "CANCELLED",   label: "Отменён",         style: "bg-zinc-800 text-zinc-600" },
];

export default function MatchControls({
  matchId,
  currentStatus,
}: {
  matchId: string;
  currentStatus: string;
}) {
  return (
    <div>
      <p className="text-zinc-500 text-xs mb-3">Статус матча</p>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <form key={s.value} action={updateMatchStatusAction}>
            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="status"  value={s.value} />
            <button
              type="submit"
              className={[
                "text-xs px-3 py-1.5 rounded-full border transition-opacity",
                s.value === currentStatus
                  ? s.style + " border-current opacity-100"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300",
              ].join(" ")}
            >
              {s.label}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
