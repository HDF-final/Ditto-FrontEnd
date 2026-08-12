import Link from "next/link";

export function MypageCourseCard({ course }) {
  return (
    <Link
      href="/ai-course"
      className="group overflow-hidden rounded-[32px] shadow-[0_8px_20px_rgba(43,28,89,0.08)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(43,28,89,0.14)]"
    >
      <div
        className={`flex h-[150px] flex-col justify-between bg-linear-to-br ${course.gradient} p-5 text-white`}
      >
        <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[10px] font-black tracking-wide">
          {course.badge}
        </span>
        <div>
          <p className="text-xl font-black tracking-tight">
            {course.englishTitle}
          </p>
          <p className="mt-1 text-xs font-medium text-white/85">
            {course.subtitle}
          </p>
        </div>
      </div>
      <div className="bg-white p-5">
        <h3 className="text-base font-black text-ink group-hover:text-brand">
          {course.title}
        </h3>
        <div className="mt-3 flex flex-col gap-1.5">
          {course.stops.map((stop) => (
            <div
              key={`${course.title}-${stop.floor}-${stop.name}`}
              className="flex items-center gap-2 text-xs text-ink"
            >
              <span className="min-w-[30px] rounded-md bg-brand-soft px-1.5 py-0.5 text-center text-[10px] font-black text-brand">
                {stop.floor}
              </span>
              <span className="font-medium">{stop.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[11px] text-ink-muted">
          <span>♥ {course.likes}</span>
          <span>· {course.spotCount}</span>
          <span>· {course.duration}</span>
        </div>
      </div>
    </Link>
  );
}
