"use client";

// =============================================================
// SFL — Street Football League
// app/profile/_components/ProfileEditForm.tsx
// =============================================================

import { useActionState, useEffect } from "react";
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
  age:             string;
  heightCm:        string;
  weightKg:        string;
  mainPosition:    string;
  altPosition:     string;
  dominantFoot:    string;
  experienceLevel: string;
  experienceYears: string;
  phone:           string;
}

export default function ProfileEditForm({ defaultValues }: { defaultValues: DefaultValues }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">

      {/* Сообщения */}
      {state.message && (
        <div className={[
          "text-sm rounded-lg px-4 py-3 border",
          state.success
            ? "bg-green-950 border-green-800 text-green-400"
            : "bg-red-950 border-red-800 text-red-400",
        ].join(" ")}>
          {state.message}
        </div>
      )}

      {/* Имя / Фамилия */}
      <div className="grid grid-cols-2 gap-3">
        <Field id="firstName" label="Имя"
          error={state.fieldErrors?.firstName?.[0]}>
          <input id="firstName" name="firstName" type="text"
            defaultValue={defaultValues.firstName} required />
        </Field>
        <Field id="lastName" label="Фамилия"
          error={state.fieldErrors?.lastName?.[0]}>
          <input id="lastName" name="lastName" type="text"
            defaultValue={defaultValues.lastName} required />
        </Field>
      </div>

      {/* Возраст / Рост / Вес */}
      <div className="grid grid-cols-3 gap-3">
        <Field id="age" label="Возраст" error={state.fieldErrors?.age?.[0]}>
          <input id="age" name="age" type="number"
            defaultValue={defaultValues.age} min="14" max="60" required />
        </Field>
        <Field id="heightCm" label="Рост (см)" error={state.fieldErrors?.heightCm?.[0]}>
          <input id="heightCm" name="heightCm" type="number"
            defaultValue={defaultValues.heightCm} min="140" max="220" required />
        </Field>
        <Field id="weightKg" label="Вес (кг)" error={state.fieldErrors?.weightKg?.[0]}>
          <input id="weightKg" name="weightKg" type="number"
            defaultValue={defaultValues.weightKg} min="40" max="150" required />
        </Field>
      </div>

      {/* Позиция */}
      <div className="grid grid-cols-2 gap-3">
        <SelectField id="mainPosition" label="Основная позиция"
          error={state.fieldErrors?.mainPosition?.[0]}
          defaultValue={defaultValues.mainPosition}>
          {POSITIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </SelectField>
        <SelectField id="altPosition" label="Доп. позиция"
          labelSuffix="(необязательно)"
          error={state.fieldErrors?.altPosition?.[0]}
          defaultValue={defaultValues.altPosition}>
          <option value="">Не указана</option>
          {POSITIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </SelectField>
      </div>

      {/* Рабочая нога */}
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
      <SelectField id="experienceLevel" label="Уровень игры"
        error={state.fieldErrors?.experienceLevel?.[0]}
        defaultValue={defaultValues.experienceLevel}>
        {EXPERIENCE_LEVELS.map((e) => (
          <option key={e.value} value={e.value}>{e.label}</option>
        ))}
      </SelectField>

      {/* Лет опыта */}
      <Field id="experienceYears" label="Лет опыта"
        error={state.fieldErrors?.experienceYears?.[0]}>
        <input id="experienceYears" name="experienceYears" type="number"
          defaultValue={defaultValues.experienceYears} min="0" max="50" />
      </Field>

      {/* Телефон */}
      <Field id="phone" label="Телефон" labelSuffix="(необязательно)"
        error={state.fieldErrors?.phone?.[0]}>
        <input id="phone" name="phone" type="tel"
          defaultValue={defaultValues.phone}
          placeholder="+998 90 123 45 67" />
      </Field>

      <button type="submit" disabled={isPending}
        className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm
                   transition-opacity hover:opacity-90 disabled:opacity-50">
        {isPending ? "Сохраняем..." : "Сохранить профиль"}
      </button>
    </form>
  );
}

// ── Field ─────────────────────────────────────────────────────
import React from "react";

const inputCls = (error?: string) => [
  "w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm",
  "placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors",
  error ? "border-red-700" : "border-zinc-700",
].join(" ");

function Field({ id, label, labelSuffix, error, children }: {
  id: string; label: string; labelSuffix?: string;
  error?: string; children: React.ReactElement;
}) {
  return (
    <div>
      <label className="block text-zinc-400 text-sm mb-1.5" htmlFor={id}>
        {label}{labelSuffix && <span className="text-zinc-600 ml-1">{labelSuffix}</span>}
      </label>
      {React.cloneElement(children, { className: inputCls(error) })}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function SelectField({ id, label, labelSuffix, error, defaultValue, children }: {
  id: string; label: string; labelSuffix?: string;
  error?: string; defaultValue?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-zinc-400 text-sm mb-1.5" htmlFor={id}>
        {label}{labelSuffix && <span className="text-zinc-600 ml-1">{labelSuffix}</span>}
      </label>
      <select id={id} name={id} defaultValue={defaultValue}
        className={inputCls(error) + " cursor-pointer"}>
        {children}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
