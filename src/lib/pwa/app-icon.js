import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Shared PWA / home-screen icon renderer.
 * Renders the Boni brand mascot on a white tile so every install surface
 * (favicon route, apple-icon, manifest icons) stays on-brand.
 */
const BONI_ICON =
  "data:image/png;base64," +
  readFileSync(join(process.cwd(), "src/lib/pwa/boni.png")).toString("base64");

export function createAppIcon(size) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <img
          src={BONI_ICON}
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );
}
