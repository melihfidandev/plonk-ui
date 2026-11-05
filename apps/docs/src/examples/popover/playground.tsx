"use client";

import { Button, DialogTrigger, Popover } from "plonk-ui";
import { Playground } from "@/site/Playground";

/** Popover sayfasının oyun alanı. */
export default function PopoverPlayground() {
  return (
    <Playground
      component="Popover"
      controls={{
        placement: {
          type: "enum",
          options: ["bottom", "top", "start", "end"],
          default: "bottom",
        },
        title: { type: "text", default: "Pro plan" },
        children: {
          type: "text",
          default: "10 team members and unlimited projects.",
        },
      }}
      wrapCode={(jsx, indent) =>
        `<DialogTrigger>\n  <Button>Plan details</Button>\n${indent(jsx)}\n</DialogTrigger>`
      }
      render={({ title, children, placement }) => (
        <DialogTrigger>
          <Button variant="secondary">Plan details</Button>
          <Popover
            placement={placement}
            title={title || undefined}
            aria-label={title ? undefined : "Pro plan"}
          >
            {children}
          </Popover>
        </DialogTrigger>
      )}
    />
  );
}
