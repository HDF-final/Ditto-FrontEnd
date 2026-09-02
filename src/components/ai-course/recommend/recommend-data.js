/**
 * Static demo data for the course recommendation flow.
 *
 * Mirrors the Figma wireframe. Once the backend course-recommendation contract
 * is available, replace this with data fetched through the shared Axios client.
 */

export const places = [
  {
    id: 1,
    category: "음식점",
    categoryStyle: "bg-[#5c2ef5] text-white",
    name: "SMT 라운지 더현대서울점",
    desc: "SM엔터테인먼트가 운영하는 6층 이세 다이닝 공간. K-pop 팬이라면 코스의 완벽한 피날레를 장식하기 좋은 곳이에요.",
    longDesc:
      "SM엔터테인먼트가 직접 운영하는 프리미엄 다이닝 공간으로, 더현대서울 6층에 위치합니다. 아이돌 컨셉의 인테리어와 시그니처 K-팝 메뉴들이 가득해 팬이라면 반드시 방문해야 할 필수 코스예요. 예약 없이는 대기가 길 수 있으니 미리 준비하세요.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=500&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=500&fit=crop",
    booking: true,
    tags: ["K-pop 테마", "인스타 핫플", "단체 가능", "예약 필수"],
    hours: "11:00 – 22:00",
    price: "₩₩₩",
    location: "더현대서울 6F",
    locationFull: "서울 영등포구 여의대로 108",
    rating: 4.8,
    reviews: 1243,
    accentColor: "#5c2ef5",
    gradientFrom: "#5c2ef5",
    gradientTo: "#1a142e",
    mapX: 175,
    mapY: 118,
    mapLabel: "6F",
  },
  {
    id: 2,
    category: "패션",
    categoryStyle: "bg-[#dbeeff] text-[#1a6cb8]",
    name: "MLB더현대서울점",
    desc: "K-pop 스타들의 대표 아이템인 스트리트 캡과 크롭 탑, 트레이닝 셋업을 한자리에서 만나보세요.",
    longDesc:
      "MLB는 K-pop 스타들이 즐겨 착용하는 스트리트 패션 브랜드예요. 더현대서울점은 최신 컬렉션을 가장 먼저 선보이는 플래그십 스토어로, 한정판 아이템과 콜라보 라인도 독점 판매합니다. 아이돌들과 같은 룩을 완성하고 싶다면 바로 이곳이에요.",
    image: null,
    heroImage:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=900&h=500&fit=crop",
    booking: false,
    tags: ["스트리트 패션", "아이돌 픽", "한정판", "카드 결제"],
    hours: "10:30 – 20:30",
    price: "₩₩",
    location: "더현대서울 1F",
    locationFull: "서울 영등포구 여의대로 108 1F",
    rating: 4.6,
    reviews: 872,
    accentColor: "#1a6cb8",
    gradientFrom: "#1a6cb8",
    gradientTo: "#0d1a2e",
    mapX: 260,
    mapY: 220,
    mapLabel: "1F",
    products: [
      {
        name: "NY 로고 볼캡",
        price: "49,000원",
        badge: "베스트",
        badgeColor: "#1a6cb8",
        image:
          "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=300&fit=crop",
      },
      {
        name: "크롭 트레이닝 탑",
        price: "79,000원",
        badge: "NEW",
        badgeColor: "#0d9488",
        image:
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300&h=300&fit=crop",
      },
      {
        name: "모노그램 숄더백",
        price: "129,000원",
        badge: "한정판",
        badgeColor: "#c0162a",
        image:
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop",
      },
      {
        name: "와이드 조거 팬츠",
        price: "89,000원",
        badge: "인기",
        badgeColor: "#7c3aed",
        image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop",
      },
      {
        name: "빅로고 후드집업",
        price: "119,000원",
        badge: "아이돌 픽",
        badgeColor: "#1a6cb8",
        image:
          "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=300&h=300&fit=crop",
      },
    ],
  },
  {
    id: 3,
    category: "디자이너 편집샵",
    categoryStyle: "bg-[#ede9f8] text-[#5c2ef5]",
    name: "EQL(이필)",
    desc: "한국에서 가장 핫한 디자이너 브랜드를 한자리에서 골라보고 싶다면 꼭 들러야 할 편집샵이에요.",
    longDesc:
      "EQL은 국내외 신진 디자이너 브랜드를 엄선해 소개하는 프리미엄 편집샵입니다. 매 시즌 새로운 브랜드와 협업 아이템이 들어오며, 패션 피플들의 성지로 불리는 공간이에요. 스타일리스트와 셀럽들도 즐겨 찾는 곳으로, 한국 패션 씬의 최전선을 경험할 수 있어요.",
    image: null,
    heroImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=500&fit=crop",
    booking: false,
    tags: ["신진 디자이너", "셀럽 픽", "프리미엄", "편집 큐레이션"],
    hours: "11:00 – 21:00",
    price: "₩₩₩₩",
    location: "성수동",
    locationFull: "서울 성동구 왕십리로 83-21",
    rating: 4.9,
    reviews: 564,
    accentColor: "#7c3aed",
    gradientFrom: "#7c3aed",
    gradientTo: "#1a142e",
    mapX: 460,
    mapY: 140,
    mapLabel: "",
  },
  {
    id: 4,
    category: "팝업",
    categoryStyle: "bg-[#1a142e] text-white",
    name: "스파이더맨: 브랜드 뉴 데이 팝업",
    desc: "화제의 영화를 체험형 팝업으로 생생하게 만나보세요!",
    longDesc:
      "마블의 스파이더맨 최신 작품을 기념하는 초대형 체험형 팝업 스토어예요. 영화 속 장면을 재현한 포토존과 한정판 굿즈, 그리고 독점 콜라보 아이템까지! 팝업 기간이 짧으니 서둘러 방문하세요. SNS 인증샷 명소로도 이미 입소문이 났어요.",
    image:
      "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=900&h=500&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=900&h=500&fit=crop",
    booking: false,
    tags: ["한정 기간", "포토존", "굿즈 판매", "마블 공식"],
    hours: "10:00 – 21:00",
    price: "무료 입장",
    location: "더현대서울 B1",
    locationFull: "서울 영등포구 더현대서울 B1",
    rating: 4.7,
    reviews: 2891,
    accentColor: "#c0162a",
    gradientFrom: "#c0162a",
    gradientTo: "#0a0a0a",
    mapX: 175,
    mapY: 340,
    mapLabel: "B1",
  },
];

