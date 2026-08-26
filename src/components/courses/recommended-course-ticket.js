import Link from "next/link";
import { DEFAULT_COMMUNITY_COURSE_IMAGES } from "@/lib/community/default-course-images";
import styles from "./recommended-course-ticket.module.css";

function getCourseImage(course) {
  const rankNumber = Number.parseInt(
    String(course.rank || "").replace(/\D/g, ""),
    10,
  );
  const fallbackIndex = Number.isNaN(rankNumber)
    ? 0
    : Math.max(0, rankNumber - 1);

  return (
    course.image ||
    DEFAULT_COMMUNITY_COURSE_IMAGES[
      fallbackIndex % DEFAULT_COMMUNITY_COURSE_IMAGES.length
    ]
  );
}

export function RecommendedCourseTicket({ course, className = "" }) {
  const image = getCourseImage(course);
  const places = Array.isArray(course.places) ? course.places.slice(0, 4) : [];
  const tags = (
    Array.isArray(course.tags) && course.tags.length > 0
      ? course.tags
      : places.map((place) => place.name)
  )
    .filter(Boolean)
    .map((tag) => String(tag).replace(/^#/, ""))
    .slice(0, 2);
  const rankNumber =
    Number.parseInt(String(course.rank || "").replace(/\D/g, ""), 10) || 1;

  return (
    <article className={`${styles.wrapper} ${className}`}>
      <div className={styles.ticket}>
        <div className={styles.main}>
          <div
            className={styles.image}
            style={{ backgroundImage: `url(${image})` }}
          />

          <div className={styles.header}>
            <span className={styles.rankBadge} aria-label={`${rankNumber}위`}>
              {rankNumber}
            </span>
            <span className={styles.pass}>COURSE PASS</span>
          </div>

          <div className={styles.placesOverlay} aria-hidden="true">
            <p className={styles.placesTitle}>COURSE SPOTS</p>
            {places.length > 0 ? (
              <ol className={styles.placesList}>
                {places.map((place, index) => (
                  <li
                    key={
                      place.placeId ||
                      `${place.floorCode || place.floor}-${place.name}-${index}`
                    }
                    className={styles.place}
                  >
                    <span className={styles.placeIndex}>{index + 1}</span>
                    <span className={styles.placeFloor}>
                      {place.floorCode || place.floor || "1F"}
                    </span>
                    <span className={styles.placeName}>{place.name}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.emptyPlaces}>코스 장소를 준비하고 있어요.</p>
            )}
          </div>
        </div>

        <div className={styles.stub}>
          <div className={styles.courseCopy}>
            <h3 className={styles.title}>{course.title}</h3>
            <p className={styles.subtitle}>
              {course.description || "DITTO가 엄선한 추천 코스입니다."}
            </p>
          </div>
          <div className={styles.tags}>
            {(tags.length > 0 ? tags : ["DITTO", "KPOP"]).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>

        <Link
          href={course.href}
          aria-label={`${course.title} 코스 상세 보기`}
          className={styles.detailLink}
        />
      </div>
    </article>
  );
}
