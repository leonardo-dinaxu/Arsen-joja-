"use client";

// =============================================================
// SFL — Street Football League
// app/matches/[id]/_components/JoinButton.tsx
// Кнопка записи / отмены записи
// =============================================================

import { useActionState } from "react";
import { joinMatchAction, leaveMatchAction, type JoinMatchState } from "@/app/actions/joinMatch";

const initialState: JoinMatchState = { success: false };

export default function JoinButton({
  matchId,
  canJoin,
  canLeave,
  isRegistered,
  matchStatus,
}: {
  matchId:      string;
  canJoin:      boolean;
  canLeave:     boolean;
  isRegistered: boolean;
  matchStatus:  string;
}) {
  const [joinState,  joinAction,  joinPending]  = useActionState(joinMatchAction,  initialState);
  const [leaveState, leaveAction, leavePending] = useActionState(leaveMatchAction, initialState);

  const message = joinState.message || leaveState.message;
  const isSuccess = joinState.success || leaveState.success;

  // Матч завершён или отменён — ничего не показываем
  if (["COMPLETED","CANCELLED","DRAFT"].includes(matchStatus) && !isRegistered) {
    return null;
  }

  return (
    <div className="space-y-3">

      {/* Сообщение об успехе или ошибке */}
      {message && (
        <div className={[
          "text-sm rounded-xl px-4 py-3 border",
          isSuccess
            ? "bg-green-950 border-green-800 text-green-400"
            : "bg-red-950 border-red-800 text-red-400",
        ].join(" ")}>
          {message}
        </div>
      )}

      {/* Уже записан */}
      {isRegistered && !joinState.success && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-green-400">✓ Вы записаны на матч</p>
            <p className="text-zinc-500 text-xs mt-0.5">
              Ожидайте подтверждения оплаты от администратора
            </p>
          </div>
          {canLeave && (
            <form action={leaveAction}>
              <input type="hidden" name="matchId" value={matchId} />
              <button
                type="submit"
                disabled={leavePending}
                className="shrink-0 text-xs text-zinc-500 border border-zinc-700 px-3 py-1.5
                           rounded-lg hover:text-red-400 hover:border-red-800 transition-colors
                           disabled:opacity-50"
              >
                {leavePending ? "Отменяем..." : "Отменить запись"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Кнопка записи */}
      {canJoin && !joinState.success && (
        <form action={joinAction}>
          <input type="hidden" name="matchId" value={matchId} />
          <button
            type="submit"
            disabled={joinPending}
            className="w-full bg-white text-black font-medium rounded-xl py-3 text-sm
                       transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {joinPending ? "Записываемся..." : "Записаться на матч"}
          </button>
        </form>
      )}

      {/* Мест нет */}
      {!canJoin && !isRegistered && matchStatus === "FULL" && (
        <div className="w-full bg-zinc-900 border border-zinc-800 text-zinc-500 font-medium
                        rounded-xl py-3 text-sm text-center">
          Все места заняты
        </div>
      )}

    </div>
  );
}
