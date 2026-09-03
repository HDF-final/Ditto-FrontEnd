import assert from "node:assert/strict";
import test from "node:test";

import { getHomeOrbitCourses } from "../src/lib/courses/home-course-language.js";

const courses = Array.from({ length: 11 }, (_, index) => ({
  id: index + 1,
  title: `한국어 코스 ${index + 1}`,
  description: `한국어 설명 ${index + 1}`,
  tags: [`한국어 태그 ${index + 1}`],
}));

test("initial home orbit keeps the four-language showcase", () => {
  const displayedCourses = getHomeOrbitCourses(courses);

  assert.equal(displayedCourses[0].title, "한국어 코스 1");
  assert.equal(displayedCourses[3].title, "K-ビューティー・シグネチャーコース");
  assert.equal(displayedCourses[6].title, "K-美妆精选路线");
  assert.equal(displayedCourses[9].title, "K-Beauty Signature Course");
});

test("manual language selection keeps every server-translated course unchanged", () => {
  const translatedCourses = courses.map((course, index) => ({
    ...course,
    title: `선택 언어 코스 ${index + 1}`,
    description: `선택 언어 설명 ${index + 1}`,
  }));

  const displayedCourses = getHomeOrbitCourses(translatedCourses, {
    showLanguageShowcase: false,
  });

  assert.strictEqual(displayedCourses, translatedCourses);
  assert.deepEqual(
    displayedCourses.map((course) => course.title),
    translatedCourses.map((course) => course.title),
  );
});
