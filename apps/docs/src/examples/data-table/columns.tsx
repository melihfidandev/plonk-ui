"use client";

import { Badge, DataTable, createDataTableColumns } from "plonk";
import { INVOICES, type Invoice } from "./invoices";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const day = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const STATUS_VARIANT = {
  Paid: "success",
  Pending: "warning",
  Overdue: "danger",
} as const;

const col = createDataTableColumns<Invoice>();

export const COLUMNS = col.columns([
  col.accessor("id", { header: "Invoice", size: 110 }),
  col.accessor("customer", { header: "Customer", size: 190 }),
  col.accessor("status", {
    header: "Status",
    size: 130,
    filterFn: "equalsString",
    meta: { filter: { type: "select" } },
    cell: (info) => (
      <Badge variant={STATUS_VARIANT[info.getValue()]}>{info.getValue()}</Badge>
    ),
  }),
  col.accessor("amount", {
    header: "Amount",
    size: 130,
    meta: { align: "end" },
    cell: (info) => money.format(info.getValue()),
  }),
  col.accessor("date", {
    header: "Date",
    size: 130,
    filterFn: "inDateRange",
    enableGlobalFilter: false,
    meta: { align: "end", filter: { type: "dateRange" } },
    cell: (info) => day.format(info.getValue()),
  }),
]);

export default function Columns() {
  return (
    <DataTable
      aria-label="Invoices"
      data={INVOICES}
      columns={COLUMNS}
      getRowId={(row) => row.id}
      height="24rem"
      className="w-full"
    />
  );
}
