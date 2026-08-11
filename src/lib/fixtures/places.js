// Searchable catalog of places that can be added to a course.
// Placeholder UI data only — not a real API contract.
//
// Detail-view fields (heroImage, longDesc, tags, hours, price, location,
// rating, reviews, accent/gradient colors, products) drive the rich place
// detail modal. `kind` drives the call-to-action (food / brand / popup).
// Product `href` is intentionally empty and will be filled from the DB later.

const u = (id, w = 300, h = 300) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop`;

const product = (name, price, badge, badgeColor, image) => ({
  name,
  price,
  badge,
  badgeColor,
  image,
  href: "",
});

export const placeCatalog = [
  {
    id: "place-smt-lounge",
    category: "한식당",
    kind: "food",
    name: "SMT 라운지 더현대서울점",
    description:
      "더현대서울에서 즐기는 모던 한식 다이닝. K-pop 콘셉트 라운지로 트렌디한 분위기를 잡기 좋아요.",
    longDesc:
      "SM엔터테인먼트가 직접 운영하는 프리미엄 다이닝 공간으로, 더현대서울 6층에 위치합니다. 아이돌 컨셉의 인테리어와 시그니처 K-팝 메뉴들이 가득해 팬이라면 반드시 방문해야 할 필수 코스예요. 예약 없이는 대기가 길 수 있으니 미리 준비하세요.",
    image: "/assets/ai-course/place-smt.jpg",
    heroImage: u("photo-1414235077428-338989a2e8c0", 900, 500),
    tags: ["K-pop 테마", "인스타 핫플", "단체 가능", "예약 필수"],
    hours: "11:00 – 22:00",
    price: "₩₩₩",
    location: "서울 영등포구 여의대로 108",
    rating: 4.8,
    reviews: 1243,
    accentColor: "#5c2ef5",
    gradientFrom: "#5c2ef5",
    gradientTo: "#1a142e",
  },
  {
    id: "place-mlb",
    category: "패션",
    kind: "brand",
    name: "MLB 더현대서울점",
    description:
      "K-pop 스타들이 자주 착용해 화제가 된 스트리트 감성 브랜드. 시즌 아이템을 둘러보기 좋아요.",
    longDesc:
      "MLB는 K-pop 스타들이 즐겨 착용하는 스트리트 패션 브랜드예요. 더현대서울점은 최신 컬렉션을 가장 먼저 선보이는 플래그십 스토어로, 한정판 아이템과 콜라보 라인도 독점 판매합니다. 아이돌들과 같은 룩을 완성하고 싶다면 바로 이곳이에요.",
    image: "/assets/ai-course/place-mlb.jpg",
    heroImage: u("photo-1441984904996-e0b6ba687e04", 900, 500),
    tags: ["스트리트 패션", "아이돌 픽", "한정판", "카드 결제"],
    hours: "10:30 – 20:30",
    price: "₩₩",
    location: "서울 영등포구 여의대로 108 1F",
    rating: 4.6,
    reviews: 872,
    accentColor: "#1a6cb8",
    gradientFrom: "#1a6cb8",
    gradientTo: "#0d1a2e",
    productLine: "스트리트 캡 · 트레이닝",
    products: [
      product("NY 로고 볼캡", "49,000원", "베스트", "#1a6cb8", u("photo-1588850561407-ed78c282e89b")),
      product("크롭 트레이닝 탑", "79,000원", "NEW", "#0d9488", u("photo-1503342217505-b0a15ec3261c")),
      product("모노그램 숄더백", "129,000원", "한정판", "#c0162a", u("photo-1548036328-c9fa89d128fa")),
      product("와이드 조거 팬츠", "89,000원", "인기", "#7c3aed", u("photo-1542272604-787c3835535d")),
      product("빅로고 후드집업", "119,000원", "아이돌 픽", "#1a6cb8", u("photo-1556821840-3a63f15732ce")),
    ],
  },
  {
    id: "place-eql",
    category: "패션",
    kind: "brand",
    name: "EQL 이퀄",
    description:
      "디자이너 브랜드를 한자리에서 만나는 편집숍. 마뗑킴, 쿠어 등 인기 라인을 확인할 수 있어요.",
    longDesc:
      "EQL은 국내외 신진 디자이너 브랜드를 엄선해 소개하는 프리미엄 편집숍입니다. 매 시즌 새로운 브랜드와 협업 아이템이 들어오며, 패션 피플들의 성지로 불리는 공간이에요. 스타일리스트와 셀럽들도 즐겨 찾는 곳으로, 한국 패션 씬의 최전선을 경험할 수 있어요.",
    image: "/assets/ai-course/place-eql.jpg",
    heroImage: u("photo-1558618666-fcd25c85cd64", 900, 500),
    tags: ["신진 디자이너", "셀럽 픽", "프리미엄", "편집 큐레이션"],
    hours: "11:00 – 21:00",
    price: "₩₩₩₩",
    location: "서울 성동구 왕십리로 83-21",
    rating: 4.9,
    reviews: 564,
    accentColor: "#7c3aed",
    gradientFrom: "#7c3aed",
    gradientTo: "#1a142e",
    productLine: "디자이너 편집",
    products: [
      product("마뗑킴 로고 니트", "98,000원", "베스트", "#7c3aed", u("photo-1490481651871-ab68de25d43d")),
      product("쿠어 오버셔츠", "119,000원", "NEW", "#0d9488", u("photo-1483985988355-763728e1935b")),
      product("렉토 미니백", "258,000원", "한정판", "#c0162a", u("photo-1548036328-c9fa89d128fa")),
      product("어텐션로우 데님", "139,000원", "인기", "#7c3aed", u("photo-1542272604-787c3835535d")),
      product("르917 로퍼", "228,000원", "셀럽 픽", "#1a6cb8", u("photo-1533867617858-e7b97e060509")),
    ],
  },
  {
    id: "place-eoi",
    category: "디저트·카페",
    kind: "food",
    name: "EOI 이오이",
    description:
      "한옥을 개조한 감성 디저트 카페. 잠깐의 휴식과 사진 찍기 좋은 무드가 가득한 공간입니다.",
    longDesc:
      "한옥을 개조해 만든 감성 디저트 카페로, 전통과 현대가 어우러진 무드가 매력적인 공간이에요. 시그니처 디저트와 계절 음료가 인기이며, 어느 자리에서 찍어도 화보가 되는 포토 스팟으로도 유명합니다.",
    image: "/assets/ai-course/place-eoi.jpg",
    heroImage: u("photo-1445116572660-236099ec97a0", 900, 500),
    tags: ["감성 카페", "인스타 핫플", "한옥", "디저트 맛집"],
    hours: "12:00 – 22:00",
    price: "₩₩",
    location: "서울 종로구 북촌로 24",
    rating: 4.7,
    reviews: 981,
    accentColor: "#db2777",
    gradientFrom: "#db2777",
    gradientTo: "#1a142e",
  },
  {
    id: "place-spider-popup",
    category: "팝업",
    kind: "popup",
    name: "스파이더맨 브랜드 뉴 데이 팝업",
    description:
      "요즘 가장 핫한 한정판 팝업 스토어. 굿즈와 포토 스팟으로 코스의 마무리를 장식하기 좋아요.",
    longDesc:
      "마블의 스파이더맨 최신 작품을 기념하는 초대형 체험형 팝업 스토어예요. 영화 속 장면을 재현한 포토존과 한정판 굿즈, 그리고 독점 콜라보 아이템까지! 팝업 기간이 짧으니 서둘러 방문하세요. SNS 인증샷 명소로도 이미 입소문이 났어요.",
    image: "/assets/ai-course/place-spider.jpg",
    heroImage: u("photo-1531259683007-016a7b628fc3", 900, 500),
    tags: ["한정 기간", "포토존", "굿즈 판매", "마블 공식"],
    hours: "10:00 – 21:00",
    price: "무료 입장",
    location: "서울 영등포구 더현대서울 B1",
    rating: 4.7,
    reviews: 2891,
    accentColor: "#c0162a",
    gradientFrom: "#c0162a",
    gradientTo: "#0a0a0a",
  },
  {
    id: "place-seongsu-popup",
    category: "팝업",
    kind: "popup",
    name: "성수동 시즌 팝업스토어",
    description:
      "브랜드 협업 팝업이 끊이지 않는 성수동. 방문 시점마다 새로운 전시와 체험이 열립니다.",
    longDesc:
      "성수동은 브랜드 협업 팝업이 끊이지 않는 서울의 트렌드 성지예요. 방문 시점마다 새로운 전시와 체험형 콘텐츠가 열려, 언제 가도 신선한 경험을 즐길 수 있습니다. 주변 카페·편집숍과 함께 둘러보기 좋아요.",
    image: "/assets/ai-course/place-seongsu.jpg",
    heroImage: u("photo-1441986300917-64674bd600d8", 900, 500),
    tags: ["트렌드 성지", "체험형", "포토존", "주말 인기"],
    hours: "11:00 – 20:00",
    price: "무료 입장",
    location: "서울 성동구 연무장길 41",
    rating: 4.5,
    reviews: 1520,
    accentColor: "#0d9488",
    gradientFrom: "#0d9488",
    gradientTo: "#0a1f1c",
  },
  {
    id: "place-nudake",
    category: "디저트·카페",
    kind: "food",
    name: "누데이크 하우스 도산",
    description:
      "젠틀몬스터가 만든 아트 디저트 카페. 비주얼이 강렬한 시그니처 케이크로 유명해요.",
    longDesc:
      "아이웨어 브랜드 젠틀몬스터가 선보인 아트 디저트 카페예요. 예술 작품 같은 시그니처 케이크 '피크'가 대표 메뉴이며, 공간 전체가 하나의 전시처럼 구성돼 있어 미식과 예술을 동시에 즐길 수 있습니다.",
    image: "/assets/ai-course/place-nudake.jpg",
    heroImage: u("photo-1567620905732-2d1ec7ab7445", 900, 500),
    tags: ["아트 디저트", "젠틀몬스터", "시그니처 케이크", "핫플"],
    hours: "11:00 – 21:00",
    price: "₩₩₩",
    location: "서울 강남구 압구정로46길",
    rating: 4.6,
    reviews: 2043,
    accentColor: "#1a142e",
    gradientFrom: "#3a2f5c",
    gradientTo: "#0a0a0a",
  },
  {
    id: "place-tamburins",
    category: "뷰티",
    kind: "brand",
    name: "탬버린즈 플래그십",
    description:
      "향수와 핸드케어로 사랑받는 K-뷰티 브랜드. 공간 자체가 하나의 전시처럼 꾸며져 있어요.",
    longDesc:
      "탬버린즈는 향수와 핸드케어로 사랑받는 K-뷰티 브랜드예요. 플래그십 스토어는 제품 진열을 넘어 하나의 예술 전시처럼 꾸며져 있어, 향을 경험하며 공간 자체를 즐길 수 있습니다. 시즌 한정 퍼퓸도 이곳에서 먼저 만나보세요.",
    image: "/assets/ai-course/place-tamburins.jpg",
    heroImage: u("photo-1522335789203-aabd1fc54bc9", 900, 500),
    tags: ["K-뷰티", "퍼퓸", "전시형 매장", "선물 추천"],
    hours: "11:00 – 21:00",
    price: "₩₩₩",
    location: "서울 강남구 압구정로10길",
    rating: 4.8,
    reviews: 745,
    accentColor: "#db2777",
    gradientFrom: "#db2777",
    gradientTo: "#1a142e",
    productLine: "퍼퓸 · 핸드케어",
    products: [
      product("퍼퓸 넘버 세븐", "95,000원", "베스트", "#db2777", u("photo-1541643600914-78b084683601")),
      product("핸드 살균 젤", "28,000원", "인기", "#7c3aed", u("photo-1571781926291-c477ebfd024b")),
      product("솔리드 퍼퓸", "62,000원", "NEW", "#0d9488", u("photo-1592945403244-b3fbafd7f539")),
      product("샤워 퍼퓸", "42,000원", "선물 추천", "#1a6cb8", u("photo-1594035910387-fea47794261f")),
      product("퍼퓸 밤", "58,000원", "한정판", "#c0162a", u("photo-1512496015851-a90fb38ba796")),
    ],
  },
];
