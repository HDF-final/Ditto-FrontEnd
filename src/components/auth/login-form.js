"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AuthAltLink,
  AuthFieldError,
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/auth-shell";
import {
  validateEmail,
  validatePassword,
} from "@/lib/utils/auth-validation";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/use-auth-store";

const LOGIN_SUCCESS_HREF = "/";

function loginRedirectPath(next) {
  if (next === "scan") return "/?scan=1";
  if (
    typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("://")
  ) {
    return next;
  }
  return LOGIN_SUCCESS_HREF;
}

const initialErrors = {
  email: "",
  password: "",
};

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(initialErrors);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const nextErrors = {
      email: validateEmail(email, {
        required: t("validation.emailRequired"),
        invalid: t("validation.emailInvalid"),
      }),
      password: validatePassword(password, {
        required: t("validation.passwordRequired"),
      }),
    };

    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setIsLoading(true);

    try {
      const userData = await login({ email, password });
      if (typeof window !== "undefined") {
        window.sessionStorage?.removeItem("ditto_logged_out");
      }
      if (userData) {
        setUser(userData);
      }
      router.push(loginRedirectPath(searchParams.get("next")));
    } catch (error) {
      setServerError(
        error?.message || t("auth.loginError"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form
        className="flex flex-col gap-3.5"
        onSubmit={handleSubmit}
        noValidate
      >
        {serverError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-xs font-medium text-red-600 animate-in fade-in"
            role="alert"
          >
            {serverError}
          </div>
        ) : null}

        <div>
          <label htmlFor="login-email" className="sr-only">
            {t("auth.email")}
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            disabled={isLoading}
            onChange={(event) => {
              setEmail(event.target.value);
              if (serverError) setServerError("");
              if (errors.email) {
                setErrors((current) => ({ ...current, email: "" }));
              }
            }}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className={authInputClassName(Boolean(errors.email))}
          />
          <AuthFieldError id="login-email-error" message={errors.email} />
        </div>
        <div>
          <label htmlFor="login-password" className="sr-only">
            {t("auth.password")}
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            disabled={isLoading}
            onChange={(event) => {
              setPassword(event.target.value);
              if (serverError) setServerError("");
              if (errors.password) {
                setErrors((current) => ({ ...current, password: "" }));
              }
            }}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
            className={authInputClassName(Boolean(errors.password))}
          />
          <AuthFieldError
            id="login-password-error"
            message={errors.password}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={authButtonClassName()}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("auth.loggingIn")}
            </span>
          ) : (
            <>
              {t("common.login")} <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>
      <AuthAltLink
        prompt={t("auth.noAccount")}
        href="/signup"
        label={t("common.signup")}
      />
    </>
  );
}
