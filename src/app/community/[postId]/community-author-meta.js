"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import { useIsMounted } from "@/hooks/use-is-mounted";

function getUserCountry(user) {
  return user?.countryCode || user?.country || user?.nationality || "";
}

function getUserName(user) {
  return user?.nickname || user?.name || "";
}

function buildAuthorHref(authorId, authorName) {
  const query = new URLSearchParams();
  if (authorId) query.set("authorId", String(authorId));
  if (authorName) query.set("author", authorName);
  const search = query.toString();
  return search ? `/community?${search}` : "/community";
}

export function CommunityAuthorName({ name = "", travelerText = "여행자" }) {
  const mounted = useIsMounted();
  const user = useAuthStore((state) => state.user);
  const displayName = name || (mounted ? getUserName(user) : "") || travelerText;

  return <>{displayName}</>;
}

export function CommunityAuthorCountry({ country = "" }) {
  const mounted = useIsMounted();
  const user = useAuthStore((state) => state.user);
  const displayCountry = country || (mounted ? getUserCountry(user) : "") || "KR";

  return <>{displayCountry}</>;
}

export function CommunityAuthorDescription({
  name = "",
  travelerText = "여행자",
}) {
  const mounted = useIsMounted();
  const user = useAuthStore((state) => state.user);
  const displayName = name || (mounted ? getUserName(user) : "") || travelerText;

  return <>이 코스를 만든 {displayName}님이 직접 쓴 글이에요.</>;
}

export function CommunityOtherCoursesLink({
  authorId = "",
  authorName = "",
  children,
  className = "",
}) {
  const mounted = useIsMounted();
  const user = useAuthStore((state) => state.user);
  const resolvedAuthorName = authorName || (mounted ? getUserName(user) : "");
  const href = buildAuthorHref(authorId, resolvedAuthorName);

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
