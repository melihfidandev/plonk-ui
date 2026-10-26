// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { buildPersonalitiesCss, personalityVariables } from "./css";
import { personalities, type ColorToken } from "./personalities";

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
