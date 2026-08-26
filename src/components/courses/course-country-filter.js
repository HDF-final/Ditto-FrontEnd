"use client";

import Link from "next/link";
import { CountryFlag } from "@/components/common/country-flag";

// 나라별 기본 추천 코스 고르개.
//
// **버튼이 주소를 바꾼다.** 예전에는 `useState` 로 테두리만 옮기고 목록은 그대로였다 —
// 누르면 뭔가 되는 것처럼 보이는데 아무 일도 안 일어났다.
//
// 서버 컴포넌트가 목록을 받으므로 `?country=` 를 읽어 백엔드에 그대로 넘긴다. 링크로
// 두는 것이 그래서다 — 상태로 들고 있으면 클라이언트에서 다시 받아야 하고, 그러면
// 첫 그림이 빈 목록으로 한 번 스친다. 주소에 있으면 새로고침·뒤로가기·공유가 다 된다.
//
// **"전체" 는 없다.** 손님은 늘 자기 나라 코스를 본다. 그래서 나라를 하나도 안 건 코스는
// 어디에도 안 뜨고, 어드민이 승인할 때 나라를 반드시 고르게 해 둔 것이 그 짝이다.

const COUNTRY_FILTERS = [
  { code: "KR", name: "한국" },
  { code: "CN", name: "중국" },
  { code: "JP", name: "일본" },
  { code: "US", name: "미국" },
];

export function CourseCountryFilter({ active }) {
  return (
    <div
      // 데스크톱에서만 뜨던 것을 모바일에도 띄운다. 나라를 가릴 방법이 아예 없었다.
      className="mt-6 flex w-fit gap-4 lg:gap-5"
      role="tablist"
      aria-label="국가별 코스 필터"
    >
      {COUNTRY_FILTERS.map((country) => {
        const on = active === country.code;

        return (
          <Link
            key={country.code}
            href={`/courses?country=${country.code}`}
            role="tab"
            aria-selected={on}
            aria-label={`${country.name} 코스`}
            // 나라를 바꾸면 1쪽부터다. `page` 를 안 실어 보내는 것이 그 뜻이다 —
            // 한국 3쪽을 보다 일본을 누르면 일본에 3쪽이 없을 수 있다.
            className={`relative flex size-11 items-center justify-center rounded-full border-2 bg-white transition ${
              on
                ? "border-brand ring-2 ring-brand/20 shadow-[0_8px_18px_rgba(92,46,245,0.2)]"
                : "border-white ring-1 ring-line hover:ring-brand"
            }`}
          >
            <CountryFlag
              code={country.code}
              className="!h-[21px] !w-8 !rounded-[3px] border border-[#d9d9df] object-cover shadow-sm"
            />
          </Link>
        );
      })}
    </div>
  );
}
