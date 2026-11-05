import {
  PERSONALITY_NAMES,
  contrastRatio,
  personalities,
  personalityVariables,
  type PersonalityName,
  type PlonkStyle,
  type PlonkVariable,
} from "plonk-ui";

/**
 * Tema oluşturucunun modeli: hangi token'lar ayarlanır, taslak nasıl tutulur,
 * koda ve paylaşım bağlantısına nasıl çevrilir. Arayüzden bağımsız, saf
 * fonksiyonlar.
 */

/** "primary" → "--plonk-color-primary", "onPrimary" → "--plonk-color-on-primary". */
export const colorVar = (key: string) =>
  `--plonk-color-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}` as PlonkVariable;

export const SURFACES = [
  { key: "canvas", label: "Canvas" },
  { key: "surface", label: "Surface" },
  { key: "sunken", label: "Sunken" },
  { key: "ink", label: "Ink" },
  { key: "inkMuted", label: "Ink muted" },
] as const;

/** Dolgu renkleri ve üstlerindeki yazının rengi (`on-` eşi). */
export const PAIRS = [
  { key: "primary", on: "onPrimary", label: "Primary" },
  { key: "secondary", on: "onSecondary", label: "Secondary" },
  { key: "accent", on: "onAccent", label: "Accent" },
  { key: "success", on: "onSuccess", label: "Success" },
  { key: "warning", on: "onWarning", label: "Warning" },
  { key: "danger", on: "onDanger", label: "Danger" },
] as const;

export type PairOn = (typeof PAIRS)[number]["on"];

/** Oluşturucunun ayarladığı token'lar, kodda yazılma sırasıyla. */
export const TOKENS = [
  ...[
    ...SURFACES.map((s) => s.key),
    ...PAIRS.flatMap((p) => [p.key, p.on]),
    "focus",
  ].map(colorVar),
  "--plonk-border-width",
  "--plonk-radius-sm",
  "--plonk-radius-md",
  "--plonk-radius-lg",
  "--plonk-shadow-x",
  "--plonk-shadow-y",
  "--plonk-shadow-color",
  "--plonk-font-display",
  "--plonk-font-display-case",
  "--plonk-font-body",
  "--plonk-tilt",
  "--plonk-jelly-amount",
] as const satisfies readonly PlonkVariable[];

export type Token = (typeof TOKENS)[number];

/** Gölge rengi kişilikte çoğunlukla mürekkebe bağlı. */
export const INK_SHADOW = "var(--plonk-color-ink)";

export interface FontOption {
  /** Paylaşım bağlantısındaki kısa ad. */
  id: string;
  label: string;
  value: string;
  /** Sadece büyük harf çizer: başlıklar büyük harfe çevrilmeli (tr: i → İ). */
  capsOnly?: boolean;
}

const p = personalities;

export const DISPLAY_FONTS: FontOption[] = [
  { id: "baloo", label: "Baloo 2", value: p.sticker.font.display },
  { id: "tiny5", label: "Tiny5", value: p.retro.font.display },
  {
    id: "bangers",
    label: "Bangers",
    value: p.comic.font.display,
    capsOnly: true,
  },
  {
    id: "bungee",
    label: "Bungee",
    value: p.arcade.font.display,
    capsOnly: true,
  },
  { id: "system", label: "System", value: "system-ui, sans-serif" },
  {
    id: "serif",
    label: "Serif",
    value: 'ui-serif, Georgia, "Times New Roman", serif',
  },
];

export const BODY_FONTS: FontOption[] = [
  { id: "nunito", label: "Nunito", value: p.sticker.font.body },
  { id: "plex", label: "IBM Plex Mono", value: p.retro.font.body },
  { id: "kalam", label: "Kalam", value: p.comic.font.body },
  { id: "rubik", label: "Rubik", value: p.arcade.font.body },
  { id: "system", label: "System", value: "system-ui, sans-serif" },
  {
    id: "serif",
    label: "Serif",
    value: 'ui-serif, Georgia, "Times New Roman", serif',
  },
];

/** Bir kişiliğin bu token'lardaki kendi değerleri. */
export function baseValues(
  personality: PersonalityName,
): Record<Token, string> {
  const all = personalityVariables(personalities[personality]);
  return Object.fromEntries(TOKENS.map((t) => [t, all[t]!])) as Record<
    Token,
    string
  >;
}

