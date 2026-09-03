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

async function forwardToBackend(url, request, headers, body) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    return await fetch(url, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildBackendUrl(request, postId, commentId) {
  const baseUrl = API_PROXY_TARGET.replace(/\/$/, "");
  const url = new URL(request.url);
  return `${baseUrl}/api/v1/community/courses/${postId}/comments/${commentId}${url.search}`;
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

async function proxyCommunityComment(request, { params }) {
  const { postId, commentId } = await params;
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  let upstream;

  try {
    upstream = await forwardToBackend(
      buildBackendUrl(request, postId, commentId),
      request,
      buildRequestHeaders(request),
      hasBody ? await request.arrayBuffer() : undefined,
    );
  } catch (err) {
    const status = err?.name === "AbortError" ? 504 : 502;
    return Response.json(
      {
        success: false,
        code: "COMMUNITY_COMMENT_PROXY_FAILED",
        message: "댓글 서버 요청에 실패했습니다.",
      },
      { status },
    );
  }

  const responseBody = await upstream.arrayBuffer();

  return new Response(responseBody, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: buildResponseHeaders(upstream.headers),
  });
}

export const PATCH = proxyCommunityComment;
export const DELETE = proxyCommunityComment;
export const OPTIONS = proxyCommunityComment;
