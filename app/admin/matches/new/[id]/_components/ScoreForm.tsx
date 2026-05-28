"use client";

// Форма счёта матча
import { updateScoreAction } from "@/app/actions/adminMatch";

export default function ScoreForm({
  matchId,
  teamAScore,
  teamBScore,
}: {
  matchId:    string;
  teamAScore: number | null;
  teamBScore: number | null;
}) {
  return (
    <form action={updateScoreAction} className="border-t border-zinc-800 pt-4">
      <p className="text-zinc-500 text-xs mb-3">Счёт матча</p>
      <div className="flex items-center gap-3">
        <input type="hidden" name="matchId" value={matchId} />
        <div className="flex items-center gap-2">
          <label className="text-zinc-500 text-xs">Команда А</label>
          <input
            name="teamAScore"
            type="number" min="0" max="99"
            defaultValue={teamAScore ?? 0}
            className="w-16 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5
                       text-white text-sm text-center outline-none focus:border-zinc-500"
          />
        </div>
        <span className="text-zinc-600">—</span>
        <div className="flex items-center gap-2">
          <input
            name="teamBScore"
            type="number" min="0" max="99"
            defaultValue={teamBScore ?? 0}
            className="w-16 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5
                       text-white text-sm text-center outline-none focus:border-zinc-500"
          />
          <label className="text-zinc-500 text-xs">Команда Б</label>
        </div>
        <button type="submit"
          className="bg-white text-black text-xs font-medium px-4 py-1.5 rounded-lg
                     hover:opacity-90 transition-opacity ml-2">
          Сохранить
        </button>
      </div>
    </form>
  );
}
