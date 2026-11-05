"use client";

import { useState } from "react";
import { Button, DataTable } from "plonk-ui";
import { COLUMNS } from "./columns";
import { INVOICES } from "./invoices";

export default function Bulk() {
  const [rows, setRows] = useState(INVOICES);

  return (
    <DataTable
      aria-label="Invoices"
      data={rows}
      columns={COLUMNS}
      getRowId={(row) => row.id}
      height="24rem"
      className="w-full"
      selectable
      toolbar={
        <Button size="sm" variant="ghost" onPress={() => setRows(INVOICES)}>
          Reset
        </Button>
      }
      bulkActions={({ ids, clear }) => (
        <>
          <Button
            size="sm"
            variant="neutral"
            onPress={() => {
              const picked = new Set(ids);
              setRows((all) =>
                all.map((r) =>
                  picked.has(r.id) ? { ...r, status: "Paid" } : r,
                ),
              );
              clear();
            }}
          >
            Mark paid
          </Button>
          <Button
            size="sm"
            variant="danger"
            onPress={() => {
              const picked = new Set(ids);
              setRows((all) => all.filter((r) => !picked.has(r.id)));
              clear();
            }}
          >
            Delete
          </Button>
        </>
      )}
    />
  );
}
