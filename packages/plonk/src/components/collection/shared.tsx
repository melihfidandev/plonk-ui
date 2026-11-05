import type { ReactNode } from "react";
import {
  Header,
  Keyboard,
  Popover,
  Separator,
  Text,
  type PopoverProps,
} from "react-aria-components";
import { cn } from "../../lib/cn";

/** The part of Menu and ListBox option state that we need. */
interface ItemRenderProps {
  selectionMode: "none" | "single" | "multiple";
}

/** The popup of Menu, Select and ComboBox. Options come in one after another. */
export function ListPopover({
  className,
  offset = 8,
  ...props
}: Omit<PopoverProps, "className"> & { className?: string }) {
  return (
    <Popover
      {...props}
      offset={offset}
      className={cn(
        "plonk-popover plonk-list max-h-80 min-w-(--trigger-width) overflow-y-auto rounded-plonk-md bg-plonk-surface p-1.5 text-plonk-ink plonk-shadow outline-none plonk-border",
        className,
      )}
    />
  );
}

/** Classes of an option row. Focus and selected colors come from the personality. */
export const itemClass =
  "plonk-item relative flex cursor-pointer items-center gap-2.5 rounded-plonk-sm px-2.5 py-2 text-[0.95rem] outline-none select-none data-disabled:cursor-not-allowed";

export interface ItemContentProps {
  /** Leading icon. Hidden from screen readers. */
  icon?: ReactNode;
  /** Small description under the label. */
  description?: ReactNode;
  /** Keyboard shortcut on the right, e.g. "⌘E". */
  shortcut?: string;
}

/** The inside of an option row: icon, label, description, shortcut and check mark. */
export function ItemContent({
  icon,
  description,
  shortcut,
  children,
  render,
}: ItemContentProps & { children: ReactNode; render: ItemRenderProps }) {
  return (
    <>
      {icon && (
        <span
          aria-hidden="true"
          className="plonk-item-icon inline-flex shrink-0 [&>svg]:size-[1.1em]"
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <Text slot="label" className="block truncate font-semibold">
          {children}
        </Text>
        {description != null && (
          <Text
            slot="description"
            className="plonk-item-description block text-xs"
          >
            {description}
          </Text>
        )}
      </span>
      {shortcut && (
        <Keyboard className="plonk-item-shortcut shrink-0 font-plonk-mono text-xs">
          {shortcut}
        </Keyboard>
      )}
      {render.selectionMode !== "none" && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="plonk-item-check size-4 shrink-0"
        >
          <path
            className="plonk-check-mark"
            pathLength={1}
            d="M4.5 12.5 9.5 17.5 19.5 6.5"
          />
        </svg>
      )}
    </>
  );
}

export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <Header className="plonk-list-header px-2.5 pt-2.5 pb-1 text-xs font-extrabold tracking-wide text-plonk-ink-muted uppercase">
      {children}
    </Header>
  );
}

export function ListSeparator() {
  return (
    <Separator className="mx-1 my-1.5 border-t-(length:--plonk-border-width) border-plonk-ink/20" />
  );
}

/** Plain text for type-to-search when the option's label isn't text. */
export const textValueOf = (children: ReactNode, textValue?: string) =>
  textValue ?? (typeof children === "string" ? children : undefined);
