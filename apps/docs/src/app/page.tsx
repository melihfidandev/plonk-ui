import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/site/code/CodeBlock";
import { CopyButton } from "@/site/code/CodeTabs";
import { Header } from "@/site/Header";
import { Letters } from "@/site/landing/Letters";
import { MakeItYours } from "@/site/landing/MakeItYours";
import { MotionTiles } from "@/site/landing/MotionTiles";
import { Specimen } from "@/site/landing/Specimen";
import { Wipe } from "@/site/landing/Wipe";

export const metadata: Metadata = {
  title: { absolute: "Plonk · React components with four personalities" },
  description:
    "Neo-brutalist, accessible React components. One library, four personalities, each with its own look and motion.",
};

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

/** Ana sayfa: "Pafta" konsepti (demos/landing/a.html), altbilgide PLONK harfleri. */
export default function Home() {
  return (
    <div className="site">
      <Header />
      <main className="site-landing">
        <section className="site-wrap site-hero">
          <div className="site-hero-copy">
            <span className="site-eyebrow">React components · v1</span>
            <h1 className="site-hero-title">
              <span className="line">
                <span>One library.</span>
              </span>
              <span className="line">
                <span>
                  Four <em>personalities.</em>
                </span>
              </span>
            </h1>
            <p className="site-lead-l">
              Neo-brutalist components with thick ink, hard shadows and a motion
              language of their own. Switch the personality, keep your code.
            </p>
            <div className="site-ctas">
              <Link className="site-btn primary" href="/docs/installation">
                Get started <Arrow />
              </Link>
              <Link className="site-btn" href="/docs/theme-builder">
                Theme builder
              </Link>
              <span className="site-install">
                <span>npm i plonk</span>
                <CopyButton text="npm i plonk" />
              </span>
            </div>
          </div>
          <Specimen />
        </section>

        <Wipe />

        <section className="site-wrap site-motion">
          <span className="site-eyebrow">Motion</span>
          <h2 className="site-h2">It moves like it looks.</h2>
          <p className="site-lead-l">
            Springs that wobble, steps that snap, ink that goes POW. Reduced
            motion means less movement, never none.
          </p>
          <MotionTiles />
        </section>

        <MakeItYours />

        <section className="site-wrap">
          <span className="site-eyebrow">Install</span>
          <h2 className="site-h2">Three steps.</h2>
          <ol className="site-steps">
            <li className="site-step">
              <span className="no">01</span>
              <div className="text">
                <h3>Install</h3>
                <p>Add the package to your project.</p>
              </div>
              <CodeBlock lang="bash" code="npm install plonk" />
            </li>
            <li className="site-step">
              <span className="no">02</span>
              <div className="text">
                <h3>Add the CSS</h3>
                <p>After Tailwind: tokens, fonts and motion in one line.</p>
              </div>
              <CodeBlock
                lang="css"
                code={'@import "tailwindcss";\n@import "plonk/theme.css";'}
              />
            </li>
            <li className="site-step">
              <span className="no">03</span>
              <div className="text">
                <h3>Wrap your app</h3>
                <p>
                  Once, at the root. Pick a personality; toasts and the locale
                  live here too.
                </p>
              </div>
              <CodeBlock
                lang="tsx"
                // Fonksiyona sarılı: tek başına JSX'e biçimlendirici ";" ekliyordu.
                code={
                  'export function Root() {\n  return (\n    <PlonkProvider personality="sticker">\n      <App />\n    </PlonkProvider>\n  );\n}'
                }
              />
            </li>
          </ol>
        </section>
      </main>

      <footer className="site-foot">
        <div className="site-wrap">
          <span className="site-eyebrow">Pick a letter</span>
          <Letters />
          <div className="site-foot-row">
            <span>A portfolio project · not actively supported</span>
            <nav aria-label="Footer">
              <Link href="/docs">Docs</Link>
              <Link href="/docs/components/button">Components</Link>
              <Link href="/docs/theme-builder">Theme builder</Link>
            </nav>
            <span>MIT · 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
