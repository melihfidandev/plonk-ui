"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { CalendarDate } from "@internationalized/date";
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

const noop = () => () => {};
/** A fixed placeholder so React Aria doesn't read "today" during server rendering. */
const SERVER_PLACEHOLDER = /* @__PURE__ */ new CalendarDate(2000, 1, 1);

const useIsClient = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

/*
 * Sunucu ön-render'ı ve "şu an": React Aria değer yokken yer tutucu için
 * "bugün"ü okuyor (Date.now), her tarih parçası da ÖÖ/ÖS adını bulmak için
 * koşulsuz new Date() çağırıyor. Değer varsa da her render'da value.toDate()
 * çağırıyor; @internationalized/date bunu new Date() ile hesaplıyor. Sonuç
 * "şu an"a bağlı değil, ama Next 16 (Cache Components) ayırt edemiyor ve
 * ön-render'ı durduruyor. Bu yüzden sunucuda ve hidrasyonda alan değersiz,
 * sabit bir yer tutucuyla çizilir ve parçalar yerine aynı boyda boş alan
 * konur; tarayıcıya geçince alan gerçek değeriyle yeniden kurulur (`key`).
 */
function useHydrationProps<V>(props: {
  value?: V | null;
  defaultValue?: V | null;
  placeholderValue?: DateValue | null;
}) {
  const isClient = useIsClient();
  if (isClient) return { key: "client" };
  return {
    key: "server",
    value: undefined,
    defaultValue: undefined,
    placeholderValue: props.placeholderValue ?? SERVER_PLACEHOLDER,
  };
}

function Segments({
  slot,
  className,
}: {
  slot?: "start" | "end";
  className?: string;
}) {
  const isClient = useIsClient();
  if (!isClient) {
    return (
      <span aria-hidden="true" className={cn("plonk-date-input", className)}>
        {"\u00a0"}
      </span>
    );
  }
  return (
    <DateInput slot={slot} className={cn("plonk-date-input", className)}>
      {(segment) => <DateSegment segment={segment} className="plonk-segment" />}
    </DateInput>
  );
}

export interface DatePickerProps<T extends DateValue>
  extends
    Omit<AriaDatePickerProps<T>, "children" | "className" | "style">,
    FieldProps {
  className?: string;
}

/**
 * Date field: day, month and year are typed as separate segments or changed with the
 * arrow keys; a button opens the calendar. Format and first day of the week follow the
 * language (the provider's `locale`).
 */
export function DatePicker<T extends DateValue>({
  label,
  description,
  error,
  className,
  ...props
}: DatePickerProps<T>) {
  const invalid = hasError(error);
  const { key, ...hydration } = useHydrationProps(props);
  return (
    <AriaDatePicker
      key={key}
      {...props}
      {...(hydration as Partial<typeof props>)}
      isInvalid={invalid || props.isInvalid}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {({ isInvalid }) => (
        <>
          <FieldLabel label={label} required={props.isRequired} />
          <FieldGroup invalid={isInvalid}>
            <Segments />
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
  /** Preset ranges next to the calendar ("Last 7 days", "This month"…). */
  presets?: CalendarPreset[];
  className?: string;
}

/** A start and an end date. Pick two days in the calendar or one of the preset ranges. */
export function DateRangePicker<T extends DateValue>({
  label,
  description,
  error,
  presets,
  className,
  ...props
}: DateRangePickerProps<T>) {
  const invalid = hasError(error);
  const { key, ...hydration } = useHydrationProps(props);
  return (
    <AriaDateRangePicker
      key={key}
      {...props}
      {...(hydration as Partial<typeof props>)}
      isInvalid={invalid || props.isInvalid}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {({ isInvalid }) => (
        <>
          <FieldLabel label={label} required={props.isRequired} />
          <FieldGroup invalid={isInvalid}>
            <Segments slot="start" className="flex-none" />
            <span aria-hidden="true" className="text-plonk-ink-muted">
              –
            </span>
            <Segments slot="end" />
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

/** Field box. Shakes like a "no" when an error appears. */
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
