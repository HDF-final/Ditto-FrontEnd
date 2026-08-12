import { CommunityCoursePage } from "./community-course-page";

export const metadata = { title: "커뮤니티" };

const communityCards = [
  {
    country: "JP",
    name: "Yuki_T",
    hash: "#첫방문 #포토스팟",
    title: "처음이면 이 코스로 시작해",
    likes: 742,
    comments: 58,
    saves: 214,
    gradient: "from-[#5c2ef5] to-[#8c57fa]",
  },
  {
    country: "CN",
    name: "Chen_Li",
    hash: "#디저트 #카페",
    title: "더현대 디저트만 골라 먹기",
    likes: 611,
    comments: 41,
    saves: 187,
    gradient: "from-[#2d1b8e] to-[#8c57fa]",
  },
  {
    country: "US",
    name: "Emma_R",
    hash: "#K뷰티 #향수",
    title: "K뷰티 쇼핑은 여기서 끝",
    likes: 508,
    comments: 33,
    saves: 152,
    gradient: "from-[#5c2ef5] to-[#8c57fa]",
  },
  {
    country: "JP",
    name: "Sakura_M",
    hash: "#패션 #편집숍",
    title: "MZ 브랜드 편집숍 투어",
    likes: 476,
    comments: 27,
    saves: 131,
    gradient: "from-[#2d1b8e] to-[#8c57fa]",
  },
  {
    country: "US",
    name: "Noah_K",
    hash: "#루프탑 #인생샷",
    title: "햇살 좋은 날 사진 코스",
    likes: 455,
    comments: 24,
    saves: 126,
    gradient: "from-[#5c2ef5] to-[#8c57fa]",
  },
  {
    country: "CN",
    name: "Mina_Z",
    hash: "#푸드코트 #로컬맛",
    title: "점심부터 저녁까지 먹방 루트",
    likes: 438,
    comments: 22,
    saves: 118,
    gradient: "from-[#2d1b8e] to-[#8c57fa]",
  },
  {
    country: "JP",
    name: "Riku_A",
    hash: "#팝업 #한정판",
    title: "오늘 열린 팝업 빠르게 돌기",
    likes: 421,
    comments: 20,
    saves: 109,
    gradient: "from-[#5c2ef5] to-[#8c57fa]",
  },
  {
    country: "US",
    name: "Lily_P",
    hash: "#굿즈 #선물",
    title: "친구 선물 사기 좋은 코스",
    likes: 397,
    comments: 18,
    saves: 96,
    gradient: "from-[#2d1b8e] to-[#8c57fa]",
  },
];

export default function CommunityPage() {
  return <CommunityCoursePage initialCards={communityCards} />;
}
