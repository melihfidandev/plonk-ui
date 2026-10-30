"use client";

import type { ReactNode } from "react";
import { Radio, RadioGroup } from "react-aria-components";
import {
  PERSONALITY_NAMES,
  PlonkProvider,
  personalities,
  type PersonalityName,
  type ToastPlacement,
} from "plonk";
import { createStore } from "./store";

const LABELS: Record<PersonalityName, string> = {
  sticker: "Sticker",
  retro: "Retro",
  comic: "Comic",
  arcade: "Arcade",
};

/** Sergilerin kişiliği: bütün sergilerde ortak, tarayıcıda hatırlanır. */
export const exhibitPersonality = createStore<PersonalityName>(
  "plonk-docs-personality",
  "sticker",
  PERSONALITY_NAMES,
);

/** Kişilik seçimi: sergi çubuklarında ve token tablosunda aynı seçim. */
export function PersonalityChips() {
  const personality = exhibitPersonality.use();
  return (
    <RadioGroup
      aria-label="Personality"
      orientation="horizontal"
      value={personality}
      onChange={(value) => exhibitPersonality.set(value as PersonalityName)}
      className="site-chips"
    >
      {PERSONALITY_NAMES.map((name) => (
        <Radio key={name} value={name} className="site-chip">
          {LABELS[name]}
        </Radio>
      ))}
    </RadioGroup>
  );
}

export interface ExhibitProps {
  /** Çubuktaki ad, ör. "Button". */
  title: string;
  /** Eserin kendisi (canlı Plonk bileşenleri). */
  children: ReactNode;
  /** Sahnenin altındaki parça: oyun alanı kontrolleri ya da kod. */
  footer?: ReactNode;
  /** Eser sahnenin ortasında mı, sol üstte mi. */
  align?: "center" | "start";
  /** Bu sergi toast bölgesi açsın mı (toast örnekleri için). */
  toaster?: boolean;
  /** Toast bölgesinin yeri (Toast sayfasının oyun alanı). */
  toastPlacement?: ToastPlacement;
  /** Eserin dili (ör. Data Table'ın Türkçe sıralama örneği). */
  locale?: string;
}

/**
 * Bir Plonk eserinin sergilendiği çerçeve: kesim işaretleri, kişilik seçimi,
 * kişiliğin kendi zemininde canlı eser ve altında ölçüleri. Site Plonk ile
 * yapılmaz; Plonk sadece bu çerçevenin içinde yaşar.
 */
export function Exhibit({
  title,
  children,
  footer,
  align = "center",
  toaster = false,
  toastPlacement,
  locale,
}: ExhibitProps) {
  const personality = exhibitPersonality.use();
  const tokens = personalities[personality];

  return (
    <figure className="site-exhibit" style={{ margin: 0 }}>
      <div className="site-exhibit-bar">
        <b>{title}</b>
        <span className="live">Live</span>
        <PersonalityChips />
      </div>
      <PlonkProvider
        personality={personality}
        toaster={toaster}
        toastPlacement={toastPlacement}
        locale={locale}
        className="site-stage"
        data-align={align}
      >
        {/* key: kişilik değişince eser yeniden "basılır". */}
        <div key={personality} className="site-stage-inner">
          {children}
        </div>
        <div aria-hidden="true" className="site-measures">
          <span>border {tokens.border.width}</span>
          <span>
            shadow {tokens.shadow.x} / {tokens.shadow.y}
          </span>
          <span>radius {tokens.radius.md}</span>
        </div>
      </PlonkProvider>
      {footer}
    </figure>
  );
}
