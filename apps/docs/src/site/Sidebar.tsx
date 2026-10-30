"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { NAV, THEME_BUILDER } from "./nav";

/**
 * Sitenin sayfa listesi. Geniş ekranda sol sütun, dar ekranda menü panelinin
 * içi (`onNavigate` ile panel kapanır). Maddeler sırayla belirsin diye her
 * birinin sırası `--i` değişkeninde. En üstte tema oluşturucunun kartı: okuma
 * sırasının dışında, kütüphanenin en ayırt edici aracı.
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
      <Link
        href={THEME_BUILDER.href}
        className="site-tool"
        style={order()}
        aria-current={pathname === THEME_BUILDER.href ? "page" : undefined}
        onClick={onNavigate}
      >
        <ToolIcon />
        <span className="text">
          <b>{THEME_BUILDER.title}</b>
          <small>{THEME_BUILDER.blurb}</small>
        </span>
        <svg
          className="arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="square"
          aria-hidden="true"
        >
          <path d="M4 12h15M13 6l6 6-6 6" />
        </svg>
      </Link>
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

/** Üç kaydırıcı: üstüne gelince topuzlar yer değiştirir. */
function ToolIcon() {
  return (
    <span className="icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="square" />
        <g className="knob k1">
          <rect x="6" y="3.5" width="5" height="5" fill="var(--site-accent)" />
        </g>
        <g className="knob k2">
          <rect x="13" y="9.5" width="5" height="5" fill="var(--site-accent)" />
        </g>
        <g className="knob k3">
          <rect x="4" y="15.5" width="5" height="5" fill="var(--site-accent)" />
        </g>
      </svg>
    </span>
  );
}
