import Image from "next/image";

export function MypageProfile({ profile, stats, onEditClick }) {
  const persona = profile.persona;

  return (
    <section className="border-b border-line bg-white px-5 pt-6 lg:px-52 lg:pt-[60px] xl:px-60 2xl:px-72">
      <div className="flex flex-col gap-5 pb-6 lg:gap-10 lg:pb-[60px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex items-center gap-3.5 lg:gap-5">
            <div
              className="flex size-[64px] shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors duration-200 lg:size-[78px]"
              style={{ backgroundColor: persona.bgColor || "#fff1e6" }}
            >
              <Image
                src={persona.image}
                alt={persona.name}
                width={66}
                height={66}
                className="h-[54px] w-[54px] object-contain lg:h-[66px] lg:w-[66px]"
                unoptimized
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-ink lg:text-[26px]">{profile.name}</h1>
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
            onClick={onEditClick}
            className="w-full cursor-pointer rounded-full border border-[#e0d8ff] bg-brand-soft px-5 py-2.5 text-sm font-black text-brand transition hover:bg-[#e7ddff] lg:w-fit lg:px-6 lg:py-3"
          >
            프로필 편집
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 lg:gap-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[16px] border border-line bg-surface-soft p-3 text-center lg:rounded-[20px] lg:p-6"
            >
              <p className="text-xl font-black leading-none text-ink lg:text-[28px]">
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
