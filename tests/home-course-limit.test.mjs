import assert from "node:assert/strict";
import test from "node:test";

import {
  HOME_SYSTEM_COURSE_LIMIT,
  limitHomeSystemCourses,
} from "../src/lib/courses/home-course-limit.js";

test("home recommended course orbit is capped at eleven courses", () => {
  const courses = Array.from({ length: 20 }, (_, index) => ({ id: index + 1 }));

  assert.equal(HOME_SYSTEM_COURSE_LIMIT, 11);
  assert.deepEqual(
    limitHomeSystemCourses(courses).map((course) => course.id),
    Array.from({ length: 11 }, (_, index) => index + 1),
  );
});

test("home course limiting keeps short lists and normalizes invalid input", () => {
  const courses = [{ id: 1 }, { id: 2 }];

  assert.deepEqual(limitHomeSystemCourses(courses), courses);
  assert.deepEqual(limitHomeSystemCourses(null), []);
});
