"use client";

import { Badge } from "plonk";
import { Playground } from "@/site/Playground";

/** Badge sayfasının oyun alanı. */
export default function BadgePlayground() {
  return (
    <Playground
      component="Badge"
      controls={{
        variant: {
          type: "enum",
          options: [
            "neutral",
            "primary",
            "secondary",
            "accent",
            "success",
            "warning",
            "danger",
          ],
          default: "neutral",
        },
        dot: { type: "boolean", default: false },
        children: { type: "text", default: "New" },
      }}
      render={({ variant, dot, children }) => (
        <Badge variant={variant} dot={dot}>
          {children}
        </Badge>
      )}
    />
  );
}
