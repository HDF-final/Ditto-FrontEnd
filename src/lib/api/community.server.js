import { getCommunityCourse as getDefaultCommunityCourse } from "@/lib/fixtures/community-courses";
import { DEFAULT_COMMUNITY_COURSE_IMAGES } from "@/lib/community/default-course-images";
import { getServerApiBaseUrl } from "./server-base-url";
import { getServerApiHeaders } from "./server-language";

const GRADIENT_PRESETS = [
  "from-[#2d1b8e] via-[#5c2ef5] to-[#8c57fa]",
  "from-[#2d1b8e] to-[#8c57fa]",
  "from-[#5c2ef5] to-[#8c57fa]",
  "from-[#6d28d9] to-[#c084fc]",
  "from-[#4a2fa8] to-[#7c5cf0]",
  "from-[#211466] to-[#8c57fa]",
  "from-[#4a044e] to-[#6d28d9]",
];

export function getGradientForId(id = 0) {
  const num = typeof id === "number" ? id : parseInt(String(id).replace(/\D/g, ""), 10) || 0;
  return GRADIENT_PRESETS[num % GRADIENT_PRESETS.length];
}

const getBaseUrl = getServerApiBaseUrl;

const COURSE_IMAGES = DEFAULT_COMMUNITY_COURSE_IMAGES;

function getDefaultCourseImage(id = 0) {
  const num = parseInt(String(id).replace(/\D/g, ""), 10) || 0;
  return COURSE_IMAGES[num % COURSE_IMAGES.length];
}

function asCleanString(value) {
  return String(value || "").trim();
}

function pickFirst(...values) {
  return values.map(asCleanString).find(Boolean) || "";
}

function getAuthorName(source = {}) {
  const nestedUser =
    source.user ||
    source.authorUser ||
    source.writerUser ||
    source.member ||
    source.author ||
    source.writer ||
    source.createdByUser ||
    {};
  const course = source.course || {};
  const courseUser =
    course.user ||
    course.authorUser ||
    course.writerUser ||
    course.member ||
    course.author ||
    course.writer ||
    {};

  return pickFirst(
    source.writerNickname,
    source.writerName,
    source.authorNickname,
    source.authorName,
    source.createdByNickname,
    source.createdByName,
    source.userNickname,
    source.userName,
    source.nickname,
    source.name,
    nestedUser.nickname,
    nestedUser.name,
    nestedUser.userName,
    nestedUser.displayName,
    course.writerNickname,
    course.writerName,
    course.authorNickname,
    course.authorName,
    course.userNickname,
    course.userName,
    course.nickname,
    course.author,
    courseUser.nickname,
    courseUser.name,
    courseUser.userName,
    courseUser.displayName,
  );
}

function getAuthorId(source = {}) {
  const nestedUser =
    source.user ||
    source.authorUser ||
    source.writerUser ||
    source.member ||
    source.createdByUser ||
    {};
  const course = source.course || {};
  const courseUser =
    course.user ||
    course.authorUser ||
    course.writerUser ||
    course.member ||
    {};

  return pickFirst(
    source.writerId,
    source.userId,
    source.memberId,
    source.authorId,
    source.createdBy,
    source.createdById,
    nestedUser.userId,
    nestedUser.id,
    nestedUser.memberId,
    course.writerId,
    course.userId,
    course.memberId,
    course.authorId,
    course.createdBy,
    courseUser.userId,
    courseUser.id,
    courseUser.memberId,
  );
}

function normalizePostImages(source = {}) {
  const imageItems = Array.isArray(source.images)
    ? source.images
        .map((image, idx) => {
          if (typeof image === "string") {
            return {
              postImageId: "",
              imageUrl: image,
              sortOrder: idx,
            };
          }

          return {
            postImageId:
              image?.postImageId ||
              image?.id ||
              image?.imageId ||
              image?.post_image_id ||
              "",
            imageUrl:
              image?.imageUrl ||
              image?.url ||
              image?.src ||
              image?.path ||
              "",
            sortOrder:
              typeof image?.sortOrder === "number"
                ? image.sortOrder
                : typeof image?.sort_order === "number"
                  ? image.sort_order
                  : idx,
          };
        })
        .filter((image) => image.imageUrl)
    : [];

  const imageUrls =
    imageItems.length > 0
      ? imageItems.map((image) => image.imageUrl)
      : Array.isArray(source.imageUrls)
        ? source.imageUrls.filter(Boolean)
        : [];

  return {
    imageItems:
      imageItems.length > 0
        ? imageItems
        : imageUrls.map((imageUrl, idx) => ({
            postImageId: "",
            imageUrl,
            sortOrder: idx,
          })),
    imageUrls,
  };
}

