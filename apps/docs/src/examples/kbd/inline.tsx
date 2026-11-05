"use client";

import { Kbd } from "plonk-ui";

export default function Inline() {
  return (
    <p className="max-w-xs leading-8">
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette, then{" "}
      <Kbd>↵</Kbd> to run the highlighted command.
    </p>
  );
}
