"use client";

import { useState } from "react";
import { Button, Radio, RadioGroup } from "plonk-ui";

export default function Controlled() {
  // null: controlled, nothing selected.
  const [size, setSize] = useState<string | null>("md");

  return (
    <div className="flex flex-col items-start gap-4">
      <RadioGroup
        label="Card size"
        orientation="horizontal"
        value={size}
        onValueChange={setSize}
      >
        <Radio value="sm" label="Small" />
        <Radio value="md" label="Medium" />
        <Radio value="lg" label="Large" />
      </RadioGroup>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="neutral" onPress={() => setSize(null)}>
          Clear
        </Button>
        <span className="font-bold">Selected: {size ?? "nothing"}</span>
      </div>
    </div>
  );
}
