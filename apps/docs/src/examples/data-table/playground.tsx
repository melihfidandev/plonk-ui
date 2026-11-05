"use client";

import { DataTable } from "plonk-ui";
import { Playground } from "@/site/Playground";
import { COLUMNS } from "./columns";
import { INVOICES } from "./invoices";

/** Data Table sayfasının oyun alanı. */
export default function DataTablePlayground() {
  return (
    <Playground
      component="DataTable"
      controls={{
        selectable: { type: "boolean", default: false },
        searchable: { type: "boolean", default: true, componentDefault: true },
        columnMenu: { type: "boolean", default: true, componentDefault: true },
        isLoading: { type: "boolean", default: false },
      }}
      extraCode={[
        'aria-label="Invoices"',
        "data={invoices}",
        "columns={columns}",
        "getRowId={(row) => row.id}",
        'height="24rem"',
      ]}
      render={(props) => (
        <DataTable
          aria-label="Invoices"
          data={INVOICES}
          columns={COLUMNS}
          getRowId={(row) => row.id}
          height="24rem"
          className="w-full"
          {...props}
        />
      )}
    />
  );
}
