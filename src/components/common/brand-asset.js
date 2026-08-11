import Image from "next/image";

const assetMap = {
  logo: {
    src: "/assets/common/ditto-logo.svg",
    alt: "DITTO 로고",
  },
  boni: {
    src: "/assets/common/boni.svg",
    alt: "Boni 캐릭터",
  },
  borangi: {
    src: "/assets/common/borangi-1.svg",
    alt: "보라 캐릭터",
  },
  orange: {
    src: "/assets/common/orange-1.svg",
    alt: "주황 캐릭터",
  },
  green: {
    src: "/assets/common/green-1.svg",
    alt: "초록 캐릭터",
  },
  pink: {
    src: "/assets/common/pink-1.svg",
    alt: "핑크 캐릭터",
  },
};

export function BrandAsset({
  name,
  width = 240,
  height = 240,
  className = "",
  imageClassName = "",
  priority = false,
}) {
  const asset = assetMap[name];

  if (!asset) {
    return null;
  }

  return (
    <div
      className={[
        "flex aspect-square items-center justify-center overflow-hidden rounded-card bg-surface-soft",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src={asset.src}
        alt={asset.alt}
        width={width}
        height={height}
        className={["h-full w-full object-contain p-6", imageClassName]
          .filter(Boolean)
          .join(" ")}
        priority={priority}
      />
    </div>
  );
}

export const brandAssets = assetMap;
