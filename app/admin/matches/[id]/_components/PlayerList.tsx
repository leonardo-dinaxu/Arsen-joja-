"use client";

// Список игроков с кнопками оплаты и удаления
import { markPaymentAction, kickPlayerAction } from "@/app/actions/adminMatch";

const POSITION_SHORT: Record<string, string> = {
  GK: "ВРТ", LB: "ЛЗ", RB: "ПЗ", CB: "ЦЗ", CDM: "ОПЗ",
  CM: "ЦПЗ", CAM: "АПЗ", LW: "ЛВ", RW: "ПВ", ST: "НАП",
};

interface Registration {
  id:     string;
  status: string;
  team:   string | null;
  user: {
    id:    string;
    email: string;
    profile: {
      firstName:    string;
      lastName:     string;
      mainPosition: string;
      rating:       number;
      photoUrl:     string | null;
    } | null;
  };
  payment: {
    status:    string;
    amountSom: number;
    paidAt:    Date | null;
  } | null;
}

export default function PlayerList({
  registrations,
  matchId,
  priceSom,
  readonly,
}: {
  registrations: Registration[];
  matchId:       string;
  priceSom:      number;
  readonly?:     boolean;
}) {
  return (
    <div className="divide-y divide-zinc-800">
      {registrations.map((reg, i) => {
        const profile  = reg.user.profile;
        const isPaid   = reg.status === "CONFIRMED" || reg.payment?.status === "MANUAL" || reg.payment?.status === "PAID";
        const initials = profile
          ? `${profile.firstName[0]}${profile.lastName[0]}`
          : reg.user.email[0].toUpperCase();

        return (
          <div key={reg.id} className="flex items-center gap-3 px-5 py-3">

            {/* Номер */}
            <span className="text-zinc-600 text-xs w-5 shrink-0">{i + 1}</span>

            {/* Аватар */}
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center
                            text-xs font-medium shrink-0">
              {initials}
            </div>

            {/* Имя + позиция */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {profile ? `${profile.firstName} ${profile.lastName}` : reg.user.email}
              </div>
              <div className="text-zinc-500 text-xs flex gap-2">
                {profile && (
                  <>
                    <span>{POSITION_SHORT[profile.mainPosition] ?? profile.mainPosition}</span>
                    <span>·</span>
                    <span>★ {profile.rating > 0 ? profile.rating.toFixed(1) : "—"}</span>
                  </>
                )}
                {reg.team && <span>· Команда {reg.team}</span>}
              </div>
            </div>

            {/* Статус оплаты */}
            <span className={[
              "text-xs px-2 py-0.5 rounded-full shrink-0",
              isPaid
                ? "bg-green-950 text-green-400"
                : "bg-orange-950 text-orange-400",
            ].join(" ")}>
              {isPaid ? "Оплачено" : "Ожидает"}
            </span>

            {/* Действия */}
            {!readonly && (
              <div className="flex gap-2 shrink-0">
                {!isPaid && (
                  <form action={markPaymentAction}>
                    <input type="hidden" name="registrationId" value={reg.id} />
                    <input type="hidden" name="matchId"        value={matchId} />
                    <button type="submit"
                      className="text-xs bg-green-950 text-green-400 border border-green-800
                                 px-2.5 py-1 rounded-lg hover:bg-green-900 transition-colors">
                      Отметить
                    </button>
                  </form>
                )}
                <form action={kickPlayerAction}>
                  <input type="hidden" name="registrationId" value={reg.id} />
                  <input type="hidden" name="matchId"        value={matchId} />
                  <button type="submit"
                    className="text-xs bg-zinc-800 text-zinc-500 border border-zinc-700
                               px-2.5 py-1 rounded-lg hover:text-red-400 hover:border-red-800 transition-colors">
                    Удалить
                  </button>
                </form>
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
