import Image from "next/image";

import { boniProfile } from "@/lib/fixtures/concierge";

export function ConciergeHeader() {
  return (
    <div className="flex items-center gap-3 border-b border-line bg-surface-soft px-5 py-4">
      <span className="flex size-14 flex-none items-center justify-center overflow-hidden rounded-full bg-white">
        <Image
          src="/assets/common/boni-chat.svg"
          alt="Boni"
          width={56}
          height={56}
          className="size-full object-contain"
        />
      </span>
      <div>
        <p className="flex items-center gap-1.5 text-base font-bold text-ink">
          <span className="inline-block size-2.5 rounded-full bg-success" />
          {boniProfile.name}
        </p>
        <p className="text-xs text-ink-muted">{boniProfile.role}</p>
        <p className="text-[11px] text-ink-subtle">{boniProfile.tagline}</p>
      </div>
    </div>
  );
}
