"use client";

import { useState } from "react";
import { Button } from "plonk";

const save = () => new Promise((resolve) => setTimeout(resolve, 1500));

export default function Loading() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handlePress() {
    setSaving(true);
    setSaved(false);
    await save();
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="flex items-center gap-4">
      <Button loading={saving} onPress={handlePress}>
        Save changes
      </Button>
      {saved && <span className="font-bold">Saved.</span>}
    </div>
  );
}
