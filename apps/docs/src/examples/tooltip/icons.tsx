"use client";

import { Button, Tooltip, TooltipTrigger } from "plonk";

const ICONS = {
  Bold: "M7 5h6a3.5 3.5 0 0 1 0 7H7zm0 7h7a3.5 3.5 0 0 1 0 7H7z",
  Italic: "M10 5h8M6 19h8M14 5l-4 14",
  Link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
};

export default function Icons() {
  return (
    <div className="flex gap-2">
      {Object.entries(ICONS).map(([label, d]) => (
        <TooltipTrigger key={label}>
          <Button variant="neutral" size="sm" aria-label={label}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d={d} />
            </svg>
          </Button>
          <Tooltip>{label}</Tooltip>
        </TooltipTrigger>
      ))}
    </div>
  );
}
