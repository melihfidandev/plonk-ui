"use client";

import { Checkbox } from "plonk";
import { Playground } from "@/site/Playground";

/** Checkbox sayfasının oyun alanı. */
export default function CheckboxPlayground() {
  return (
    <Playground
      component="Checkbox"
      controls={{
        label: { type: "text", default: "Email me about replies" },
        description: { type: "text", default: "" },
        error: { type: "text", default: "" },
        indeterminate: { type: "boolean", default: false },
        required: { type: "boolean", default: false },
        disabled: { type: "boolean", default: false },
      }}
      render={({ label, description, error, ...rest }) => (
        <Checkbox
          label={label || undefined}
          aria-label={label ? undefined : "Email me about replies"}
          description={description || undefined}
          error={error || undefined}
          {...rest}
        />
      )}
    />
  );
}
