"use client";

import { use, type ReactNode } from "react";
import { useLocale } from "react-aria";
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  ComboBoxStateContext,
  FieldError,
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Text,
  type ComboBoxProps as AriaComboBoxProps,
  type ListBoxItemProps,
} from "react-aria-components";
import { cn } from "../../lib/cn";
import { useShakeOnInvalid } from "../../motion/jelly";
import {
  ItemContent,
  itemClass,
  ListPopover,
  textValueOf,
  type ItemContentProps,
} from "../collection/shared";
import type { FieldProps } from "../field/Field";
import { Chevron } from "../select/Select";

export interface ComboBoxProps<T extends object>
  extends
    Omit<AriaComboBoxProps<T>, "children" | "className" | "style">,
    FieldProps {
  children: ReactNode | ((item: T) => ReactNode);
  placeholder?: string;
  /** Hiçbir seçenek eşleşmediğinde gösterilen metin. */
  emptyMessage?: ReactNode;
  className?: string;
}

/**
 * Yazdıkça filtrelenen seçim kutusu. Eşleşen harfler seçeneklerde vurgulanır.
 */
export function ComboBox<T extends object>({
  label,
  description,
  error,
  children,
  placeholder,
  emptyMessage = "No results",
  className,
  ...props
}: ComboBoxProps<T>) {
  const invalid = error != null && error !== false && error !== "";
  const shakeRef = useShakeOnInvalid<HTMLDivElement>(invalid);

  return (
    <AriaComboBox
      // Sonuç kalmayınca listeyi kapatmak yerine "sonuç yok" mesajını göster.
      allowsEmptyCollection
      {...props}
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
      <Group
        ref={shakeRef}
        data-invalid={invalid || undefined}
        className="plonk-field flex h-11 items-center rounded-plonk-md pl-3"
      >
        <Input
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-base text-plonk-ink outline-none placeholder:text-plonk-ink-muted"
        />
        <AriaButton className="grid h-full w-10 shrink-0 cursor-pointer place-items-center text-plonk-ink outline-none">
          <Chevron />
        </AriaButton>
      </Group>
      {description != null && (
        <Text slot="description" className="text-sm text-plonk-ink-muted">
          {description}
        </Text>
      )}
      <FieldError className="plonk-field-error inline-flex w-fit items-center gap-1.5 rounded-plonk-sm bg-plonk-danger px-2 py-0.5 text-sm font-bold text-plonk-on-danger plonk-border">
        {typeof error === "boolean" ? null : error}
      </FieldError>
      <ListPopover>
        <ListBox
          className="outline-none"
          renderEmptyState={() => (
            <p className="px-2.5 py-2 text-sm text-plonk-ink-muted">
              {emptyMessage}
            </p>
          )}
        >
          {children}
        </ListBox>
      </ListPopover>
    </AriaComboBox>
  );
}

export interface ComboBoxItemProps<T>
  extends
    Omit<ListBoxItemProps<T>, "children" | "className" | "style">,
    ItemContentProps {
  children: ReactNode;
  className?: string;
}

export function ComboBoxItem<T extends object>({
  children,
  icon,
  description,
  textValue,
  className,
  ...props
}: ComboBoxItemProps<T>) {
  return (
    <ListBoxItem
      {...props}
      textValue={textValueOf(children, textValue)}
      className={cn(itemClass, className)}
    >
      {(render) => (
        <ItemContent icon={icon} description={description} render={render}>
          {typeof children === "string" ? (
            <Highlight text={children} />
          ) : (
            children
          )}
        </ItemContent>
      )}
    </ListBoxItem>
  );
}

/**
 * Yazılan metnin seçenekteki ilk eşleşmesini vurgular. Küçük harfe çevirme
 * provider'ın diline göre: dil verilmezse tarayıcınınki kullanılır ve İngilizce
 * bir tarayıcıda "İzmir" → "i̇zmir" (noktalı i) olur, "iz" eşleşmez.
 */
function Highlight({ text }: { text: string }) {
  const { locale } = useLocale();
  const query = use(ComboBoxStateContext)?.inputValue.trim() ?? "";
  const index = query
    ? text.toLocaleLowerCase(locale).indexOf(query.toLocaleLowerCase(locale))
    : -1;
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="plonk-mark">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}
