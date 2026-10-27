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

/** Sütunun Plonk'a özel ayarları: `columnDef.meta`. */
export interface DataTableColumnMeta {
  /** Sütun menüsündeki ve filtredeki adı (başlık metin değilse). */
  label?: string;
  /** Sayılar ve tarihler için `end`: sağa yaslanır. */
  align?: "start" | "end";
  /**
   * Araç çubuğunda bu sütun için filtre. `select`: değerlerden biri (seçenekler
   * verilmezse veriden toplanır). `dateRange`: iki tarih arası.
   */
  filter?:
    | { type: "select"; options?: { value: string; label?: ReactNode }[] }
    | { type: "dateRange" };
}

const text = (value: unknown) =>
  value == null ? "" : typeof value === "string" ? value : String(value);

/**
 * Tablonun kullandığı TanStack özellikleri. Metin sıralama ve arama dile
 * duyarlı: yerleşik olanlar karakter koduyla sıralıyor (Türkçede "Ç" Z'den
 * sonra geliyordu) ve dilden bağımsız küçük harfe çeviriyor ("ışık" "Işık"ı
 * bulmuyordu).
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

/** Bir sütun tanımı. Genelde `createDataTableColumns` ile yazılır. */
export type DataTableColumn<T extends RowData> = ColumnDef<
  DataTableFeatures,
  T,
  // Değer tipi sütuna göre değişir; dizide hepsi bir arada durur.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

/**
 * Sütunları tip güvenli yazmak için yardımcı (TanStack'in `createColumnHelper`'ı,
 * Plonk'un özellikleriyle bağlı).
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
