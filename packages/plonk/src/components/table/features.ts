import {
  columnFilteringFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  constructFilterFn,
  constructSortFn,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  filterFn_inDateRange,
  globalFilteringFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_basic,
  sortFn_datetime,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

/** Plonk-specific column settings: `columnDef.meta`. */
export interface DataTableColumnMeta {
  /** Name in the column menu and the filter (when the header isn't text). */
  label?: string;
  /** `end` for numbers and dates: aligned to the end. */
  align?: "start" | "end";
  /**
   * A toolbar filter for this column. `select`: one of the values (collected from the
   * data when no options are given). `dateRange`: between two dates.
   */
  filter?:
    | { type: "select"; options?: { value: string; label?: ReactNode }[] }
    | { type: "dateRange" };
}

const text = (value: unknown) =>
  value == null ? "" : typeof value === "string" ? value : String(value);

/**
 * TanStack features used by the table. Text sorting and search are
 * language-aware: the built-in ones sort by character code (in Turkish "Ç" came after
 * Z) and lowercase regardless of language ("ışık" didn't find "Işık").
 */
export function createDataTableFeatures(locale: string) {
  const collator = new Intl.Collator(locale, {
    numeric: true,
    sensitivity: "base",
  });
  const localeText = constructSortFn({
    resolveDataValue: text,
    sort: (a: string, b: string) => collator.compare(a, b),
  });
  const includesText = constructFilterFn({
    filter: (dataValue: string, filterValue: string) =>
      dataValue.includes(filterValue),
    autoRemove: (value) => value == null || String(value).trim() === "",
    resolveFilterValue: (value) => text(value).trim().toLocaleLowerCase(locale),
    resolveDataValue: (value) => text(value).toLocaleLowerCase(locale),
  });

  return tableFeatures({
    rowSortingFeature,
    columnFilteringFeature,
    globalFilteringFeature,
    columnVisibilityFeature,
    columnSizingFeature,
    columnResizingFeature,
    rowSelectionFeature,
    filteredRowModel: createFilteredRowModel(),
    sortedRowModel: createSortedRowModel(),
    sortFns: {
      alphanumeric: localeText,
      text: localeText,
      datetime: sortFn_datetime,
      basic: sortFn_basic,
    },
    filterFns: {
      includesString: includesText,
      equalsString: filterFn_equalsString,
      inDateRange: filterFn_inDateRange,
    },
    columnMeta: {} as DataTableColumnMeta,
  });
}

export type DataTableFeatures = ReturnType<typeof createDataTableFeatures>;

/** A column definition. Usually written with `createDataTableColumns`. */
export type DataTableColumn<T extends RowData> = ColumnDef<
  DataTableFeatures,
  T,
  // Değer tipi sütuna göre değişir; dizide hepsi bir arada durur.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

/**
 * Helper for writing type-safe columns (TanStack's `createColumnHelper`, bound to
 * Plonk's features).
 *
 * ```ts
 * const col = createDataTableColumns<Invoice>();
 * const columns = col.columns([
 *   col.accessor("customer", { header: "Customer" }),
 *   col.accessor("amount", { header: "Amount", meta: { align: "end" } }),
 * ]);
 * ```
 */
export function createDataTableColumns<T extends RowData>() {
  return createColumnHelper<DataTableFeatures, T>();
}
