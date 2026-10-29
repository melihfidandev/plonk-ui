"use client";

import { Button, toast } from "plonk";

export default function Variants() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button
        variant="neutral"
        onPress={() => toast("New comment on “Spring launch”")}
      >
        Info
      </Button>
      <Button variant="neutral" onPress={() => toast.success("Invoice sent")}>
        Success
      </Button>
      <Button
        variant="neutral"
        onPress={() =>
          toast.warning("Storage almost full", {
            description: "You've used 92% of your 10 GB.",
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="neutral"
        onPress={() =>
          toast.danger("Payment failed", {
            description: "The card was declined.",
          })
        }
      >
        Danger
      </Button>
    </div>
  );
}
