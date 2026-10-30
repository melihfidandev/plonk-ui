"use client";

import { DataTable, createDataTableColumns } from "plonk";

interface Customer {
  name: string;
  city: string;
}

const CUSTOMERS: Customer[] = [
  { name: "Zeynep", city: "İzmir" },
  { name: "Çağla", city: "Şanlıurfa" },
  { name: "Ömer", city: "Ankara" },
  { name: "Işıl", city: "Çanakkale" },
  { name: "İlker", city: "Iğdır" },
  { name: "Şule", city: "Bursa" },
  { name: "Cem", city: "Ordu" },
  { name: "Sevgi", city: "Üsküdar" },
];

const col = createDataTableColumns<Customer>();
const COLUMNS = col.columns([
  col.accessor("name", { header: "Ad", size: 140 }),
  col.accessor("city", { header: "Şehir", size: 160 }),
]);

const MESSAGES = {
  search: "Ara…",
  columns: "Sütunlar",
  all: "Tümü",
  clearFilters: "Filtreleri temizle",
  noResults: "Eşleşen kayıt yok",
  loading: "Yükleniyor…",
  selected: "seçili",
  clearSelection: "Seçimi temizle",
  selectAll: "Tümünü seç",
  selectRow: "Satırı seç",
  rowCount: (shown: number, total: number) =>
    shown === total ? `${total} kayıt` : `${shown} / ${total} kayıt`,
};

export default function Turkish() {
  return (
    <DataTable
      aria-label="Müşteriler"
      data={CUSTOMERS}
      columns={COLUMNS}
      getRowId={(row) => row.name}
      height="20rem"
      className="w-full"
      messages={MESSAGES}
    />
  );
}
