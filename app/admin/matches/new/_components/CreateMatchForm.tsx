"use client";

// =============================================================
// SFL — Street Football League
// app/admin/matches/new/_components/CreateMatchForm.tsx
// =============================================================

import { useActionState } from "react";
import Link               from "next/link";
import { createMatchAction, type CreateMatchState } from "@/app/actions/createMatch";

const initialState: CreateMatchState = { success: false };

// Сегодняшняя дата для min у input[type=date]
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function CreateMatchForm() {
  const [state, formAction, isPending] = useActionState(createMatchAction, initialState);

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="text-lg font-medium tracking-[0.2em] uppercase">⬡ SFL Admin</Link>
        <Link href="/admin" className="text-zinc-500 text-sm hover:text-white transition-colors">
          ← Назад
        </Link>
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

          {/* Название */}
          <Field id="title" label="Название матча"
            placeholder="Матч #18 · Суббота вечер"
            error={state.fieldErrors?.title?.[0]}>
            <input id="title" name="title" type="text"
              placeholder="Матч #18 · Суббота вечер" required />
          </Field>

          {/* Дата + Время */}
          <div className="grid grid-cols-2 gap-3">
            <Field id="date" label="Дата" error={state.fieldErrors?.date?.[0]}>
              <input id="date" name="date" type="date" min={todayStr()} required />
            </Field>
            <Field id="time" label="Время" error={state.fieldErrors?.time?.[0]}>
              <input id="time" name="time" type="time" required />
            </Field>
          </div>

          {/* Адрес */}
          <Field id="address" label="Адрес" error={state.fieldErrors?.address?.[0]}>
            <input id="address" name="address" type="text"
              placeholder="ул. Амира Темура 1, Ташкент" required />
          </Field>

          {/* Название площадки */}
          <Field id="venueName" label="Название площадки"
            labelSuffix="(необязательно)" error={state.fieldErrors?.venueName?.[0]}>
            <input id="venueName" name="venueName" type="text"
              placeholder="Стадион Пахтакор, поле А" />
          </Field>

          {/* Цена + Кол-во игроков */}
          <div className="grid grid-cols-2 gap-3">
            <Field id="priceSom" label="Стоимость (сум)" error={state.fieldErrors?.priceSom?.[0]}>
              <input id="priceSom" name="priceSom" type="number"
                placeholder="150000" min="1000" required />
            </Field>
            <Field id="maxPlayers" label="Макс. игроков" error={state.fieldErrors?.maxPlayers?.[0]}>
              <input id="maxPlayers" name="maxPlayers" type="number"
                placeholder="14" min="2" max="30" defaultValue="14" required />
            </Field>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="description">
              Описание <span className="text-zinc-600">(необязательно)</span>
            </label>
            <textarea
              id="description" name="description" rows={3}
              placeholder="Дополнительная информация о матче..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm
                         placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors resize-none"
            />
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

// ── Field wrapper ─────────────────────────────────────────────
function Field({
  id, label, labelSuffix, error, children,
}: {
  id: string;
  label: string;
  labelSuffix?: string;
  error?: string;
  children: React.ReactElement;
}) {
  const inputClass = [
    "w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm",
    "placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors",
    error ? "border-red-700" : "border-zinc-700",
  ].join(" ");

  // Клонируем child и добавляем className
  const child = React.cloneElement(children, { className: inputClass });

  return (
    <div>
      <label className="block text-zinc-400 text-sm mb-1.5" htmlFor={id}>
        {label}{labelSuffix && <span className="text-zinc-600 ml-1">{labelSuffix}</span>}
      </label>
      {child}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

import React from "react";
