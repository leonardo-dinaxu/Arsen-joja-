"use client";

import { useActionState }      from "react";
import Link                    from "next/link";
import { editMatchAction, deleteMatchAction, type EditMatchState } from "@/app/actions/editMatch";

const initialState: EditMatchState = { success: false };

const inputCls = (error?: string) => [
  "w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm",
  "placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors",
  error ? "border-red-700" : "border-zinc-700",
].join(" ");

interface MatchData {
  id: string; title: string; date: string; time: string;
  address: string; venueName: string; priceSom: number;
  maxPlayers: number; description: string; status: string;
}

export default function EditMatchForm({ match }: { match: MatchData }) {
  const [state, formAction, isPending] = useActionState(editMatchAction, initialState);

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="text-lg font-medium tracking-[0.2em] uppercase">⬡ SFL Admin</Link>
        <Link href={`/admin/matches/${match.id}`}
          className="text-zinc-500 text-sm hover:text-white transition-colors">← Назад</Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium">Редактировать матч</h1>
            <p className="text-zinc-500 text-sm mt-1">{match.title}</p>
          </div>
          <form action={deleteMatchAction}
            onSubmit={(e) => { if (!confirm("Удалить матч?")) e.preventDefault(); }}>
            <input type="hidden" name="matchId" value={match.id} />
            <button type="submit"
              className="text-xs text-red-400 border border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-950 transition-colors">
              Удалить
            </button>
          </form>
        </div>

        {state.message && !state.fieldErrors && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="matchId" value={match.id} />

          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="title">Название</label>
            <input id="title" name="title" type="text" defaultValue={match.title} required
              className={inputCls(state.fieldErrors?.title?.[0])} />
            {state.fieldErrors?.title && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.title[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="date">Дата</label>
              <input id="date" name="date" type="date" defaultValue={match.date} required
                className={inputCls(state.fieldErrors?.date?.[0])} />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="time">Время</label>
              <input id="time" name="time" type="time" defaultValue={match.time} required
                className={inputCls(state.fieldErrors?.time?.[0])} />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="address">Адрес</label>
            <input id="address" name="address" type="text" defaultValue={match.address} required
              className={inputCls(state.fieldErrors?.address?.[0])} />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="venueName">
              Площадка <span className="text-zinc-600">(необязательно)</span>
            </label>
            <input id="venueName" name="venueName" type="text" defaultValue={match.venueName}
              className={inputCls()} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="priceSom">Стоимость (сум)</label>
              <input id="priceSom" name="priceSom" type="number"
                defaultValue={match.priceSom} min="1000" required
                className={inputCls(state.fieldErrors?.priceSom?.[0])} />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="maxPlayers">Макс. игроков</label>
              <input id="maxPlayers" name="maxPlayers" type="number"
                defaultValue={match.maxPlayers} min="2" max="30" required
                className={inputCls(state.fieldErrors?.maxPlayers?.[0])} />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="description">
              Описание <span className="text-zinc-600">(необязательно)</span>
            </label>
            <textarea id="description" name="description" rows={3}
              defaultValue={match.description}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5
                         text-white text-sm placeholder:text-zinc-600 outline-none
                         focus:border-zinc-500 transition-colors resize-none" />
          </div>

          <button type="submit" disabled={isPending}
            className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm
                       transition-opacity hover:opacity-90 disabled:opacity-50">
            {isPending ? "Сохраняем..." : "Сохранить изменения"}
          </button>
        </form>
      </div>
    </main>
  );
}
