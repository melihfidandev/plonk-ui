import type { Easing } from "./easing";

export const PERSONALITY_NAMES = ["sticker", "retro"] as const;
export type PersonalityName = (typeof PERSONALITY_NAMES)[number];

export const DEFAULT_PERSONALITY: PersonalityName = "sticker";

export type ColorToken =
  | "canvas"
  | "surface"
  | "sunken"
  | "ink"
  | "inkMuted"
  | "primary"
  | "onPrimary"
  | "accent"
  | "onAccent"
  | "secondary"
  | "onSecondary"
  | "success"
  | "onSuccess"
  | "warning"
  | "onWarning"
  | "danger"
  | "onDanger"
  | "focus";

export type MotionToken = "press" | "spring" | "snap" | "enter" | "exit";

export interface Personality {
  name: PersonalityName;
  label: string;
  description: string;
  color: Record<ColorToken, string>;
  border: { width: string };
  shadow: { x: string; y: string; color: string };
  radius: { sm: string; md: string; lg: string; pill: string };
  font: { display: string; body: string; mono: string };
  /** Sticker gibi hafif eğik yerleşim açısı. */
  tilt: string;
  motion: Record<MotionToken, Easing>;
  /** Bırakınca esneme: 0 kapalı, 1 tam jöle. */
  jelly: { amount: number; duration: number };
}

export const MOTION_TOKENS: Record<MotionToken, string> = {
  press: "Basılırken: parmağın altında hemen içeri girer.",
  spring: "Bırakınca ve genel geri dönüşler.",
  snap: "Yer değiştiren göstergeler, switch topuzu.",
  enter: "Dialog, popover gibi katmanların gelişi.",
  exit: "Katmanların çıkışı. Kısa ve sade.",
};

const sticker: Personality = {
  name: "sticker",
  label: "Sticker",
  description:
    "Defter, bant ve sticker'lar. Her şey biraz eğik yapıştırılmış; basınca ezilip yaylanıyor.",
  color: {
    canvas: "#FFF9EC",
    surface: "#FFFFFF",
    sunken: "#FFFDF8",
    ink: "#1F1A17",
    inkMuted: "#6B625B",
    primary: "#FFD23F",
    onPrimary: "#1F1A17",
    accent: "#FF8CC6",
    onAccent: "#1F1A17",
    secondary: "#5FBFFF",
    onSecondary: "#1F1A17",
    success: "#7DDE92",
    onSuccess: "#1F1A17",
    warning: "#FFB547",
    onWarning: "#1F1A17",
    danger: "#FF6B6B",
    onDanger: "#1F1A17",
    focus: "#1E7FE0",
  },
  border: { width: "2.5px" },
  shadow: { x: "4px", y: "4px", color: "var(--plonk-color-ink)" },
  radius: { sm: "8px", md: "12px", lg: "18px", pill: "999px" },
  font: {
    display: '"Lilita One", ui-rounded, system-ui, sans-serif',
    body: '"Nunito", ui-rounded, system-ui, sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, monospace',
  },
  tilt: "1.5deg",
  motion: {
    press: { type: "bezier", points: [0.3, 0.7, 0.4, 1], duration: 70 },
    spring: { type: "spring", response: 0.42, damping: 0.52 },
    snap: { type: "spring", response: 0.5, damping: 0.6 },
    enter: { type: "spring", response: 0.55, damping: 0.62 },
    exit: { type: "bezier", points: [0.4, 0, 1, 1], duration: 140 },
  },
  jelly: { amount: 0.75, duration: 620 },
};

const retro: Personality = {
  name: "retro",
  label: "Eski Bilgisayar",
  description:
    "Her bileşen bir pencere. Hareket kademeli ve anlık: animasyondan çok sistem tepkisi.",
  color: {
    canvas: "#D8D2C2",
    surface: "#F5F2E9",
    sunken: "#FFFFFF",
    ink: "#141414",
    inkMuted: "#5A564C",
    primary: "#5B4CFF",
    onPrimary: "#FFFFFF",
    accent: "#00B3A4",
    onAccent: "#141414",
    secondary: "#FF5A36",
    onSecondary: "#141414",
    success: "#3FA34D",
    onSuccess: "#141414",
    warning: "#E8A317",
    onWarning: "#141414",
    danger: "#D63B2F",
    onDanger: "#FFFFFF",
    focus: "#5B4CFF",
  },
  border: { width: "2px" },
  shadow: { x: "4px", y: "4px", color: "var(--plonk-color-ink)" },
  radius: { sm: "0px", md: "0px", lg: "0px", pill: "0px" },
  font: {
    display: '"Silkscreen", ui-monospace, monospace',
    body: '"IBM Plex Mono", ui-monospace, monospace',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
  tilt: "0deg",
  motion: {
    press: { type: "instant" },
    spring: { type: "steps", count: 2, duration: 100 },
    snap: { type: "steps", count: 3, duration: 240 },
    enter: { type: "steps", count: 4, duration: 200 },
    exit: { type: "steps", count: 2, duration: 100 },
  },
  jelly: { amount: 0, duration: 0 },
};

export const personalities: Record<PersonalityName, Personality> = {
  sticker,
  retro,
};
