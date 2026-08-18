import Image from "next/image";

export function MypageProfile({ profile, stats }) {
  const persona = profile.persona;

  return (
    <section className="border-b border-line bg-white px-10 sm:px-14 pt-[60px] lg:px-52 xl:px-60 2xl:px-72">
      <div className="flex flex-col gap-10 pb-[60px]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-5">
            <div
              className="flex size-[78px] shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors duration-200"
              style={{ backgroundColor: persona.bgColor || "#fff1e6" }}
            >
              <Image
                src={persona.image}
                alt={persona.name}
                width={66}
                height={66}
                className="h-[66px] w-[66px] object-contain"
                unoptimized
              />
            </div>
            <div>
              <h1 className="text-[26px] font-black text-ink">{profile.name}</h1>
              <p className="mt-1 text-sm font-medium text-ink-muted">
                {profile.description}
              </p>
              <div
                className="mt-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 transition-colors duration-200"
                style={{
                  backgroundColor: persona.badgeBg || "#f5f3ff",
                  borderColor: persona.badgeBorder || "#e0d8ff",
                }}
              >
                <Image
                  src={persona.image}
                  alt=""
                  width={22}
                  height={22}
                  className="size-[22px] object-contain"
                  unoptimized
                />
                <span
                  className="text-sm font-black"
                  style={{ color: persona.badgeText || "#5c2ef5" }}
                >
                  {persona.name}
                </span>
                <span className="text-xs font-medium text-ink-muted">
                  {persona.description}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="w-fit rounded-full border border-[#e0d8ff] bg-brand-soft px-6 py-3 text-sm font-black text-brand transition hover:bg-[#e7ddff]"
          >
            프로필 편집
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[20px] border border-line bg-surface-soft p-6"
            >
              <p className="text-[28px] font-black leading-none text-ink">
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-medium text-ink-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
