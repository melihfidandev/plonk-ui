import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/site/Header";

export const metadata: Metadata = { title: "Page not found" };

/** 404: sitenin teknik çizim dilinde, "paftada olmayan" bir sayfa. */
export default function NotFound() {
  return (
    <div className="site">
      <Header />
      <main className="site-landing site-404">
        <section className="site-wrap">
          <span className="site-eyebrow">Error · 404</span>
          <p className="site-404-code" aria-hidden="true">
            <span>4</span>
            <span>0</span>
            <span>4</span>
          </p>
          <h1 className="site-h2">This page isn&rsquo;t on the drawing.</h1>
          <p className="site-lead-l">
            The link may be out of date, or the page has moved. Start from the
            docs, or search with <kbd>⌘K</kbd>.
          </p>
          <div className="site-ctas">
            <Link className="site-btn primary" href="/docs">
              Read the docs
            </Link>
            <Link className="site-btn" href="/">
              Home
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
