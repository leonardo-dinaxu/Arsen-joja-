"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileState } from "@/app/actions/updateProfile";

const initialState: ProfileState = { success: false };

const POSITIONS = [
  { value: "GK", label: "Вратарь" }, { value: "LB", label: "Левый защитник" },
  { value: "RB", label: "Правый защитник" }, { value: "CB", label: "Центральный защитник" },
  { value: "CDM", label: "Опорный полузащитник" }, { value: "CM", label: "Центральный полузащитник" },
  { value: "CAM", label: "Атакующий полузащитник" }, { value: "LW", label: "Левый вингер" },
  { value: "RW", label: "Правый вингер" }, { value: "ST", label: "Нападающий" },
];
const EXPERIENCE_LEVELS = [
  { value: "BEGINNER", label: "Новичок (до 1 года)" }, { value: "AMATEUR", label: "Любитель (1–3 года)" },
  { value: "INTERMEDIATE", label: "Средний (3–7 лет)" }, { value: "EXPERIENCED", label: "Опытный (7–12 лет)" },
  { value: "PROFESSIONAL", label: "Профессионал (12+ лет)" },
];

interface DV {
  firstName: string; lastName: string; age: string; heightCm: string; weightKg: string;
  mainPosition: string; altPosition: string; dominantFoot: string;
  experienceLevel: string; experienceYears: string; phone: string;
}

const cls = (e?: string) => [
  "w-full bg-[#111111] border rounded-xl px-4 py-2.5 text-white text-sm",
  "placeholder:text-zinc-600 outline-none focus:border-white/30 transition-colors",
  e ? "border-red-800" : "border-white/[0.08]",
].join(" ");

export default function ProfileEditForm({ defaultValues: d }: { defaultValues: DV }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <div className={["text-sm rounded-lg px-4 py-3 border",
          state.success ? "bg-green-950 border-green-800 text-green-400" : "bg-red-950 border-red-800 text-red-400"].join(" ")}>
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-zinc-400 text-sm mb-1.5">Имя</label>
          <input name="firstName" type="text" defaultValue={d.firstName} required className={cls(state.fieldErrors?.firstName?.[0])} />
          {state.fieldErrors?.firstName && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.firstName[0]}</p>}
        </div>
        <div>
          <label className="block text-zinc-400 text-sm mb-1.5">Фамилия</label>
          <input name="lastName" type="text" defaultValue={d.lastName} required className={cls(state.fieldErrors?.lastName?.[0])} />
          {state.fieldErrors?.lastName && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.lastName[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-zinc-400 text-sm mb-1.5">Возраст</label>
          <input name="age" type="number" defaultValue={d.age} min="14" max="60" required className={cls(state.fieldErrors?.age?.[0])} />
        </div>
        <div>
          <label className="block text-zinc-400 text-sm mb-1.5">Рост (см)</label>
          <input name="heightCm" type="number" defaultValue={d.heightCm} min="140" max="220" required className={cls(state.fieldErrors?.heightCm?.[0])} />
        </div>
        <div>
          <label className="block text-zinc-400 text-sm mb-1.5">Вес (кг)</label>
          <input name="weightKg" type="number" defaultValue={d.weightKg} min="40" max="150" required className={cls(state.fieldErrors?.weightKg?.[0])} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-zinc-400 text-sm mb-1.5">Основная позиция</label>
          <select name="mainPosition" defaultValue={d.mainPosition} className={cls() + " cursor-pointer"}>
            {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-zinc-400 text-sm mb-1.5">Доп. позиция</label>
          <select name="altPosition" defaultValue={d.altPosition} className={cls() + " cursor-pointer"}>
            <option value="">Не указана</option>
            {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-zinc-400 text-sm mb-2">Рабочая нога</label>
        <div className="grid grid-cols-3 gap-2">
          {[{ value: "LEFT", label: "Левая" }, { value: "RIGHT", label: "Правая" }, { value: "BOTH", label: "Обе" }].map((f) => (
            <label key={f.value}
              className="flex items-center justify-center bg-[#111111] border border-white/[0.08] rounded-xl py-2.5 text-sm cursor-pointer
                         has-[:checked]:border-white has-[:checked]:bg-white/[0.06] transition-colors">
              <input type="radio" name="dominantFoot" value={f.value} defaultChecked={d.dominantFoot === f.value} className="sr-only" />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-zinc-400 text-sm mb-1.5">Уровень игры</label>
        <select name="experienceLevel" defaultValue={d.experienceLevel} className={cls() + " cursor-pointer"}>
          {EXPERIENCE_LEVELS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-zinc-400 text-sm mb-1.5">Лет опыта</label>
        <input name="experienceYears" type="number" defaultValue={d.experienceYears} min="0" max="50" className={cls()} />
      </div>

      <div>
        <label className="block text-zinc-400 text-sm mb-1.5">Телефон <span className="text-zinc-600">(необязательно)</span></label>
        <input name="phone" type="tel" defaultValue={d.phone} placeholder="+998 90 123 45 67" className={cls()} />
      </div>

      <button type="submit" disabled={isPending}
        className="w-full bg-white text-black font-medium rounded-xl py-2.5 text-sm transition-opacity hover:opacity-90 disabled:opacity-50">
        {isPending ? "Сохраняем..." : "Сохранить профиль"}
      </button>
    </form>
  );
}
