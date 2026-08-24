import {
  allNews,
  featuredNews,
  getNewsBySlug as getFixtureNewsBySlug,
  getRelatedNews as getFixtureRelatedNews,
  newsItems,
} from "@/lib/fixtures/news";
import { getServerApiBaseUrl } from "./server-base-url";
import { getServerApiHeaders } from "./server-language";

const GRADIENT_PRESETS = [
  "from-[#2d1b8e] via-[#5c2ef5] to-[#8c57fa]",
  "from-[#2d1b8e] to-[#5c2ef5]",
  "from-[#5c2ef5] to-[#8c57fa]",
  "from-[#6d28d9] to-[#c084fc]",
  "from-[#4a2fa8] to-[#7c5cf0]",
  "from-[#211466] to-[#8c57fa]",
  "from-[#4a044e] to-[#6d28d9]",
];

export function getGradientForSlug(slug = "") {
  if (!slug) return GRADIENT_PRESETS[0];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash + slug.charCodeAt(i)) % GRADIENT_PRESETS.length;
  }
  return GRADIENT_PRESETS[hash] || GRADIENT_PRESETS[0];
}

export function formatNewsDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return String(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  } catch {
    return String(dateString);
  }
}

const getBaseUrl = getServerApiBaseUrl;

/**
 * 뉴스 요약 DTO -> UI 표준 객체 정규화
 */
export function normalizeNewsSummary(item, index = 0) {
  if (!item) return null;
  const slug =
    item.slug || (item.newsFeedId ? String(item.newsFeedId) : `news-${index}`);
  const rawKeywords = item.keywords || item.tags || [];
  // Strip '#' from keywords for consistent display if already included
  const keywords = rawKeywords.map((k) => (k.startsWith("#") ? k.slice(1) : k));
  const summaries =
    item.summaries && item.summaries.length > 0
      ? item.summaries
      : item.summary
        ? [item.summary]
        : [];
  const summary = summaries[0] || item.summary || "";
  const date = formatNewsDate(item.createdAt || item.date);

  const category =
    item.category ||
    item.label ||
    (keywords[0] ? `${keywords[0]} 뉴스` : "트렌드 뉴스");

  return {
    newsFeedId: item.newsFeedId,
    slug,
    title: item.title || "",
    summary,
    summaries,
    tags: keywords,
    keywords,
    category,
    label: item.label || category,
    date,
    views: item.views || "10만+",
    representativeImageUrl: item.representativeImageUrl || null,
    gradient: item.gradient || getGradientForSlug(slug),
    sourceUrl: item.sourceUrl || null,
  };
}

/**
 * 뉴스 상세 DTO -> UI 표준 객체 정규화
 */