export interface Draft {
  personality: PersonalityName;
  /** Sadece kişilikten farklı olan token'lar. */
  values: Partial<Record<Token, string>>;
  /** Elle seçilmiş `on-` renkleri: bunlara otomatik öneri dokunmaz. */
  locked: PairOn[];
  /** Köşeler (sm / md / lg) tek kaydırıcıyla mı değişiyor. */
  linked: boolean;
}

export const emptyDraft = (personality: PersonalityName): Draft => ({
  personality,
  values: {},
  locked: [],
  linked: true,
});

/** Token'ın şu anki değeri: değiştirildiyse o, yoksa kişiliğinki. */
export const valueOf = (draft: Draft, token: Token) =>
  draft.values[token] ?? baseValues(draft.personality)[token];

/** Değerleri yazar; kişiliğin kendi değerine dönen token taslaktan düşer. */
export function withValues(
  draft: Draft,
  next: Partial<Record<Token, string>>,
): Draft {
  const base = baseValues(draft.personality);
  const values = { ...draft.values };
  for (const [token, value] of Object.entries(next) as [Token, string][]) {
    if (value === base[token]) delete values[token];
    else values[token] = value;
  }
  return { ...draft, values };
}

export const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

/**
 * Dolgu rengine en okunur yazı rengi: mürekkep, beyaz ve kişiliğin kendi
 * `on-` renkleri arasından kontrastı en yüksek olan.
 */
export function suggestOn(draft: Draft, fill: string): string {
  const base = baseValues(draft.personality);
  const ink = valueOf(draft, colorVar("ink"));
  const candidates = [
    ...new Set(
      [
        ink,
        "#FFFFFF",
        ...PAIRS.map((pair) => base[colorVar(pair.on) as Token]),
      ].filter(isHex),
    ),
  ];
  let best = candidates[0]!;
  for (const color of candidates) {
    if (contrastRatio(fill, color) > contrastRatio(fill, best)) best = color;
  }
  return best;
}

/** Dolgu rengini değiştirir; eşi elle seçilmediyse ona uygun yazı rengi önerilir. */
export function setFill(
  draft: Draft,
  pair: (typeof PAIRS)[number],
  fill: string,
): Draft {
  const fillVar = colorVar(pair.key) as Token;
  const onVar = colorVar(pair.on) as Token;
  if (draft.locked.includes(pair.on))
    return withValues(draft, { [fillVar]: fill });
  const base = baseValues(draft.personality);
  const on = fill === base[fillVar] ? base[onVar] : suggestOn(draft, fill);
  return withValues(draft, { [fillVar]: fill, [onVar]: on });
}

/** `on-` rengini elle seçmek onu kilitler. */
export function setOn(
  draft: Draft,
  pair: (typeof PAIRS)[number],
  on: string,
): Draft {
  const locked = draft.locked.includes(pair.on)
    ? draft.locked
    : [...draft.locked, pair.on];
  return withValues({ ...draft, locked }, { [colorVar(pair.on)]: on });
}

/** Kilidi açar ve önerilen rengi geri getirir. */
export function unlockOn(draft: Draft, pair: (typeof PAIRS)[number]): Draft {
  const next = {
    ...draft,
    locked: draft.locked.filter((key) => key !== pair.on),
  };
  return setFill(next, pair, valueOf(next, colorVar(pair.key) as Token));
}

/** Köşeler bağlıyken: md'den sm ve lg (Sticker'ın oranları, 8 / 12 / 18). */
export function linkedRadii(md: number): Partial<Record<Token, string>> {
  return {
    "--plonk-radius-sm": `${Math.round((md * 2) / 3)}px`,
    "--plonk-radius-md": `${md}px`,
    "--plonk-radius-lg": `${Math.round(md * 1.5)}px`,
  };
}

/** Değişen token'lar, kodda yazılma sırasıyla. */
export function changes(draft: Draft): [Token, string][] {
  return TOKENS.filter((t) => draft.values[t] !== undefined).map((t) => [
    t,
    draft.values[t]!,
  ]);
}

/** Önizlemenin provider'ına verilen stil. */
export const styleOf = (draft: Draft) =>
  Object.fromEntries(changes(draft)) as PlonkStyle;

