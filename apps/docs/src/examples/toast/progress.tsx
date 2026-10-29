"use client";

import { useState } from "react";
import { Button, toast } from "plonk";

const upload = () => new Promise((resolve) => setTimeout(resolve, 2500));

export default function Progress() {
  const [busy, setBusy] = useState(false);

  async function handlePress() {
    setBusy(true);
    // timeout: 0 keeps it on screen until we dismiss it.
    const id = toast("Uploading moodboard.zip…", { timeout: 0 });
    await upload();
    toast.dismiss(id);
    toast.success("Upload complete", { description: "8.4 MB, 24 files." });
    setBusy(false);
  }

  return (
    <Button loading={busy} onPress={handlePress}>
      Upload
    </Button>
  );
}
