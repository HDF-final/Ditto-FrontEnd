const LANGUAGE_SHOWCASE_GROUPS = [
  {
    code: "KO",
    titles: null,
    descriptions: null,
    tags: null,
  },
  {
    code: "JP",
    titles: [
      "K-ビューティー・シグネチャーコース",
      "K-POP トレンドツアー",
      "ソウル・ファッションルート",
    ],
    descriptions: [
      "韓国で話題のビューティーブランドを巡るおすすめコースです。",
      "いま注目のK-POPスポットを楽しむトレンドコースです。",
      "ソウルの人気ファッションスポットを巡るショッピングコースです。",
    ],
    tags: [
      ["Kビューティー", "ソウルショッピング"],
      ["K-POP", "トレンドツアー"],
      ["ソウルファッション", "ショッピング"],
    ],
  },
  {
    code: "CN",
    titles: ["K-美妆精选路线", "K-POP潮流体验", "首尔时尚购物路线"],
    descriptions: [
      "探索韩国当下热门美妆品牌的精选路线。",
      "一次体验人气K-POP地点的潮流路线。",
      "打卡首尔热门时尚空间的购物路线。",
    ],
    tags: [
      ["韩妆", "首尔购物"],
      ["K-POP", "潮流打卡"],
      ["首尔时尚", "购物路线"],
    ],
  },
  {
    code: "EN",
    titles: [
      "K-Beauty Signature Course",
      "K-POP Trend Tour",
      "Seoul Fashion Route",
    ],
    descriptions: [
      "A curated route through Korea's most talked-about beauty brands.",
      "A trend-led tour of must-see K-POP spots.",
      "A shopping route through Seoul's favorite fashion destinations.",
    ],
    tags: [
      ["KBeauty", "SeoulShopping"],
      ["KPOP", "TrendTour"],
      ["SeoulFashion", "ShoppingRoute"],
    ],
  },
];

function getLanguageShowcaseCourse(course, index) {
  const group =
    LANGUAGE_SHOWCASE_GROUPS[
      Math.floor(index / 3) % LANGUAGE_SHOWCASE_GROUPS.length
    ];
  const copyIndex = index % 3;

  if (!group.titles) {
    return { ...course, displayLanguage: group.code };
  }

  return {
    ...course,
    title: group.titles[copyIndex],
    description: group.descriptions[copyIndex],
    tags: group.tags[copyIndex],
    displayLanguage: group.code,
  };
}

export function getHomeOrbitCourses(
  courses,
  { showLanguageShowcase = true } = {},
) {
  if (!Array.isArray(courses)) {
    return [];
  }

  return showLanguageShowcase
    ? courses.map(getLanguageShowcaseCourse)
    : courses;
}
