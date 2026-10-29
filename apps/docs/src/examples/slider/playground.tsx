"use client";

import { Slider } from "plonk";
import { Playground } from "@/site/Playground";

/** Slider sayfasının oyun alanı. */
export default function SliderPlayground() {
  return (
    <Playground
      component="Slider"
      controls={{
        label: { type: "text", default: "Volume" },
        min: { type: "number", default: 0, omitDefault: true },
        max: { type: "number", default: 100, omitDefault: true },
        step: { type: "number", default: 1, min: 1, omitDefault: true },
        valueBubble: {
          type: "enum",
          options: ["always", "active", "never"],
          default: "always",
        },
        isDisabled: { type: "boolean", default: false },
      }}
      extraCode={["defaultValue={40}"]}
      render={({ label, ...rest }) => (
        <Slider
          className="w-full max-w-xs"
          label={label || undefined}
          aria-label={label ? undefined : "Volume"}
          defaultValue={40}
          {...rest}
        />
      )}
    />
  );
}
