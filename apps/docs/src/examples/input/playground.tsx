"use client";

import { Input } from "plonk";
import { Playground } from "@/site/Playground";

/** Input sayfasının oyun alanı. */
export default function InputPlayground() {
  return (
    <Playground
      component="Input"
      controls={{
        label: { type: "text", default: "Email" },
        placeholder: { type: "text", default: "you@studio.com" },
        description: { type: "text", default: "" },
        error: { type: "text", default: "" },
        required: { type: "boolean", default: false },
        disabled: { type: "boolean", default: false },
      }}
      render={({ label, placeholder, description, error, ...rest }) => (
        <Input
          className="w-full max-w-xs"
          label={label || undefined}
          aria-label={label ? undefined : "Email"}
          placeholder={placeholder}
          description={description || undefined}
          error={error || undefined}
          {...rest}
        />
      )}
    />
  );
}
