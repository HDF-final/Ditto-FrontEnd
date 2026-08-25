import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */

// 브라우저는 항상 같은 오리진의 `/api/*`로 요청하고, Next가 백엔드로 프록시합니다.
// CORS 설정 없이 개발할 수 있고, 배포 환경별 백엔드 주소는 이 서버 전용
// 환경변수 하나만 바꾸면 됩니다. (`NEXT_PUBLIC_`이 아니므로 번들에 노출되지 않음)
const apiProxyTarget =
  process.env.API_PROXY_TARGET ??
  "http://hdf-spring-alb-476185930.ap-northeast-2.elb.amazonaws.com";

// AI 코스 추천은 한 턴에 40~50초가 걸립니다. AI 코스 추천 응답이 완료되기 전에
// 프록시가 연결을 끊지 않도록 타임아웃을 충분히 길게 설정합니다.
//
// 클라이언트(axios) 타임아웃 120초보다 길게 잡아, 시간 초과 판단은 항상 axios가
// 먼저 하도록 둡니다. 그래야 화면에 우리가 만든 안내 문구가 뜹니다.
const API_PROXY_TIMEOUT_MS = 150_000;

const nextConfig = {
  output: "standalone", // Docker 배포를 위한 Standalone 경량화 빌드 설정

  images: {
    // Place hero/product photos and S3 uploaded assets
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.s3.*.amazonaws.com" },
      { protocol: "http", hostname: "**.amazonaws.com" },
      {
        protocol: "https",
        hostname: "hdf-ditto-images.s3.ap-northeast-2.amazonaws.com",
      },
    ],
  },

  allowedDevOrigins: ["127.0.0.1", "192.168.2.181"],

  experimental: {
    proxyTimeout: API_PROXY_TIMEOUT_MS,
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },

  // 실내 지도 원장과 층 텍스처는 한 번 만들어지면 바뀌지 않습니다. 그런데 Next는
  // `public/` 파일에 지문(해시)을 안 붙여서 기본값이 매번 재검증이고, 지도를 열 때마다
  // JSON 588KB + PNG 2.2MB에 대해 조건부 요청이 나갑니다.
  //
  // 경로에 이미 버전이 들어 있습니다(`/navigation/v2/`). 원장을 다시 만들면 `v3`로
  // 올리는 것이 전제이고, **v2 안에서 파일을 갈아끼우면 최대 3주 동안 옛 것을 보게
  // 됩니다** — 그때는 경로를 올리거나 이 값을 줄이세요.
  //
  // `manifest.json`만 짧게 둡니다. 그게 원장의 색인이고 6KB라 매번 확인해도 쌉니다.
  // **순서가 중요합니다** — 같은 키가 겹치면 뒤에 온 규칙이 이깁니다. 그래서 manifest를
  // 넓은 규칙 뒤에 둡니다.
  async headers() {
    const threeWeeks = 60 * 60 * 24 * 21;
    return [
      {
        source: "/navigation/v2/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${threeWeeks}` }],
      },
      {
        source: "/maps/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${threeWeeks}` }],
      },
      {
        source: "/navigation/v2/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

export default withNextIntl(nextConfig);