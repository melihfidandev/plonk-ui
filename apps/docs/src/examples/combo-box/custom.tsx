"use client";

import { useState } from "react";
import { ComboBox, ComboBoxItem } from "plonk-ui";

const TAGS = ["design", "frontend", "research", "urgent"];

export default function Custom() {
  const [tag, setTag] = useState("");

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <ComboBox
        label="Tag"
        description="Pick one or type a new one."
        allowsCustomValue
        inputValue={tag}
        onInputChange={setTag}
      >
        {TAGS.map((t) => (
          <ComboBoxItem key={t} id={t}>
            {t}
          </ComboBoxItem>
        ))}
      </ComboBox>
      <span className="font-bold">Tag: {tag || "none"}</span>
    </div>
  );
}
