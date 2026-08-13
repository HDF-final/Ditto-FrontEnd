/** @type {import('next').NextConfig} */

// 브라우저는 항상 같은 오리진의 `/api/*`로 요청하고, Next가 백엔드로 프록시합니다.
// CORS 설정 없이 개발할 수 있고, 배포 환경별 백엔드 주소는 이 서버 전용
// 환경변수 하나만 바꾸면 됩니다. (`NEXT_PUBLIC_`이 아니므로 번들에 노출되지 않음)
const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://localhost:8080";

const nextConfig = {
  images: {
    // Place hero/product photos are served from Unsplash in the sample data.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  allowedDevOrigins: ["127.0.0.1", "192.168.2.181"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
