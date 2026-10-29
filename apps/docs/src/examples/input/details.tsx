"use client";

import { Input } from "plonk";

export default function Details() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <Input
        label="Username"
        description="Letters, numbers and dashes."
        defaultValue="melih"
      />
      <Input
        label="Email"
        type="email"
        defaultValue="melih@"
        error="Enter a full email address."
      />
      <Input label="Workspace" defaultValue="plonk-studio" disabled />
    </div>
  );
}
