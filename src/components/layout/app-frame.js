"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const AUTH_PATHS = new Set(["/login", "/signup", "/country", "/persona"]);

/**
 * Site chrome wrapper. Auth routes match the HTML mock (no header/footer).
 */
export function AppFrame({ children }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PATHS.has(pathname);

  if (isAuthRoute) {
    return children;
  }

  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
