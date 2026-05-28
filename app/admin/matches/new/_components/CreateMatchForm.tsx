"use client";

import { useActionState } from "react";
import Link               from "next/link";
import { createMatchAction, type CreateMatchState } from "@/app/actions/createMatch";

const initialState: CreateMatchState = { success: false };

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const inputCls = (error?: string) => [
  "w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm",
  "placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors",
  error ? "border-red-700" : "border-zinc-700",
].join(" ");

export default function CreateMatchForm() {
  const [state, formAction, isPending] = useActionState(createMatchAction, initialState);

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="text-lg font-medium tracking-[0.2em] uppercase">⬡ SFL Admin</Link>
        <Link href="/admin" className="text-zinc-500 text-sm hover:text-white transition-colors">← Назад</Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-medium mb-1">Новый матч</h1>
        <p className="text-zinc-500 text-sm mb-8">Заполните информацию о матче</p>

        {state.message && !state.fieldErrors && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-5">

          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="title">Название матча</label>
            <input id="title" name="title" type="text"
              placeholder="Матч #18 · Суббота вечер" required
              className={inputCls(state.fieldErrors?.title?.[0])} />
            {state.fieldErrors?.title && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.title[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="date">Дата</label>
              <input id="date" name="date" type="date" min={todayStr()} required
                className={inputCls(state.fieldErrors?.date?.[0])} />
              {state.fieldErrors?.date && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.date[0]}</p>}
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="time">Время</label>
              <input id="time" name="time" type="time" required
                className={inputCls(state.fieldErrors?.time?.[0])} />
              {state.fieldErrors?.time && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.time[0]}</p>}
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="address">Адрес</label>
            <input id="address" name="address" type="text"
              placeholder="ул. Амира Темура 1, Ташкент" required
              className={inputCls(state.fieldErrors?.address?.[0])} />
            {state.fieldErrors?.address && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.address[0]}</p>}
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="venueName">
              Название площадки <span className="text-zinc-600">(необязательно)</span>
            </label>
            <input id="venueName" name="venueName" type="text"
              placeholder="Стадион Пахтакор, поле А"
              className={inputCls()} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="priceSom">Стоимость (сум)</label>
              <input id="priceSom" name="priceSom" type="number"
                placeholder="150000" min="1000" required
                className={inputCls(state.fieldErrors?.priceSom?.[0])} />
              {state.fieldErrors?.priceSom && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.priceSom[0]}</p>}
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="maxPlayers">Макс. игроков</label>
              <input id="maxPlayers" name="maxPlayers" type="number"
                placeholder="14" min="2" max="30" defaultValue="14" required
                className={inputCls(state.fieldErrors?.maxPlayers?.[0])} />
              {state.fieldErrors?.maxPlayers && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.maxPlayers[0]}</p>}
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="description">
              Описание <span className="text-zinc-600">(необязательно)</span>
            </label>
            <textarea id="description" name="description" rows={3}
              placeholder="Дополнительная информация о матче..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5
                         text-white text-sm placeholder:text-zinc-600 outline-none
                         focus:border-zinc-500 transition-colors resize-none" />
          </div>

          <button type="submit" disabled={isPending}
            className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm
                       transition-opacity hover:opacity-90 disabled:opacity-50">
            {isPending ? "Создаём..." : "Создать матч"}
          </button>
        </form>
      </div>
    </main>
  );
}
