"use client";

import { Textarea } from "plonk";
import { Playground } from "@/site/Playground";

/** Textarea sayfasının oyun alanı. */
export default function TextareaPlayground() {
  return (
    <Playground
      component="Textarea"
      controls={{
        label: { type: "text", default: "Message" },
        placeholder: { type: "text", default: "Say hello…" },
        description: { type: "text", default: "" },
        error: { type: "text", default: "" },
        autoResize: { type: "boolean", default: false },
        required: { type: "boolean", default: false },
        disabled: { type: "boolean", default: false },
      }}
      render={({ label, description, error, ...rest }) => (
        <Textarea
          className="w-full max-w-sm"
          label={label || undefined}
          aria-label={label ? undefined : "Message"}
          description={description || undefined}
          error={error || undefined}
          {...rest}
        />
      )}
    />
  );
}
