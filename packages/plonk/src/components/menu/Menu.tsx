"use client";

import type { ReactNode } from "react";
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  type MenuTriggerProps,
  type PopoverProps,
} from "react-aria-components";
import { cn } from "../../lib/cn";
import {
  ItemContent,
  itemClass,
  ListPopover,
  ListSeparator,
  SectionHeader,
  textValueOf,
  type ItemContentProps,
} from "../collection/shared";

export { MenuTrigger, type MenuTriggerProps };

export interface MenuProps<T> extends Omit<
  AriaMenuProps<T>,
  "className" | "style"
> {
  placement?: PopoverProps["placement"];
  className?: string;
}

/**
 * Eylem menüsü. `MenuTrigger` içinde bir `Button` ile kullanılır. Ok tuşları,
 * yazarak arama ve Esc React Aria'dan gelir.
 */
export function Menu<T extends object>({
  placement = "bottom start",
  className,
  ...props
}: MenuProps<T>) {
  return (
    <ListPopover placement={placement}>
      <AriaMenu {...props} className={cn("outline-none", className)} />
    </ListPopover>
  );
}

export interface MenuItemProps<T>
  extends
    Omit<AriaMenuItemProps<T>, "children" | "className" | "style">,
    ItemContentProps {
  children: ReactNode;
  /** `danger`: silme gibi yıkıcı eylemler. */
  variant?: "default" | "danger";
  className?: string;
}

export function MenuItem<T extends object>({
  children,
  icon,
  description,
  shortcut,
  variant = "default",
  textValue,
  className,
  ...props
}: MenuItemProps<T>) {
  return (
    <AriaMenuItem
      {...props}
      textValue={textValueOf(children, textValue)}
      data-variant={variant}
      className={cn(itemClass, className)}
    >
      {(render) => (
        <ItemContent
          icon={icon}
          description={description}
          shortcut={shortcut}
          render={render}
        >
          {children}
        </ItemContent>
      )}
    </AriaMenuItem>
  );
}

export function MenuSection({
  title,
  children,
}: {
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AriaMenuSection>
      {title != null && <SectionHeader>{title}</SectionHeader>}
      {children}
    </AriaMenuSection>
  );
}

export const MenuSeparator = ListSeparator;
