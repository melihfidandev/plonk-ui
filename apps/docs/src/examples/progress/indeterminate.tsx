"use client";

import { Progress } from "plonk";

export default function Indeterminate() {
  return (
    <Progress
      className="w-full max-w-xs"
      label="Connecting to the printer"
      variant="secondary"
    />
  );
}
