import type { Metadata } from "next";

/*
 * Sitenin adresi: paylaşım kartlarındaki mutlak görsel adresleri ve site haritası için.
 * Vercel üretim adresini kendisi verir (VERCEL_PROJECT_PRODUCTION_URL); kendi alan adı
 * bağlanırsa NEXT_PUBLIC_SITE_URL ile ezilir. Yerelde localhost.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_NAME = "Plonk";

/**
 * Bir docs sayfasının metadata'sı. Başlık ve açıklama bir kez yazılır; paylaşım kartının
 * (Open Graph, X) başlık ve açıklaması buradan türetilir. Görseli sayfanın kendi
 * opengraph-image.tsx'i ekler.
 */
export function pageMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  const full = `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    openGraph: {
      title: full,
      description,
      siteName: SITE_NAME,
      type: "article",
    },
    twitter: { card: "summary_large_image", title: full, description },
  };
}
