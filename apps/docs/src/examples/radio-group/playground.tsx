"use client";

import { Radio, RadioGroup } from "plonk";
import { Playground } from "@/site/Playground";

/** Radio Group sayfasının oyun alanı. */
export default function RadioGroupPlayground() {
  return (
    <Playground
      component="RadioGroup"
      controls={{
        label: { type: "text", default: "Plan" },
        orientation: {
          type: "enum",
          options: ["vertical", "horizontal"],
          default: "vertical",
        },
        description: { type: "text", default: "" },
        error: { type: "text", default: "" },
        required: { type: "boolean", default: false },
        disabled: { type: "boolean", default: false },
      }}
      childrenCode={[
        '<Radio value="free" label="Free" />',
        '<Radio value="pro" label="Pro" />',
        '<Radio value="team" label="Team" />',
      ].join("\n")}
      render={({ label, description, error, ...rest }) => (
        <RadioGroup
          label={label || undefined}
          aria-label={label ? undefined : "Plan"}
          description={description || undefined}
          error={error || undefined}
          {...rest}
        >
          <Radio value="free" label="Free" />
          <Radio value="pro" label="Pro" />
          <Radio value="team" label="Team" />
        </RadioGroup>
      )}
    />
  );
}