/**
 * Candidate places appended one-by-one when the user taps "장소 추가".
 * Frontend-only demo pool until the recommendation API is wired up.
 */
export const extraPlaces = [
  {
    id: 101,
    category: "카페",
    categoryStyle: "bg-[#fce7f3] text-[#be185d]",
    name: "누데이크 성수",
    desc: "젠틀몬스터가 만든 디저트 카페. 비주얼 끝판왕 케이크로 유명한 인스타 성지예요.",
    longDesc:
      "젠틀몬스터가 선보이는 디저트 브랜드 누데이크의 플래그십 매장이에요. 예술 작품 같은 시그니처 케이크 '피크'를 비롯해 실험적인 비주얼의 디저트가 가득합니다. 공간 자체가 하나의 전시처럼 꾸며져 있어 사진 찍기에도 완벽한 코스예요.",
    image:
      "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=300&h=300&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=900&h=500&fit=crop",
    booking: false,
    tags: ["디저트", "인스타 핫플", "힙지로", "포토존"],
    hours: "11:00 – 21:00",
    price: "₩₩",
    location: "성수동",
    locationFull: "서울 성동구 아차산로 100",
    rating: 4.7,
    reviews: 932,
    accentColor: "#be185d",
    gradientFrom: "#be185d",
    gradientTo: "#1a142e",
    mapLabel: "",
  },
  {
    id: 102,
    category: "뷰티",
    categoryStyle: "bg-[#ede9f8] text-[#5c2ef5]",
    name: "올리브영 명동타운",
    desc: "K-뷰티 전 브랜드를 한자리에서. 외국인 관광객 필수 코스인 초대형 플래그십.",
    longDesc:
      "국내 최대 규모의 올리브영 플래그십 스토어예요. K-뷰티 인기 브랜드부터 신상 아이템까지 한자리에서 만나볼 수 있고, 외국인 관광객을 위한 즉시 환급과 통역 서비스도 갖추고 있어요. 명동 한복판에 있어 쇼핑 코스의 시작점으로 딱이에요.",
    image: null,
    heroImage:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&h=500&fit=crop",
    booking: false,
    tags: ["K-뷰티", "즉시 환급", "기념품", "관광객 픽"],
    hours: "10:00 – 22:30",
    price: "₩₩",
    location: "명동",
    locationFull: "서울 중구 명동길 53",
    rating: 4.5,
    reviews: 2103,
    accentColor: "#5c2ef5",
    gradientFrom: "#5c2ef5",
    gradientTo: "#1a142e",
    mapLabel: "",
  },
  {
    id: 103,
    category: "전시",
    categoryStyle: "bg-[#1a142e] text-white",
    name: "그라운드시소 성수",
    desc: "감각적인 기획 전시가 늘 열리는 복합문화공간. 사진 찍기 좋은 전시 명소예요.",
    longDesc:
      "그라운드시소는 감각적인 기획 전시로 유명한 복합문화공간이에요. 시즌마다 새로운 주제의 전시가 열리며, 전시 관람 후 즐길 수 있는 카페와 굿즈 숍도 함께 있습니다. 데이트 코스나 감성 사진 명소로 인기가 많아요.",
    image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=300&h=300&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=900&h=500&fit=crop",
    booking: true,
    tags: ["전시", "포토존", "데이트", "복합문화공간"],
    hours: "10:00 – 19:00",
    price: "₩₩",
    location: "성수동",
    locationFull: "서울 성동구 서울숲2길 32-14",
    rating: 4.6,
    reviews: 781,
    accentColor: "#0d9488",
    gradientFrom: "#0d9488",
    gradientTo: "#0a0a0a",
    mapLabel: "",
  },
  {
    id: 104,
    category: "패션",
    categoryStyle: "bg-[#dbeeff] text-[#1a6cb8]",
    name: "무신사 스탠다드 홍대",
    desc: "합리적인 가격의 베이직 아이템 성지. K-패션 입문자에게 딱인 대형 매장이에요.",
    longDesc:
      "무신사가 직접 전개하는 자체 브랜드 무신사 스탠다드의 오프라인 플래그십이에요. 베이직하면서도 트렌디한 아이템을 합리적인 가격에 만나볼 수 있고, 피팅 공간이 넉넉해 편하게 쇼핑하기 좋아요. K-패션을 처음 접하는 여행자에게 추천하는 코스예요.",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&h=300&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&h=500&fit=crop",
    booking: false,
    tags: ["베이직", "가성비", "K-패션 입문", "대형 매장"],
    hours: "11:00 – 22:00",
    price: "₩₩",
    location: "홍대",
    locationFull: "서울 마포구 양화로 지하 188",
    rating: 4.4,
    reviews: 1567,
    accentColor: "#1a6cb8",
    gradientFrom: "#1a6cb8",
    gradientTo: "#0d1a2e",
    mapLabel: "",
  },
  {
    id: 105,
    category: "팝업",
    categoryStyle: "bg-[#1a142e] text-white",
    name: "성수 트레이딩 팝업존",
    desc: "매주 바뀌는 브랜드 팝업이 모이는 성수동 핫플. 한정판 굿즈 헌팅 명소예요.",
    longDesc:
      "성수동을 대표하는 팝업 전문 공간으로, 매주 새로운 브랜드의 체험형 팝업이 열려요. 한정판 굿즈와 콜라보 아이템을 가장 먼저 만날 수 있고, 브랜드마다 개성 있는 포토존이 마련돼 있어 SNS 인증샷 명소로도 유명해요.",
    image: null,
    heroImage:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=500&fit=crop",
    booking: false,
    tags: ["팝업", "한정판", "굿즈", "포토존"],
    hours: "12:00 – 20:00",
    price: "무료 입장",
    location: "성수동",
    locationFull: "서울 성동구 연무장길 45",
    rating: 4.5,
    reviews: 640,
    accentColor: "#c0162a",
    gradientFrom: "#c0162a",
    gradientTo: "#0a0a0a",
    mapLabel: "",
  },
];

