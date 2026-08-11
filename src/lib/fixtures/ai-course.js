// Static sample data for the AI course editor foundation.
// This is placeholder UI data only — do not treat it as a real API contract.
// Image paths intentionally point at assets that may not exist yet so the
// stop card's image-failure fallback can be exercised without a backend.

export const aiCourseFixture = {
  id: "course-draft-1",
  title: "K-MZ Trend 코스",
  stops: [
    {
      id: "stop-1",
      category: "한식당",
      name: "SMT 라운지 더현대서울점",
      description:
        "더현대서울에서 즐기는 모던 한식 다이닝. K-pop 콘셉트 라운지로 트렌디한 분위기를 잡기 좋은 시작점이에요.",
      image: "/assets/ai-course/stop-1.jpg",
    },
    {
      id: "stop-2",
      category: "K-pop",
      name: "MLB 키즈 현대서울점",
      description:
        "K-pop 스타들이 자주 착용해 화제가 된 스트리트 감성 브랜드. 포토존과 시즌 아이템을 함께 둘러볼 수 있어요.",
      image: "/assets/ai-course/stop-2.jpg",
    },
    {
      id: "stop-3",
      category: "디저트·카페",
      name: "EOI 이엘",
      description:
        "한옥을 개조한 감성 디저트 카페. 잠깐의 휴식과 함께 사진 찍기 좋은 무드가 가득한 공간입니다.",
      image: "/assets/ai-course/stop-3.jpg",
    },
    {
      id: "stop-4",
      category: "패션",
      name: "스파이더즈 브랜드 뉴 데이 팝업",
      description:
        "요즘 가장 핫한 팝업 스토어. 한정판 굿즈와 포토 스팟으로 코스의 마무리를 장식하기 좋아요.",
      image: "/assets/ai-course/stop-4.jpg",
    },
  ],
};

export const emptyAiCourseFixture = {
  id: "course-draft-empty",
  title: "",
  stops: [],
};
