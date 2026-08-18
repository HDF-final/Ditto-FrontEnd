import { CommunityBookmarksView } from "@/components/community/community-bookmarks-view";

export const metadata = {
  title: "내가 좋아요한 커뮤니티 코스 | DITTO",
  description: "내가 찜하고 좋아요한 DITTO 여행자 커뮤니티 코스 목록입니다.",
};

export default function BookmarksPage() {
  return <CommunityBookmarksView />;
}