/**
 * Manual-mode place pool for the "장소 추가" picker.
 *
 * DITTO only offers shops located *inside the department store* (더현대서울),
 * so every entry carries a `floor` and one of the store categories below.
 * The picker lets users narrow the list by category and floor.
 */
export const DEPARTMENT_CATEGORIES = ["팝업", "음식점", "패션", "뷰티", "카페"];

// Ordered low → high so the picker can sort floors naturally (B2 → 6F).
export const DEPARTMENT_FLOORS = ["B2", "B1", "1F", "2F", "3F", "4F", "5F", "6F"];

const CATEGORY_STYLES = {
  팝업: { categoryStyle: "bg-[#1a142e] text-white", accentColor: "#c0162a", gradientFrom: "#c0162a", gradientTo: "#0a0a0a" },
  음식점: { categoryStyle: "bg-[#5c2ef5] text-white", accentColor: "#5c2ef5", gradientFrom: "#5c2ef5", gradientTo: "#1a142e" },
  패션: { categoryStyle: "bg-[#dbeeff] text-[#1a6cb8]", accentColor: "#1a6cb8", gradientFrom: "#1a6cb8", gradientTo: "#0d1a2e" },
  뷰티: { categoryStyle: "bg-[#ede9f8] text-[#5c2ef5]", accentColor: "#5c2ef5", gradientFrom: "#5c2ef5", gradientTo: "#1a142e" },
  카페: { categoryStyle: "bg-[#fce7f3] text-[#be185d]", accentColor: "#be185d", gradientFrom: "#be185d", gradientTo: "#1a142e" },
};

