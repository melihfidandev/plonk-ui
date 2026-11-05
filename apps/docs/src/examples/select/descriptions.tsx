"use client";

import { Select, SelectItem } from "plonk-ui";

export default function Descriptions() {
  return (
    <Select
      className="w-full max-w-xs"
      label="Plan"
      defaultValue="pro"
      description="You can change plans at any time."
    >
      <SelectItem id="free" description="1 project, 3 members">
        Free
      </SelectItem>
      <SelectItem id="pro" description="Unlimited projects, 10 members">
        Pro
      </SelectItem>
      <SelectItem id="team" description="Everything unlimited">
        Team
      </SelectItem>
      <SelectItem id="enterprise" description="Talk to sales" isDisabled>
        Enterprise
      </SelectItem>
    </Select>
  );
}
