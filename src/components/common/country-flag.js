const FLAG_IMAGES = {
  KR: "https://flagcdn.com/w80/kr.png",
  CN: "https://flagcdn.com/w80/cn.png",
  JP: "https://flagcdn.com/w80/jp.png",
  US: "https://flagcdn.com/w80/us.png",
};

export function CountryFlag({
  code = "",
  emoji = "",
  className = "h-[14px] w-[20px]",
}) {
  const src = FLAG_IMAGES[String(code).toUpperCase()];

  if (!src) {
    return (
      <span className="leading-none" aria-hidden="true">
        {emoji || "🌐"}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={20}
      height={14}
      draggable={false}
      className={`inline-block rounded-[2px] object-cover ${className}`}
    />
  );
}
