"use client";

import { useState } from "react";
import { Switch } from "plonk";

export default function Settings() {
  const [autosave, setAutosave] = useState(true);
  const [sounds, setSounds] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <Switch
        label="Autosave"
        description={autosave ? "Saving every change." : "Save with ⌘S."}
        checked={autosave}
        onChange={(event) => setAutosave(event.target.checked)}
      />
      <Switch
        label="Sounds"
        description="A small click when you press buttons."
        checked={sounds}
        onChange={(event) => setSounds(event.target.checked)}
      />
      <Switch
        label="Beta features"
        description="Ask your admin to turn this on."
        disabled
      />
    </div>
  );
}
