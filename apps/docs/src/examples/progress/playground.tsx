"use client";

import { Progress } from "plonk";
import { Playground } from "@/site/Playground";

/** Progress sayfasının oyun alanı. */
export default function ProgressPlayground() {
  return (
    <Playground
      component="Progress"
      controls={{
        label: { type: "text", default: "Uploading" },
        value: { type: "number", default: 60, min: 0, max: 100, step: 10 },
        variant: {
          type: "enum",
          options: [
            "primary",
            "secondary",
            "accent",
            "success",
            "warning",
            "danger",
          ],
          default: "primary",
        },
        showValue: { type: "boolean", default: true },
      }}
      render={({ label, ...rest }) => (
        <Progress
          className="w-full max-w-xs"
          label={label || undefined}
          aria-label={label ? undefined : "Uploading"}
          {...rest}
        />
      )}
    />
  );
}
