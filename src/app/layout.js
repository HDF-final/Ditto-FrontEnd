import { AppFrame } from "@/components/layout/app-frame";
import { PwaRegister } from "@/components/layout/pwa-register";
import "./globals.css";

export const metadata = {
  title: {
    default: "DITTO | K-Culture Shopping Mate",
    template: "%s | DITTO",
  },
  description:
    "국가별 K-컬처 트렌드부터 AI 맞춤 코스와 실내 길찾기까지 연결하는 관광 플랫폼",
  applicationName: "DITTO",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DITTO",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  themeColor: "#5c2ef5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-dvh bg-[#e8e2f6] lg:min-h-full lg:bg-background">
        <div className="app-shell">
          <AppFrame>{children}</AppFrame>
        </div>
        <PwaRegister />
      </body>
    </html>
  );
}
