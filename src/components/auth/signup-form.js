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

/**
 * Valid signup form → country selection (`/country`) → persona (`/persona`) → complete signup.
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

  const [email, setEmail] = useState(draft.email || "");
  const [password, setPassword] = useState(draft.password || "");
  const [nickname, setNickname] = useState(draft.nickname || "");
  const [termsAccepted, setTermsAccepted] = useState(draft.termsAccepted ?? true);
  const [marketingAccepted, setMarketingAccepted] = useState(draft.marketingAccepted ?? false);
  const [errors, setErrors] = useState(initialErrors);

  function clearError(field) {
    setErrors((current) =>
      current[field] ? { ...current, [field]: "" } : current,
    );
  }

  function handleSubmit(event) {
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

    setDraft({
      email,
      password,
      nickname,
      termsAccepted,
      marketingAccepted,
    });

    router.push(SIGNUP_SUCCESS_HREF);
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
        <button type="submit" className={authButtonClassName()}>
          가입하고 시작하기 <span aria-hidden="true">→</span>
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
