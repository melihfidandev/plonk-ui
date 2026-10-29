"use client";

import { Select, SelectItem } from "plonk";
import { Playground } from "@/site/Playground";

/** Select sayfasının oyun alanı. */
export default function SelectPlayground() {
  return (
    <Playground
      component="Select"
      controls={{
        label: { type: "text", default: "Plan" },
        placeholder: { type: "text", default: "Choose a plan" },
        description: { type: "text", default: "" },
        error: { type: "text", default: "" },
        isRequired: { type: "boolean", default: false },
        isDisabled: { type: "boolean", default: false },
      }}
      childrenCode={[
        '<SelectItem id="free">Free</SelectItem>',
        '<SelectItem id="pro">Pro</SelectItem>',
        '<SelectItem id="team">Team</SelectItem>',
      ].join("\n")}
      render={({ label, description, error, ...rest }) => (
        <Select
          className="w-full max-w-xs"
          label={label || undefined}
          aria-label={label ? undefined : "Plan"}
          description={description || undefined}
          error={error || undefined}
          {...rest}
        >
          <SelectItem id="free">Free</SelectItem>
          <SelectItem id="pro">Pro</SelectItem>
          <SelectItem id="team">Team</SelectItem>
        </Select>
      )}
    />
  );
}
