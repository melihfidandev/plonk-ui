"use client";

import { Button } from "plonk";

export default function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="neutral">Neutral</Button>
      <Button variant="danger">Delete</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  );
}
