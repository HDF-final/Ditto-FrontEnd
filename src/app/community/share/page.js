import { ShareCourseForm } from "./share-course-form";

export const metadata = { title: "내 코스 공유하기" };

const myCourses = [
  {
    category: "SEOUL ICONS",
    title: "K-POP 성지순례",
    tags: "#더현대서울 #SMTOWN #MUSINSA",
    meta: "3시간 · 1,284",
    gradient: "from-[#5c2ef5] to-[#9b5cf6]",
  },
  {
    category: "GLOW LAB",
    title: "K-Beauty 투어",
    tags: "#올리브영 #NONFICTION #Hince",
    meta: "2시간 · 963",
    gradient: "from-[#2d1b8e] to-[#7c3ff2]",
  },
  {
    category: "THE HYUNDAI",
    title: "MZ 쇼핑 코스",
    tags: "#더현대서울 #성수동 #브랜드팝업",
    meta: "4시간 · 842",
    gradient: "from-[#5c2ef5] to-[#9b5cf6]",
  },
  {
    category: "SEOUL TABLE",
    title: "테이스티 서울 미식",
    tags: "#GOURMET #LOCAL #입시로",
    meta: "5시간 · 671",
    gradient: "from-[#2d1b8e] to-[#7c3ff2]",
  },
  {
    category: "PHOTO ROUTE",
    title: "더현대 인생샷 한 바퀴",
    tags: "#더현대 #포토스팟 #루프탑",
    meta: "2시간 · 538",
    gradient: "from-[#5c2ef5] to-[#9b5cf6]",
  },
  {
    category: "POP-UP RUN",
    title: "주말 팝업 빠른 동선",
    tags: "#팝업 #한정판 #편집숍",
    meta: "3시간 · 427",
    gradient: "from-[#2d1b8e] to-[#7c3ff2]",
  },
];

export default function ShareCoursePage() {
  return <ShareCourseForm courses={myCourses} />;
}
