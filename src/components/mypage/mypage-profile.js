export function MypageProfile({ profile, stats }) {
  return (
    <section className="bg-surface-soft px-5 py-12 lg:px-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black text-brand">{profile.persona}</p>
          <h1 className="mt-2 text-4xl font-black text-ink">{profile.name}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted">
            {profile.summary}
          </p>
          <p className="mt-2 text-xs font-bold text-ink-subtle">{profile.country}</p>
        </div>
        <dl className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="min-w-24 rounded-card border border-line bg-white px-5 py-4 text-center shadow-card"
            >
              <dt className="text-xs font-bold text-ink-muted">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-black text-brand">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