export function normalizePublicCourseCard(post) {
  if (!post) return null;

  const postId = post.postId;
  const slug = String(postId);
  const authorId = getAuthorId(post);
  const authorName = getAuthorName(post);
  // 백엔드가 게시글에 첨부된 사진 URL/ID 목록(정렬순)을 내려줍니다. 없으면 빈 배열.
  const { imageUrls: uploadedImages, imageItems } = normalizePostImages(post);
  const image =
    uploadedImages[0] ||
    post.representativeImageUrl ||
    post.imageUrl ||
    post.image ||
    post.course?.representativeImageUrl ||
    getDefaultCourseImage(postId);

  // Extract hash keywords from title
  const words = (post.title || "").split(/\s+/).filter((w) => w.length > 1);
  const hash = words.length > 0 ? `#${words.slice(0, 2).join(" #")}` : "#공유코스";

  return {
    postId,
    courseId: post.courseId,
    slug,
    authorId,
    authorKey: String(authorName || "").trim(),
    country: post.country || post.user?.country || "",
    name: authorName,
    persona: post.persona || post.shoppingType || post.user?.persona || "sohwak",
    hash,
    title: post.title,
    description: post.content || "",
    image,
    images: uploadedImages,
    imageItems,
    likes: post.likeCount ?? 0,
    comments: post.commentCount ?? 0,
    saves: post.bookmarkCount ?? 0,
    gradient: getGradientForId(postId),
    label: "THE HYUNDAI SEOUL",
    isRealDb: true,
  };
}

/**
 * 백엔드 PublicCourseDetailResponse -> UI 상세 데이터 정규화
 */
export function normalizePublicCourseDetail(detail) {
  if (!detail) return null;

  const postId = detail.postId;
  const slug = String(postId);

  const places = (detail.course?.places || []).map((p, idx) => ({
    placeId: p.placeId,
    floor: p.floor || p.floorCode || `${idx + 1}F`,
    name: p.name || p.placeName || `추천 장소 #${p.placeId || idx + 1}`,
    description: p.description || p.desc || "더현대 서울 내 추천 방문 스팟",
  }));

  const comments = (detail.comments || []).map((c) => ({
    commentId: c.commentId,
    name: c.nickname || `여행자_${c.userId || ""}`,
    country: "KR",
    text: c.content,
    isAuthor: c.isAuthor ?? false,
    createdAt: c.createdAt,
    likes: 0,
    replies: 0,
  }));

  const num = typeof postId === "number" ? postId : parseInt(String(postId).replace(/\D/g, ""), 10) || 0;
  // 백엔드가 게시글에 첨부된 사진 URL/ID 목록(정렬순)을 내려줍니다. 없으면 빈 배열.
  const { imageUrls: uploadedImages, imageItems } = normalizePostImages(detail);
  const image =
    uploadedImages[0] ||
    detail.course?.representativeImageUrl ||
    detail.representativeImageUrl ||
    getDefaultCourseImage(num);

  const authorName = getAuthorName(detail);
  const authorId = getAuthorId(detail);

  return {
    postId,
    courseId:
      detail.course?.courseId ||
      detail.course?.id ||
      detail.courseId ||
      detail.sourceCourseId ||
      detail.originalCourseId,
    slug,
    authorId,
    authorKey: String(authorName || "").trim(),
    country: detail.country || detail.user?.country || "KR",
    name: authorName,
    persona: detail.persona || detail.shoppingType || detail.user?.persona || detail.course?.persona || "sohwak",
    hash: "#공개코스 #더현대서울",
    title: detail.title,
    description: detail.content,
    image,
    images: uploadedImages,
    imageItems,
    likes: detail.likeCount ?? detail.likes ?? 0,
    commentsCount: comments.length,
    saves: detail.bookmarkCount ?? detail.bookmarks ?? 0,
    gradient: getGradientForId(postId),
    label: "THE HYUNDAI SEOUL",
    stops: places.length > 0 ? places : [
      { floor: "1F", name: "워터폴 가든", description: "입구에서 바로 보이는 포토존" },
      { floor: "5F", name: "사운즈 포레스트", description: "실내 정원에서 쉬기 좋은 구간" },
      { floor: "B2", name: "크리에이티브 그라운드", description: "쇼핑 후 둘러보기 좋은 편집숍" },
    ],
    note: detail.content,
    reviews: comments,
    isRealDb: true,
  };
}

