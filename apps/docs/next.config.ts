import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Docs sayfaları MDX; bileşen sayfaları page.mdx olarak yazılır.
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Kütüphane geliştirmede derlenmeden, doğrudan kaynak koduyla kullanılıyor.
  transpilePackages: ["plonk"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default createMDX({ extension: /\.mdx?$/ })(nextConfig);
