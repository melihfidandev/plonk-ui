"use client";

import { Textarea } from "plonk-ui";

export default function AutoResize() {
  return (
    <Textarea
      className="w-full max-w-sm"
      label="Release notes"
      description="Grows as you type, then scrolls."
      autoResize
      rows={2}
      defaultValue={"Buttons now press harder.\nToasts peel off the corner."}
    />
  );
}
