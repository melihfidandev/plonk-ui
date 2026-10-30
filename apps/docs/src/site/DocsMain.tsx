"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { THEME_BUILDER } from "./nav";

/**
 * İçerik sütunu. Tema oluşturucuda başlık listesi yok; içerik onun sütununu da
 * kullanır (`data-wide`). Sayfa yolundan karar verilir: Next gizlediği önceki
 * sayfayı DOM'da tuttuğu için CSS `:has()` ile bakmak yanılırdı.
 */
export function DocsMain({ children }: { children: ReactNode }) {
  const wide = usePathname() === THEME_BUILDER.href;
  return (
    <main className="site-main" data-wide={wide || undefined}>
      {children}
    </main>
  );
}