export function normalizeNewsDetail(feed) {
  if (!feed) return null;
  const slug = feed.slug || (feed.newsFeedId ? String(feed.newsFeedId) : "");
  const rawKeywords = feed.keywords || feed.tags || [];
  const keywords = rawKeywords.map((k) => (k.startsWith("#") ? k.slice(1) : k));
  const summaries =
    feed.summaries && feed.summaries.length > 0
      ? feed.summaries
      : feed.summaryPoints && feed.summaryPoints.length > 0
        ? feed.summaryPoints
        : feed.summary
          ? [feed.summary]
          : [];
  const summary = summaries[0] || feed.summary || "";
  const date = formatNewsDate(feed.createdAt || feed.date);

  let quote = feed.quote || null;
  let quoteSource = feed.quoteSource || null;
  const rawBodyText = typeof feed.body === "string" ? feed.body : "";

  let body = [];
  if (Array.isArray(feed.body)) {
    body = feed.body;
  } else if (rawBodyText.trim()) {
    const rawParagraphs = rawBodyText
      .split(/\n\s*\n|\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    const filteredParagraphs = [];

    for (let i = 0; i < rawParagraphs.length; i++) {
      const p = rawParagraphs[i];
      const hasQuotes = /^[“"][^”"]+[”"]$/.test(p);
      const isNextLineSource =
        i + 1 < rawParagraphs.length &&
        /^-\s*(DITTO.*|Yonhap.*)/i.test(rawParagraphs[i + 1]);

      if (hasQuotes || (isNextLineSource && !quote)) {
        quote = p.replace(/^[“"]|[”"]$/g, "").trim();
        if (isNextLineSource) {
          quoteSource = rawParagraphs[i + 1].replace(/^-\s*/, "").trim();
          i++; // Skip source line
        } else {
          quoteSource = quoteSource || "DITTO Trend Lab";
        }
        continue;
      } else if (/^-\s*(DITTO.*)/i.test(p)) {
        quoteSource = p.replace(/^-\s*/, "").trim();
        continue;
      }
      filteredParagraphs.push(p);
    }
    body = filteredParagraphs;
  } else {
    body = [
      summary,
      "K-컬처 트렌드는 콘텐츠 소비와 실제 여행 동선을 함께 바꾸고 있습니다. 브랜드 경험, 팬덤 이벤트, 쇼핑 스팟이 연결되며 여행자는 더 촘촘한 코스를 기대하게 되었어요.",
      "DITTO는 뉴스 관심사를 실제 방문 가능한 코스와 연결해 여행자가 지금 가장 주목받는 장소를 쉽게 발견하도록 돕습니다.",
    ];
  }

  const category =
    feed.label ||
    feed.category ||
    (keywords[0] ? `${keywords[0]} 뉴스` : "트렌드 뉴스");

  const summaryPoints =
    summaries.length > 0
      ? summaries
      : [
          `${category} 흐름이 빠르게 확산`,
          "여행 동선과 브랜드 경험의 연결 강화",
          "저장한 관심사를 코스 추천에 활용",
        ];

  return {
    newsFeedId: feed.newsFeedId,
    slug,
    title: feed.title || "",
    summary,
    summaries,
    summaryPoints,
    body,
    tags: keywords,
    keywords,
    category,
    label: feed.label || category,
    date,
    views: feed.views || "12.4만",
    representativeImageUrl: feed.representativeImageUrl || null,
    gradient: feed.gradient || getGradientForSlug(slug),
    quote,
    quoteSource,
    sourceUrl: feed.sourceUrl || null,
    insight:
      feed.insight ||
      (keywords[0] ? `${keywords[0]} 키워드` : "인터랙션 많은 기사"),
  };
}

/**
 * Server Component용 뉴스피드 목록 조회.
 * 백엔드 연결 실패 시 fixtures 목록으로 안전하게 폴백합니다.
 */
export async function fetchNewsFeedsServer({ page = 0, size = 20 } = {}) {
  try {
    const headers = await getServerApiHeaders({ Accept: "application/json" });
    const res = await fetch(
      `${getBaseUrl()}/api/v1/news?page=${page}&size=${size}`,
      {
        cache: "no-store",
        headers,
      },
    );

    if (res.ok) {
      const json = await res.json();
      if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((item, i) => normalizeNewsSummary(item, i));
      }
    }
  } catch {
    // Backend offline / connection error - fallback to fixtures
  }

  return [featuredNews, ...newsItems].map((item, i) =>
    normalizeNewsSummary(item, i),
  );
}

/**
 * Server Component용 슬러그 기반 뉴스 상세 조회.
 * 백엔드 GET /api/v1/news/slug/{slug} 호출, 미응답 시 fixtures에서 탐색.
 */
export async function getNewsDetailBySlug(slug) {
  if (!slug) return null;

  try {
    const headers = await getServerApiHeaders({ Accept: "application/json" });
    const res = await fetch(
      `${getBaseUrl()}/api/v1/news/slug/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
        headers,
      },
    );

    if (res.ok) {
      const json = await res.json();
      if (json?.success && json.data) {
        return normalizeNewsDetail(json.data);
      }
    }
  } catch {
    // Fallback to fixture
  }

  const fixture = getFixtureNewsBySlug(slug);
  if (fixture) {
    return normalizeNewsDetail(fixture);
  }

  return null;
}

/**
 * Server Component용 newsId 기반 뉴스 상세 조회.
 * 백엔드 GET /api/v1/news/{newsId} 호출.
 */
export async function getNewsDetailById(newsId) {
  if (!newsId) return null;

  try {
    const headers = await getServerApiHeaders({ Accept: "application/json" });
    const res = await fetch(`${getBaseUrl()}/api/v1/news/${newsId}`, {
      cache: "no-store",
      headers,
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.success && json.data) {
        return normalizeNewsDetail(json.data);
      }
    }
  } catch {
    // Fallback
  }

  const found = allNews.find((n) => String(n.newsFeedId) === String(newsId));
  return found ? normalizeNewsDetail(found) : null;
}

/**
 * 사이트맵 및 generateStaticParams용 슬러그 목록 조회.
 * 백엔드 GET /api/v1/news/sitemap 호출.
 */
export async function getNewsSitemap() {
  try {
    const headers = await getServerApiHeaders({ Accept: "application/json" });
    const res = await fetch(`${getBaseUrl()}/api/v1/news/sitemap`, {
      cache: "no-store",
      headers,
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((item) => ({
          slug: item.slug,
          createdAt: item.createdAt || new Date().toISOString(),
        }));
      }
    }
  } catch {
    // Fallback
  }

  return allNews.map((news) => ({
    slug: news.slug,
    createdAt: news.date || new Date().toISOString(),
  }));
}

/**
 * 관련 뉴스 목록 조회 (현재 슬러그 제외 상위 3개).
 */
export async function getRelatedNewsList(currentSlug) {
  const feeds = await fetchNewsFeedsServer({ page: 0, size: 6 });
  const filtered = feeds.filter((feed) => feed.slug !== currentSlug);
  if (filtered.length > 0) {
    return filtered.slice(0, 3);
  }
  return getFixtureRelatedNews(currentSlug).map((f) => normalizeNewsSummary(f));
}
