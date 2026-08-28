import assert from "node:assert/strict";
import test from "node:test";

import {
  getDefaultCourseImage,
  normalizeCourse,
} from "../src/lib/courses/normalize-course.js";

// 187번 "찬미나 브랜드 투어" 를 백엔드에서 받은 모양이다. 자리 1은 근거 사진(셀럽)이
// 붙었고 나머지는 매장 사진이다 — 반영 람다가 실제로 만드는 배치가 이 모양이다.
const RAW_COURSE = {
  courseId: 187,
  name: "찬미나 브랜드 투어",
  description: "찬미나와 관련이 확인된 자리를 모았습니다.",
  creationType: "SYSTEM",
  imageUrl:
    "https://hdf-ditto-images.s3.ap-northeast-2.amazonaws.com/course/CELE1AA1/1.jpg",
  places: [
    {
      placeId: 177,
      name: "샤넬 뷰티",
      floorCode: "1F",
      visitOrder: 1,
      recommendationReason:
        "찬미나는 2026년 샤넬 뷰티 앰배서더로 발탁되었습니다. " +
        "말씀하신 브랜드 취향에 맞춰 이 매장을 담았습니다.",
      imageUrl:
        "https://hdf-ditto-images.s3.ap-northeast-2.amazonaws.com/course/CELE1AA1/1.jpg",
    },
    {
      placeId: 61,
      name: "카페 H",
      floorCode: "5F",
      visitOrder: 2,
      recommendationReason: "쇼핑 중 잠시 쉬어 가실 수 있는 공간으로 담았습니다.",
      imageUrl: "https://d1bxld598du04o.cloudfront.net/place-picture/카페 H.jpg",
    },
  ],
};

test("자리마다 추천 이유가 aiReason 으로 간다 — 이게 보니 모달을 여는 열쇠다", () => {
  const course = normalizeCourse(RAW_COURSE, "187");

  // `PlaceModal` 은 `aiReason` 이 있어야 보니 모달(`AiPlaceModalContent`)로 갈라진다.
  // 비면 "매장 안내 + 일반 문구" 가 나오는 일반 모달로 떨어진다.
  assert.equal(
    course.stops[0].aiReason,
    RAW_COURSE.places[0].recommendationReason,
  );
  assert.equal(
    course.stops[1].aiReason,
    RAW_COURSE.places[1].recommendationReason,
  );

  // 꼬리표가 아니라 문장이 온다. 짧게 잘려 오면 저장 쪽이 되돌아간 것이다.
  assert.ok(course.stops[0].aiReason.length > 30);
});

test("자리 사진이 aiImage 로 간다 — 셀럽 사진과 매장 사진 둘 다", () => {
  const course = normalizeCourse(RAW_COURSE, "187");

  assert.match(course.stops[0].aiImage, /course\/CELE1AA1\/1\.jpg$/);
  assert.match(course.stops[1].aiImage, /place-picture/);
  // 지도·목록이 읽는 칸도 같은 값이라 한 자리가 화면마다 다른 사진을 달지 않는다.
  assert.equal(course.stops[0].image, course.stops[0].aiImage);
});

test("커뮤니티 업로드 사진이 CDN 호스트로 잘못 오면 S3 원본으로 되돌린다", () => {
  const course = normalizeCourse(
    {
      courseId: 208,
      name: "더현대에서 지수 립스틱 득템한 날",
      places: [
        {
          placeId: 106,
          name: "애플스토어",
          imageUrl:
            "https://d1bxld598du04o.cloudfront.net/images/community/posts/2026-08-27/66cd6c63-f97b-4b53-9101-8cf6370e41d9.jpg",
        },
      ],
    },
    "208",
  );

  assert.equal(
    course.stops[0].image,
    "https://hdf-ditto-images.s3.ap-northeast-2.amazonaws.com/images/community/posts/2026-08-27/66cd6c63-f97b-4b53-9101-8cf6370e41d9.jpg",
  );
});

test("대표 사진은 백엔드가 준 것을 쓰고 기본 이미지로 안 떨어진다", () => {
  const course = normalizeCourse(RAW_COURSE, "187");

  assert.equal(course.image, RAW_COURSE.imageUrl);
  assert.notEqual(course.image, getDefaultCourseImage(RAW_COURSE, "187"));
});

test("이유가 없는 코스는 aiReason 이 null 이라 일반 모달 그대로다", () => {
  // 예전에 손으로 올린 코스가 이 모양이다 — `recommendation_reason` 이 비어 있다.
  const course = normalizeCourse(
    {
      courseId: 1,
      name: "K-뷰티 반나절 코스",
      places: [{ placeId: 9, name: "템버린즈", floorCode: "1F", visitOrder: 1 }],
    },
    "1",
  );

  assert.equal(course.stops[0].aiReason, null);
  assert.equal(course.stops[0].aiImage, null);
  // 설명 칸은 예전처럼 기본 문구로 채워져 카드가 비지 않는다.
  assert.equal(course.stops[0].description, "더현대 서울 내 추천 방문 스팟");
});

test("사진이 하나도 없으면 그때만 기본 이미지로 떨어진다", () => {
  const course = normalizeCourse(
    { courseId: 1, name: "K-뷰티 반나절 코스", places: [] },
    "1",
  );

  assert.equal(course.image, getDefaultCourseImage({ courseId: 1 }, "1"));
});
