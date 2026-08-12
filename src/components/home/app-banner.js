import Link from "next/link";

export function AppBanner() {
  return (
    <section className="bg-background px-10 sm:px-14 py-16 lg:px-52 xl:px-60 2xl:px-72">
      <div className="grid min-h-60 overflow-hidden rounded-[32px] bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] lg:grid-cols-[1fr_420px]">
        <div className="flex flex-col justify-center gap-3 p-8 sm:p-[60px]">
          <h2 className="text-2xl font-black text-white sm:text-[28px]">
            모바일 앱으로 더 스마트한 여행을!
          </h2>
          <p className="text-sm leading-7 text-violet-100 sm:text-base">
            2.5D 실시간 지도로 여행의 여정 기록까지, 앱 하나로 더 편리하게.
          </p>
          <div className="mt-2">
            <Link
              href="/ai-course"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-[#4a2fa8]"
            >
              앱 다운로드
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="flex min-h-44 items-center justify-center bg-white/10 px-8 text-center text-xs text-violet-100">
          앱 화면 · QR 이미지 영역
        </div>
      </div>
    </section>
  );
}
