import Image from "next/image";

export function MypageProfile({ profile, stats, onEditClick, onLogoutClick }) {
  const persona = profile.persona;

  return (
    <section className="border-b border-line bg-white px-4 pt-5 sm:px-8 sm:pt-8 lg:px-52 lg:pt-[60px] xl:px-60 2xl:px-72">
      <div className="flex flex-col gap-4 pb-5 sm:gap-6 sm:pb-8 lg:gap-10 lg:pb-[60px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex min-w-0 items-center gap-3.5 lg:gap-5">
            <div
              className="flex size-[58px] sm:size-[68px] shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors duration-200 lg:size-[78px]"
              style={{ backgroundColor: persona.bgColor || "#fff1e6" }}
            >
              <Image
                src={persona.image}
                alt={persona.name}
                width={66}
                height={66}
                className="h-[48px] w-[48px] sm:h-[58px] sm:w-[58px] object-contain lg:h-[66px] lg:w-[66px]"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-black text-ink lg:text-[26px] truncate">{profile.name}</h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-ink-muted truncate">
                {profile.description}
              </p>
              <div
                className="mt-2 inline-flex max-w-full items-center gap-1.5 sm:gap-2 rounded-full border px-2.5 py-1 sm:px-3.5 sm:py-1.5 transition-colors duration-200"
                style={{
                  backgroundColor: persona.badgeBg || "#f5f3ff",
                  borderColor: persona.badgeBorder || "#e0d8ff",
                }}
              >
                <Image
                  src={persona.image}
                  alt=""
                  width={20}
                  height={20}
                  className="size-[18px] sm:size-[22px] object-contain shrink-0"
                  unoptimized
                />
                <span
                  className="text-xs sm:text-sm font-black whitespace-nowrap shrink-0"
                  style={{ color: persona.badgeText || "#5c2ef5" }}
                >
                  {persona.name}
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-ink-muted whitespace-nowrap truncate max-w-[140px] sm:max-w-none">
                  {persona.description}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-fit">
            <button
              type="button"
              onClick={onEditClick}
              style={{
                backgroundColor: persona.softButtonBg || persona.badgeBg || "#f5f3ff",
                borderColor: persona.softButtonBorder || persona.badgeBorder || "#e0d8ff",
                color: persona.softButtonText || persona.badgeText || "#5c2ef5",
              }}
              className="w-full cursor-pointer rounded-full border px-4 py-2.5 text-xs sm:text-sm font-black transition-all hover:opacity-90 lg:w-auto lg:px-6 lg:py-3 shadow-xs whitespace-nowrap text-center"
            >
              프로필 편집
            </button>
            {onLogoutClick ? (
              <button
                type="button"
                onClick={onLogoutClick}
                className="hidden lg:inline-flex cursor-pointer rounded-full border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink-muted transition-all hover:border-brand hover:text-brand lg:px-5 lg:py-3 shadow-xs whitespace-nowrap shrink-0"
              >
                로그아웃
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-3 lg:gap-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: persona.statBg || "#f9f7ff",
                borderColor: persona.statBorder || "#ede9fe",
              }}
              className="rounded-[14px] border px-1.5 py-2.5 text-center transition-all duration-200 sm:p-3 lg:rounded-[20px] lg:p-6 shadow-xs"
            >
              <p className="text-base font-black leading-none text-ink sm:text-xl lg:text-[28px]">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] font-medium text-ink-muted sm:text-xs whitespace-nowrap truncate">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
