"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { READY_PAGES } from "./nav";

/**
 * Sayfanın sonunda önceki / sonraki sayfa. Sıra yan menüdeki sırayla aynı ve
 * bölümler arası geçer; hazır olmayan sayfalar atlanır. Bölüm değişiyorsa
 * etiket bunu söyler ("Next section · Components").
 */
export function Pager() {
  const pathname = usePathname();
  const index = READY_PAGES.findIndex((page) => page.href === pathname);
  if (index < 0) return null;
  const current = READY_PAGES[index]!;
  const prev = READY_PAGES[index - 1];
  const next = READY_PAGES[index + 1];
  if (!prev && !next) return null;

  const eyebrow = (page: (typeof READY_PAGES)[number], dir: string) =>
    page.section === current.section
      ? `${dir} · ${page.section}`
      : `${dir} section · ${page.section}`;

  return (
    <nav aria-label="Pages" className="site-pager">
      {prev && (
        <Link href={prev.href} rel="prev" className="site-pager-link prev">
          <span className="eyebrow">
            <Arrow /> {eyebrow(prev, "Previous")}
          </span>
          <span className="title">{prev.title}</span>
        </Link>
      )}
      {next && (
        <Link href={next.href} rel="next" className="site-pager-link next">
          <span className="eyebrow">
            {eyebrow(next, "Next")} <Arrow />
          </span>
          <span className="title">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}
