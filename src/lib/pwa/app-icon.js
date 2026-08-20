import { ImageResponse } from "next/og";

const BRAND = "#5c2ef5";

/**
 * Shared PWA / home-screen icon renderer.
 * A solid brand tile with a white "D" so install surfaces stay on-brand
 * without shipping extra raster assets.
 */
export function createAppIcon(size) {
  const fontSize = Math.round(size * 0.42);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND,
          color: "#ffffff",
          fontSize,
          fontWeight: 800,
          letterSpacing: "-0.06em",
        }}
      >
        D
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );
}
