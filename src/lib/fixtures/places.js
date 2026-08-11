import { aiCourseFixture } from "./ai-course";

const extraPlaces = [
  {
    id: "place-5",
    category: "K-뷰티",
    name: "올리브영 명동 플래그십",
    description:
      "외국인 여행자가 많이 찾는 K-뷰티 쇼핑 스팟. 인기 제품을 한 번에 둘러보기 좋아요.",
    image: "/assets/ai-course/stop-5.jpg",
    hours: "10:00-22:30",
    price: "제품별 상이",
    location: "서울 중구 명동",
    rating: 4.7,
    reviews: 1284,
    kind: "brand",
  },
  {
    id: "place-6",
    category: "팝업",
    name: "성수 팝업 스트리트",
    description:
      "브랜드 팝업과 포토존이 모여 있는 성수 대표 산책 코스예요.",
    image: "/assets/ai-course/stop-6.jpg",
    hours: "브랜드별 상이",
    price: "무료 입장",
    location: "서울 성동구 성수",
    rating: 4.5,
    reviews: 642,
    kind: "popup",
  },
];

export const placeCatalog = [...aiCourseFixture.stops, ...extraPlaces];
