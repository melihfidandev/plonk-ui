"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { NAV } from "./nav";

/**
 * Sitenin sayfa listesi. Geniş ekranda sol sütun, dar ekranda menü panelinin
 * içi (`onNavigate` ile panel kapanır). Maddeler sırayla belirsin diye her
 * birinin sırası `--i` değişkeninde.
 */
export function Sidebar({
  className = "site-sidebar",
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  let index = 0;
  const order = () => ({ "--i": index++ }) as CSSProperties;

  return (
    <nav aria-label="Documentation" className={className}>
      {NAV.map((section) => (
        <div key={section.title}>
          <h4 style={order()}>{section.title}</h4>
          {section.pages.map((page) =>
            page.ready ? (
              <Link
                key={page.href}
                href={page.href}
                style={order()}
                aria-current={pathname === page.href ? "page" : undefined}
                onClick={onNavigate}
              >
                {page.title}
              </Link>
            ) : (
              <span
                key={page.href}
                style={order()}
                className="soon"
                title="Coming soon"
              >
                {page.title}
              </span>
            ),
          )}
        </div>
      ))}
    </nav>
  );
}
