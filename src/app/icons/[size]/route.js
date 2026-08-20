import { createAppIcon } from "@/lib/pwa/app-icon";

export const dynamic = "force-static";

const ALLOWED_SIZES = new Set([192, 512]);

export async function GET(_request, { params }) {
  const { size } = await params;
  const dimension = Number(size);

  if (!ALLOWED_SIZES.has(dimension)) {
    return new Response("Not found", { status: 404 });
  }

  return createAppIcon(dimension);
}