async function fetchPublicCourseSummaryByPostId(postId, headers, baseUrl) {
  const targetPostId = String(postId || "");
  if (!targetPostId) return null;

  const pageSize = 100;
  const maxPages = 5;

  for (let page = 0; page < maxPages; page += 1) {
    const params = new URLSearchParams({
      page: String(page),
      size: String(pageSize),
    });
    const response = await fetch(
      `${baseUrl}/api/v1/community/courses?${params.toString()}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    if (!response.ok) return null;

    const json = await response.json();
    const content = Array.isArray(json?.data?.content)
      ? json.data.content
      : [];
    const matched = content.find((post) => String(post?.postId) === targetPostId);
    if (matched) return matched;
    if (content.length < pageSize) return null;
  }

  return null;
}

/**
 * 서버 사이드 공개 코스 목록 조회
 */
export async function fetchPublicCoursesServer({
  page = 0,
  size = 20,
  authorId = "",
  author = "",
  cache = "no-store",
  revalidate,
} = {}) {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (authorId) params.set("authorId", String(authorId));
  if (author) params.set("author", author);
  const url = `${baseUrl}/api/v1/community/courses?${params.toString()}`;
  const headers = await getServerApiHeaders({ Accept: "application/json" });

  try {
    const fetchOptions = {
      method: "GET",
      headers,
      cache,
    };
    if (typeof revalidate === "number") {
      fetchOptions.next = { revalidate };
    }
    const response = await fetch(url, {
      ...fetchOptions,
    });

    if (!response.ok) {
      console.warn(`[Community Server] Fetch failed: HTTP ${response.status}`);
      return [];
    }

    const json = await response.json();
    const data = json?.data;
    const content = Array.isArray(data?.content) ? data.content : [];

    if (content.length === 0) {
      return [];
    }

    return content.map((post) => normalizePublicCourseCard(post));
  } catch (error) {
    console.error("[Community Server] Connection error:", error.message);
    return [];
  }
}

/**
 * 서버 사이드 공개 코스 상세 조회 (postId 또는 slug 지원)
 */
export async function fetchPublicCourseDetailServer(postIdOrSlug) {
  if (!postIdOrSlug) return null;

  // 1. If numeric postId: fetch from real backend
  const isNumeric = /^\d+$/.test(String(postIdOrSlug));
  if (isNumeric) {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/v1/community/courses/${postIdOrSlug}`;
    const headers = await getServerApiHeaders({ Accept: "application/json" });

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      if (response.ok) {
        const json = await response.json();
        if (json?.data) {
          const detail = json.data;
          try {
            const summary = await fetchPublicCourseSummaryByPostId(
              postIdOrSlug,
              headers,
              baseUrl,
            );
            if (summary) {
              detail.writerNickname =
                detail.writerNickname || summary.writerNickname;
              detail.writerName = detail.writerName || summary.writerName;
              detail.authorNickname =
                detail.authorNickname || summary.authorNickname;
              detail.userNickname = detail.userNickname || summary.userNickname;
              detail.nickname = detail.nickname || summary.nickname;
              detail.name = detail.name || summary.name;
              detail.country = detail.country || summary.country;
              detail.user = {
                ...(detail.user || {}),
                ...(summary.user || {}),
              };
            }
          } catch (error) {
            console.warn(
              `[Community Server] Author summary fetch failed for ${postIdOrSlug}:`,
              error.message,
            );
          }
          const courseId = detail.course?.courseId || detail.courseId;
          if (courseId) {
            try {
              const courseRes = await fetch(`${baseUrl}/api/v1/courses/${courseId}`, {
                method: "GET",
                headers,
                cache: "no-store",
              });
              if (courseRes.ok) {
                const cJson = await courseRes.json();
                if (cJson?.data?.places && cJson.data.places.length > 0) {
                  detail.course = {
                    ...detail.course,
                    ...cJson.data,
                    places: cJson.data.places,
                  };
                }
              }
            } catch {
              // ignore
            }
          }
          return normalizePublicCourseDetail(detail);
        }
      }

      // 1-2. If not a community post, check if it is a user-created course (GET /courses/{id})
      const courseUrl = `${baseUrl}/api/v1/courses/${postIdOrSlug}`;
      const courseRes = await fetch(courseUrl, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      if (courseRes.ok) {
        const json = await courseRes.json();
        const courseData = json?.data;
        if (courseData) {
          const places = (courseData.places || []).map((p, idx) => ({
            placeId: p.placeId,
            floor: p.floor || p.floorCode || `${idx + 1}F`,
            name: p.name || `추천 장소 #${p.placeId || idx + 1}`,
            description: p.description || "더현대 서울 내 추천 방문 스팟",
          }));

          const num = parseInt(String(postIdOrSlug), 10) || 0;
          return {
            postId: courseData.courseId || postIdOrSlug,
            courseId: courseData.courseId || courseData.id,
            slug: String(postIdOrSlug),
            country: "KR",
            name: "DITTO 여행자",
            hash: "#나만의코스 #더현대서울",
            title: courseData.name || courseData.title || "나만의 맞춤 코스",
            description:
              courseData.description ||
              (places.length > 0
                ? places.map((p) => p.name).join(" → ")
                : "더현대 서울 맞춤 코스입니다."),
            image:
              courseData.representativeImageUrl ||
              getDefaultCourseImage(num),
            likes: 0,
            commentsCount: 0,
            saves: 0,
            gradient: getGradientForId(postIdOrSlug),
            label: "THE HYUNDAI SEOUL",
            stops: places.length > 0 ? places : [
              { floor: "1F", name: "워터폴 가든", description: "입구에서 바로 보이는 포토존" },
              { floor: "5F", name: "사운즈 포레스트", description: "실내 정원에서 쉬기 좋은 구간" },
              { floor: "B2", name: "크리에이티브 그라운드", description: "쇼핑 후 둘러보기 좋은 편집숍" },
            ],
            note: courseData.description || "내가 생성한 맞춤 코스입니다.",
            reviews: [],
            isRealDb: true,
          };
        }
      }
    } catch (error) {
      console.error(`[Community Server] Detail fetch failed for ${postIdOrSlug}:`, error.message);
    }
  }

  // 2. Fallback to fixture by slug
  const fixture = getDefaultCommunityCourse(postIdOrSlug);
  if (fixture) {
    return fixture;
  }

  // 3. Fallback for any valid numeric id (so users clicking newly created courses never see 404)
  if (isNumeric) {
    const num = parseInt(String(postIdOrSlug), 10) || 0;
    return {
      postId: Number(postIdOrSlug),
      courseId: Number(postIdOrSlug),
      slug: String(postIdOrSlug),
      country: "KR",
      name: "DITTO 여행자",
      hash: "#나만의코스 #더현대서울",
      title: "나만의 맞춤 코스",
      description: "더현대 서울 맞춤 추천 코스입니다.",
      image: getDefaultCourseImage(num),
      likes: 0,
      commentsCount: 0,
      saves: 0,
      gradient: getGradientForId(postIdOrSlug),
      label: "THE HYUNDAI SEOUL",
      stops: [
        { floor: "1F", name: "워터폴 가든", description: "입구에서 바로 보이는 포토존" },
        { floor: "5F", name: "사운즈 포레스트", description: "실내 정원에서 쉬기 좋은 구간" },
        { floor: "B2", name: "크리에이티브 그라운드", description: "쇼핑 후 둘러보기 좋은 편집숍" },
      ],
      note: "내가 생성한 맞춤 코스입니다.",
      reviews: [],
      isRealDb: false,
    };
  }

  return null;
}
