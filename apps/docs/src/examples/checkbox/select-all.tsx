"use client";

import { useState } from "react";
import { Checkbox } from "plonk";

const FILES = ["brief.pdf", "moodboard.png", "invoice-0042.pdf"];

export default function SelectAll() {
  const [selected, setSelected] = useState<string[]>(["brief.pdf"]);
  const all = selected.length === FILES.length;
  const some = selected.length > 0 && !all;

  const toggle = (file: string, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, file] : current.filter((f) => f !== file),
    );

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="All files"
        checked={all}
        indeterminate={some}
        onChange={(event) => setSelected(event.target.checked ? FILES : [])}
      />
      <div className="flex flex-col gap-3 ps-9">
        {FILES.map((file) => (
          <Checkbox
            key={file}
            label={file}
            checked={selected.includes(file)}
            onChange={(event) => toggle(file, event.target.checked)}
          />
        ))}
      </div>
    </div>
  );
}
