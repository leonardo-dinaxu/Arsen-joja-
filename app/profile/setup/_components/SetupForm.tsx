"use client";

// =============================================================
// SFL — Street Football League
// app/profile/setup/_components/SetupForm.tsx
// =============================================================

import { useActionState, useEffect, forwardRef } from "react";
import { useForm }       from "react-hook-form";
import { zodResolver }   from "@hookform/resolvers/zod";
import { z }             from "zod";
import Link              from "next/link";
import { updateProfileAction, type ProfileState } from "@/app/actions/updateProfile";

// Клиентская схема (без coerce — RHF работает со строками)
const schema = z.object({
  firstName:       z.string().min(2, "Минимум 2 символа"),
  lastName:        z.string().min(2, "Минимум 2 символа"),
  age:             z.string().refine((v) => +v >= 14 && +v <= 60, "От 14 до 60 лет"),
  heightCm:        z.string().refine((v) => +v >= 140 && +v <= 220, "От 140 до 220 см"),
  weightKg:        z.string().refine((v) => +v >= 40  && +v <= 150, "От 40 до 150 кг"),
  mainPosition:    z.string().min(1, "Выберите позицию"),
  altPosition:     z.string().optional(),
  dominantFoot:    z.string().min(1, "Выберите ногу"),
  experienceLevel: z.string().min(1, "Выберите уровень"),
  experienceYears: z.string(),
  phone:           z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

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

const initialState: ProfileState = { success: false };

interface Props {
  defaultValues: FormValues;
}

export default function SetupForm({ defaultValues }: Props) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      age:             String(defaultValues.age || ""),
      heightCm:        String(defaultValues.heightCm || ""),
      weightKg:        String(defaultValues.weightKg || ""),
      experienceYears: String(defaultValues.experienceYears || "0"),
    },
  });

  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages?.[0]) setError(field as keyof FormValues, { message: messages[0] });
      });
    }
  }, [state, setError]);

  function onValid(_data: FormValues, e?: React.BaseSyntheticEvent) {
    formAction(new FormData(e?.target as HTMLFormElement));
  }

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
        <p className="text-zinc-500 text-sm mb-8">
          Эти данные помогут подобрать подходящие матчи
        </p>

        {state.message && !state.fieldErrors && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {state.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onValid)} className="space-y-5" noValidate>

          {/* Имя / Фамилия */}
          <div className="grid grid-cols-2 gap-3">
            <Field id="firstName" label="Имя" placeholder="Азиз"
              error={errors.firstName?.message} {...register("firstName")} />
            <Field id="lastName" label="Фамилия" placeholder="Турсунов"
              error={errors.lastName?.message} {...register("lastName")} />
          </div>

          {/* Возраст / Рост / Вес */}
          <div className="grid grid-cols-3 gap-3">
            <Field id="age" label="Возраст" type="number" placeholder="25"
              error={errors.age?.message} {...register("age")} />
            <Field id="heightCm" label="Рост (см)" type="number" placeholder="178"
              error={errors.heightCm?.message} {...register("heightCm")} />
            <Field id="weightKg" label="Вес (кг)" type="number" placeholder="75"
              error={errors.weightKg?.message} {...register("weightKg")} />
          </div>

          {/* Основная позиция */}
          <SelectField id="mainPosition" label="Основная позиция"
            error={errors.mainPosition?.message} {...register("mainPosition")}>
            <option value="">Выберите позицию</option>
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </SelectField>

          {/* Доп. позиция */}
          <SelectField id="altPosition" label="Дополнительная позиция"
            labelSuffix="(необязательно)" error={errors.altPosition?.message}
            {...register("altPosition")}>
            <option value="">Не указана</option>
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </SelectField>

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
                  className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800
                             rounded-lg py-2.5 text-sm cursor-pointer has-[:checked]:border-white
                             has-[:checked]:bg-zinc-800 transition-colors">
                  <input type="radio" value={f.value} {...register("dominantFoot")} className="sr-only" />
                  {f.label}
                </label>
              ))}
            </div>
            {errors.dominantFoot && (
              <p className="text-red-400 text-xs mt-1">{errors.dominantFoot.message}</p>
            )}
          </div>

          {/* Уровень */}
          <SelectField id="experienceLevel" label="Уровень игры"
            error={errors.experienceLevel?.message} {...register("experienceLevel")}>
            <option value="">Выберите уровень</option>
            {EXPERIENCE_LEVELS.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </SelectField>

          {/* Лет опыта */}
          <Field id="experienceYears" label="Лет опыта" type="number" placeholder="3"
            error={errors.experienceYears?.message} {...register("experienceYears")} />

          {/* Телефон */}
          <Field id="phone" label="Телефон" labelSuffix="(необязательно)"
            type="tel" placeholder="+998 90 123 45 67"
            error={errors.phone?.message} {...register("phone")} />

          <button type="submit" disabled={isPending}
            className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm
                       transition-opacity hover:opacity-90 disabled:opacity-50 mt-2">
            {isPending ? "Сохраняем..." : "Сохранить профиль"}
          </button>

        </form>
      </div>
    </main>
  );
}

// ── Field ────────────────────────────────────────────────────
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string; label: string; labelSuffix?: string; error?: string;
}
const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ id, label, labelSuffix, error, ...props }, ref) => (
    <div>
      <label className="block text-zinc-400 text-sm mb-1.5" htmlFor={id}>
        {label}{labelSuffix && <span className="text-zinc-600 ml-1">{labelSuffix}</span>}
      </label>
      <input id={id} ref={ref} {...props}
        className={[
          "w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm",
          "placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-500",
          error ? "border-red-700" : "border-zinc-700",
        ].join(" ")}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
);
Field.displayName = "Field";

// ── SelectField ──────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string; label: string; labelSuffix?: string; error?: string;
}
const SelectField = forwardRef<HTMLSelectElement, SelectProps>(
  ({ id, label, labelSuffix, error, children, ...props }, ref) => (
    <div>
      <label className="block text-zinc-400 text-sm mb-1.5" htmlFor={id}>
        {label}{labelSuffix && <span className="text-zinc-600 ml-1">{labelSuffix}</span>}
      </label>
      <select id={id} ref={ref} {...props}
        className={[
          "w-full bg-zinc-800 border rounded-lg px-4 py-2.5 text-white text-sm",
          "outline-none transition-colors focus:border-zinc-500 cursor-pointer",
          error ? "border-red-700" : "border-zinc-700",
        ].join(" ")}>
        {children}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
);
SelectField.displayName = "SelectField";
