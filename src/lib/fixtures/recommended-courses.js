export const recommendedCourses = [
  {
    slug: "first-timer-boni-route",
    rank: 1,
    authorInitial: "B",
    author: "Boni",
    hash: "#DITTO추천 #초행자코스",
    title: "처음이면 이 코스로 시작해",
    description:
      "보니가 초행자에게 필요한 이동 난이도, 쉬는 구간, 사진 포인트를 기준으로 추천한 기본 코스입니다.",
    gradient: "from-[#2d1b8e] to-[#8c57fa]",
    label: "THE HYUNDAI SEOUL",
    stops: [
      { floor: "1F", name: "워터폴 가든", description: "입구에서 바로 보이는 포토존" },
      { floor: "5F", name: "사운즈 포레스트", description: "실내 정원에서 쉬기 좋은 구간" },
      { floor: "B2", name: "크리에이티브 그라운드", description: "쇼핑 후 둘러보기 좋은 편집숍" },
    ],
    criteria: [
      {
        title: "이동 난이도 낮음",
        description: "상하 이동이 단순해서 초행자가 따라가기 쉬워요.",
      },
      {
        title: "사진 포인트 선명",
        description: "시작 지점과 쉬는 구간에 인증샷 포인트가 있어요.",
      },
      {
        title: "쇼핑 마무리 적합",
        description: "마지막 장소에서 선물과 굿즈를 한 번에 볼 수 있어요.",
      },
    ],
    note:
      "이 코스는 더현대 서울이 처음인 사용자에게 가장 부담이 적은 순서예요. 입구에서 바로 찾을 수 있는 워터폴 가든으로 시작하고, 중간에 사운즈 포레스트에서 쉬면서 사진을 남긴 뒤, 마지막에 B2 편집숍으로 내려가 쇼핑을 마무리하도록 구성했습니다.",
  },
  {
    slug: "hyundai-mz-trend",
    rank: 2,
    authorInitial: "B",
    author: "Boni",
    hash: "#DITTO추천 #트렌드코스",
    title: "MZ 트렌드 코스",
    description: "팝업과 편집숍 중심으로 최신 트렌드를 빠르게 확인하는 코스입니다.",
    gradient: "from-[#2d1b8e] to-[#5c2ef5]",
    label: "THE HYUNDAI SEOUL",
    stops: [
      { floor: "B2", name: "팝업존", description: "시즌 브랜드 확인" },
      { floor: "B1", name: "편집숍", description: "트렌드 제품 탐색" },
      { floor: "1F", name: "메인 홀", description: "이벤트 체크" },
    ],
    criteria: [
      { title: "팝업 접근성", description: "짧은 시간에 핵심 팝업을 볼 수 있어요." },
      { title: "트렌드 밀도", description: "인기 브랜드 동선을 우선했어요." },
      { title: "쇼핑 연계", description: "구매까지 이어지기 좋은 흐름이에요." },
    ],
    note: "팝업과 편집숍을 중심으로 빠르게 둘러보는 코스입니다.",
  },
  {
    slug: "k-beauty-glow",
    rank: 3,
    authorInitial: "B",
    author: "Boni",
    hash: "#DITTO추천 #뷰티코스",
    title: "K-Beauty & Glow",
    description: "뷰티 브랜드와 향수, 쉬는 공간을 연결한 코스입니다.",
    gradient: "from-[#6d28d9] to-[#c084fc]",
    label: "GLOW LAB",
    stops: [
      { floor: "B2", name: "뷰티 편집숍", description: "제품 비교" },
      { floor: "1F", name: "향수 매장", description: "시향 포인트" },
      { floor: "5F", name: "라운지", description: "구매 후 휴식" },
    ],
    criteria: [
      { title: "비교 쉬움", description: "비슷한 카테고리를 가까이 묶었어요." },
      { title: "체험 중심", description: "테스트와 시향을 우선했어요." },
      { title: "휴식 포함", description: "중간 피로도를 낮췄어요." },
    ],
    note: "K-뷰티 쇼핑을 한 번에 끝내고 싶은 사용자에게 맞춘 코스입니다.",
  },
  {
    slug: "quick-gourmet",
    rank: 4,
    authorInitial: "B",
    author: "Boni",
    hash: "#DITTO추천 #미식코스",
    title: "Quick & Gourmet",
    description: "짧은 시간에 식사와 디저트를 함께 즐기는 코스입니다.",
    gradient: "from-[#4a2fa8] to-[#7c5cf0]",
    label: "SEOUL TABLE",
    stops: [
      { floor: "B1", name: "푸드홀", description: "식사 선택" },
      { floor: "B1", name: "디저트 존", description: "간식 추천" },
      { floor: "5F", name: "카페", description: "마무리 휴식" },
    ],
    criteria: [
      { title: "시간 효율", description: "이동을 최소화했어요." },
      { title: "선택 폭", description: "취향별 선택지가 많아요." },
      { title: "마무리 좋음", description: "휴식 공간을 포함했어요." },
    ],
    note: "식사와 디저트를 가까운 동선 안에서 해결하는 코스입니다.",
  },
];

export function getRecommendedCourse(slug) {
  return recommendedCourses.find((course) => course.slug === slug);
}
