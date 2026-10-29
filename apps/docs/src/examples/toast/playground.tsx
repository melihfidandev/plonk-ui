"use client";

import { Button, toast } from "plonk";
import { Playground } from "@/site/Playground";

const PLACEMENTS = [
  "bottom-end",
  "bottom",
  "bottom-start",
  "top-end",
  "top",
  "top-start",
] as const;

/**
 * Toast sayfasının oyun alanı. Sayfanın tek toast bölgesi burada açılır
 * (kuyruk ortak; her sergi bölge açsaydı her toast birkaç kez görünürdü).
 */
export default function ToastPlayground() {
  return (
    <Playground
      component="Toast"
      controls={{
        variant: {
          type: "enum",
          options: ["info", "success", "warning", "danger"],
          default: "info",
        },
        title: { type: "text", default: "Changes saved" },
        description: { type: "text", default: "" },
        action: { type: "boolean", default: false },
        timeout: {
          type: "enum",
          options: ["5000", "10000", "0"],
          default: "5000",
        },
        tape: { type: "boolean", default: true },
        placement: { type: "enum", options: PLACEMENTS, default: "bottom-end" },
      }}
      stage={({ placement }) => ({ toaster: true, toastPlacement: placement })}
      code={({
        variant,
        title,
        description,
        action,
        timeout,
        tape,
        placement,
      }) => {
        const options = [
          description && `description: "${description}"`,
          action && `action: { label: "Undo", onPress: undo }`,
          timeout !== "5000" && `timeout: ${timeout}`,
          !tape && "tape: false",
        ].filter(Boolean);
        const call = variant === "info" ? "toast" : `toast.${variant}`;
        const args = options.length
          ? `"${title}", {\n  ${options.join(",\n  ")},\n}`
          : `"${title}"`;
        const where =
          placement === "bottom-end"
            ? ""
            : `// <PlonkProvider toastPlacement="${placement}">\n`;
        return `${where}${call}(${args});`;
      }}
      render={({ variant, title, description, action, timeout, tape }) => (
        <Button
          onPress={() =>
            toast[variant](title || "Changes saved", {
              description: description || undefined,
              action: action
                ? { label: "Undo", onPress: () => toast("Change undone") }
                : undefined,
              timeout: Number(timeout),
              tape,
            })
          }
        >
          Show toast
        </Button>
      )}
    />
  );
}
