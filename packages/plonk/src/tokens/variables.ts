import type { CSSProperties } from "react";
import type { ColorToken, MotionToken, Personality } from "./personalities";

/** "inkMuted" → "ink-muted" (tip düzeyinde). */
type Kebab<S extends string> = S extends `${infer Head}${infer Tail}`
  ? `${Head extends Lowercase<Head> ? Head : `-${Lowercase<Head>}`}${Kebab<Tail>}`
  : S;

/** Kullanıcının ezebileceği bütün `--plonk-*` token değişkenleri. */
export type PlonkVariable =
  | `--plonk-color-${Kebab<ColorToken>}`
  | "--plonk-border-width"
  | `--plonk-shadow-${keyof Personality["shadow"]}`
  | `--plonk-radius-${keyof Personality["radius"]}`
  | `--plonk-font-${keyof Personality["font"]}`
  | "--plonk-font-display-case"
  | "--plonk-font-display-tracking"
  | "--plonk-tilt"
  | `--plonk-motion-${MotionToken}-${"easing" | "duration"}`
  | `--plonk-jelly-${"amount" | "duration"}`;

/**
 * React'in stil tipi + Plonk token'ları. `style={{ "--plonk-color-focus": "#f0c" }}`
 * cast yazmadan çalışır; editör token adlarını önerir, yanlış yazılan adı yakalar.
 */
export type PlonkStyle = CSSProperties & {
  [K in PlonkVariable]?: string | number;
};
