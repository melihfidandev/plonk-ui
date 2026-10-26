import { resolveEasing } from "./easing";
import {
  DEFAULT_PERSONALITY,
  personalities,
  type MotionToken,
  type Personality,
} from "./personalities";

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Kişiliği `--plonk-*` CSS değişkenlerine çevirir. */
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
 * Hareket azaltıldığında: jöle kapanır (`!important`, böylece provider'ın `jelly`
 * ayarı ya da satır içi bir stil bu kuralı ezemez), yaylar kısa ve sade bir yavaşlamaya döner.
 * Basma tepkisi kalır; geri bildirim kaybolmasın.
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

/** `src/personalities.css` dosyasının içeriği. */
export function buildPersonalitiesCss(): string {
  const parts = [
    "/* Bu dosya üretilir, elle düzenleme. Kaynak: src/tokens/personalities.ts */",
    "/* Yeniden üretmek için: pnpm --filter plonk tokens */",
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
  return parts.join("\n\n") + "\n";
}