export type CodeFormat = "css" | "provider";

export function themeCode(draft: Draft, format: CodeFormat): string {
  const list = changes(draft);
  if (format === "css") {
    const body = list.length
      ? list.map(([token, value]) => `  ${token}: ${value};`).join("\n")
      : "  /* Nothing changed yet. Pick a color or move a slider. */";
    return `[data-plonk-personality="${draft.personality}"] {\n${body}\n}`;
  }
  // Font listeleri çift tırnak içerir: JSX'te tek tırnakla yaz.
  const quote = (value: string) =>
    value.includes('"') ? `'${value}'` : `"${value}"`;
  const open = `<PlonkProvider personality="${draft.personality}"`;
  const app = "  <App />\n</PlonkProvider>";
  if (!list.length) return `${open}>\n${app}`;
  const style = list
    .map(([token, value]) => `    "${token}": ${quote(value)},`)
    .join("\n");
  return `<PlonkProvider\n  personality="${draft.personality}"\n  style={{\n${style}\n  }}\n>\n${app}`;
}

/* ---------- Paylaşım bağlantısı: #theme=sticker&color-primary=7C5CFF… ---------- */

const PREFIX = "--plonk-";

/** Bağlantıdan gelen değerler doğrulanır: sadece bilinen token, beklenen biçim. */
function parseValue(token: Token, raw: string): string | null {
  if (token.startsWith("--plonk-color-")) {
    const hex = `#${raw.toUpperCase()}`;
    return isHex(hex) ? hex : null;
  }
  if (token === "--plonk-shadow-color") {
    if (raw === "ink") return INK_SHADOW;
    const hex = `#${raw.toUpperCase()}`;
    return isHex(hex) ? hex : null;
  }
  if (token === "--plonk-font-display" || token === "--plonk-font-body") {
    const fonts = token === "--plonk-font-display" ? DISPLAY_FONTS : BODY_FONTS;
    return fonts.find((font) => font.id === raw)?.value ?? null;
  }
  if (token === "--plonk-font-display-case") {
    return raw === "none" || raw === "uppercase" ? raw : null;
  }
  if (token === "--plonk-tilt")
    return /^-?\d{1,2}(\.\d{1,2})?deg$/.test(raw) ? raw : null;
  if (token === "--plonk-jelly-amount") {
    const n = Number(raw);
    return raw !== "" && n >= 0 && n <= 1 ? String(n) : null;
  }
  return /^-?\d{1,2}(\.\d{1,2})?px$/.test(raw) ? raw : null;
}

function encodeValue(token: Token, value: string): string {
  if (value === INK_SHADOW) return "ink";
  if (value.startsWith("#")) return value.slice(1);
  if (token === "--plonk-font-display") {
    return DISPLAY_FONTS.find((font) => font.value === value)?.id ?? "";
  }
  if (token === "--plonk-font-body") {
    return BODY_FONTS.find((font) => font.value === value)?.id ?? "";
  }
  return value;
}

export function encodeDraft(draft: Draft): string {
  const params = new URLSearchParams({ theme: draft.personality });
  for (const [token, value] of changes(draft)) {
    params.set(token.slice(PREFIX.length), encodeValue(token, value));
  }
  if (draft.locked.length) params.set("lock", draft.locked.join(","));
  if (!draft.linked) params.set("corners", "free");
  return params.toString();
}

/** `#theme=…` değilse ya da kişilik tanınmıyorsa `null`. */
export function decodeDraft(hash: string): Draft | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const personality = params.get("theme") as PersonalityName | null;
  if (!personality || !PERSONALITY_NAMES.includes(personality)) return null;
  let draft = emptyDraft(personality);
  const values: Partial<Record<Token, string>> = {};
  for (const token of TOKENS) {
    const raw = params.get(token.slice(PREFIX.length));
    const value = raw === null ? null : parseValue(token, raw);
    if (value !== null) values[token] = value;
  }
  draft = withValues(draft, values);
  const onKeys = PAIRS.map((pair) => pair.on as string);
  draft.locked = (params.get("lock") ?? "")
    .split(",")
    .filter((key): key is PairOn => onKeys.includes(key));
  draft.linked = params.get("corners") !== "free";
  return draft;
}
