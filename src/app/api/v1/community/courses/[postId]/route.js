const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET ??
  "http://hdf-spring-alb-476185930.ap-northeast-2.elb.amazonaws.com";

const FORWARDED_HEADERS = new Set([
  "accept",
  "accept-language",
  "content-type",
  "cookie",
  "x-user-id",
  "x-user-email",
  "x-user-role",
]);

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildBackendUrl(request, postId) {
  const baseUrl = API_PROXY_TARGET.replace(/\/$/, "");
  const url = new URL(request.url);
  return `${baseUrl}/api/v1/community/courses/${postId}${url.search}`;
}

function buildRequestHeaders(request) {
  const headers = new Headers();
  const hasLocalUserOverride = request.headers.has("x-user-id");

  for (const [key, value] of request.headers.entries()) {
    const normalizedKey = key.toLowerCase();
    if (!FORWARDED_HEADERS.has(normalizedKey)) continue;
    if (hasLocalUserOverride && normalizedKey === "cookie") continue;
    headers.set(key, value);
  }

  return headers;
}

function buildResponseHeaders(upstreamHeaders) {
  const headers = new Headers();

  for (const [key, value] of upstreamHeaders.entries()) {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  return headers;
}

async function proxyCommunityCourse(request, { params }) {
  const { postId } = await params;
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const upstream = await fetch(buildBackendUrl(request, postId), {
    method,
    headers: buildRequestHeaders(request),
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
    redirect: "manual",
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: buildResponseHeaders(upstream.headers),
  });
}

export const PATCH = proxyCommunityCourse;
export const DELETE = proxyCommunityCourse;
export const OPTIONS = proxyCommunityCourse;
