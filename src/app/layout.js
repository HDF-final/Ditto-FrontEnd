import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export const metadata = {
  title: {
    default: "DITTO | K-Culture Shopping Mate",
    template: "%s | DITTO",
  },
  description:
    "국가별 K-컬처 트렌드부터 AI 맞춤 코스와 실내 길찾기까지 연결하는 관광 플랫폼",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
        <footer className="border-t border-line bg-white px-5 py-6 text-center text-sm text-ink-muted">
          © 2026 DITTO. Front-end foundation.
        </footer>
      </body>
    </html>
  );
}
