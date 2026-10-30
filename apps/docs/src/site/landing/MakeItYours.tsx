"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import {
  Badge,
  Button,
  Card,
  PlonkProvider,
  Switch,
  type PlonkStyle,
} from "plonk";

/** Birkaç hazır marka rengi: dolgu ve üstündeki yazı. */
const SWATCHES = [
  ["#FFD23F", "#1F1A17"],
  ["#7C5CFF", "#FFFFFF"],
  ["#FF6B3D", "#1F1A17"],
  ["#16A34A", "#FFFFFF"],
  ["#FF8CC6", "#1F1A17"],
  ["#0F1115", "#FFFFFF"],
] as const;

/** Tema oluşturucunun tadımlığı: bir renk ve köşe seç, eser hemen uyar. */
export function MakeItYours() {
  const [swatch, setSwatch] = useState(0);
  const [corner, setCorner] = useState(12);
  const [fill, on] = SWATCHES[swatch]!;
  const style: PlonkStyle = {
    "--plonk-color-primary": fill,
    "--plonk-color-on-primary": on,
    "--plonk-radius-sm": `${Math.round((corner * 2) / 3)}px`,
    "--plonk-radius-md": `${corner}px`,
    "--plonk-radius-lg": `${Math.round(corner * 1.5)}px`,
  };

  return (
    <div className="site-wrap site-make">
      <div>
        <span className="site-eyebrow">Theme builder</span>
        <h2 className="site-h2">Make it yours.</h2>
        <p className="site-lead-l">
          Start from a personality, pick your colors, corners and type, then
          copy the CSS. Try a color:
        </p>
        <div className="site-swatches" role="group" aria-label="Primary color">
          {SWATCHES.map(([color], i) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              aria-pressed={i === swatch}
              style={{ "--c": color } as CSSProperties}
              onClick={() => setSwatch(i)}
            />
          ))}
        </div>
        <label className="site-corner">
          Corners
          <input
            type="range"
            min={0}
            max={24}
            value={corner}
            onChange={(e) => setCorner(Number(e.target.value))}
          />
          <span>{corner}px</span>
        </label>
        <Link className="site-btn dark" href="/docs/theme-builder">
          Open the theme builder
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
      <PlonkProvider
        personality="sticker"
        toaster={false}
        style={style}
        className="site-make-stage site-cut"
      >
        <Card
          tilt="left"
          tape
          className="w-full max-w-sm"
          title="Your brand here"
          description="Every component follows the tokens you pick."
          footer={
            <>
              <Button>Ship it</Button>
              <Badge variant="primary">New</Badge>
            </>
          }
        >
          <Switch label="Autosave" defaultChecked />
        </Card>
      </PlonkProvider>
    </div>
  );
}
