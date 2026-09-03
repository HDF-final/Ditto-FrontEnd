import { RecommendedCourseTicket } from "@/components/courses/recommended-course-ticket";
import { getHomeOrbitCourses } from "@/lib/courses/home-course-language";
import styles from "./recommended-course-orbit.module.css";

function getOrbitRadius(courseCount) {
  if (courseCount <= 3) return 340;
  return Math.min(620, Math.max(390, courseCount * 52));
}

export function RecommendedCourseOrbit({
  courses,
  showLanguageShowcase = true,
}) {
  const localizedCourses = getHomeOrbitCourses(courses, {
    showLanguageShowcase,
  });
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
