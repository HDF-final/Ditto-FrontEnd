import { RecommendedCourseTicket } from "@/components/courses/recommended-course-ticket";
import styles from "./recommended-course-orbit.module.css";

const LANGUAGE_GROUPS = [
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

function getLocalizedCourse(course, index) {
  const group = LANGUAGE_GROUPS[
    Math.floor(index / 3) % LANGUAGE_GROUPS.length
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

function getOrbitRadius(courseCount) {
  if (courseCount <= 3) return 340;
  return Math.min(620, Math.max(390, courseCount * 52));
}

export function RecommendedCourseOrbit({ courses }) {
  const localizedCourses = courses.map(getLocalizedCourse);
  const courseCount = localizedCourses.length;
  const duration = Math.max(52, courseCount * 5) * 1.25;
  const radius = getOrbitRadius(courseCount);

  return (
    <div
      className={styles.stage}
      aria-label="국가별 언어로 소개하는 기본 추천 코스"
    >
      <div
        className={`${styles.orbit} ${courseCount < 2 ? styles.staticOrbit : ""}`}
        style={{
          "--orbit-duration": `${duration}s`,
          "--orbit-radius": `${radius}px`,
        }}
      >
        {localizedCourses.map((course, index) => {
          const angle = (360 / courseCount) * index;
          const delay = -(duration * (courseCount - index)) / courseCount;

          return (
            <div
              key={`${course.href}-${course.rank}-${index}`}
              className={styles.slot}
              style={{
                "--orbit-angle": `${angle}deg`,
                "--orbit-delay": `${delay}s`,
              }}
            >
              <div className={styles.front}>
                <RecommendedCourseTicket
                  course={course}
                  className={styles.ticket}
                  showPlacesOnHover={false}
                />
              </div>
              <div className={styles.back} aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
