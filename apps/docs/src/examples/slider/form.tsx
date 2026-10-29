"use client";

import { useState, type FormEvent } from "react";
import { Button, Slider } from "plonk";

export default function Form() {
  const [sent, setSent] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSent(
      JSON.stringify({
        volume: data.get("volume"),
        hours: data.getAll("hours"),
      }),
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xs flex-col gap-6"
    >
      <Slider
        label="Volume"
        name="volume"
        defaultValue={60}
        valueBubble="active"
      />
      <Slider
        label="Working hours"
        name="hours"
        defaultValue={[9, 17]}
        min={0}
        max={24}
        minGap={1}
        formatValue={(h) => `${String(h).padStart(2, "0")}:00`}
      />
      <Button type="submit" className="self-start">
        Save
      </Button>
      <code className="empty:hidden">{sent}</code>
    </form>
  );
}
