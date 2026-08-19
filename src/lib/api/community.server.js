import {
  communityCourses as defaultCommunityCourses,
  getCommunityCourse as getDefaultCommunityCourse,
} from "@/lib/fixtures/community-courses";

const GRADIENT_PRESETS = [
  "from-[#2d1b8e] via-[#5c2ef5] to-[#8c57fa]",
  "from-[#2d1b8e] to-[#8c57fa]",
  "from-[#5c2ef5] to-[#8c57fa]",
  "from-[#6d28d9] to-[#c084fc]",
  "from-[#4a2fa8] to-[#7c5cf0]",
  "from-[#211466] to-[#8c57fa]",
  "from-[#4a044e] to-[#6d28d9]",
];

const COUNTRY_PRESETS = ["JP", "CN", "US", "KR"];
const AUTHOR_NAMES = ["Yuki_T", "Chen_Li", "Emma_R", "Sakura_M", "Noah_K", "Mina_Z", "Riku_A", "Lily_P"];

export function getGradientForId(id = 0) {
  const num = typeof id === "number" ? id : parseInt(String(id).replace(/\D/g, ""), 10) || 0;
  return GRADIENT_PRESETS[num % GRADIENT_PRESETS.length];
}

function getBaseUrl() {
  return (
    process.env.API_PROXY_TARGET ||
    process.env.INTERNAL_API_URL ||
    "http://localhost:8080"
  );
}

const COURSE_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=900&fit=crop",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=900&fit=crop",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=900&fit=crop",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=900&fit=crop",
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&h=900&fit=crop",
  "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=900&fit=crop",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=900&fit=crop",
  "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&h=900&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=900&fit=crop",
];

export function normalizePublicCourseCard(post, index = 0) {
  if (!post) return null;

  const postId = post.postId;
  const slug = String(postId);
  const country = COUNTRY_PRESETS[index % COUNTRY_PRESETS.length];
  const authorName = AUTHOR_NAMES[index % AUTHOR_NAMES.length];
  const image = post.representativeImageUrl || COURSE_IMAGES[index % COURSE_IMAGES.length];

  // Extract hash keywords from title
  const words = (post.title || "").split(/\s+/).filter((w) => w.length > 1);
  const hash = words.length > 0 ? `#${words.slice(0, 2).join(" #")}` : "#추천코스 #더현대";

  return {
    postId,
    courseId: post.courseId,
    slug,
    country,
    name: authorName,
    hash,
    title: post.title,
    description: post.content || `${post.title}에 연결된 맞춤형 추천 코스입니다.`,
    image,
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
    floor: p.floor || `${idx + 1}F`,
    name: p.name || `추천 장소 #${p.placeId || idx + 1}`,
    description: p.description || "더현대 서울 내 추천 방문 스팟",
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
  const image =
    detail.course?.representativeImageUrl ||
    detail.representativeImageUrl ||
    COURSE_IMAGES[num % COURSE_IMAGES.length];

  return {
    postId,
    courseId: detail.course?.courseId,
    slug,
    country: "KR",
    name: "DITTO 여행자",
    hash: "#공개코스 #더현대서울",
    title: detail.title,
    description: detail.content,
    image,
    likes: 0,
    commentsCount: comments.length,
    saves: 0,
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

/**
 * 서버 사이드 공개 코스 목록 조회
 */
export async function fetchPublicCoursesServer({ page = 0, size = 20 } = {}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1/community/courses?page=${page}&size=${size}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(`[Community Server] Fetch failed: HTTP ${response.status}`);
      return defaultCommunityCourses;
    }

    const json = await response.json();
    const data = json?.data;
    const content = Array.isArray(data?.content) ? data.content : [];

    if (content.length === 0) {
      return defaultCommunityCourses;
    }

    const realCourses = content.map((post, idx) => normalizePublicCourseCard(post, idx));
    
    // Combine real DB courses at the top, then fallback fixtures for full richness
    return [...realCourses, ...defaultCommunityCourses];
  } catch (error) {
    console.error("[Community Server] Connection error:", error.message);
    return defaultCommunityCourses;
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

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const json = await response.json();
        if (json?.data) {
          return normalizePublicCourseDetail(json.data);
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

  return null;
}
