export function Card({ as: Component = "article", className = "", ...props }) {
  return (
    <Component
      className={[
        "rounded-card border border-line bg-surface p-6 shadow-card",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function SoftCard({
  as: Component = "section",
  className = "",
  ...props
}) {
  return (
    <Component
      className={[
        "rounded-card border border-line bg-surface-soft p-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
