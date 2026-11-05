import { resolveEasing } from "./easing";
import {
  DEFAULT_PERSONALITY,
  personalities,
  type MotionToken,
  type Personality,
} from "./personalities";

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Turns a personality into `--plonk-*` CSS variables. */
export function personalityVariables(p: Personality): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(p.color)) {
    vars[`--plonk-color-${kebab(key)}`] = value;
  }
  vars["--plonk-border-width"] = p.border.width;
  vars["--plonk-shadow-x"] = p.shadow.x;
  vars["--plonk-shadow-y"] = p.shadow.y;
  vars["--plonk-shadow-color"] = p.shadow.color;
  for (const [key, value] of Object.entries(p.radius)) {
    vars[`--plonk-radius-${key}`] = value;
  }
  for (const [key, value] of Object.entries(p.font)) {
    vars[`--plonk-font-${key}`] = value;
  }
  vars["--plonk-font-display-case"] = p.displayCase;
  vars["--plonk-font-display-tracking"] = p.displayTracking;
  vars["--plonk-tilt"] = p.tilt;
  for (const [key, easing] of Object.entries(p.motion)) {
    const { easing: fn, duration } = resolveEasing(easing);
    vars[`--plonk-motion-${key}-easing`] = fn;
    vars[`--plonk-motion-${key}-duration`] = `${duration}ms`;
  }
  vars["--plonk-jelly-amount"] = String(p.jelly.amount);
  vars["--plonk-jelly-duration"] = `${p.jelly.duration}ms`;
  return vars;
}

/**
 * When motion is reduced: jelly turns off (`!important`, so the provider's `jelly`
 * setting or an inline style can't override this rule) and springs become a short,
 * plain ease-out. The press response stays, so feedback isn't lost.
 */
const REDUCED: Partial<
  Record<MotionToken, { easing: string; duration: number }>
> = {
  spring: { easing: "cubic-bezier(0.2, 0, 0, 1)", duration: 150 },
  snap: { easing: "cubic-bezier(0.2, 0, 0, 1)", duration: 150 },
  enter: { easing: "cubic-bezier(0.2, 0, 0, 1)", duration: 150 },
  exit: { easing: "cubic-bezier(0.4, 0, 1, 1)", duration: 100 },
};

function reducedVariables(): Record<string, string> {
  const vars: Record<string, string> = {
    "--plonk-jelly-amount": "0 !important",
  };
  for (const [key, value] of Object.entries(REDUCED)) {
    vars[`--plonk-motion-${key}-easing`] = value.easing;
    vars[`--plonk-motion-${key}-duration`] = `${value.duration}ms`;
  }
  return vars;
}

const block = (selector: string, vars: Record<string, string>, indent = "") =>
  [
    `${indent}${selector} {`,
    ...Object.entries(vars).map(([k, v]) => `${indent}  ${k}: ${v};`),
    `${indent}}`,
  ].join("\n");

/** Contents of the `src/personalities.css` file. */
export function buildPersonalitiesCss(): string {
  const parts = [
    "/* Bu dosya üretilir, elle düzenleme. Kaynak: src/tokens/personalities.ts */",
    "/* Yeniden üretmek için: pnpm --filter plonk-ui tokens */",
  ];
  for (const p of Object.values(personalities)) {
    const selector =
      p.name === DEFAULT_PERSONALITY
        ? `:root,\n[data-plonk-personality="${p.name}"]`
        : `[data-plonk-personality="${p.name}"]`;
    parts.push(block(selector, personalityVariables(p)));
  }
  const reduced = reducedVariables();
  parts.push(
    `@media (prefers-reduced-motion: reduce) {\n${block(
      ":root,\n  [data-plonk-personality]",
      reduced,
      "  ",
    )}\n}`,
  );
  parts.push(
    block(
      '[data-plonk-motion="reduce"],\n[data-plonk-motion="reduce"] [data-plonk-personality]',
      reduced,
    ),
  );
  // Değişkenler Tailwind'in base katmanında: kullanıcının katmansız CSS'i ve
  // utility sınıfları (ör. [--plonk-jelly-amount:0.3]) bunları ezebilir.
  const [header, note, ...rules] = parts;
  const body = rules
    .join("\n\n")
    .split("\n")
    .map((line) => (line ? `  ${line}` : line))
    .join("\n");
  return `${header}\n\n${note}\n\n@layer base {\n${body}\n}\n`;
}
