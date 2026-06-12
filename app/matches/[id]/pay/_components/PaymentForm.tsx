"use client";

import { useActionState, useEffect, useState } from "react";
import { choosePaymentAction, type PaymentState } from "@/app/actions/payment";

const initialState: PaymentState = { success: false };

// ⬇️ ПОМЕНЯЙ НА СВОИ РЕКВИЗИТЫ
const CARD_NUMBER = "5614 6819 1409 9282";
const CARD_OWNER  = "AKBARXOJAYEV SH";

const PROVIDERS = [
  { value: "CARD", label: "Перевод на карту",        description: "Переведите на карту и подтвердите", icon: "💳", badge: null },
  { value: "CASH", label: "Наличными при встрече",   description: "Оплатите администратору перед игрой", icon: "💵", badge: "Сразу подтверждается" },
];

export default function PaymentForm({ matchId }: { matchId: string }) {
  const [selected, setSelected] = useState("CARD");
  const [copied, setCopied]     = useState(false);
  const [state, formAction, isPending] = useActionState(choosePaymentAction, initialState);

  useEffect(() => {
    if (state.success && state.redirectTo) window.location.href = state.redirectTo;
  }, [state]);

  function copyCard() {
    navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

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

      {/* Реквизиты карты — показываются при выборе CARD */}
      {selected === "CARD" && (
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Реквизиты для перевода</p>
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="font-display text-2xl tracking-[0.15em]">{CARD_NUMBER}</span>
            <button type="button" onClick={copyCard}
              className="text-xs border border-white/[0.08] px-3 py-1.5 rounded-lg hover:border-white/25 transition-colors shrink-0">
              {copied ? "✓ Скопировано" : "Копировать"}
            </button>
          </div>
          <div className="flex justify-between text-sm border-t border-white/[0.05] pt-3">
            <span className="text-zinc-500">Владелец</span>
            <span className="text-white font-medium">{CARD_OWNER}</span>
          </div>
          <p className="text-zinc-600 text-xs mt-4 leading-relaxed">
            Переведите точную сумму на карту, затем нажмите кнопку ниже.
            Администратор проверит платёж и подтвердит ваше место.
          </p>
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="matchId"  value={matchId} />
        <input type="hidden" name="provider" value={selected} />
        <button type="submit" disabled={isPending}
          className="w-full bg-white text-black font-medium rounded-xl py-3 text-sm transition-opacity hover:opacity-90 disabled:opacity-50">
          {isPending
            ? "Обрабатываем..."
            : selected === "CARD"
              ? "Я оплатил — отправить на проверку"
              : "Подтвердить — оплачу при встрече"}
        </button>
      </form>

      <button type="button" onClick={() => window.history.back()}
        className="w-full text-zinc-500 text-sm py-2 hover:text-white transition-colors">
        Назад
      </button>
    </div>
  );
}
