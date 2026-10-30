// Sample data for the Data Table examples: the same 240 invoices every time.
export interface Invoice {
  id: string;
  customer: string;
  status: "Paid" | "Pending" | "Overdue";
  amount: number;
  date: Date;
}

const CUSTOMERS = [
  "Acme Studio",
  "Atlas Logistics",
  "Bora Textiles",
  "Cedar Foods",
  "Delta Architects",
  "Echo Records",
  "Fable Books",
  "Granite Labs",
  "Harbor Coffee",
  "Iris Cosmetics",
  "Juniper Health",
  "Kite Travel",
];
const STATUSES: Invoice["status"][] = ["Paid", "Pending", "Overdue"];

export const INVOICES: Invoice[] = Array.from({ length: 240 }, (_, i) => ({
  id: `INV-${String(i + 1).padStart(4, "0")}`,
  customer: CUSTOMERS[(i * 7) % CUSTOMERS.length]!,
  status: STATUSES[(i * 5 + (i >> 3)) % 3]!,
  amount: 120 + ((i * 7919) % 9880),
  date: new Date(2026, (i * 13) % 10, 1 + ((i * 11) % 28)),
}));
