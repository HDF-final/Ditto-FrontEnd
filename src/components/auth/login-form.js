"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const initialErrors = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
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
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setIsLoading(true);

    try {
      const userData = await login({ email, password });
      if (userData) {
        setUser(userData);
      }
      router.push(LOGIN_SUCCESS_HREF);
    } catch (error) {
      setServerError(
        error?.message || "이메일 또는 비밀번호를 다시 확인해주세요.",
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
            이메일
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="이메일을 입력하세요"
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
            비밀번호
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요"
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
              로그인 중...
            </span>
          ) : (
            <>
              로그인 <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>
      <AuthAltLink
        prompt="아직 계정이 없으신가요?"
        href="/signup"
        label="회원가입"
      />
    </>
  );
}
