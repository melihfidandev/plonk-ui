"use client";

import { Button } from "plonk";

const Plus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function Icons() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button iconStart={<Plus />}>New project</Button>
      <Button variant="neutral" iconEnd={<Arrow />}>
        Continue
      </Button>
      <Button variant="ghost" aria-label="Add item" iconStart={<Plus />} />
    </div>
  );
}
