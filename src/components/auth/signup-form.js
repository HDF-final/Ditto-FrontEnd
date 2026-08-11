"use client";

import Link from "next/link";

import { Button } from "@/components/common/button";

export function SignupForm() {
  return (
    <form className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-bold text-ink">
        이름
        <input
          className="rounded-control border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
          placeholder="이름"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-bold text-ink">
        이메일
        <input
          type="email"
          className="rounded-control border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
          placeholder="ditto@example.com"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-bold text-ink">
        비밀번호
        <input
          type="password"
          className="rounded-control border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
          placeholder="8자 이상"
        />
      </label>
      <Button as="button" type="button" className="mt-2 w-full">
        가입하기
      </Button>
      <Link href="/country" className="text-center text-sm font-bold text-brand">
        국가 선택으로 계속
      </Link>
    </form>
  );
}
