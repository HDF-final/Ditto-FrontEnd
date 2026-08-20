// 브랜드 로고 이미지를 같은 오리진으로 프록시합니다.
//
// 브랜드 로고는 S3 presigned URL로 내려오는데, S3가 CORS 헤더를 주지 않아
// 브라우저에서 <canvas>로 픽셀을 읽으면(=여백 자동 트리밍) 캔버스가 오염돼
// 막힙니다. 이 라우트로 이미지를 우리 오리진에서 다시 내려주면 same-origin이
// 되어 캔버스 트리밍이 가능해집니다. SSRF를 막기 위해 우리 S3 버킷만 허용합니다.

const ALLOWED_HOST = "hdf-ditto-images.s3.ap-northeast-2.amazonaws.com";

export async function GET(request) {
  const src = new URL(request.url).searchParams.get("src");
  if (!src) return new Response("missing src", { status: 400 });

  let target;
  try {
    target = new URL(src);
  } catch {
    return new Response("bad src", { status: 400 });
  }
  if (target.protocol !== "https:" || target.hostname !== ALLOWED_HOST) {
    return new Response("forbidden host", { status: 403 });
  }

  let upstream;
  try {
    upstream = await fetch(target.toString(), { cache: "no-store" });
  } catch {
    return new Response("upstream fetch failed", { status: 502 });
  }
  if (!upstream.ok) {
    return new Response("upstream error", { status: upstream.status });
  }

  const body = await upstream.arrayBuffer();
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "image/png",
      // presigned URL은 30분 만료라 짧게만 캐시합니다.
      "Cache-Control": "public, max-age=300",
    },
  });
}
