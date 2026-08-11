import Link from "next/link";

export function CourseCard({ course }) {
  return (
    <Link
      href={course.href}
      className="group overflow-hidden rounded-[32px] bg-white shadow-[0_8px_20px_rgba(43,28,89,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(43,28,89,0.14)]"
    >
      <div
        className={`flex h-[150px] flex-col justify-between bg-linear-to-br ${course.gradient} p-5 text-white`}
      >
        <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[10px] font-black tracking-wide">
          {course.rank}
        </span>
        <p className="text-xl font-black tracking-tight">
          {course.englishTitle}
        </p>
      </div>
      <div className="p-5">
        <h3 className="text-base font-black text-ink group-hover:text-brand">
          {course.title}
        </h3>
        <p className="mt-1 text-xs font-semibold text-ink-muted">
          {course.tags.map((tag) => `#${tag}`).join(" ")}
        </p>
      </div>
    </Link>
  );
}
