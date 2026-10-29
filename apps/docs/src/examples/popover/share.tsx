"use client";

import { useState } from "react";
import { Button, DialogTrigger, Input, Popover } from "plonk";

const LINK = "https://plonk.dev/s/a8f3";

export default function Share() {
  const [copied, setCopied] = useState(false);

  return (
    <DialogTrigger onOpenChange={() => setCopied(false)}>
      <Button variant="secondary">Share</Button>
      <Popover title="Share link">
        {({ close }) => (
          <div className="flex flex-col gap-3">
            <Input aria-label="Link" defaultValue={LINK} readOnly />
            <Button
              size="sm"
              className="self-start"
              onPress={async () => {
                await navigator.clipboard?.writeText(LINK);
                setCopied(true);
                setTimeout(close, 700);
              }}
            >
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </div>
        )}
      </Popover>
    </DialogTrigger>
  );
}
