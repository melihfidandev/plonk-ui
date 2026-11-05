import type { Easing } from "./easing";

export const PERSONALITY_NAMES = [
  "sticker",
  "retro",
  "comic",
  "arcade",
] as const;
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
  /**
   * Letter case and spacing of the heading font. Everything is uppercase in Retro, like
   * old system screens. The browser converts it by the page's language (tr: i → İ).
   */
  displayCase: "none" | "uppercase";
  displayTracking: string;
  /** Slight tilt angle for a Sticker-like placement. */
  tilt: string;
  motion: Record<MotionToken, Easing>;
  /** Wobble on release: 0 off, 1 full jelly. */
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
    display: '"Baloo 2", ui-rounded, system-ui, sans-serif',
    body: '"Nunito", ui-rounded, system-ui, sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, monospace',
  },
  displayCase: "none",
  displayTracking: "0em",
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
    display: '"Tiny5", ui-monospace, monospace',
    body: '"IBM Plex Mono", ui-monospace, monospace',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
  displayCase: "uppercase",
  displayTracking: "0.06em",
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

const comic: Personality = {
  name: "comic",
  label: "Çizgi Roman",
  description:
    "Kalın mürekkep, nokta tramı, konuşma balonları. Hızlı ve sert: her tıklamada bir ses efekti patlar.",
  color: {
    canvas: "#FFF6DA",
    surface: "#FFFFFF",
    sunken: "#FFFDF3",
    ink: "#111111",
    inkMuted: "#5A554B",
    // Demodaki #FF3B30 beyaz yazıyla AA'yı geçmiyordu (3.5); biraz koyulaştı.
    primary: "#E3170A",
    onPrimary: "#FFFFFF",
    accent: "#FFD400",
    onAccent: "#111111",
    secondary: "#1E88FF",
    onSecondary: "#111111",
    success: "#2BC66A",
    onSuccess: "#111111",
    warning: "#FF9F1C",
    onWarning: "#111111",
    danger: "#A3160E",
    onDanger: "#FFFFFF",
    focus: "#1E88FF",
  },
  border: { width: "3px" },
  shadow: { x: "5px", y: "5px", color: "var(--plonk-color-ink)" },
  radius: { sm: "2px", md: "3px", lg: "4px", pill: "999px" },
  font: {
    display: '"Bangers", "Impact", system-ui, sans-serif',
    body: '"Kalam", "Comic Sans MS", system-ui, sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, monospace',
  },
  displayCase: "uppercase",
  displayTracking: "0.04em",
  tilt: "0.8deg",
  motion: {
    press: { type: "bezier", points: [0.2, 0.9, 0.3, 1], duration: 60 },
    spring: { type: "spring", response: 0.32, damping: 0.45 },
    snap: { type: "spring", response: 0.36, damping: 0.5 },
    enter: { type: "spring", response: 0.4, damping: 0.5 },
    exit: { type: "bezier", points: [0.5, 0, 1, 1], duration: 110 },
  },
  jelly: { amount: 0.45, duration: 420 },
};

const arcade: Personality = {
  name: "arcade",
  label: "Atari Salonu",
  description:
    "Jetonlu oyun makinesi: gece zemini, neon renkler, kubbeli butonlar. Butondan puan uçar, dialog geri sayar.",
  // Tek koyu kişilik: yazı açık, yüzeyler koyu, gölge camgöbeği neon.
  color: {
    canvas: "#1A1238",
    surface: "#2A1F5C",
    sunken: "#120C2B",
    ink: "#F4F0FF",
    inkMuted: "#B8AEE0",
    // Demodaki #FF2E88 beyaz yazıyla AA'yı geçmiyordu (3.5); biraz koyulaştı.
    primary: "#E0006F",
    onPrimary: "#FFFFFF",
    accent: "#FFE600",
    onAccent: "#0B0820",
    secondary: "#23E5FF",
    onSecondary: "#0B0820",
    success: "#39FF88",
    onSuccess: "#0B0820",
    warning: "#FF9F1C",
    onWarning: "#0B0820",
    danger: "#FF4D5E",
    onDanger: "#0B0820",
    focus: "#FFE600",
  },
  border: { width: "3px" },
  // Gölge aşağıya düşer: kubbeli jeton düğmesi gibi basılır.
  shadow: { x: "0px", y: "5px", color: "#23E5FF" },
  radius: { sm: "6px", md: "12px", lg: "18px", pill: "999px" },
  font: {
    display: '"Bungee", "Impact", system-ui, sans-serif',
    body: '"Rubik", system-ui, sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, monospace',
  },
  displayCase: "uppercase",
  displayTracking: "0.02em",
  tilt: "0deg",
  motion: {
    press: { type: "bezier", points: [0, 0, 0.2, 1], duration: 90 },
    spring: { type: "spring", response: 0.38, damping: 0.5 },
    snap: { type: "steps", count: 5, duration: 240 },
    enter: { type: "steps", count: 5, duration: 300 },
    exit: { type: "steps", count: 3, duration: 150 },
  },
  jelly: { amount: 0, duration: 0 },
};

export const personalities: Record<PersonalityName, Personality> = {
  sticker,
  retro,
  comic,
  arcade,
};
