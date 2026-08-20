"use client";

import { useEffect, useState } from "react";
import { getMyCourses } from "@/lib/api/courses";
import { getPublicCourses } from "@/lib/api/community";
import { ShareCourseForm } from "./share-course-form";
import { getTranslations } from "next-intl/server";

export default function ShareCoursePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadUserCourses() {
      setLoading(true);
      try {
        const [myRes, publicRes] = await Promise.allSettled([
          getMyCourses(),
          getPublicCourses({ page: 0, size: 100 }),
        ]);

        const myContent =
          myRes.status === "fulfilled"
            ? Array.isArray(myRes.value?.content)
              ? myRes.value.content
              : Array.isArray(myRes.value)
                ? myRes.value
                : []
            : [];

        const publicContent =
          publicRes.status === "fulfilled"
            ? Array.isArray(publicRes.value?.content)
              ? publicRes.value.content
              : Array.isArray(publicRes.value)
                ? publicRes.value
                : []
            : [];

        // 이미 커뮤니티에 공유된 courseId 집합
        const sharedCourseIds = new Set(
          publicContent.map((p) => Number(p.courseId)).filter(Boolean),
        );

        if (isMounted) {
          // 공유되지 않은 코스만 필터링
          const unshared = myContent.filter(
            (c) => !sharedCourseIds.has(Number(c.courseId)),
          );

          const normalized = unshared.map((c, idx) => ({
            id: c.courseId || idx + 1,
            courseId: c.courseId,
            category: "MY COURSE",
            title: c.name || "나만의 코스",
            tags: "#더현대서울 #추천코스",
            meta: `${c.placeCount || 0}개 스팟`,
            gradient: "from-[#5c2ef5] to-[#9b5cf6]",
          }));
          setCourses(normalized);
        }
      } catch {
        if (isMounted) setCourses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadUserCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  return <ShareCourseForm courses={courses} loading={loading} />;
}
