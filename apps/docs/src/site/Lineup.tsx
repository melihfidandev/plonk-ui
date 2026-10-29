"use client";

import {
  Badge,
  Button,
  PERSONALITY_NAMES,
  PlonkProvider,
  Progress,
  Switch,
  type PersonalityName,
} from "plonk";
import type { ReactNode } from "react";

const CARDS: Record<PersonalityName, { name: string; motion: string }> = {
  sticker: { name: "Sticker", motion: "Squash, stretch, spring back" },
  retro: { name: "Retro", motion: "Stepped, instant, framed" },
  comic: { name: "Comic", motion: "Fast, overshooting, loud" },
  arcade: { name: "Arcade", motion: "Pixel steps, neon, points" },
};

/**
 * Dört kişilik yan yana, aynı küçük setle. Sergi seçicisinden bağımsız: burada
 * amaç karşılaştırmak. Telefonda alt alta, geniş ekranda 2×2. `children`
 * verilirse küçük set yerine o çizilir (ör. Card sayfasında bant).
 */
export function Lineup({
  children,
}: {
  children?: (personality: PersonalityName) => ReactNode;
}) {
  return (
    <div className="site-lineup">
      {PERSONALITY_NAMES.map((personality, i) => (
        <figure
          key={personality}
          className="site-lineup-card"
          style={{ "--i": i } as React.CSSProperties}
        >
          <figcaption>
            <span className="index">0{i + 1}</span>
            <b>{CARDS[personality].name}</b>
            <code>{`"${personality}"`}</code>
            <span className="motion">{CARDS[personality].motion}</span>
          </figcaption>
          <PlonkProvider
            personality={personality}
            toaster={false}
            className="site-lineup-stage"
          >
            {children ? (
              children(personality)
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Press me</Button>
                  <Badge variant="accent">New</Badge>
                </div>
                <Switch label="Autosave" defaultChecked={i % 2 === 0} />
                <Progress value={40 + i * 15} label="Level" showValue />
              </>
            )}
          </PlonkProvider>
        </figure>
      ))}
    </div>
  );
}
