"use client";

import { useState } from "react";
import { CountryFlag } from "@/components/common/country-flag";

const COUNTRY_FILTERS = [
  { code: "KR", name: "한국" },
  { code: "CN", name: "중국" },
  { code: "JP", name: "일본" },
  { code: "US", name: "미국" },
];

export function CourseCountryFilter() {
  const [activeCountry, setActiveCountry] = useState("KR");

  return (
    <div
      className="mt-6 hidden w-fit gap-5 lg:flex"
      role="tablist"
      aria-label="국가별 코스 필터"
    >
      {COUNTRY_FILTERS.map((country) => {
        const active = activeCountry === country.code;

        return (
          <button
            key={country.code}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${country.name} 코스`}
            onClick={() => setActiveCountry(country.code)}
            className={`relative flex size-11 cursor-pointer items-center justify-center rounded-full border-2 bg-white transition ${
              active
                ? "border-brand ring-2 ring-brand/20 shadow-[0_8px_18px_rgba(92,46,245,0.2)]"
                : "border-white ring-1 ring-line hover:ring-brand"
            }`}
          >
            <CountryFlag
              code={country.code}
              className="!h-[21px] !w-8 !rounded-[3px] border border-[#d9d9df] object-cover shadow-sm"
            />
          </button>
        );
      })}
    </div>
  );
}
