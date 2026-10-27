"use client";

import type { ReactNode } from "react";
import {
  Button as AriaButton,
  DateInput,
  DatePicker as AriaDatePicker,
  DateRangePicker as AriaDateRangePicker,
  DateSegment,
  Dialog,
  FieldError,
  Group,
  Label,
  Popover,
  Text,
  type DatePickerProps as AriaDatePickerProps,
  type DateRangePickerProps as AriaDateRangePickerProps,
  type DateValue,
} from "react-aria-components";
import { cn } from "../../lib/cn";
import { useShakeOnInvalid } from "../../motion/jelly";
import type { FieldProps } from "../field/Field";
import { Calendar, RangeCalendar, type CalendarPreset } from "./Calendar";

export interface DatePickerProps<T extends DateValue>
  extends
    Omit<AriaDatePickerProps<T>, "children" | "className" | "style">,
    FieldProps {
  className?: string;
}

/**
 * Tarih alanı: gün, ay ve yıl ayrı parçalar halinde yazılır ya da ok
 * tuşlarıyla değiştirilir; düğmeyle takvim açılır. Biçim ve haftanın ilk
 * günü dile göre (provider'ın `locale`'i).
 */
export function DatePicker<T extends DateValue>({
  label,
  description,
  error,
  className,
  ...props
}: DatePickerProps<T>) {
  const invalid = hasError(error);
  return (
    <AriaDatePicker
      {...props}
      isInvalid={invalid || props.isInvalid}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {({ isInvalid }) => (
        <>
          <FieldLabel label={label} required={props.isRequired} />
          <FieldGroup invalid={isInvalid}>
            <DateInput className="plonk-date-input">
              {(segment) => (
                <DateSegment segment={segment} className="plonk-segment" />
              )}
            </DateInput>
            <CalendarButton />
          </FieldGroup>
          <FieldFooter description={description} error={error} />
          <CalendarPopover>
            <Calendar />
          </CalendarPopover>
        </>
      )}
    </AriaDatePicker>
  );
}

export interface DateRangePickerProps<T extends DateValue>
  extends
    Omit<AriaDateRangePickerProps<T>, "children" | "className" | "style">,
    FieldProps {
  /** Takvimin yanında hazır aralıklar ("Son 7 gün", "Bu ay"…). */
  presets?: CalendarPreset[];
  className?: string;
}

/** Başlangıç ve bitiş tarihi. Takvimde iki gün seçilir ya da hazır aralıklardan biri. */
export function DateRangePicker<T extends DateValue>({
  label,
  description,
  error,
  presets,
  className,
  ...props
}: DateRangePickerProps<T>) {
  const invalid = hasError(error);
  return (
    <AriaDateRangePicker
      {...props}
      isInvalid={invalid || props.isInvalid}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {({ isInvalid }) => (
        <>
          <FieldLabel label={label} required={props.isRequired} />
          <FieldGroup invalid={isInvalid}>
            <DateInput slot="start" className="plonk-date-input flex-none">
              {(segment) => (
                <DateSegment segment={segment} className="plonk-segment" />
              )}
            </DateInput>
            <span aria-hidden="true" className="text-plonk-ink-muted">
              –
            </span>
            <DateInput slot="end" className="plonk-date-input">
              {(segment) => (
                <DateSegment segment={segment} className="plonk-segment" />
              )}
            </DateInput>
            <CalendarButton />
          </FieldGroup>
          <FieldFooter description={description} error={error} />
          <CalendarPopover>
            <RangeCalendar presets={presets} />
          </CalendarPopover>
        </>
      )}
    </AriaDateRangePicker>
  );
}

const hasError = (error: ReactNode) =>
  error != null && error !== false && error !== "";

function FieldLabel({
  label,
  required,
}: {
  label?: ReactNode;
  required?: boolean;
}) {
  if (label == null) return null;
  return (
    <Label className="text-sm font-bold text-plonk-ink">
      {label}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-plonk-ink-muted">
          *
        </span>
      )}
    </Label>
  );
}

/** Alan kutusu. Hata gelince "hayır" der gibi sallanır. */
function FieldGroup({
  invalid,
  children,
}: {
  invalid: boolean;
  children: ReactNode;
}) {
  const ref = useShakeOnInvalid<HTMLDivElement>(invalid);
  return (
    <Group
      ref={ref}
      data-invalid={invalid || undefined}
      className="plonk-field flex h-11 w-full min-w-0 items-center gap-1.5 rounded-plonk-md pr-1.5 pl-3 text-base text-plonk-ink"
    >
      {children}
    </Group>
  );
}

function FieldFooter({
  description,
  error,
}: {
  description?: ReactNode;
  error?: ReactNode;
}) {
  return (
    <>
      {description != null && (
        <Text slot="description" className="text-sm text-plonk-ink-muted">
          {description}
        </Text>
      )}
      <FieldError className="plonk-field-error inline-flex w-fit items-center gap-1.5 rounded-plonk-sm bg-plonk-danger px-2 py-0.5 text-sm font-bold text-plonk-on-danger plonk-border">
        {typeof error === "boolean" ? null : error}
      </FieldError>
    </>
  );
}

function CalendarButton() {
  return (
    <AriaButton className="plonk-cal-trigger ml-auto grid size-8 shrink-0 cursor-pointer place-items-center rounded-plonk-sm outline-none">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-[1.15rem]"
      >
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </svg>
    </AriaButton>
  );
}

function CalendarPopover({ children }: { children: ReactNode }) {
  return (
    <Popover
      placement="bottom start"
      offset={10}
      className="plonk-popover plonk-cal-popover outline-none"
    >
      <Dialog className="outline-none">{children}</Dialog>
    </Popover>
  );
}
