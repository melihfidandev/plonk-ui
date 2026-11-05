"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useLocale } from "react-aria";
import {
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type Header,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { getLocalTimeZone, type CalendarDate } from "@internationalized/date";
import { cn } from "../../lib/cn";
import { playJelly } from "../../motion/jelly";
import { useTapeDefault } from "../../provider/PlonkProvider";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { DateRangePicker } from "../date-picker";
import { Input } from "../input";
import { Menu, MenuItem, MenuTrigger } from "../menu";
import { Select, SelectItem } from "../select";
import {
  createDataTableFeatures,
  type DataTableColumn,
  type DataTableColumnMeta,
  type DataTableFeatures,
} from "./features";

type F = DataTableFeatures;

export interface DataTableMessages {
  search: string;
  columns: string;
  all: string;
  clearFilters: string;
  noResults: string;
  loading: string;
  /** The word in "3 selected"; the number is shown separately. */
  selected: string;
  clearSelection: string;
  selectAll: string;
  selectRow: string;
  rowCount: (shown: number, total: number) => string;
}

const MESSAGES: DataTableMessages = {
  search: "Search…",
  columns: "Columns",
  all: "All",
  clearFilters: "Clear filters",
  noResults: "No results",
  loading: "Loading…",
  selected: "selected",
  clearSelection: "Clear selection",
  selectAll: "Select all rows",
  selectRow: "Select row",
  rowCount: (shown, total) =>
    shown === total ? `${total} rows` : `${shown} of ${total} rows`,
};

export interface DataTableBulkContext<T> {
  /** Data of the selected rows that are loaded. */
  rows: T[];
  /** Ids of the selected rows (including ones not loaded). */
  ids: string[];
  clear: () => void;
}

export interface DataTableProps<T extends RowData> {
  data: T[];
  columns: DataTableColumn<T>[];
  /** A stable id for the row. Selection and reorder motion rely on it. */
  getRowId: (row: T) => string;
  /** Selection boxes at the start of rows, and the bulk action bar. */
  selectable?: boolean;
  /** Actions shown in the bar at the bottom while there is a selection. */
  bulkActions?: (ctx: DataTableBulkContext<T>) => ReactNode;
  /** The tape on the bulk action bar. Defaults to the provider's `tape` setting. */
  bulkBarTape?: boolean;
  /** Search box (across all text columns). On by default. */
  searchable?: boolean;
  /** Show/hide columns menu. On by default. */
  columnMenu?: boolean;
  /** Content added to the end of the toolbar (e.g. a "New" button). */
  toolbar?: ReactNode;
  /** Height of the scroll area. Rows are virtual: thousands scroll smoothly too. */
  height?: number | string;
  /** Row height (px). */
  rowHeight?: number;
  isLoading?: boolean;
  /** Content shown when empty. */
  emptyState?: ReactNode;
  /** When the server sorts: the table only reports the state. */
  manualSorting?: boolean;
  /** When the server filters. */
  manualFiltering?: boolean;
  /** Total row count on the server (for the counter). */
  rowCount?: number;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  columnVisibility?: ColumnVisibilityState;
  onColumnVisibilityChange?: (visibility: ColumnVisibilityState) => void;
  messages?: Partial<DataTableMessages>;
  "aria-label"?: string;
  className?: string;
}

/** Controlled state: uses the value when given, otherwise its own state. */
function useControllable<V>(
  value: V | undefined,
  onChange: ((v: V) => void) | undefined,
  initial: V,
) {
  const [inner, setInner] = useState(initial);
  const current = value ?? inner;
  const set = (updater: Updater<V>) => {
    const next =
      typeof updater === "function"
        ? (updater as (old: V) => V)(current)
        : updater;
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  return [current, set] as const;
}

const SELECT_ID = "__select";

/**
 * Data table: sorting (multi-sort with Shift), search and column filters, hiding and
 * resizing columns, row selection and bulk actions, virtual scrolling. The engine is
 * TanStack Table + Virtual; the look and motion are Plonk's.
 *
 * In Sticker sorted rows lean as they slide to their new places, selected rows are
 * painted with a highlighter, and the action bar sticks on from below with tape. In
 * Retro rows appear in steps, selection is inverted and the bar is a status bar.
 */
export function DataTable<T extends RowData>({
  data,
  columns,
  getRowId,
  selectable = false,
  bulkActions,
  bulkBarTape,
  searchable = true,
  columnMenu = true,
  toolbar,
  height = "28rem",
  rowHeight = 44,
  isLoading = false,
  emptyState,
  manualSorting,
  manualFiltering,
  rowCount,
  messages: customMessages,
  "aria-label": ariaLabel,
  className,
  ...state
}: DataTableProps<T>) {
  const messages = { ...MESSAGES, ...customMessages };
  const { locale } = useLocale();
  const features = useMemo(() => createDataTableFeatures(locale), [locale]);
  const tapeDefault = useTapeDefault();

  const [sorting, setSorting] = useControllable(
    state.sorting,
    state.onSortingChange,
    [],
  );
  const [globalFilter, setGlobalFilter] = useControllable(
    state.globalFilter,
    state.onGlobalFilterChange,
    "",
  );
  const [columnFilters, setColumnFilters] = useControllable(
    state.columnFilters,
    state.onColumnFiltersChange,
    [],
  );
  const [rowSelection, setRowSelection] = useControllable(
    state.rowSelection,
    state.onRowSelectionChange,
    {},
  );
  const [columnVisibility, setColumnVisibility] = useControllable(
    state.columnVisibility,
    state.onColumnVisibilityChange,
    {},
  );

  const allColumns = useMemo<DataTableColumn<T>[]>(
    () =>
      selectable
        ? [selectColumn<T>(messages.selectAll, messages.selectRow), ...columns]
        : columns,
    // Mesajlar sadece etiket; her render'da yeni nesne olmasın diye metinlere bağlı.
    [selectable, columns, messages.selectAll, messages.selectRow],
  );

  const table = useTable({
    features,
    columns: allColumns,
    data,
    getRowId: (row: T) => getRowId(row),
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: "includesString",
    getColumnCanGlobalFilter: (column) => column.id !== SELECT_ID,
    columnResizeMode: "onChange",
    enableMultiSort: true,
    // Her sütunda aynı döngü: artan → azalan → sırasız (TanStack sayılarda azalandan başlıyordu).
    sortDescFirst: false,
    manualSorting,
    manualFiltering,
    defaultColumn: { size: 160, minSize: 64, maxSize: 640 },
  });

  const rows = table.getRowModel().rows;
  const leafColumns = table.getVisibleLeafColumns();

  // ---------- Sanal kaydırma ----------
  const scroller = useRef<HTMLDivElement>(null);
  // TanStack Virtual React Compiler'la memoize edilemiyor (bilinen durum);
  // bileşen derleyici optimizasyonu olmadan çalışır.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scroller.current,
    estimateSize: () => rowHeight,
    getItemKey: (index) => rows[index]?.id ?? index,
    overscan: 8,
    // jsdom ve ilk render: ölçü gelene kadar makul bir pencere.
    initialRect: { width: 960, height: 480 },
  });
  const items = virtualizer.getVirtualItems();
  const padTop = items[0]?.start ?? 0;
  const padBottom = items.length
    ? virtualizer.getTotalSize() - (items.at(-1)?.end ?? 0)
    : 0;

  // ---------- Sıralama / süzme hareketi ----------
  const tbody = useRef<HTMLTableSectionElement>(null);
  useReorderMotion(
    tbody,
    scroller,
    JSON.stringify([sorting, globalFilter, columnFilters, leafColumns.length]),
    data,
  );

  // Silinen satırların seçimi kendiliğinden temizlenmez (TanStack): ayıkla.
  const ids = useMemo(() => new Set(data.map(getRowId)), [data, getRowId]);
  useLayoutEffect(() => {
    if (manualFiltering) return;
    const stale = Object.keys(rowSelection).filter((id) => !ids.has(id));
    if (stale.length) {
      const next = { ...rowSelection };
      stale.forEach((id) => delete next[id]);
      setRowSelection(next);
    }
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id],
  );
  const clearSelection = () => setRowSelection({});
  const total = rowCount ?? data.length;
  const filtersActive = columnFilters.length > 0 || globalFilter !== "";

  return (
    <div className={cn("plonk-table flex min-w-0 flex-col gap-3", className)}>
      {(searchable || columnMenu || toolbar || leafColumns.some(hasFilter)) && (
        <div className="plonk-table-toolbar flex flex-wrap items-end gap-3">
          {searchable && (
            <Input
              type="search"
              aria-label={messages.search}
              placeholder={messages.search}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="min-w-48 flex-1"
              iconStart={<SearchIcon />}
            />
          )}
          {table
            .getAllLeafColumns()
            .filter(hasFilter)
            .map((column) => (
              <ColumnFilter
                key={column.id}
                column={column}
                data={table.getCoreRowModel().rows}
                messages={messages}
              />
            ))}
          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              className="h-11"
              onPress={() => {
                setColumnFilters([]);
                setGlobalFilter("");
              }}
            >
              {messages.clearFilters}
            </Button>
          )}
          <span className="plonk-table-count ml-auto self-end pb-3 text-sm font-semibold text-plonk-ink-muted">
            {messages.rowCount(rows.length, total)}
          </span>
          {columnMenu && (
            <MenuTrigger>
              <Button variant="neutral" size="sm" className="h-11">
                {messages.columns}
              </Button>
              <Menu
                placement="bottom end"
                selectionMode="multiple"
                selectedKeys={table
                  .getAllLeafColumns()
                  .filter((c) => c.getIsVisible())
                  .map((c) => c.id)}
                onSelectionChange={(keys) => {
                  const shown = keys === "all" ? null : new Set(keys);
                  const next: ColumnVisibilityState = {};
                  for (const c of table.getAllLeafColumns()) {
                    if (c.getCanHide())
                      next[c.id] = shown ? shown.has(c.id) : true;
                  }
                  setColumnVisibility(next);
                }}
                disallowEmptySelection
              >
                {table
                  .getAllLeafColumns()
                  .filter((c) => c.getCanHide() && c.id !== SELECT_ID)
                  .map((c) => (
                    <MenuItem key={c.id} id={c.id}>
                      {columnLabel(c)}
                    </MenuItem>
                  ))}
              </Menu>
            </MenuTrigger>
          )}
          {toolbar}
        </div>
      )}

      <div className="plonk-table-frame relative">
        <div
          ref={scroller}
          className="plonk-table-scroll"
          style={
            { height, "--plonk-table-row": `${rowHeight}px` } as CSSProperties
          }
        >
          <table
            aria-label={ariaLabel}
            aria-rowcount={rows.length + 1}
            aria-busy={isLoading || undefined}
            aria-multiselectable={selectable || undefined}
            className="plonk-table-grid"
            style={{ width: `max(100%, ${table.getTotalSize()}px)` }}
          >
            <colgroup>
              {leafColumns.map((c) => (
                <col key={c.id} style={{ width: c.getSize() }} />
              ))}
            </colgroup>
            <thead>
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id} aria-rowindex={1}>
                  {group.headers.map((header) => (
                    <HeaderCell key={header.id} header={header} table={table} />
                  ))}
                </tr>
              ))}
            </thead>
            <tbody ref={tbody}>
              {padTop > 0 && (
                <tr aria-hidden="true" className="plonk-table-spacer">
                  <td colSpan={leafColumns.length} style={{ height: padTop }} />
                </tr>
              )}
              {items.map((item) => {
                const row = rows[item.index];
                if (!row) return null;
                return (
                  <tr
                    key={row.id}
                    data-row-id={row.id}
                    aria-rowindex={item.index + 2}
                    aria-selected={selectable ? row.getIsSelected() : undefined}
                    data-selected={row.getIsSelected() || undefined}
                    // Dönüşümlü satırlar için: nth-child sanal kaydırmada kayar.
                    data-odd={item.index % 2 === 1 || undefined}
                    className="plonk-table-row"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        data-align={metaOf(cell.column).align}
                        className="plonk-table-cell"
                      >
                        <table.FlexRender cell={cell} />
                      </td>
                    ))}
                  </tr>
                );
              })}
              {padBottom > 0 && (
                <tr aria-hidden="true" className="plonk-table-spacer">
                  <td
                    colSpan={leafColumns.length}
                    style={{ height: padBottom }}
                  />
                </tr>
              )}
              {rows.length === 0 &&
                isLoading &&
                Array.from({ length: 6 }, (_, i) => (
                  <tr
                    key={`skeleton-${i}`}
                    aria-hidden="true"
                    className="plonk-table-skeleton"
                  >
                    {leafColumns.map((c) => (
                      <td key={c.id} className="plonk-table-cell">
                        <span
                          style={{ "--plonk-skeleton-i": i } as CSSProperties}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              {rows.length === 0 && !isLoading && (
                <tr className="plonk-table-empty">
                  <td colSpan={leafColumns.length}>
                    {emptyState ?? messages.noResults}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isLoading && rows.length > 0 && (
          <span role="status" className="plonk-table-loading">
            <span className="sr-only">{messages.loading}</span>
          </span>
        )}
        {selectable && (
          <BulkBar
            count={selectedIds.length}
            tape={bulkBarTape ?? tapeDefault}
            messages={messages}
            onClear={clearSelection}
          >
            {bulkActions?.({
              rows: selectedRows.map((r) => r.original),
              ids: selectedIds,
              clear: clearSelection,
            })}
          </BulkBar>
        )}
      </div>
    </div>
  );
}

// ---------- Başlık hücresi: sıralama ve genişlik ayarı ----------

function HeaderCell<T extends RowData>({
  header,
  table,
}: {
  header: Header<F, T, unknown>;
  table: ReturnType<typeof useTable<F, T>>;
}) {
  const column = header.column;
  const sorted = column.getCanSort() ? column.getIsSorted() : false;
  const sortIndex = column.getSortIndex();
  const multi = table.state.sorting.length > 1;
  const meta = metaOf(column);
  const resize = column.getCanResize() ? header.getResizeHandler() : null;

  return (
    <th
      colSpan={header.colSpan}
      scope="col"
      aria-sort={
        column.getCanSort()
          ? sorted === "asc"
            ? "ascending"
            : sorted === "desc"
              ? "descending"
              : "none"
          : undefined
      }
      data-align={meta.align}
      data-sorted={sorted || undefined}
      className="plonk-table-head"
    >
      {header.isPlaceholder ? null : column.getCanSort() ? (
        <button
          type="button"
          className="plonk-table-sort"
          onClick={(e) => {
            column.getToggleSortingHandler()?.(e);
            playJelly(e.currentTarget, "pop");
          }}
        >
          <span className="truncate">
            <table.FlexRender header={header} />
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            data-dir={sorted || "none"}
            className="plonk-table-arrow"
          >
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
          {multi && sorted && (
            <span aria-hidden="true" className="plonk-table-sort-index">
              {sortIndex + 1}
            </span>
          )}
        </button>
      ) : (
        <table.FlexRender header={header} />
      )}
      {resize && (
        <span
          aria-hidden="true"
          data-resizing={column.getIsResizing() || undefined}
          className="plonk-table-resize"
          onMouseDown={resize}
          onTouchStart={resize}
          onDoubleClick={() => column.resetSize()}
        />
      )}
    </th>
  );
}

// ---------- Sütun filtresi (araç çubuğunda) ----------

function ColumnFilter<T extends RowData>({
  column,
  data,
  messages,
}: {
  column: ReturnType<
    ReturnType<typeof useTable<F, T>>["getAllLeafColumns"]
  >[number];
  data: Row<F, T>[];
  messages: DataTableMessages;
}) {
  const meta = metaOf(column);
  const label = columnLabel(column);
  const value = column.getFilterValue();

  if (meta.filter?.type === "select") {
    const options =
      meta.filter.options ??
      [...new Set(data.map((r) => String(r.getValue(column.id) ?? "")))]
        .filter(Boolean)
        .sort()
        .map((v) => ({ value: v, label: v }));
    return (
      <Select
        label={label}
        className="w-44"
        selectedKey={typeof value === "string" ? value : "__all"}
        onSelectionChange={(key) =>
          column.setFilterValue(
            key === "__all" || key == null ? undefined : String(key),
          )
        }
      >
        <SelectItem id="__all">{messages.all}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} id={o.value} textValue={o.value}>
            {o.label ?? o.value}
          </SelectItem>
        ))}
      </Select>
    );
  }

  // Tarih aralığı: filtre değeri [gün başı, gün sonu, başlangıç günü, bitiş günü].
  // İlk ikisi TanStack'in inDateRange'i için, son ikisi seçicinin kendisi için.
  const range =
    Array.isArray(value) && value.length === 4
      ? (value as [Date, Date, CalendarDate, CalendarDate])
      : null;
  return (
    <DateRangePicker
      label={label}
      className="w-[22rem] max-w-full"
      value={range ? { start: range[2], end: range[3] } : null}
      onChange={(r) => {
        if (!r) return column.setFilterValue(undefined);
        const tz = getLocalTimeZone();
        const start = (r.start as CalendarDate).toDate(tz);
        const end = (r.end as CalendarDate).add({ days: 1 }).toDate(tz);
        end.setMilliseconds(-1);
        column.setFilterValue([start, end, r.start, r.end]);
      }}
    />
  );
}

// ---------- Toplu işlem çubuğu ----------

function BulkBar({
  count,
  tape,
  messages,
  onClear,
  children,
}: {
  count: number;
  tape: boolean;
  messages: DataTableMessages;
  onClear: () => void;
  children?: ReactNode;
}) {
  const [shown, setShown] = useState(count > 0);
  const [exiting, setExiting] = useState(false);
  const [lastCount, setLastCount] = useState(count);
  // Görünürlüğü render sırasında ayarla; çıkarken son sayıyı göstermeye devam et.
  if (count > 0 && (!shown || exiting)) {
    setShown(true);
    setExiting(false);
  }
  if (count === 0 && shown && !exiting) setExiting(true);
  if (count > 0 && count !== lastCount) setLastCount(count);

  // Çıkış animasyonu hiç çalışmazsa (CSS kapatıldıysa) çubuk takılı kalmasın.
  useEffect(() => {
    if (!exiting) return;
    const id = setTimeout(() => setShown(false), 1000);
    return () => clearTimeout(id);
  }, [exiting]);

  if (!shown) return null;
  const n = count || lastCount;
  return (
    <div
      role="toolbar"
      aria-label={`${n} ${messages.selected}`}
      data-exiting={exiting || undefined}
      data-tape={tape || undefined}
      className="plonk-table-bulk"
      onAnimationEnd={(e) => {
        if (exiting && e.target === e.currentTarget) setShown(false);
      }}
    >
      <span aria-hidden="true" className="plonk-table-bulk-grip" />
      <span className="plonk-table-bulk-count" aria-live="polite">
        <span key={n} className="plonk-table-bulk-n">
          {n}
        </span>{" "}
        {messages.selected}
      </span>
      {children}
      <button
        type="button"
        aria-label={messages.clearSelection}
        className="plonk-table-bulk-clear"
        onClick={onClear}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  );
}

// ---------- Hareket: sıralama ve süzmede satırlar ----------

/**
 * When sorting, filtering or the data changes, rows move to their new places.
 * Row positions are recorded after every render; on a change the difference between
 * the old and new position is played (FLIP). Not played while scrolling.
 *
 * The personality picks the motion in CSS (`--plonk-table-reorder`): Sticker `flip`
 * (slides without overshoot and leans on the way; a spring's overshoot piled rows on
 * top of each other), Comic `hop` (leans forward in its direction, passes the target
 * by a fixed few pixels, settles back and squishes on landing), Retro and Arcade
 * `steps` (appear top to bottom in steps), reduced motion `fade`.
 */
function useReorderMotion(
  tbody: React.RefObject<HTMLTableSectionElement | null>,
  scroller: React.RefObject<HTMLDivElement | null>,
  orderKey: string,
  data: unknown,
) {
  const positions = useRef(new Map<string, number>());
  const lastKey = useRef<string | null>(null);
  const lastData = useRef(data);

  useLayoutEffect(() => {
    const body = tbody.current;
    if (!body) return;
    const changed =
      lastKey.current !== null &&
      (lastKey.current !== orderKey || lastData.current !== data);
    const mode = changed
      ? getComputedStyle(body).getPropertyValue("--plonk-table-reorder").trim()
      : "";
    const limit = scroller.current?.clientHeight ?? 600;
    const next = new Map<string, number>();

    body.querySelectorAll<HTMLElement>("tr[data-row-id]").forEach((tr, i) => {
      const id = tr.dataset.rowId!;
      const top = tr.offsetTop;
      next.set(id, top);
      if (!changed) return;
      const was = positions.current.get(id);
      if (mode === "flip") {
        if (was === undefined) {
          tr.animate(
            [
              { opacity: 0, transform: "translateY(-8px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 320, easing: "cubic-bezier(.22, 1, .36, 1)" },
          );
        } else if (was !== top) {
          // Uzaktan (sanal listenin dışından) gelen satır görünür alanın hemen dışından başlar.
          const dy = Math.max(-limit, Math.min(limit, was - top));
          const tilt = Math.max(-2.5, Math.min(2.5, dy / 120));
          tr.animate(
            [
              { transform: `translateY(${dy}px) rotate(${tilt}deg)` },
              {
                transform: `translateY(${dy * 0.08}px) rotate(${tilt * 0.3}deg)`,
                offset: 0.6,
              },
              { transform: "translateY(0) scale(1.01, .94)", offset: 0.8 },
              { transform: "none" },
            ],
            { duration: 640, easing: "cubic-bezier(.22, 1, .36, 1)" },
          );
        }
      } else if (mode === "hop") {
        if (was === undefined) {
          tr.animate(
            [
              { opacity: 0, transform: "scale(.94) skewX(-8deg)" },
              { opacity: 1, transform: "scale(1.02) skewX(2deg)", offset: 0.6 },
              { opacity: 1, transform: "none" },
            ],
            { duration: 300, easing: "cubic-bezier(.2, .8, .3, 1)" },
          );
        } else if (was !== top) {
          const dy = Math.max(-limit, Math.min(limit, was - top));
          // Aşma mesafeyle büyümez: uzaktan gelen satır da birkaç piksel geçer.
          const over = Math.sign(dy) * -5;
          const lean = Math.sign(dy) * 7;
          tr.animate(
            [
              { transform: `translateY(${dy}px) skewX(${lean}deg)` },
              {
                transform: `translateY(${over}px) skewX(${-lean * 0.4}deg)`,
                offset: 0.55,
              },
              { transform: "translateY(0) scale(1.01, .9)", offset: 0.78 },
              { transform: "none" },
            ],
            { duration: 520, easing: "cubic-bezier(.3, .7, .4, 1)" },
          );
        }
      } else if (mode === "steps") {
        tr.animate(
          [{ opacity: 0 }, { opacity: 0, offset: 0.99 }, { opacity: 1 }],
          {
            duration: 1 + Math.min(i, 24) * 22,
          },
        );
      } else if (mode === "fade") {
        tr.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 150,
          easing: "ease-out",
        });
      }
    });

    positions.current = next;
    lastKey.current = orderKey;
    lastData.current = data;
  });
}

// ---------- Yardımcılar ----------

function metaOf(column: {
  columnDef: { meta?: unknown };
}): DataTableColumnMeta {
  return (column.columnDef.meta ?? {}) as DataTableColumnMeta;
}

function hasFilter(column: { columnDef: { meta?: unknown } }) {
  return metaOf(column).filter != null;
}

function columnLabel(column: {
  id: string;
  columnDef: { meta?: unknown; header?: unknown };
}) {
  const meta = metaOf(column);
  if (meta.label) return meta.label;
  return typeof column.columnDef.header === "string"
    ? column.columnDef.header
    : column.id;
}

function selectColumn<T extends RowData>(
  selectAll: string,
  selectRow: string,
): DataTableColumn<T> {
  return {
    id: SELECT_ID,
    size: 48,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableGlobalFilter: false,
    header: ({ table }) => (
      <Checkbox
        aria-label={selectAll}
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={selectRow}
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  };
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </svg>
  );
}
