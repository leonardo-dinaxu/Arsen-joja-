"use client";

// =============================================================
// SFL — Street Football League
// app/profile/setup/_components/SetupForm.tsx
// =============================================================

import { useActionState } from "react";
import Link               from "next/link";
import { updateProfileAction, type ProfileState } from "@/app/actions/updateProfile";

const initialState: ProfileState = { success: false };

const POSITIONS = [
  { value: "GK",  label: "Вратарь" },
  { value: "LB",  label: "Левый защитник" },
  { value: "RB",  label: "Правый защитник" },
  { value: "CB",  label: "Центральный защитник" },
  { value: "CDM", label: "Опорный полузащитник" },
  { value: "CM",  label: "Центральный полузащитник" },
  { value: "CAM", label: "Атакующий полузащитник" },
  { value: "LW",  label: "Левый вингер" },
  { value: "RW",  label: "Правый вингер" },
  { value: "ST",  label: "Нападающий" },
];

const EXPERIENCE_LEVELS = [
  { value: "BEGINNER",     label: "Новичок (до 1 года)" },
  { value: "AMATEUR",      label: "Любитель (1–3 года)" },
  { value: "INTERMEDIATE", label: "Средний (3–7 лет)" },
  { value: "EXPERIENCED",  label: "Опытный (7–12 лет)" },
  { value: "PROFESSIONAL", label: "Профессионал (12+ лет)" },
];

interface DefaultValues {
  firstName:       string;
  lastName:        string;
  age:             number;
  heightCm:        number;
  weightKg:        number;
  mainPosition:    string;
  altPosition:     string;
  dominantFoot:    string;
  experienceLevel: string;
  experienceYears: number;
  phone:           string;
}

const inputCls = (error?: string) => [
  "w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm",
  "placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors",
  error ? "border-red-700" : "border-zinc-700",
].join(" ");

export default function SetupForm({ defaultValues }: { defaultValues: DefaultValues }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-medium tracking-[0.2em] uppercase">⬡ SFL</span>
        <Link href="/dashboard" className="text-zinc-500 text-sm hover:text-white transition-colors">
          ← Назад
        </Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-medium mb-1">Заполните профиль</h1>
        <p className="text-zinc-500 text-sm mb-8">Эти данные помогут подобрать подходящие матчи</p>

        {state.message && !state.fieldErrors && (
          <div className={[
            "text-sm rounded-lg px-4 py-3 border mb-6",
            state.success
              ? "bg-green-950 border-green-800 text-green-400"
              : "bg-red-950 border-red-800 text-red-400",
          ].join(" ")}>
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-5">

          {/* Имя / Фамилия */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="firstName">Имя</label>
              <input id="firstName" name="firstName" type="text"
                defaultValue={defaultValues.firstName} placeholder="Азиз" required
                className={inputCls(state.fieldErrors?.firstName?.[0])} />
              {state.fieldErrors?.firstName && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.firstName[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="lastName">Фамилия</label>
              <input id="lastName" name="lastName" type="text"
                defaultValue={defaultValues.lastName} placeholder="Турсунов" required
                className={inputCls(state.fieldErrors?.lastName?.[0])} />
              {state.fieldErrors?.lastName && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.lastName[0]}</p>
              )}
            </div>
          </div>

          {/* Возраст / Рост / Вес */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="age">Возраст</label>
              <input id="age" name="age" type="number"
                defaultValue={defaultValues.age || ""} placeholder="25" min="14" max="60" required
                className={inputCls(state.fieldErrors?.age?.[0])} />
              {state.fieldErrors?.age && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.age[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="heightCm">Рост (см)</label>
              <input id="heightCm" name="heightCm" type="number"
                defaultValue={defaultValues.heightCm || ""} placeholder="178" min="140" max="220" required
                className={inputCls(state.fieldErrors?.heightCm?.[0])} />
              {state.fieldErrors?.heightCm && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.heightCm[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="weightKg">Вес (кг)</label>
              <input id="weightKg" name="weightKg" type="number"
                defaultValue={defaultValues.weightKg || ""} placeholder="75" min="40" max="150" required
                className={inputCls(state.fieldErrors?.weightKg?.[0])} />
              {state.fieldErrors?.weightKg && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.weightKg[0]}</p>
              )}
            </div>
          </div>

          {/* Позиция */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="mainPosition">
              Основная позиция
            </label>
            <select id="mainPosition" name="mainPosition"
              defaultValue={defaultValues.mainPosition}
              className={inputCls(state.fieldErrors?.mainPosition?.[0]) + " cursor-pointer"}>
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="altPosition">
              Дополнительная позиция <span className="text-zinc-600">(необязательно)</span>
            </label>
            <select id="altPosition" name="altPosition"
              defaultValue={defaultValues.altPosition}
              className={inputCls() + " cursor-pointer"}>
              <option value="">Не указана</option>
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Нога */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Рабочая нога</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "LEFT",  label: "Левая"  },
                { value: "RIGHT", label: "Правая" },
                { value: "BOTH",  label: "Обе"    },
              ].map((f) => (
                <label key={f.value}
                  className="flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700
                             rounded-lg py-2.5 text-sm cursor-pointer has-[:checked]:border-white
                             has-[:checked]:bg-zinc-700 transition-colors">
                  <input type="radio" name="dominantFoot" value={f.value}
                    defaultChecked={defaultValues.dominantFoot === f.value}
                    className="sr-only" />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          {/* Уровень */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="experienceLevel">
              Уровень игры
            </label>
            <select id="experienceLevel" name="experienceLevel"
              defaultValue={defaultValues.experienceLevel}
              className={inputCls() + " cursor-pointer"}>
              {EXPERIENCE_LEVELS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          {/* Лет опыта */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="experienceYears">
              Лет опыта
            </label>
            <input id="experienceYears" name="experienceYears" type="number"
              defaultValue={defaultValues.experienceYears} min="0" max="50"
              className={inputCls()} />
          </div>

          {/* Телефон */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1.5" htmlFor="phone">
              Телефон <span className="text-zinc-600">(необязательно)</span>
            </label>
            <input id="phone" name="phone" type="tel"
              defaultValue={defaultValues.phone} placeholder="+998 90 123 45 67"
              className={inputCls(state.fieldErrors?.phone?.[0])} />
            {state.fieldErrors?.phone && (
              <p className="text-red-400 text-xs mt-1">{state.fieldErrors.phone[0]}</p>
            )}
          </div>

          <button type="submit" disabled={isPending}
            className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm
                       transition-opacity hover:opacity-90 disabled:opacity-50">
            {isPending ? "Сохраняем..." : "Сохранить профиль"}
          </button>

        </form>
      </div>
    </main>
  );
}
