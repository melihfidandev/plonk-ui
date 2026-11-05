import type { MetadataRoute } from "next";
import { SEARCH_PAGES } from "@/site/nav";
import { SITE_URL } from "@/site/metadata";

// Arama motorları için sayfa listesi: ana sayfa + menüdeki bütün hazır sayfalar.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    ...SEARCH_PAGES.map((page) => ({
      url: `${SITE_URL}${page.href}`,
      priority: page.href === "/docs" ? 0.9 : 0.7,
    })),
  ];
}
