// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { buildPersonalitiesCss, personalityVariables } from "./css";
import { personalities, type ColorToken } from "./personalities";
import type { PlonkVariable } from "./variables";

/*
 * PlonkVariable tipinin tam listesi. Record olduğu için TypeScript eksik ya da
 * fazla bir ad olursa hata verir; aşağıdaki test de üretilen CSS ile karşılaştırır.
 * Böylece tip, gerçek değişkenlerden hiç kopmaz.
 */
const ALL_VARIABLES: Record<PlonkVariable, true> = {
  "--plonk-color-canvas": true,
  "--plonk-color-surface": true,
  "--plonk-color-sunken": true,
  "--plonk-color-ink": true,
  "--plonk-color-ink-muted": true,
  "--plonk-color-primary": true,
  "--plonk-color-on-primary": true,
  "--plonk-color-accent": true,
  "--plonk-color-on-accent": true,
  "--plonk-color-secondary": true,
  "--plonk-color-on-secondary": true,
  "--plonk-color-success": true,
  "--plonk-color-on-success": true,
  "--plonk-color-warning": true,
  "--plonk-color-on-warning": true,
  "--plonk-color-danger": true,
  "--plonk-color-on-danger": true,
  "--plonk-color-focus": true,
  "--plonk-border-width": true,
  "--plonk-shadow-x": true,
  "--plonk-shadow-y": true,
  "--plonk-shadow-color": true,
  "--plonk-radius-sm": true,
  "--plonk-radius-md": true,
  "--plonk-radius-lg": true,
  "--plonk-radius-pill": true,
  "--plonk-font-display": true,
  "--plonk-font-body": true,
  "--plonk-font-mono": true,
  "--plonk-font-display-case": true,
  "--plonk-font-display-tracking": true,
  "--plonk-tilt": true,
  "--plonk-motion-press-easing": true,
  "--plonk-motion-press-duration": true,
  "--plonk-motion-spring-easing": true,
  "--plonk-motion-spring-duration": true,
  "--plonk-motion-snap-easing": true,
  "--plonk-motion-snap-duration": true,
  "--plonk-motion-enter-easing": true,
  "--plonk-motion-enter-duration": true,
  "--plonk-motion-exit-easing": true,
  "--plonk-motion-exit-duration": true,
  "--plonk-jelly-amount": true,
  "--plonk-jelly-duration": true,
};

const TEXT_PAIRS: [ColorToken, ColorToken][] = [
  ["canvas", "ink"],
  ["surface", "ink"],
  ["sunken", "ink"],
  ["surface", "inkMuted"],
  ["primary", "onPrimary"],
  ["accent", "onAccent"],
  ["secondary", "onSecondary"],
  ["success", "onSuccess"],
  ["warning", "onWarning"],
  ["danger", "onDanger"],
];

describe.each(Object.values(personalities))("$label", (p) => {
  it.each(TEXT_PAIRS)("%s üstünde %s metni AA kontrastını geçer", (bg, fg) => {
    expect(contrastRatio(p.color[bg], p.color[fg])).toBeGreaterThanOrEqual(4.5);
  });

  it("odak halkası yüzeyden ayırt edilir", () => {
    expect(
      contrastRatio(p.color.surface, p.color.focus),
    ).toBeGreaterThanOrEqual(3);
  });

  it("her token bir CSS değişkenine dönüşür", () => {
    const vars = personalityVariables(p);
    expect(vars["--plonk-color-on-primary"]).toBe(p.color.onPrimary);
    expect(vars["--plonk-motion-spring-duration"]).toMatch(/^\d+ms$/);
    expect(Object.values(vars).every((v) => v.length > 0)).toBe(true);
  });

  it("PlonkVariable tipi üretilen değişkenlerle birebir aynı", () => {
    expect(Object.keys(personalityVariables(p)).sort()).toEqual(
      Object.keys(ALL_VARIABLES).sort(),
    );
  });
});

describe("contrastRatio", () => {
  it("siyah-beyazda 21 verir", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  });
});

describe("personalities.css", () => {
  it("token tanımlarıyla güncel", () => {
    const file = readFileSync(
      new URL("../personalities.css", import.meta.url),
      "utf8",
    );
    expect(file, "Çalıştır: pnpm --filter plonk tokens").toBe(
      buildPersonalitiesCss(),
    );
  });
});
