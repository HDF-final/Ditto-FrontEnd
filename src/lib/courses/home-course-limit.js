export const HOME_SYSTEM_COURSE_LIMIT = 11;

export function limitHomeSystemCourses(courses) {
  if (!Array.isArray(courses)) {
    return [];
  }

  return courses.slice(0, HOME_SYSTEM_COURSE_LIMIT);
}
