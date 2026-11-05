"use client";

import { Kbd } from "plonk-ui";

const SHORTCUTS = [
  { action: "Search", keys: ["⌘", "K"] },
  { action: "New project", keys: ["⌘", "Shift", "N"] },
  { action: "Close panel", keys: ["Esc"] },
];

export default function Shortcuts() {
  return (
    <dl className="grid w-full max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-3">
      {SHORTCUTS.map(({ action, keys }) => (
        <div key={action} className="contents">
          <dt className="font-bold">{action}</dt>
          <dd className="flex gap-1">
            {keys.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
