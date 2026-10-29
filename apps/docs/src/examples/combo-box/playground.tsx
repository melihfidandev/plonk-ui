"use client";

import { ComboBox, ComboBoxItem } from "plonk";
import { Playground } from "@/site/Playground";

/** Combo Box sayfasının oyun alanı. */
export default function ComboBoxPlayground() {
  return (
    <Playground
      component="ComboBox"
      controls={{
        label: { type: "text", default: "City" },
        placeholder: { type: "text", default: "Start typing…" },
        description: { type: "text", default: "" },
        error: { type: "text", default: "" },
        allowsCustomValue: { type: "boolean", default: false },
        isDisabled: { type: "boolean", default: false },
      }}
      childrenCode={[
        '<ComboBoxItem id="istanbul">Istanbul</ComboBoxItem>',
        '<ComboBoxItem id="izmir">Izmir</ComboBoxItem>',
        '<ComboBoxItem id="lisbon">Lisbon</ComboBoxItem>',
        '<ComboBoxItem id="tokyo">Tokyo</ComboBoxItem>',
      ].join("\n")}
      render={({ label, description, error, ...rest }) => (
        <ComboBox
          className="w-full max-w-xs"
          label={label || undefined}
          aria-label={label ? undefined : "City"}
          description={description || undefined}
          error={error || undefined}
          {...rest}
        >
          <ComboBoxItem id="istanbul">Istanbul</ComboBoxItem>
          <ComboBoxItem id="izmir">Izmir</ComboBoxItem>
          <ComboBoxItem id="lisbon">Lisbon</ComboBoxItem>
          <ComboBoxItem id="tokyo">Tokyo</ComboBoxItem>
        </ComboBox>
      )}
    />
  );
}
