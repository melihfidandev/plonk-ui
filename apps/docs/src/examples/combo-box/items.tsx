"use client";

import { useState } from "react";
import { ComboBox, ComboBoxItem } from "plonk";

const LANGUAGES = [
  { id: "en", name: "English", native: "English" },
  { id: "tr", name: "Turkish", native: "Türkçe" },
  { id: "de", name: "German", native: "Deutsch" },
  { id: "ja", name: "Japanese", native: "日本語" },
  { id: "pt", name: "Portuguese", native: "Português" },
  { id: "es", name: "Spanish", native: "Español" },
];

export default function Items() {
  const [language, setLanguage] = useState<string | null>("tr");

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <ComboBox
        label="Language"
        defaultItems={LANGUAGES}
        value={language}
        onChange={(key) => setLanguage(key == null ? null : String(key))}
        emptyMessage="No language by that name"
      >
        {(item) => (
          <ComboBoxItem description={item.native}>{item.name}</ComboBoxItem>
        )}
      </ComboBox>
      <span className="font-bold">Value: {language ?? "none"}</span>
    </div>
  );
}
