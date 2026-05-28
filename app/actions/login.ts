"use server";

import { signIn }      from "@/auth";
import { loginSchema } from "@/lib/validations/auth";
import { AuthError }   from "next-auth";
import { redirect }    from "next/navigation";

export type LoginState = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {

  const parsed = loginSchema.safeParse({
    email:    formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success:     false,
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<Record<string, string[]>>,
    };
  }

  const { email, password } = parsed.data;

  const rawCallback = formData.get("callbackUrl");
  const callbackUrl =
    typeof rawCallback === "string" && rawCallback.startsWith("/")
      ? rawCallback
      : "/dashboard";

  console.log("[LOGIN] Attempting signIn for:", email);

  try {
    const result = await signIn("credentials", {
      email:    email.toLowerCase().trim(),
      password,
      redirect: false,
    });
    console.log("[LOGIN] signIn result:", result);
  } catch (error) {
    console.log("[LOGIN] caught error type:", error instanceof AuthError ? error.type : typeof error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Неверный email или пароль" };
        default:
          return { success: false, message: "Ошибка входа. Попробуйте позже." };
      }
    }
    throw error;
  }

  console.log("[LOGIN] Redirecting to:", callbackUrl);
  redirect(callbackUrl);
}
