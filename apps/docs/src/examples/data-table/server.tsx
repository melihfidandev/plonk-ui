"use client";

import { useEffect, useState } from "react";
import { DataTable, type SortingState } from "plonk-ui";
import { COLUMNS } from "./columns";
import { INVOICES, type Invoice } from "./invoices";

// Stands in for your API: sorts and searches on the "server", then answers.
async function fetchInvoices(sorting: SortingState, search: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const query = search.toLowerCase();
  const rows = INVOICES.filter(
    (r) => !query || `${r.id} ${r.customer}`.toLowerCase().includes(query),
  );
  const [sort] = sorting;
  if (sort) {
    const key = sort.id as keyof Invoice;
    rows.sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0));
    if (sort.desc) rows.reverse();
  }
  return { rows, total: INVOICES.length };
}

export default function Server() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<{
    request: string;
    rows: Invoice[];
    total: number;
  }>();
  // Loading until the answer for the current request arrives.
  const request = JSON.stringify([sorting, search]);
  const loading = result?.request !== request;

  useEffect(() => {
    let current = true;
    fetchInvoices(sorting, search).then((next) => {
      if (current) setResult({ request, ...next });
    });
    return () => {
      current = false;
    };
  }, [request, sorting, search]);

  return (
    <DataTable
      aria-label="Invoices"
      data={result?.rows ?? []}
      columns={COLUMNS}
      getRowId={(row) => row.id}
      height="24rem"
      className="w-full"
      columnMenu={false}
      manualSorting
      manualFiltering
      sorting={sorting}
      onSortingChange={setSorting}
      globalFilter={search}
      onGlobalFilterChange={setSearch}
      rowCount={result?.total}
      isLoading={loading}
    />
  );
}
