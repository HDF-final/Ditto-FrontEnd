"use client";

import { useState } from "react";

export function MypageTabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="mb-[60px] flex gap-[22px] border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(tab)}
          className={`-mb-px border-b-2 pb-3.5 text-[15px] font-black transition ${
            activeTab === tab
              ? "border-brand text-brand"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
