"use client";

// =============================================================
// SFL — Street Football League
// app/matches/[id]/pay/_components/PaymentForm.tsx
// =============================================================

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { choosePaymentAction, type PaymentState } from "@/app/actions/payment";

const initialState: PaymentState = { success: false };

const PROVIDERS = [
  {
    value:       "PAYME",
    label:       "Payme",
    description: "Оплата через Payme",
    icon:        "💳",
    badge:       null,
  },
  {
    value:       "CLICK",
    label:       "Click",
    description: "Оплата через Click",
    icon:        "💳",
    badge:       null,
  },
  {
    value:       "CASH",
    label:       "Наличными при встрече",
    description: "Оплатите администратору перед игрой",
    icon:        "💵",
    badge:       "Сразу подтверждается",
  },
];

export default function PaymentForm({ matchId }: { matchId: string }) {
  const router   = useRouter();
  const [selected, setSelected] = useState<string>("PAYME");
  const [state, formAction, isPending] = useActionState(choosePaymentAction, initialState);

  // После успеха — редирект на платёжную систему или обратно
  useEffect(() => {
    if (state.success && state.redirect) {
      window.location.href = state.redirect;
    }
  }, [state]);

  return (
    <div className="space-y-4">

      {/* Ошибка */}
      {state.message && !state.success && (
        <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
          {state.message}
        </div>
      )}

      {/* Выбор способа */}
      <div className="space-y-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setSelected(p.value)}
            className={[
              "w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all text-left",
              selected === p.value
                ? "bg-zinc-800 border-white"
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-600",
            ].join(" ")}
          >
            {/* Радио-кружок */}
            <div className={[
              "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
              selected === p.value ? "border-white" : "border-zinc-600",
            ].join(" ")}>
              {selected === p.value && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>

            {/* Иконка + текст */}
            <span className="text-lg shrink-0">{p.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">{p.label}</span>
                {p.badge && (
                  <span className="text-xs bg-green-950 text-green-400 px-2 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}
              </div>
              <p className="text-zinc-500 text-xs mt-0.5">{p.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Кнопка оплаты */}
      <form action={formAction}>
        <input type="hidden" name="matchId"  value={matchId} />
        <input type="hidden" name="provider" value={selected} />
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-white text-black font-medium rounded-xl py-3 text-sm
                     transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending
            ? "Обрабатываем..."
            : selected === "CASH"
              ? "Подтвердить — оплачу при встрече"
              : `Перейти к оплате через ${selected === "PAYME" ? "Payme" : "Click"}`}
        </button>
      </form>

      {/* Назад */}
      <button
        type="button"
        onClick={() => router.back()}
        className="w-full text-zinc-500 text-sm py-2 hover:text-white transition-colors"
      >
        Назад
      </button>

    </div>
  );
}
