"use client";

import { useActionState, useEffect, forwardRef } from "react";
import { useForm }       from "react-hook-form";
import { zodResolver }   from "@hookform/resolvers/zod";
import { signIn }        from "next-auth/react";
import { useRouter }     from "next/navigation";
import Link              from "next/link";
import { registerAction, type RegisterState } from "@/app/actions/register";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

const initialState: RegisterState = { success: false };

export default function RegisterForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  const {
    register,
    trigger,
    getValues,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages?.[0]) setError(field as keyof RegisterInput, { message: messages[0] });
      });
    }
    if (state.success) {
      const values = getValues();
      signIn("credentials", {
        email:    values.email,
        password: values.password,
        redirect: false,
      }).then(() => {
        router.push("/profile/setup");
        router.refresh();
      });
    }
  }, [state, setError, router, getValues]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const valid = await trigger();
    if (!valid) return;

    const values = getValues();
    const formData = new FormData();
    formData.set("firstName",       values.firstName);
    formData.set("lastName",        values.lastName);
    formData.set("email",           values.email);
    formData.set("phone",           values.phone ?? "");
    formData.set("password",        values.password);
    formData.set("confirmPassword", values.confirmPassword);
    formAction(formData);
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <span className="text-2xl font-medium tracking-[0.25em] text-white uppercase">⬡ SFL</span>
          <p className="text-zinc-500 text-sm mt-2">Street Football League</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-white text-xl font-medium mb-1">Создать аккаунт</h1>
          <p className="text-zinc-500 text-sm mb-6">Заполните данные для регистрации</p>

          {!state.success && state.message && !state.fieldErrors && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {state.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <Field id="firstName" label="Имя" placeholder="Азиз"
                autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
              <Field id="lastName" label="Фамилия" placeholder="Турсунов"
                autoComplete="family-name" error={errors.lastName?.message} {...register("lastName")} />
            </div>
            <Field id="email" label="Email" type="email" placeholder="you@example.com"
              autoComplete="email" error={errors.email?.message} {...register("email")} />
            <Field id="phone" label="Телефон" labelSuffix="(необязательно)" type="tel"
              placeholder="+998 90 123 45 67" autoComplete="tel"
              error={errors.phone?.message} {...register("phone")} />
            <Field id="password" label="Пароль" type="password" placeholder="Минимум 6 символов"
              autoComplete="new-password" error={errors.password?.message} {...register("password")} />
            <Field id="confirmPassword" label="Повторите пароль" type="password" placeholder="••••••••"
              autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
            <button type="submit" disabled={isPending}
              className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm
                         transition-opacity hover:opacity-90 disabled:opacity-50 mt-2">
              {isPending ? "Создаём аккаунт..." : "Зарегистрироваться"}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-sm mt-6">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-white hover:underline">Войти</Link>
        </p>
      </div>
    </main>
  );
}

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
