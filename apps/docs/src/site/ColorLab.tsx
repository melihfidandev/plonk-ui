"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  PlonkProvider,
  Progress,
  Switch,
  personalities,
  type PlonkStyle,
} from "plonk";
import { ColorField, Contrast } from "./ColorField";
import { Exhibit, exhibitPersonality } from "./Exhibit";
import { LiveCode } from "./LiveCode";

/** Sergide değiştirilebilen renkler; `on` eşi olanlar kontrastla birlikte. */
const TOKENS = [
  { key: "primary", on: "onPrimary" },
  { key: "accent", on: "onAccent" },
  { key: "focus" },
] as const;

type Key = "primary" | "onPrimary" | "accent" | "onAccent" | "focus";

const cssName = (key: string) =>
  `--plonk-color-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

/**
 * Renk sergisi: ana renkleri değiştir, eşlerinin kontrastını gör, CSS'i
 * kopyala. Asıl tema oluşturucu ayrı sayfada; bu sadece fikri gösterir.
 */
export function ColorLab() {
  const personality = exhibitPersonality.use();
  const base = personalities[personality].color;
  // Kişilik değişince ayarlar o kişiliğin renklerinden yeniden başlar.
  const [edits, setEdits] = useState<{
    personality: string;
    colors: Partial<Record<Key, string>>;
  }>({ personality, colors: {} });
  const colors = edits.personality === personality ? edits.colors : {};
  const value = (key: Key) => colors[key] ?? base[key];
  const set = (key: Key, color: string) =>
    setEdits({ personality, colors: { ...colors, [key]: color } });

  const changed = Object.entries(colors) as [Key, string][];
  const style = Object.fromEntries(
    changed.map(([key, color]) => [cssName(key), color]),
  ) as PlonkStyle;
  const code = changed.length
    ? `[data-plonk-personality="${personality}"] {\n${changed
        .map(([key, color]) => `  ${cssName(key)}: ${color};`)
        .join("\n")}\n}`
    : "/* Pick a color to see the CSS */";

  return (
    <Exhibit
      title="Colors · Try it"
      footer={
        <>
          <div className="site-controls">
            {TOKENS.map((token) => (
              <div key={token.key} className="site-control">
                <span>{token.key}</span>
                <div className="site-colors">
                  <ColorField
                    label={token.key}
                    value={value(token.key)}
                    onChange={(c) => set(token.key, c)}
                  />
                  {"on" in token && (
                    <>
                      <ColorField
                        label={token.on}
                        value={value(token.on)}
                        onChange={(c) => set(token.on, c)}
                      />
                      <Contrast a={value(token.key)} b={value(token.on)} />
                    </>
                  )}
                </div>
              </div>
            ))}
            {changed.length > 0 && (
              <button
                type="button"
                className="site-reset"
                onClick={() => setEdits({ personality, colors: {} })}
              >
                Reset
              </button>
            )}
          </div>
          <LiveCode lang="CSS" code={code} />
        </>
      }
    >
      <PlonkProvider personality={personality} toaster={false} style={style}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="accent">Accent</Button>
            <Badge variant="accent">New</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Switch label="Autosave" defaultChecked />
            <Checkbox label="Remember me" defaultChecked />
          </div>
          <Progress value={62} label="Upload" showValue />
        </div>
      </PlonkProvider>
    </Exhibit>
  );
}
