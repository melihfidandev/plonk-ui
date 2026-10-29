"use client";

import { useState } from "react";
import { Button, Card } from "plonk";

export default function Closable() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <Button variant="neutral" onPress={() => setOpen(true)}>
        Bring the tip back
      </Button>
    );
  }

  return (
    <Card
      className="w-full max-w-xs"
      title="Tip"
      onClose={() => setOpen(false)}
      closeLabel="Dismiss tip"
    >
      Press ⌘K anywhere to jump to a page.
    </Card>
  );
}
