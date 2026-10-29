"use client";

import { Card } from "plonk";
import { Playground } from "@/site/Playground";

/** Card sayfasının oyun alanı. */
export default function CardPlayground() {
  return (
    <Playground
      component="Card"
      controls={{
        title: { type: "text", default: "Weekly report" },
        description: { type: "text", default: "" },
        tilt: {
          type: "enum",
          options: ["none", "left", "right"],
          default: "none",
        },
        tape: { type: "boolean", default: false },
        children: {
          type: "text",
          default: "Signups are up 12% since the new onboarding shipped.",
        },
      }}
      render={({ title, description, tilt, tape, children }) => (
        <Card
          className="w-full max-w-xs"
          title={title || undefined}
          description={description || undefined}
          tilt={tilt === "none" ? undefined : tilt}
          tape={tape}
        >
          {children}
        </Card>
      )}
    />
  );
}
