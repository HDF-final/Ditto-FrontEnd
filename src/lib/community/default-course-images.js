export const DEFAULT_COMMUNITY_COURSE_IMAGES = [
  "/assets/community/default-course-1.png",
  "/assets/community/default-course-2.png",
  "/assets/community/default-course-3.png",
  "/assets/community/default-course-4.png",
  "/assets/community/default-course-5.png",
];

export function getRandomDefaultCommunityCourseImage() {
  const index = Math.floor(Math.random() * DEFAULT_COMMUNITY_COURSE_IMAGES.length);
  return DEFAULT_COMMUNITY_COURSE_IMAGES[index];
}
