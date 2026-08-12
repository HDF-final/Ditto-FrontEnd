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

/**
 * Temporary success policy (UI-only, no real auth):
 * valid login form → navigate to home (`/`).
 */
const LOGIN_SUCCESS_HREF = "/";

const initialErrors = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(initialErrors);

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    // Front-end validation only — no tokens, session, or storage.
    router.push(LOGIN_SUCCESS_HREF);
  }

  return (
    <>
      <form
        className="flex flex-col gap-3.5"
        onSubmit={handleSubmit}
        noValidate
      >
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
            onChange={(event) => {
              setEmail(event.target.value);
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
            onChange={(event) => {
              setPassword(event.target.value);
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
        <button type="submit" className={authButtonClassName()}>
          로그인 <span aria-hidden="true">→</span>
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
