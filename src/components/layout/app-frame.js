import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function AppFrame({ children }) {
  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
