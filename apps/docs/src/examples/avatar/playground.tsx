"use client";

import { Avatar } from "plonk-ui";
import { Playground } from "@/site/Playground";

/** Avatar sayfasının oyun alanı. */
export default function AvatarPlayground() {
  return (
    <Playground
      component="Avatar"
      controls={{
        name: { type: "text", default: "Ada Lovelace" },
        size: { type: "enum", options: ["sm", "md", "lg"], default: "md" },
        src: {
          type: "enum",
          options: ["none", "/avatars/ada.svg"],
          default: "none",
        },
      }}
      render={({ name, size, src }) => (
        <Avatar
          name={name || "?"}
          size={size}
          src={src === "none" ? undefined : src}
        />
      )}
    />
  );
}
