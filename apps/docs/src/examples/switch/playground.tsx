"use client";

import { Switch } from "plonk-ui";
import { Playground } from "@/site/Playground";

/** Switch sayfasının oyun alanı. */
export default function SwitchPlayground() {
  return (
    <Playground
      component="Switch"
      controls={{
        label: { type: "text", default: "Autosave" },
        description: { type: "text", default: "" },
        disabled: { type: "boolean", default: false },
      }}
      render={({ label, description, disabled }) => (
        <Switch
          label={label || undefined}
          aria-label={label ? undefined : "Autosave"}
          description={description || undefined}
          disabled={disabled}
        />
      )}
    />
  );
}
