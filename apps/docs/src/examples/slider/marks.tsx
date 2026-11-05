"use client";

import { Slider } from "plonk-ui";

const LEVELS = ["Off", "Low", "Medium", "High"];

export default function Marks() {
  return (
    <Slider
      className="w-full max-w-xs"
      label="Noise reduction"
      defaultValue={2}
      min={0}
      max={3}
      formatValue={(value) => LEVELS[value] ?? ""}
      marks={[0, 1, 2, 3]}
      valueBubble="active"
    />
  );
}
