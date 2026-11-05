import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/cn";

export type KbdProps = ComponentPropsWithRef<"kbd">;

/** A keyboard key. Put them side by side for combinations: <Kbd>⌘</Kbd><Kbd>K</Kbd> */
export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      {...props}
      className={cn(
        "plonk-kbd inline-grid h-6 min-w-6 place-items-center rounded-plonk-sm bg-plonk-surface px-1.5 font-plonk-mono text-xs font-semibold text-plonk-ink plonk-border",
        className,
      )}
    />
  );
}
