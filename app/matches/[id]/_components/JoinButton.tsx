"use client";

import { useActionState, useEffect } from "react";
import { useRouter }                 from "next/navigation";
import Link                          from "next/link";
import { joinMatchAction, leaveMatchAction, type JoinMatchState } from "@/app/actions/joinMatch";

const initialState: JoinMatchState = { success: false };

export default function JoinButton({
  matchId,
  canJoin,
  canLeave,
  isRegistered,
  isPaid,
  matchStatus,
}: {
  matchId:      string;
  canJoin:      boolean;
  canLeave:     boolean;
  isRegistered: boolean;
  isPaid:       boolean;
  matchStatus:  string;
}) {
  const router = useRouter();

  const [joinState,  joinAction,  joinPending]  = useActionState(joinMatchAction,  initialState);
  const [leaveState, leaveAction, leavePending] = useActionState(leaveMatchAction, initialState);

  // После успешной записи — сразу на страницу оплаты
  useEffect(() => {
    if (joinState.success) {
      router.push(`/matches/${matchId}/pay`);
    }
  }, [joinState.success, matchId, router]);

  if (["COMPLETED","CANCELLED","DRAFT"].includes(matchStatus) && !isRegistered) return null;

  return (
    <div className="space-y-3">

      {/* Ошибки */}
      {leaveState.message && (
        <div className={[
          "text-sm rounded-xl px-4 py-3 border",
          leaveState.success
            ? "bg-green-950 border-green-800 text-green-400"
            : "bg-red-950 border-red-800 text-red-400",
        ].join(" ")}>
          {leaveState.message}
        </div>
      )}
      {joinState.message && !joinState.success && (
        <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">
          {joinState.message}
        </div>
      )}

      {/* Уже записан */}
      {isRegistered && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              {isPaid ? (
                <>
                  <p className="text-sm font-medium text-green-400">✓ Оплачено</p>
                  <p className="text-zinc-500 text-xs mt-0.5">Ваше место подтверждено</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-orange-400">⏳ Ожидает оплаты</p>
                  <p className="text-zinc-500 text-xs mt-0.5">Оплатите участие чтобы подтвердить место</p>
                </>
              )}
            </div>
            {canLeave && (
              <form action={leaveAction}>
                <input type="hidden" name="matchId" value={matchId} />
                <button type="submit" disabled={leavePending}
                  className="shrink-0 text-xs text-zinc-500 border border-zinc-700 px-3 py-1.5
                             rounded-lg hover:text-red-400 hover:border-red-800 transition-colors
                             disabled:opacity-50">
                  {leavePending ? "Отменяем..." : "Отменить запись"}
                </button>
              </form>
            )}
          </div>

          {/* Кнопка оплаты */}
          {!isPaid && !["COMPLETED","CANCELLED","IN_PROGRESS"].includes(matchStatus) && (
            <Link
              href={`/matches/${matchId}/pay`}
              className="block w-full bg-white text-black font-medium text-center
                         rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              Оплатить участие →
            </Link>
          )}
        </div>
      )}

      {/* Кнопка записи */}
      {canJoin && (
        <form action={joinAction}>
          <input type="hidden" name="matchId" value={matchId} />
          <button type="submit" disabled={joinPending}
            className="w-full bg-white text-black font-medium rounded-xl py-3 text-sm
                       transition-opacity hover:opacity-90 disabled:opacity-50">
            {joinPending ? "Записываемся..." : "Записаться на матч"}
          </button>
        </form>
      )}

      {/* Мест нет */}
      {!canJoin && !isRegistered && matchStatus === "FULL" && (
        <div className="w-full bg-zinc-900 border border-zinc-800 text-zinc-500
                        rounded-xl py-3 text-sm text-center">
          Все места заняты
        </div>
      )}

    </div>
  );
}
