import Link from "next/link";

export function CourseCard({ course }) {
  return (
    <Link
      href={course.href}
      className="group flex h-full min-h-[400px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_8px_20px_rgba(43,28,89,0.08)] lg:min-h-[540px] lg:rounded-[32px] lg:transition lg:hover:-translate-y-1 lg:hover:shadow-[0_18px_32px_rgba(43,28,89,0.14)]"
    >
      <div
        className={`flex min-h-[270px] flex-1 flex-col justify-between bg-linear-to-br p-5 text-white lg:min-h-[370px] lg:p-8 ${course.gradient}`}
      >
        <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[10px] font-black tracking-wide">
          {course.rank}
        </span>
        <p className="text-xl font-black tracking-tight lg:text-[26px] lg:leading-8">
          {course.englishTitle}
        </p>
      </div>
      <div className="min-h-[130px] p-5 lg:min-h-[170px] lg:p-8">
        <h3 className="text-sm font-black text-ink group-hover:text-brand lg:text-lg">
          {course.title}
        </h3>
        <p className="mt-1 text-xs font-semibold text-ink-muted">
          {course.tags.map((tag) => `#${tag}`).join(" ")}
        </p>
      </div>
    </Link>
  );
}
