"use client";

import { Button, Dialog, DialogTrigger } from "plonk";
import { Playground } from "@/site/Playground";

/** Dialog sayfasının oyun alanı. */
export default function DialogPlayground() {
  return (
    <Playground
      component="Dialog"
      controls={{
        title: { type: "text", default: "Rename project" },
        description: {
          type: "text",
          default: "Everyone on the team sees the new name.",
        },
        size: { type: "enum", options: ["sm", "md", "lg"], default: "md" },
        role: {
          type: "enum",
          options: ["dialog", "alertdialog"],
          default: "dialog",
        },
        hideClose: { type: "boolean", default: false },
        children: { type: "text", default: "The old link keeps working." },
      }}
      extraCode={[
        "footer={({ close }) => <Button onPress={close}>Done</Button>}",
      ]}
      wrapCode={(jsx, indent) =>
        `<DialogTrigger>\n  <Button>Open dialog</Button>\n${indent(jsx)}\n</DialogTrigger>`
      }
      render={({ title, description, children, ...rest }) => (
        <DialogTrigger>
          <Button>Open dialog</Button>
          <Dialog
            title={title || undefined}
            aria-label={title ? undefined : "Rename project"}
            description={description || undefined}
            footer={({ close }) => <Button onPress={close}>Done</Button>}
            {...rest}
          >
            {children || undefined}
          </Dialog>
        </DialogTrigger>
      )}
    />
  );
}
