// 코스 상세 응답 → 화면이 읽는 모양.
//
// 백엔드 상세(`/api/v1/courses/{id}`) · 추천 목록 · 픽스처가 **저마다 다른 칸 이름**으로
// 같은 것을 준다. 세 곳에서 온 것을 화면이 구별하지 않게 여기서 한 모양으로 맞춘다.
//
// 페이지에서 떼어 낸 것은 검사를 붙이기 위해서다 — 자리마다 어느 칸이 어디로 가는지가
// 이 화면 동작의 전부인데, 페이지 안에 있으면 확인할 방법이 없었다.

// **상대경로다.** `@/` 별칭은 Next 빌드만 풀 수 있어, 별칭을 쓰면 `node --test` 가
// 이 모듈을 못 읽는다 (tests/ 의 다른 검사들이 읽는 lib 모듈도 전부 그래서 별칭이 없다).
import { DEFAULT_COMMUNITY_COURSE_IMAGES } from "../community/default-course-images.js";

const DEFAULT_SYSTEM_COURSE_IDS = ["1", "122", "21", "22", "23"];

export function getDefaultCourseImage(rawCourse, slug) {
  const courseId = String(rawCourse?.courseId || rawCourse?.id || slug || "");
  const matchedIndex = DEFAULT_SYSTEM_COURSE_IDS.indexOf(courseId);
  const fallbackIndex = matchedIndex >= 0 ? matchedIndex : 0;

  return DEFAULT_COMMUNITY_COURSE_IMAGES[
    fallbackIndex % DEFAULT_COMMUNITY_COURSE_IMAGES.length
  ];
}

export function normalizeCourse(rawCourse, slug) {
  if (!rawCourse) return null;

  const courseId = rawCourse.courseId || rawCourse.id || slug;
  const title = rawCourse.name || rawCourse.title || "기본 추천 코스";
  const description =
    rawCourse.description ||
    "DITTO AI 보니가 엄선한 더현대 서울 대표 추천 코스입니다.";
  const note =
    rawCourse.note ||
    rawCourse.description ||
    "더현대 서울에서 가장 인기 있는 대표 스팟들을 초행자도 이동하기 편한 최적 실내 동선으로 연결한 추천 코스입니다.";

  const rawPlaces = Array.isArray(rawCourse.places)
    ? rawCourse.places
    : Array.isArray(rawCourse.stops)
      ? rawCourse.stops
      : [];

  // 자리마다 관리자가 확정한 추천 이유(`recommendationReason`)와 그 자리에 맞는 사진이
  // 백엔드에서 온다. 사진은 근거가 있으면 셀럽 사진이고 없으면 매장 사진이다.
  //
  // **`aiReason` 에 넣는 것이 요점이다.** `PlaceModal` 이 그 칸을 보고 보니 대화에서
  // 쓰는 모달로 갈라진다(`place-modal.js` 의 `isAiMode`). 넣지 않으면 일반 모달로
  // 떨어져 "매장 안내 + 일반 문구 + 기본 사진" 이 나온다 — 지금까지 그랬다.
  // 이유가 없는 코스(예전에 손으로 올린 것)는 `null` 이라 일반 모달 그대로다.
  const stops = rawPlaces.map((p, idx) => {
    const reason = p.recommendationReason || p.reason || null;
    const image = p.imageUrl || p.image || p.placeImg || null;
    return {
      placeId: p.placeId,
      floor: p.floorCode || p.floor || `${idx + 1}F`,
      name: p.name || p.placeName || `스팟 #${idx + 1}`,
      description: reason || p.description || p.desc || "더현대 서울 내 추천 방문 스팟",
      category: p.category,
      image,
      navigationKey: p.navigationKey,
      x: p.xCoordinate,
      y: p.yCoordinate,
      aiReason: reason,
      aiImage: image,
      aiImageCaption: null,
    };
  });

  // `imageUrl` 이 백엔드가 주는 값이다 — 관리자 지정 → 셀럽 사진 → 첫 자리 매장 사진
  // 차례로 고른 것이라 목록 카드와 같은 사진이다. 나머지는 예전 응답 모양을 받치는 것이고,
  // 전부 비면 그때 기본 이미지로 떨어진다.
  const image =
    rawCourse.imageUrl ||
    rawCourse.representativeImageUrl ||
    rawCourse.image ||
    rawCourse.thumbnailUrl ||
    rawCourse.coverImageUrl ||
    rawCourse.mainImageUrl ||
    getDefaultCourseImage(rawCourse, slug);

  const gradient =
    rawCourse.gradient || "from-[#2d1b8e] via-[#5c2ef5] to-[#8c57fa]";

  return {
    courseId,
    title,
    description,
    note,
    image,
    gradient,
    label: rawCourse.label || "THE HYUNDAI SEOUL",
    stops,
    createdAt: rawCourse.createdAt || "2026.03.02",
  };
}
