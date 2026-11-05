import type { CSSProperties } from "react";
import type { ColorToken, MotionToken, Personality } from "./personalities";

/** "inkMuted" → "ink-muted" (at the type level). */
type Kebab<S extends string> = S extends `${infer Head}${infer Tail}`
  ? `${Head extends Lowercase<Head> ? Head : `-${Lowercase<Head>}`}${Kebab<Tail>}`
  : S;

/** Every `--plonk-*` token variable the user can override. */
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
 * React's style type + Plonk tokens. `style={{ "--plonk-color-focus": "#f0c" }}`
 * works without a cast; the editor suggests token names and catches misspelled ones.
 */
export type PlonkStyle = CSSProperties & {
  [K in PlonkVariable]?: string | number;
};
