"use client";

import { Button, Kbd, Tooltip, TooltipTrigger } from "plonk";

export default function Shortcut() {
  return (
    <TooltipTrigger>
      <Button variant="ghost">Search</Button>
      <Tooltip placement="bottom">
        <span className="flex items-center gap-2">
          Open search <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </Tooltip>
    </TooltipTrigger>
  );
}
