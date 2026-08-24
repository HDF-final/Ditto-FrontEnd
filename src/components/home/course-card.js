import Link from "next/link";

export function CourseCard({ course }) {
  return (
    <Link
      href={course.href}
      className="group flex h-full flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_6px_18px_rgba(43,28,89,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(43,28,89,0.12)] lg:rounded-[32px]"
    >
      <div
        className={`flex h-[4.75rem] shrink-0 flex-col justify-between bg-linear-to-br p-3 text-white lg:h-auto lg:aspect-[4/3] lg:p-7 ${course.gradient}`}
      >
        <span className="w-fit rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] font-black tracking-wide lg:px-3 lg:py-1 lg:text-[10px]">
          {course.rank}
        </span>
        <p className="line-clamp-2 text-[11px] font-black leading-[1.3] tracking-tight sm:text-xl lg:text-[21px] xl:text-[24px] lg:leading-7 xl:leading-8">
          {course.englishTitle}
        </p>
      </div>
      <div className="flex flex-1 flex-col justify-center p-3 sm:p-5 lg:min-h-[130px] lg:justify-start lg:p-6 xl:p-7">
        <h3 className="line-clamp-2 text-[11px] font-black leading-[1.35] text-ink group-hover:text-brand sm:text-base lg:text-[16px] xl:text-lg">
          {course.title}
        </h3>
        <p className="mt-1 truncate text-[9px] font-semibold leading-[1.3] text-ink-muted lg:mt-1 lg:text-xs">
          {course.tags.map((tag) => `#${tag}`).join(" ")}
        </p>
      </div>
    </Link>
  );
}
