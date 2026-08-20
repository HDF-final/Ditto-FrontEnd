import Link from "next/link";

export function CourseCard({ course }) {
  return (
    <Link
      href={course.href}
      className="group overflow-hidden rounded-[24px] bg-white shadow-[0_8px_20px_rgba(43,28,89,0.08)] lg:rounded-[32px] lg:transition lg:hover:-translate-y-1 lg:hover:shadow-[0_18px_32px_rgba(43,28,89,0.14)]"
    >
      <div
        className={`flex h-[120px] flex-col justify-between bg-linear-to-br p-4 text-white lg:h-[150px] lg:p-5 ${course.gradient}`}
      >
        <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[10px] font-black tracking-wide">
          {course.rank}
        </span>
        <p className="text-lg font-black tracking-tight lg:text-xl">
          {course.englishTitle}
        </p>
      </div>
      <div className="p-4 lg:p-5">
        <h3 className="text-sm font-black text-ink group-hover:text-brand lg:text-base">
          {course.title}
        </h3>
        <p className="mt-1 text-xs font-semibold text-ink-muted">
          {course.tags.map((tag) => `#${tag}`).join(" ")}
        </p>
      </div>
    </Link>
  );
}
