"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/common/button";

export function LoginForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-bold text-ink">
        이메일
        <input
          type="email"
          required
          className="rounded-control border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
          placeholder="ditto@example.com"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-bold text-ink">
        비밀번호
        <input
          type="password"
          required
          className="rounded-control border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
          placeholder="비밀번호"
        />
      </label>
      <Button type="submit" className="mt-2 w-full">
        로그인
      </Button>
      {submitted ? (
        <p className="text-sm font-semibold text-brand">
          로그인 API 연결 전 임시 화면입니다.
        </p>
      ) : null}
      <p className="text-center text-sm text-ink-muted">
        계정이 없나요?{" "}
        <Link href="/signup" className="font-bold text-brand">
          회원가입
        </Link>
      </p>
    </form>
  );
}
