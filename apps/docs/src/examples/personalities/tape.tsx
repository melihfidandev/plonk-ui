"use client";

import { Button, Card, toast } from "plonk-ui";

export default function Tape() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Card tape title="Pinned note" className="w-60">
        Cards have no tape unless you ask for it.
      </Card>
      <div className="flex flex-col gap-3">
        <Button onPress={() => toast("Taped to the screen")}>
          Toast with tape
        </Button>
        <Button
          variant="neutral"
          onPress={() => toast("No tape this time", { tape: false })}
        >
          Toast without tape
        </Button>
      </div>
    </div>
  );
}
