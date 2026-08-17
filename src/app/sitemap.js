import { getNewsSitemap } from "@/lib/api/news.server";

export default async function sitemap() {
  const newsItems = await getNewsSitemap();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ditto.travel";

  const newsUrls = newsItems.map((item) => ({
    url: `${baseUrl}/news/${item.slug}`,
    lastModified: item.createdAt ? new Date(item.createdAt) : new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...newsUrls,
  ];
}
