"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthAltLink,
  AuthFieldError,
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/auth-shell";
import { TermsCheckbox } from "@/components/auth/terms-checkbox";
import {
  validateEmail,
  validateNickname,
  validatePassword,
  validateRequiredTerms,
} from "@/lib/utils/auth-validation";

import { useSignupStore } from "@/stores/use-signup-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { signup, login } from "@/lib/api/auth";

/**
 * Valid signup form → validates & signs up in RDS → country selection (`/country`) → persona (`/persona`) → finish.
 */
const SIGNUP_SUCCESS_HREF = "/country";

const initialErrors = {
  email: "",
  password: "",
  nickname: "",
  terms: "",
};

export function SignupForm() {
  const router = useRouter();
  const draft = useSignupStore((state) => state.draft);
  const setDraft = useSignupStore((state) => state.setDraft);
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState(draft.email || "");
  const [password, setPassword] = useState(draft.password || "");
  const [nickname, setNickname] = useState(draft.nickname || "");
  const [termsAccepted, setTermsAccepted] = useState(draft.termsAccepted ?? true);
  const [marketingAccepted, setMarketingAccepted] = useState(draft.marketingAccepted ?? false);
  const [errors, setErrors] = useState(initialErrors);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function clearError(field) {
    setErrors((current) =>
      current[field] ? { ...current, [field]: "" } : current,
    );
    setServerError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
      nickname: validateNickname(nickname),
      terms: validateRequiredTerms(termsAccepted),
    };

    setErrors(nextErrors);

    if (
      nextErrors.email ||
      nextErrors.password ||
      nextErrors.nickname ||
      nextErrors.terms
    ) {
      return;
    }

    setIsLoading(true);
    setServerError("");

    try {
      // 1. Call real backend signup API to validate email uniqueness and create user in RDS
      const signupResult = await signup({
        email,
        password,
        nickname: nickname || "디또러버",
        country: draft.country || "KR",
        persona: draft.persona || "openrun",
        marketingAgreed: Boolean(marketingAccepted),
      });

      // 2. Establish login session
      try {
        const loginResult = await login({ email, password });
        if (loginResult) {
          setUser(loginResult);
        }
      } catch {
        if (signupResult) {
          setUser(signupResult);
        }
      }

      // 3. Save draft marked as successfully signed up
      setDraft({
        email,
        password,
        nickname,
        termsAccepted,
        marketingAccepted,
        isSignedUp: true,
      });

      router.push(SIGNUP_SUCCESS_HREF);
    } catch (err) {
      const errMsg = err?.message || "회원가입 처리 중 오류가 발생했습니다.";
      if (
        errMsg.includes("이메일") ||
        errMsg.includes("email") ||
        errMsg.includes("중복") ||
        errMsg.includes("존재")
      ) {
        setErrors((prev) => ({
          ...prev,
          email: errMsg,
        }));
      } else {
        setServerError(errMsg);
      }
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
        <div>
          <label htmlFor="signup-email" className="sr-only">
            이메일
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearError("email");
            }}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            className={authInputClassName(Boolean(errors.email))}
          />
          <AuthFieldError id="signup-email-error" message={errors.email} />
        </div>
        <div>
          <label htmlFor="signup-password" className="sr-only">
            비밀번호
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearError("password");
            }}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password ? "signup-password-error" : undefined
            }
            className={authInputClassName(Boolean(errors.password))}
          />
          <AuthFieldError
            id="signup-password-error"
            message={errors.password}
          />
        </div>
        <div>
          <label htmlFor="signup-nickname" className="sr-only">
            닉네임
          </label>
          <input
            id="signup-nickname"
            name="nickname"
            type="text"
            autoComplete="nickname"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(event) => {
              setNickname(event.target.value);
              clearError("nickname");
            }}
            aria-invalid={errors.nickname ? true : undefined}
            aria-describedby={
              errors.nickname ? "signup-nickname-error" : undefined
            }
            className={authInputClassName(Boolean(errors.nickname))}
          />
          <AuthFieldError
            id="signup-nickname-error"
            message={errors.nickname}
          />
        </div>
        <div className="my-0.5 flex flex-col gap-2.5">
          <TermsCheckbox
            id="signup-terms"
            name="terms"
            checked={termsAccepted}
            onChange={(event) => {
              setTermsAccepted(event.target.checked);
              clearError("terms");
            }}
            error={errors.terms}
          >
            이용약관 및 개인정보처리방침에 동의합니다 (필수)
          </TermsCheckbox>
          <TermsCheckbox
            id="signup-marketing"
            name="marketing"
            checked={marketingAccepted}
            onChange={(event) => setMarketingAccepted(event.target.checked)}
          >
            마케팅 정보 수신에 동의합니다 (선택)
          </TermsCheckbox>
        </div>
        {serverError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-xs font-medium text-red-600 animate-in fade-in"
            role="alert"
          >
            {serverError}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={isLoading}
          className={authButtonClassName()}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              가입 확인 중...
            </span>
          ) : (
            <>
              가입하고 시작하기 <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>
      <AuthAltLink
        prompt="이미 계정이 있으신가요?"
        href="/login"
        label="로그인"
      />
    </>
  );
}
