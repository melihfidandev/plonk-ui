"use client";

import type { ReactNode } from "react";
import {
  Button as AriaButton,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Select as AriaSelect,
  SelectValue,
  Text,
  type ListBoxItemProps,
  type SelectProps as AriaSelectProps,
} from "react-aria-components";
import { cn } from "../../lib/cn";
import { useShakeOnInvalid } from "../../motion/jelly";
import {
  ItemContent,
  itemClass,
  ListPopover,
  SectionHeader,
  textValueOf,
  type ItemContentProps,
} from "../collection/shared";
import type { FieldProps } from "../field/Field";

export interface SelectProps<T extends object>
  extends
    Omit<AriaSelectProps<T>, "children" | "className" | "style">,
    FieldProps {
  /** Options: `SelectItem`s, or a render function together with `items`. */
  children: ReactNode | ((item: T) => ReactNode);
  items?: Iterable<T>;
  className?: string;
}

/**
 * A dropdown select. Opens from the keyboard, arrow keys and type-to-search work;
 * submitted with a form through a hidden `<select>` (React Aria).
 */
export function Select<T extends object>({
  label,
  description,
  error,
  items,
  children,
  placeholder,
  className,
  ...props
}: SelectProps<T>) {
  const invalid = error != null && error !== false && error !== "";
  const shakeRef = useShakeOnInvalid<HTMLButtonElement>(invalid);

  return (
    <AriaSelect
      {...props}
      placeholder={placeholder}
      isInvalid={invalid || props.isInvalid}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {label != null && (
        <Label className="text-sm font-bold text-plonk-ink">
          {label}
          {props.isRequired && (
            <span aria-hidden="true" className="ml-0.5 text-plonk-ink-muted">
              *
            </span>
          )}
        </Label>
      )}
      <AriaButton
        ref={shakeRef}
        data-invalid={invalid || undefined}
        className="plonk-field flex h-11 w-full cursor-pointer items-center gap-2 rounded-plonk-md px-3 text-left text-base text-plonk-ink outline-none data-disabled:cursor-not-allowed"
      >
        {/*
          Seçenek açıklamasıyla birlikte kopyalanırsa tek satırlık alana sığmaz;
          burada sadece adı (textValue) gösterilir.
        */}
        <SelectValue className="min-w-0 flex-1 truncate data-placeholder:text-plonk-ink-muted">
          {({ isPlaceholder, selectedText, defaultChildren }) =>
            isPlaceholder ? defaultChildren : selectedText
          }
        </SelectValue>
        <Chevron />
      </AriaButton>
      {description != null && (
        <Text slot="description" className="text-sm text-plonk-ink-muted">
          {description}
        </Text>
      )}
      <FieldError className="plonk-field-error inline-flex w-fit items-center gap-1.5 rounded-plonk-sm bg-plonk-danger px-2 py-0.5 text-sm font-bold text-plonk-on-danger plonk-border">
        {typeof error === "boolean" ? null : error}
      </FieldError>
      <ListPopover>
        <ListBox items={items} className="outline-none">
          {children}
        </ListBox>
      </ListPopover>
    </AriaSelect>
  );
}

export interface SelectItemProps<T>
  extends
    Omit<ListBoxItemProps<T>, "children" | "className" | "style">,
    ItemContentProps {
  children: ReactNode;
  className?: string;
}

/** An option. A tick is drawn next to the selected one. */
export function SelectItem<T extends object>({
  children,
  icon,
  description,
  textValue,
  className,
  ...props
}: SelectItemProps<T>) {
  return (
    <ListBoxItem
      {...props}
      textValue={textValueOf(children, textValue)}
      className={cn(itemClass, className)}
    >
      {(render) => (
        <ItemContent icon={icon} description={description} render={render}>
          {children}
        </ItemContent>
      )}
    </ListBoxItem>
  );
}

export function SelectSection({
  title,
  children,
}: {
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <ListBoxSection>
      {title != null && <SectionHeader>{title}</SectionHeader>}
      {children}
    </ListBoxSection>
  );
}

export function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="plonk-chevron size-4 shrink-0"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
