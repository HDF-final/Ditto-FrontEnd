import { getCommunityCourse as getDefaultCommunityCourse } from "@/lib/fixtures/community-courses";
import { DEFAULT_COMMUNITY_COURSE_IMAGES } from "@/lib/community/default-course-images";
import { getImageUrl } from "@/lib/courses/image-url";
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
  const review = pickFirst(post.review, post.content, post.description);

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
    review,
    description: review,
    createdAt:
      post.createdAt ||
      post.created_at ||
      post.createdDate ||
      post.created_date ||
      post.regDate ||
      post.reg_date,
    updatedAt:
      post.updatedAt ||
      post.updated_at ||
      post.modifiedAt ||
      post.modified_at ||
      post.updatedDate ||
      post.updated_date,
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

function normalizePopularPlace(place = {}) {
  const rank = Number(place.rank || place.placeRank || 0);
  const postCount = Number(place.postCount || place.count || 0);
  const name = pickFirst(
    place.name,
    place.placeName,
    place.place_name,
    place.title,
  );

  if (!name) return null;

  return {
    rank: rank > 0 ? rank : 0,
    placeId: place.placeId || place.id || place.place_id || "",
    navigationKey: place.navigationKey || place.navigation_key || "",
    name,
    floor: pickFirst(place.floor, place.floorCode, place.floor_code),
    imageUrl:
      getImageUrl(place) ||
      pickFirst(
        place.imageUrl,
        place.image_url,
        place.image,
        place.placeImg,
        place.place_img,
      ),
    description: pickFirst(place.description, place.desc),
    category: place.category || "",
    postCount: postCount > 0 ? postCount : 0,
  };
}

function getServerPlaceHeaders(headers = {}) {
  const localUserId = process.env.NEXT_PUBLIC_LOCAL_USER_ID?.trim() || "1";
  return {
    ...headers,
    "X-User-Id": localUserId,
  };
}

async function fetchJson(url, fetchOptions = {}) {
  const response = await fetch(url, fetchOptions);
  if (!response.ok) return null;

  const json = await response.json();
  if (json?.success === false) return null;
  return json;
}

function getPlaceId(value) {
  const id = value?.placeId || value?.place_id || value?.id;
  return id == null ? "" : String(id);
}

