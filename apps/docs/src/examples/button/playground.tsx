"use client";

import { Button } from "plonk";
import { Playground } from "@/site/Playground";

/** Button sayfasının oyun alanı. */
export default function ButtonPlayground() {
  return (
    <Playground
      component="Button"
      controls={{
        variant: {
          type: "enum",
          options: [
            "primary",
            "secondary",
            "accent",
            "neutral",
            "danger",
            "ghost",
          ],
          default: "primary",
        },
        size: { type: "enum", options: ["sm", "md", "lg"], default: "md" },
        loading: { type: "boolean", default: false },
        isDisabled: { type: "boolean", default: false },
        children: { type: "text", default: "Send invite" },
      }}
      render={({ variant, size, loading, isDisabled, children }) => (
        <Button
          variant={variant}
          size={size}
          loading={loading}
          isDisabled={isDisabled}
        >
          {children}
        </Button>
      )}
    />
  );
}
