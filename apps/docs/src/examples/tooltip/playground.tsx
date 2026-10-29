"use client";

import { Button, Tooltip, TooltipTrigger } from "plonk";
import { Playground } from "@/site/Playground";

/** Tooltip sayfasının oyun alanı. */
export default function TooltipPlayground() {
  return (
    <Playground
      component="Tooltip"
      controls={{
        placement: {
          type: "enum",
          options: ["top", "bottom", "start", "end"],
          default: "top",
        },
        children: { type: "text", default: "Copy link" },
      }}
      wrapCode={(jsx, indent) =>
        `<TooltipTrigger>\n  <Button aria-label="Copy link">…</Button>\n${indent(jsx)}\n</TooltipTrigger>`
      }
      render={({ placement, children }) => (
        <TooltipTrigger>
          <Button variant="neutral">Hover or focus me</Button>
          <Tooltip placement={placement}>{children}</Tooltip>
        </TooltipTrigger>
      )}
    />
  );
}