async function fetchFallbackPopularPlaces(baseUrl, headers, preloadedPlaceRows) {
  try {
    const [coursesJson, placesJson] = await Promise.all([
      fetchJson(`${baseUrl}/api/v1/community/courses?page=0&size=100`, {
        method: "GET",
        headers,
        cache: "no-store",
      }),
      Array.isArray(preloadedPlaceRows) && preloadedPlaceRows.length > 0
        ? { data: preloadedPlaceRows }
        : fetchJson(`${baseUrl}/api/v1/places/navigation`, {
            method: "GET",
            headers: getServerPlaceHeaders(headers),
            cache: "no-store",
          }),
    ]);

    const posts = Array.isArray(coursesJson?.data?.content)
      ? coursesJson.data.content
      : [];
    const placeRows = Array.isArray(placesJson?.data) ? placesJson.data : [];
    if (posts.length === 0 || placeRows.length === 0) return [];

    const placesById = new Map(
      placeRows
        .map((place) => [getPlaceId(place), place])
        .filter(([placeId]) => placeId),
    );

    const detailResults = await Promise.all(
      posts.map(async (post) => {
        if (!post?.postId) return null;

        const detailJson = await fetchJson(
          `${baseUrl}/api/v1/community/courses/${post.postId}`,
          {
            method: "GET",
            headers,
            cache: "no-store",
          },
        );
        return detailJson?.data || null;
      }),
    );

    const countsByPlaceId = new Map();
    detailResults.forEach((detail) => {
      const places = Array.isArray(detail?.course?.places)
        ? detail.course.places
        : [];
      const uniquePlaceIds = new Set(places.map(getPlaceId).filter(Boolean));

      uniquePlaceIds.forEach((placeId) => {
        const place = placesById.get(placeId);
        if (!place) return;

        const current = countsByPlaceId.get(placeId) || {
          placeId,
          name: pickFirst(place.name, place.placeName, place.place_name),
          floor: pickFirst(place.floor, place.floorCode, place.floor_code),
          imageUrl:
            getImageUrl(place) ||
            pickFirst(
              place.imageUrl,
              place.image_url,
              place.image,
              place.placeImg,
              place.place_img,
            ),
          postCount: 0,
        };
        countsByPlaceId.set(placeId, {
          ...current,
          postCount: current.postCount + 1,
        });
      });
    });

    return Array.from(countsByPlaceId.values())
      .filter((place) => place.name && place.postCount > 0)
      .sort((a, b) => {
        if (b.postCount !== a.postCount) return b.postCount - a.postCount;
        return a.name.localeCompare(b.name, "ko");
      })
      .slice(0, 5)
      .map((place, index) => ({
        ...place,
        rank: index + 1,
      }));
  } catch (error) {
    console.error(
      "[Community Server] Popular places fallback failed:",
      error.message,
    );
    return [];
  }
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
    createdAt:
      detail.createdAt ||
      detail.created_at ||
      detail.createdDate ||
      detail.created_date ||
      detail.regDate ||
      detail.reg_date,
    updatedAt:
      detail.updatedAt ||
      detail.updated_at ||
      detail.modifiedAt ||
      detail.modified_at ||
      detail.updatedDate ||
      detail.updated_date,
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
 * 서버 사이드 커뮤니티 인기 장소 TOP3 조회
 */
export async function fetchPopularCommunityPlacesServer({
  cache = "no-store",
  revalidate,
} = {}) {
  const baseUrl = getBaseUrl();
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

    const [popRes, placesJson] = await Promise.all([
      fetch(`${baseUrl}/api/v1/community/courses/popular-places`, fetchOptions).catch(() => null),
      fetchJson(`${baseUrl}/api/v1/places/navigation`, {
        method: "GET",
        headers: getServerPlaceHeaders(headers),
        cache: "no-store",
      }).catch(() => null),
    ]);

    const placeRows = Array.isArray(placesJson?.data) ? placesJson.data : [];
    const placesById = new Map(
      placeRows
        .map((p) => [getPlaceId(p), p])
        .filter(([id]) => id),
    );
    const placesByName = new Map(
      placeRows
        .map((p) => [
          String(p.name || p.placeName || p.place_name || "").trim().toLowerCase(),
          p,
        ])
        .filter(([k]) => k),
    );

    let normalizedPlaces = [];
    if (popRes && popRes.ok) {
      const json = await popRes.json();
      const places = Array.isArray(json?.data) ? json.data : [];

      normalizedPlaces = places
        .map((p) => {
          const matched =
            placesById.get(getPlaceId(p)) ||
            placesByName.get(String(p.name || p.placeName || p.place_name || "").trim().toLowerCase());
          return normalizePopularPlace({
            ...matched,
            ...p,
            imageUrl:
              p.imageUrl ||
              p.image_url ||
              matched?.imageUrl ||
              matched?.image_url ||
              matched?.placeImg ||
              matched?.image,
          });
        })
        .filter(Boolean);
    }

    if (normalizedPlaces.length < 5) {
      const fallbackPlaces = await fetchFallbackPopularPlaces(baseUrl, headers, placeRows);
      const existingPlaceIds = new Set(
        normalizedPlaces.map((p) => String(p.placeId || p.name).trim().toLowerCase()),
      );

      for (const fb of fallbackPlaces) {
        const idKey = String(fb.placeId || fb.name).trim().toLowerCase();
        if (!existingPlaceIds.has(idKey)) {
          existingPlaceIds.add(idKey);
          normalizedPlaces.push(fb);
        }
        if (normalizedPlaces.length >= 5) break;
      }
    }

    if (normalizedPlaces.length > 0) {
      return normalizedPlaces
        .slice(0, 5)
        .map((place, index) => ({
          ...place,
          rank: index + 1,
        }));
    }

    return fetchFallbackPopularPlaces(baseUrl, headers, placeRows);
  } catch (error) {
    console.error(
      "[Community Server] Popular places connection error:",
      error.message,
    );
    return fetchFallbackPopularPlaces(baseUrl, headers);
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
              detail.likeCount = summary.likeCount ?? detail.likeCount;
              detail.bookmarkCount =
                summary.bookmarkCount ?? detail.bookmarkCount;
              detail.commentCount = summary.commentCount ?? detail.commentCount;
              detail.createdAt = summary.createdAt ?? detail.createdAt;
              detail.updatedAt = summary.updatedAt ?? detail.updatedAt;
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
