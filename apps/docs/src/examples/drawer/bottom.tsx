"use client";

import { Button, DialogTrigger, Drawer } from "plonk";

const TARGETS = ["Copy link", "Email", "Slack", "Download PDF"];

export default function Bottom() {
  return (
    <DialogTrigger>
      <Button>Share</Button>
      <Drawer placement="bottom" title="Share “Spring launch”">
        {({ close }) => (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TARGETS.map((target) => (
              <Button key={target} variant="neutral" onPress={close}>
                {target}
              </Button>
            ))}
          </div>
        )}
      </Drawer>
    </DialogTrigger>
  );
}
