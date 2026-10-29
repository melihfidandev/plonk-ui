"use client";

import { Badge } from "plonk";

const DEPLOYS = [
  { name: "docs", status: "Live", variant: "success" },
  { name: "api", status: "Building", variant: "warning" },
  { name: "billing", status: "Failed", variant: "danger" },
] as const;

export default function Status() {
  return (
    <ul className="flex w-full max-w-xs flex-col gap-3">
      {DEPLOYS.map((deploy) => (
        <li key={deploy.name} className="flex items-center justify-between">
          <span className="font-bold">{deploy.name}</span>
          <Badge variant={deploy.variant} dot>
            {deploy.status}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
