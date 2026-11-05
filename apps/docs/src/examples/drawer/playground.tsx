"use client";

import { Button, DialogTrigger, Drawer } from "plonk-ui";
import { Playground } from "@/site/Playground";

/** Drawer sayfasının oyun alanı. */
export default function DrawerPlayground() {
  return (
    <Playground
      component="Drawer"
      controls={{
        placement: {
          type: "enum",
          options: ["right", "left", "bottom"],
          default: "right",
        },
        title: { type: "text", default: "Notifications" },
        description: { type: "text", default: "" },
        hideClose: { type: "boolean", default: false },
        children: { type: "text", default: "You're all caught up." },
      }}
      wrapCode={(jsx, indent) =>
        `<DialogTrigger>\n  <Button>Open drawer</Button>\n${indent(jsx)}\n</DialogTrigger>`
      }
      render={({ title, description, children, ...rest }) => (
        <DialogTrigger>
          <Button>Open drawer</Button>
          <Drawer
            title={title || undefined}
            aria-label={title ? undefined : "Notifications"}
            description={description || undefined}
            {...rest}
          >
            {children || undefined}
          </Drawer>
        </DialogTrigger>
      )}
    />
  );
}