// Build a full place object from the minimal per-shop fields, filling in the
// shared department-store location and the category's color styling.
function makeDeptPlace({ id, category, floor, name, desc, longDesc, image, heroImage, tags, hours, price, rating, reviews, booking = false, products }) {
  return {
    id,
    category,
    floor,
    ...CATEGORY_STYLES[category],
    name,
    desc,
    longDesc,
    image: image ?? null,
    heroImage,
    booking,
    tags,
    hours,
    price,
    location: `더현대서울 ${floor}`,
    locationFull: `서울 영등포구 여의대로 108 ${floor}`,
    rating,
    reviews,
    mapLabel: floor,
    ...(products ? { products } : {}),
  };
}

export const departmentStorePlaces = [
  makeDeptPlace({
    id: 201,
    category: "음식점",
    floor: "B2",
    name: "테이스티 서울 푸드홀",
    desc: "더현대서울 지하의 대형 푸드홀. 한 자리에서 다양한 K-미식을 맛볼 수 있어요.",
    longDesc:
      "테이스티 서울은 더현대서울 B2에 자리한 초대형 푸드홀이에요. 전국의 유명 맛집과 셰프 브랜드가 한자리에 모여 있어, 취향대로 골라 먹기 좋아요. 여행 코스 중간에 든든하게 배를 채우기 좋은 스팟입니다.",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=300&h=300&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&h=500&fit=crop",
    tags: ["푸드홀", "다양한 메뉴", "가성비", "단체 가능"],
    hours: "10:30 – 22:00",
    price: "₩₩",
    rating: 4.5,
    reviews: 1820,
  }),
  makeDeptPlace({
    id: 202,
    category: "팝업",
    floor: "B1",
    name: "산리오 캐릭터즈 팝업",
    desc: "시즌마다 바뀌는 캐릭터 팝업. 한정판 굿즈와 포토존이 가득해요.",
    longDesc:
      "더현대서울 B1에서 열리는 산리오 캐릭터즈 팝업이에요. 시나모롤, 쿠로미 등 인기 캐릭터의 한정판 굿즈를 만나볼 수 있고, 곳곳의 포토존에서 인증샷을 남기기 좋아요. 팝업 기간이 짧으니 서둘러 방문하세요.",
    image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=300&h=300&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=900&h=500&fit=crop",
    tags: ["한정 기간", "캐릭터 굿즈", "포토존", "MZ 인기"],
    hours: "10:30 – 20:00",
    price: "무료 입장",
    rating: 4.7,
    reviews: 1502,
  }),
  makeDeptPlace({
    id: 203,
    category: "뷰티",
    floor: "1F",
    name: "탬버린즈 플래그십",
    desc: "젠틀몬스터가 만든 향수·핸드케어 브랜드. 감각적인 공간 연출로 유명해요.",
    longDesc:
      "탬버린즈는 젠틀몬스터가 전개하는 프리미엄 뷰티 브랜드예요. 시그니처 퍼퓸과 핸드크림을 예술 작품처럼 전시한 공간이 인상적이에요. 향으로 남기는 여행의 기념품을 찾는다면 꼭 들러야 할 코스입니다.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&h=500&fit=crop",
    tags: ["K-뷰티", "향수", "선물용", "포토존"],
    hours: "10:30 – 20:00",
    price: "₩₩₩",
    rating: 4.8,
    reviews: 964,
  }),
  makeDeptPlace({
    id: 204,
    category: "패션",
    floor: "2F",
    name: "마뗑킴 더현대서울",
    desc: "MZ세대 최애 K-패션 브랜드. 러블리한 무드의 시즌 컬렉션을 만나보세요.",
    longDesc:
      "마뗑킴은 국내외에서 폭발적인 인기를 끌고 있는 K-패션 브랜드예요. 러블리하면서도 트렌디한 감성의 아이템이 가득하고, 아이돌들이 착용해 화제가 된 시그니처 룩도 만나볼 수 있어요. 최신 시즌 컬렉션을 가장 먼저 확인하기 좋아요.",
    image: null,
    heroImage: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&h=500&fit=crop",
    tags: ["K-패션", "MZ 인기", "아이돌 픽", "시즌 신상"],
    hours: "10:30 – 20:00",
    price: "₩₩₩",
    rating: 4.6,
    reviews: 1187,
    products: [
      { name: "로고 크롭 가디건", price: "89,000원", badge: "베스트", badgeColor: "#1a6cb8", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop" },
      { name: "플리츠 미니 스커트", price: "69,000원", badge: "NEW", badgeColor: "#0d9488", image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=300&h=300&fit=crop" },
      { name: "오버핏 셔츠", price: "79,000원", badge: "인기", badgeColor: "#7c3aed", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop" },
    ],
  }),
  makeDeptPlace({
    id: 205,
    category: "패션",
    floor: "3F",
    name: "아더에러 더현대서울",
    desc: "유니크한 무드의 컨템포러리 브랜드. 실험적인 스타일링의 성지예요.",
    longDesc:
      "아더에러는 독창적인 컨셉과 실험적인 디자인으로 마니아층을 확보한 컨템포러리 브랜드예요. 매장 자체가 하나의 설치 예술처럼 꾸며져 있어 둘러보는 재미가 쏠쏠해요. 남들과 다른 개성 있는 룩을 찾는 여행자에게 추천해요.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&h=500&fit=crop",
    tags: ["컨템포러리", "유니크", "셀럽 픽", "공간 연출"],
    hours: "10:30 – 20:00",
    price: "₩₩₩₩",
    rating: 4.7,
    reviews: 738,
  }),
  makeDeptPlace({
    id: 206,
    category: "카페",
    floor: "5F",
    name: "블루보틀 여의도",
    desc: "스페셜티 커피의 대명사. 탁 트인 뷰와 함께 여유로운 휴식을 즐겨보세요.",
    longDesc:
      "블루보틀 여의도점은 더현대서울 5F에 자리한 스페셜티 커피 매장이에요. 정성껏 핸드드립한 커피와 시그니처 디저트를 탁 트인 공간에서 즐길 수 있어요. 쇼핑 중 잠시 숨을 고르며 쉬어 가기 좋은 코스입니다.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&h=500&fit=crop",
    tags: ["스페셜티 커피", "디저트", "휴식", "뷰 맛집"],
    hours: "10:30 – 21:00",
    price: "₩₩",
    rating: 4.6,
    reviews: 1340,
  }),
  makeDeptPlace({
    id: 207,
    category: "팝업",
    floor: "B1",
    name: "K-pop 아티스트 콜라보 팝업",
    desc: "인기 아이돌과 협업한 기간 한정 팝업. 팬이라면 놓칠 수 없는 성지예요.",
    longDesc:
      "지금 가장 핫한 K-pop 아티스트와 협업한 기간 한정 팝업이에요. 독점 포토카드와 콜라보 굿즈, 실물 크기 스탠디 포토존까지 팬심을 저격하는 요소가 가득해요. 오픈런이 벌어질 만큼 인기라 이른 방문을 추천해요.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&h=500&fit=crop",
    tags: ["K-pop", "한정 굿즈", "포토존", "팬 필수"],
    hours: "10:30 – 20:00",
    price: "무료 입장",
    rating: 4.9,
    reviews: 3204,
  }),
  makeDeptPlace({
    id: 208,
    category: "음식점",
    floor: "6F",
    name: "에그드랍 프리미엄 더현대서울",
    desc: "든든한 프리미엄 샌드위치 브랜드. 가볍게 즐기기 좋은 한 끼예요.",
    longDesc:
      "에그드랍은 폭신한 브리오슈 번과 시그니처 소스로 사랑받는 샌드위치 브랜드예요. 더현대서울점은 프리미엄 라인을 선보이며, 커피와 함께 가볍게 한 끼를 즐기기 좋아요. 코스 중간 요기가 필요할 때 딱이에요.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=300&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=900&h=500&fit=crop",
    tags: ["샌드위치", "간단한 한 끼", "테이크아웃", "가성비"],
    hours: "10:30 – 21:30",
    price: "₩₩",
    rating: 4.4,
    reviews: 1056,
  }),
  makeDeptPlace({
    id: 209,
    category: "뷰티",
    floor: "1F",
    name: "라네즈 플래그십",
    desc: "글로벌 인기 K-뷰티 브랜드. 대표 슬리핑 마스크를 직접 체험해보세요.",
    longDesc:
      "라네즈는 외국인 관광객에게도 인기가 높은 대표 K-뷰티 브랜드예요. 시그니처 워터 슬리핑 마스크와 립 슬리핑 마스크를 직접 발라보고 테스트할 수 있어요. 기념품이나 선물용 쇼핑 코스로 안성맞춤입니다.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&h=500&fit=crop",
    tags: ["K-뷰티", "관광객 픽", "선물용", "체험 매장"],
    hours: "10:30 – 20:00",
    price: "₩₩",
    rating: 4.5,
    reviews: 1495,
  }),
  makeDeptPlace({
    id: 210,
    category: "카페",
    floor: "6F",
    name: "노티드 더현대서울",
    desc: "귀여운 스마일 도넛으로 유명한 디저트 카페. 비주얼 맛집이에요.",
    longDesc:
      "노티드는 사랑스러운 스마일 캐릭터와 폭신한 크림 도넛으로 인기를 끄는 디저트 카페예요. 시즌마다 새로운 한정 메뉴가 나오고, 굿즈도 함께 판매해 모으는 재미가 있어요. 달콤한 마무리로 코스를 완성하기 좋아요.",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&h=300&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=900&h=500&fit=crop",
    tags: ["도넛", "디저트", "인스타 핫플", "굿즈"],
    hours: "10:30 – 21:00",
    price: "₩₩",
    rating: 4.6,
    reviews: 2210,
  }),
];

export const suggestions = [
  "뷔 무드로 코스 생성해줘",
  "장원영처럼 반짝 코스 생성해줘",
  "필릭스 감성으로 코스 생성해줘",
  "카리나 코스 생성해줘",
];

export const BONI_IMAGE = "/assets/ai-course/boni-profile.png";
