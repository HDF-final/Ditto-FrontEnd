import Link from "next/link";

export function MypageCourseCard({ course }) {
  const stops = Array.isArray(course.stops) ? course.stops : [];
  const isInteractive = Boolean(course.href);
  const className = `group overflow-hidden rounded-[32px] shadow-[0_8px_20px_rgba(43,28,89,0.08)] transition ${
    isInteractive
      ? "hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(43,28,89,0.14)]"
      : ""
  }`;

  const content = (
    <>
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
        {stops.length > 0 ? (
          <div className="mt-3 flex flex-col gap-1.5">
            {stops.map((stop, index) => (
              <div
                key={`${course.id}-${stop.floor}-${stop.name}-${index}`}
                className="flex items-center gap-2 text-xs text-ink"
              >
                <span className="min-w-[30px] rounded-md bg-brand-soft px-1.5 py-0.5 text-center text-[10px] font-black text-brand">
                  {stop.floor}
                </span>
                <span className="font-medium">{stop.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs font-medium text-ink-muted">
            {course.spotCount
              ? `저장된 방문 장소 ${course.spotCount}`
              : "코스 상세에서 방문 정보를 확인해보세요."}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[11px] text-ink-muted">
          {course.likes !== undefined ? <span>♥ {course.likes}</span> : null}
          {course.bookmarkCount !== undefined ? (
            <span>📌 {course.bookmarkCount}</span>
          ) : null}
          {course.spotCount ? <span>{course.spotCount}</span> : null}
          {course.duration ? <span>{course.duration}</span> : null}
        </div>
      </div>
    </>
  );

  return isInteractive ? (
    <Link href={course.href} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}
