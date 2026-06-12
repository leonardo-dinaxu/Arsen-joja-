"use client";

import { useActionState, useEffect, useState } from "react";
import { choosePaymentAction, type PaymentState } from "@/app/actions/payment";

const initialState: PaymentState = { success: false };

const PROVIDERS = [
  { value: "CASH",  label: "Наличными при встрече", description: "Оплатите администратору перед игрой", icon: "💵", badge: "Сразу подтверждается" },
  { value: "PAYME", label: "Payme", description: "Оплата через Payme", icon: "💳", badge: null },
  { value: "CLICK", label: "Click", description: "Оплата через Click", icon: "💳", badge: null },
];

export default function PaymentForm({ matchId }: { matchId: string }) {
  const [selected, setSelected] = useState("CASH");
  const [state, formAction, isPending] = useActionState(choosePaymentAction, initialState);

  useEffect(() => {
    if (state.success && state.redirectTo) window.location.href = state.redirectTo;
  }, [state]);

  return (
    <div className="space-y-4">
      {state.message && !state.success && (
        <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        {PROVIDERS.map((p) => (
          <button key={p.value} type="button" onClick={() => setSelected(p.value)}
            className={["w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all text-left",
              selected === p.value ? "bg-white/[0.06] border-white" : "bg-[#0A0A0A] border-white/[0.08] hover:border-white/25"].join(" ")}>
            <div className={["w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
              selected === p.value ? "border-white" : "border-zinc-600"].join(" ")}>
              {selected === p.value && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className="text-lg shrink-0">{p.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white text-sm font-medium">{p.label}</span>
                {p.badge && <span className="text-xs bg-green-950 text-green-400 px-2 py-0.5 rounded-full">{p.badge}</span>}
              </div>
              <p className="text-zinc-500 text-xs mt-0.5">{p.description}</p>
            </div>
          </button>
        ))}
      </div>

      <form action={formAction}>
        <input type="hidden" name="matchId"  value={matchId} />
        <input type="hidden" name="provider" value={selected} />
        <button type="submit" disabled={isPending}
          className="w-full bg-white text-black font-medium rounded-xl py-3 text-sm transition-opacity hover:opacity-90 disabled:opacity-50">
          {isPending ? "Обрабатываем..." : selected === "CASH" ? "Подтвердить — оплачу при встрече" : `Перейти к оплате через ${selected === "PAYME" ? "Payme" : "Click"}`}
        </button>
      </form>

      <button type="button" onClick={() => window.history.back()}
        className="w-full text-zinc-500 text-sm py-2 hover:text-white transition-colors">
        Назад
      </button>
    </div>
  );
}
