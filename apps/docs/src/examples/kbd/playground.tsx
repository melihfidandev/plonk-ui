"use client";

import { Kbd } from "plonk-ui";
import { Playground } from "@/site/Playground";

/** Kbd sayfasının oyun alanı. */
export default function KbdPlayground() {
  return (
    <Playground
      component="Kbd"
      controls={{ children: { type: "text", default: "Esc" } }}
      render={({ children }) => <Kbd>{children}</Kbd>}
    />
  );
}
