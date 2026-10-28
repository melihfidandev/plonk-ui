"use client";

import { personalities, personalityVariables } from "plonk";
import { PersonalityChips, exhibitPersonality } from "./Exhibit";

const GROUPS = {
  color: { title: "Colors", match: /^--plonk-color-/ },
  shape: { title: "Shape", match: /^--plonk-(border|shadow|radius|tilt)/ },
  font: { title: "Type", match: /^--plonk-font-/ },
  motion: { title: "Motion", match: /^--plonk-(motion|jelly)-/ },
} as const;

/** Token'ların kısa açıklamaları (İngilizce, sitede gösterilir). */
const NOTES: Record<string, string> = {
  "--plonk-color-canvas": "Page background behind components.",
  "--plonk-color-surface": "Cards, fields, menus, dialogs.",
  "--plonk-color-sunken": "Recessed areas inside a surface.",
  "--plonk-color-ink": "Text, borders and hard shadows.",
  "--plonk-color-ink-muted": "Secondary text and hints.",
  "--plonk-color-primary": "Main actions and selection.",
  "--plonk-color-accent": "Highlights and badges.",
  "--plonk-color-secondary": "Second-tier actions.",
  "--plonk-color-success": "Done, saved, switched on.",
  "--plonk-color-warning": "Needs attention.",
  "--plonk-color-danger": "Destructive actions and errors.",
  "--plonk-color-focus": "Keyboard focus ring and field glow.",
  "--plonk-border-width": "Every outline.",
  "--plonk-shadow-x": "Hard shadow offset, horizontal.",
  "--plonk-shadow-y": "Hard shadow offset, vertical.",
  "--plonk-shadow-color": "Hard shadow color.",
  "--plonk-radius-sm": "Small corners: checkboxes, badges.",
  "--plonk-radius-md": "Buttons, fields, cards.",
  "--plonk-radius-lg": "Dialogs and large panels.",
  "--plonk-radius-pill": "Switches, tabs, pills.",
  "--plonk-tilt": "The slight angle things are stuck on at.",
  "--plonk-font-display": "Headings, buttons, labels.",
  "--plonk-font-body": "Running text.",
  "--plonk-font-mono": "Code and keyboard keys.",
  "--plonk-font-display-case":
    "uppercase for fonts that only draw capitals, so i becomes İ in Turkish.",
  "--plonk-font-display-tracking": "Letter spacing for the display font.",
  "--plonk-motion-press-easing": "Going down under the finger.",
  "--plonk-motion-spring-easing": "Coming back after a press.",
  "--plonk-motion-snap-easing": "Indicators moving to a new spot.",
  "--plonk-motion-enter-easing": "Overlays arriving.",
  "--plonk-motion-exit-easing": "Overlays leaving.",
  "--plonk-jelly-amount": "0 is off, 1 is full jelly.",
  "--plonk-jelly-duration": "How long the wobble lasts.",
};

/** `on-` eşleri: o rengin üstündeki yazı ve ikonlar. */
function note(name: string) {
  const pair = /^--plonk-color-on-(.+)$/.exec(name);
  if (pair) return `Text and icons on ${pair[1]}.`;
  const motion = /^--plonk-motion-(.+)-duration$/.exec(name);
  if (motion) return `Duration of ${motion[1]}.`;
  return NOTES[name];
}

/** linear(…) eğrileri yüzlerce karakter: kısaltılır, tamamı title'da. */
function shorten(value: string) {
  if (value.startsWith("linear(")) return "linear(…) spring";
  return value.length > 44 ? `${value.slice(0, 42)}…` : value;
}

/**
 * Bir grup token'ın seçili kişilikteki değerleri. Kişilik seçimi sergilerle
 * ortak. Telefonda her satır iki kat: ad + değer, altında açıklama.
 */
export function TokenTable({ group }: { group: keyof typeof GROUPS }) {
  const personality = exhibitPersonality.use();
  const { title, match } = GROUPS[group];
  const rows = Object.entries(
    personalityVariables(personalities[personality]),
  ).filter(([name]) => match.test(name));

  return (
    <figure className="site-tokens" style={{ margin: 0 }}>
      <div className="site-exhibit-bar">
        <b>{title}</b>
        <PersonalityChips />
      </div>
      <dl>
        {rows.map(([name, value]) => (
          <div key={name}>
            <dt>
              <code>{name}</code>
            </dt>
            <dd className="value" title={value}>
              {group === "color" && (
                <span
                  aria-hidden="true"
                  className="swatch"
                  style={{ background: value }}
                />
              )}
              {shorten(value)}
            </dd>
            <dd className="note">{note(name)}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
