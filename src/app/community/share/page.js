"use client";

import { useEffect, useState } from "react";
import { getMyCourses } from "@/lib/api/courses";
import { ShareCourseForm } from "./share-course-form";

export default function ShareCoursePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadUserCourses() {
      setLoading(true);
      try {
        const myRes = await getMyCourses({ page: 0, size: 100 });
        const myContent = Array.isArray(myRes?.content)
          ? myRes.content
          : Array.isArray(myRes)
            ? myRes
            : [];

        if (isMounted) {
          const normalized = myContent.map((c, idx) => ({
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
