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

/** Menu ve ListBox seçeneklerinin ortak durum bilgisinden ihtiyacımız olan kısım. */
interface ItemRenderProps {
  selectionMode: "none" | "single" | "multiple";
}

/** Menu, Select ve ComboBox'ın açılan kutusu. Seçenekler sırayla gelir. */
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

/** Seçenek satırının sınıfları. Odak ve seçili hâlin rengi kişilikten gelir. */
export const itemClass =
  "plonk-item relative flex cursor-pointer items-center gap-2.5 rounded-plonk-sm px-2.5 py-2 text-[0.95rem] outline-none select-none data-disabled:cursor-not-allowed";

export interface ItemContentProps {
  /** Baştaki ikon. Ekran okuyuculardan gizlenir. */
  icon?: ReactNode;
  /** Etiketin altındaki küçük açıklama. */
  description?: ReactNode;
  /** Sağdaki klavye kısayolu, ör. "⌘E". */
  shortcut?: string;
}

/** Bir seçenek satırının içi: ikon, etiket, açıklama, kısayol ve seçili işareti. */
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

/** Seçeneğin etiketi metin değilse yazarak arama için düz metin gerekir. */
export const textValueOf = (children: ReactNode, textValue?: string) =>
  textValue ?? (typeof children === "string" ? children : undefined);
