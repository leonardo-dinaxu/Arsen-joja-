"use client";

// =============================================================
// SFL — Street Football League
// app/admin/matches/[id]/edit/_components/EditMatchForm.tsx
// =============================================================

import { useActionState }      from "react";
import Link                    from "next/link";
import { editMatchAction, deleteMatchAction, type EditMatchState } from "@/app/actions/editMatch";

const initialState: EditMatchState = { success: false };

interface MatchData {
  id:          string;
  title:       string;
  date:        string;
  time:        string;
  address:     string;
  venueName:   string;
  priceSom:    number;
  maxPlayers:  number;
  description: string;
  status:      string;
}

export default function EditMatchForm({ match }: { match: MatchData }) {
  const [state, formAction, isPending] = useActionState(editMatchAction, initialState);

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="text-lg font-medium tracking-[0.2em] uppercase">
          ⬡ SFL Admin
        </Link>
        <Link
          href={`/admin/matches/${match.id}`}
          className="text-zinc-500 text-sm hover:text-white transition-colors"
        >
          ← Назад
        </Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium">Редактировать матч</h1>
            <p className="text-zinc-500 text-sm mt-1">{match.title}</p>
          </div>
          {/* Кнопка удаления */}
          <DeleteButton matchId={match.id} />
        </div>

        {state.message && !state.fieldErrors && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="matchId" value={match.id} />

          {/* Название */}
          <Field id="title" label="Название матча"
            error={state.fieldErrors?.title?.[0]}>
            <input
              id="title" name="title" type="text"
              defaultValue={match.title} required
            />
          </Field>

          {/* Дата + Время */}
          <div className="grid grid-cols-2 gap-3">
            <Field id="date" label="Дата" error={state.fieldErrors?.date?.[0]}>
              <input
                id="date" name="date" type="date"
                defaultValue={match.date} required
              />
            </Field>
            <Field id="time" label="Время" error={state.fieldErrors?.time?.[0]}>
              <input
                id="time" name="time" type="time"
                defaultValue={match.time} required
              />
            </Field>
          </div>

          {/* Адрес */}
          <Field id="address" label="Адрес" error={state.fieldErrors?.address?.[0]}>
            <input
              id="address" name="address" type="text"
              defaultValue={match.address} required
            />
          </Field>

          {/* Площадка */}
          <Field id="venueName" label="Название площадки"
            labelSuffix="(необязательно)" error={state.fieldErrors?.venueName?.[0]}>
            <input
              id="venueName" name="venueName" type="text"
              defaultValue={match.venueName}
            />
          </Field>

          {/* Цена + игроки */}
          <div className="grid grid-cols-2 gap-3">
            <Field id="priceSom" label="Стоимость (сум)"
              error={state.fieldErrors?.priceSom?.[0]}>
              <input
                id="priceSom" name="priceSom" type="number"
                defaultValue={match.priceSom} min="1000" required
              />
            </Field>
            <Field id="maxPlayers" label="Макс. игроков"
              error={state.fieldErrors?.maxPlayers?.[0]}>
              <input
                id="maxPlayers" name="maxPlayers" type="number"
                defaultValue={match.maxPlayers} min="2" max="30" required
              />
            </Field>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="description">
              Описание <span className="text-zinc-600">(необязательно)</span>
            </label>
            <textarea
              id="description" name="description" rows={3}
              defaultValue={match.description}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5
                         text-white text-sm placeholder:text-zinc-600 outline-none
                         focus:border-zinc-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm
                       transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Сохраняем..." : "Сохранить изменения"}
          </button>
        </form>
      </div>
    </main>
  );
}

// ── Кнопка удаления с подтверждением ─────────────────────────

function DeleteButton({ matchId }: { matchId: string }) {
  return (
    <form
      action={deleteMatchAction}
      onSubmit={(e) => {
        if (!confirm("Удалить матч? Это действие необратимо.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="matchId" value={matchId} />
      <button
        type="submit"
        className="text-xs text-red-400 border border-red-900 px-3 py-1.5 rounded-lg
                   hover:bg-red-950 transition-colors"
      >
        Удалить матч
      </button>
    </form>
  );
}

// ── Field ─────────────────────────────────────────────────────
import React from "react";

function Field({
  id, label, labelSuffix, error, children,
}: {
  id:           string;
  label:        string;
  labelSuffix?: string;
  error?:       string;
  children:     React.ReactElement;
}) {
  const cls = [
    "w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm",
    "placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors",
    error ? "border-red-700" : "border-zinc-700",
  ].join(" ");

  return (
    <div>
      <label className="block text-zinc-400 text-sm mb-1.5" htmlFor={id}>
        {label}
        {labelSuffix && <span className="text-zinc-600 ml-1">{labelSuffix}</span>}
      </label>
      {React.cloneElement(children, { className: cls })}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
