export function MypageCourseCard({ course }) {
  return (
    <article className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className={`h-28 bg-linear-to-br ${course.gradient}`} />
      <div className="p-5">
        <span className="rounded-control bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
          {course.category}
        </span>
        <h2 className="mt-3 line-clamp-2 text-base font-black text-ink">
          {course.title}
        </h2>
        <p className="mt-2 text-sm font-semibold text-ink-muted">
          장소 {course.stops}개 · {course.date}
        </p>
      </div>
    </article>
  );
}
