"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button, PlonkProvider, type PersonalityName } from "plonk-ui";
import { PERSONALITY_LABELS } from "../Exhibit";

const LETTERS: [string, PersonalityName][] = [
  ["P", "sticker"],
  ["L", "retro"],
  ["O", "comic"],
  ["N", "arcade"],
];

/**
 * Altbilgideki PLONK: her harf bir kişilikte gerçek bir düğme (basınca jöle,
 * ters renk, POW!, +100). K senin harfin: boş çerçeve, tema oluşturucuya açılır.
 * Harfler altbilgi ekrana girince, her biri kendi girişiyle belirir.
 */
export function Letters() {
  const root = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className="site-letters" data-shown={shown || undefined}>
      {LETTERS.map(([letter, name], i) => (
        <PlonkProvider
          key={name}
          personality={name}
          toaster={false}
          className="site-letter"
        >
          <div className="site-in" style={{ "--i": i } as CSSProperties}>
            <Button
              variant="neutral"
              aria-label={`${letter}, ${PERSONALITY_LABELS[name]}`}
            >
              {letter}
            </Button>
          </div>
          <span aria-hidden="true">{PERSONALITY_LABELS[name]}</span>
        </PlonkProvider>
      ))}
      <div className="site-letter">
        <Link
          href="/docs/theme-builder"
          className="site-letter-yours"
          aria-label="K, yours: open the theme builder"
        >
          K
        </Link>
        <span aria-hidden="true">Yours →</span>
      </div>
    </div>
  );
}
