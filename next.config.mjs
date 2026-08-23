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
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

export default withNextIntl(nextConfig);