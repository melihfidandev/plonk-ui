"use client";

import { DatePicker } from "plonk-ui";
import { Playground } from "@/site/Playground";

/** Date Picker sayfasının oyun alanı. */
export default function DatePickerPlayground() {
  return (
    <Playground
      component="DatePicker"
      controls={{
        label: { type: "text", default: "Departure" },
        description: { type: "text", default: "" },
        error: { type: "text", default: "" },
        isRequired: { type: "boolean", default: false },
        isDisabled: { type: "boolean", default: false },
      }}
      render={({ label, description, error, ...rest }) => (
        <DatePicker
          className="w-full max-w-xs"
          label={label || undefined}
          aria-label={label ? undefined : "Departure"}
          description={description || undefined}
          error={error || undefined}
          {...rest}
        />
      )}
    />
  );
}
