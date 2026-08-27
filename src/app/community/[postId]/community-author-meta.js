"use client";

import Link from "next/link";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useCommunityPostAuthorsStore } from "@/stores/use-community-post-authors-store";

function useStoredAuthor(...ids) {
  const mounted = useIsMounted();
  const author = useCommunityPostAuthorsStore((state) => state.getPostAuthor(...ids));
  return mounted ? author : null;
}

function buildAuthorHref(authorId, authorName) {
  const query = new URLSearchParams();
  if (authorName) query.set("author", authorName);
  else if (authorId) query.set("authorId", String(authorId));
  const search = query.toString();
  return search ? `/community?${search}` : "/community";
}

export function CommunityAuthorName({
  name = "",
  travelerText = "여행자",
  postId = "",
  courseId = "",
}) {
  const storedAuthor = useStoredAuthor(postId, courseId);
  const displayName = name || storedAuthor?.name || travelerText;

  return <>{displayName}</>;
}

export function CommunityAuthorCountry({
  country = "",
  postId = "",
  courseId = "",
}) {
  const storedAuthor = useStoredAuthor(postId, courseId);
  const displayCountry = country || storedAuthor?.country || "KR";

  return <>{displayCountry}</>;
}

export function CommunityAuthorDescription({
  name = "",
  travelerText = "여행자",
  postId = "",
  courseId = "",
}) {
  const storedAuthor = useStoredAuthor(postId, courseId);
  const displayName = name || storedAuthor?.name || travelerText;

  return <>이 코스를 만든 {displayName}님이 직접 쓴 글이에요.</>;
}

export function CommunityOtherCoursesLink({
  postId = "",
  authorId = "",
  authorName = "",
  courseId = "",
  children,
  className = "",
}) {
  const storedAuthor = useStoredAuthor(postId, authorId, courseId);
  const resolvedAuthorName = authorName || storedAuthor?.name || "";
  const href = buildAuthorHref(authorId, resolvedAuthorName);

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
