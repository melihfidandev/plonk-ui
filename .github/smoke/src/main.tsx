import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Card,
  createDataTableColumns,
  DataTable,
  DatePicker,
  Dialog,
  DialogTrigger,
  parseDate,
  PlonkProvider,
  Select,
  SelectItem,
  Slider,
  Switch,
  toast,
} from "plonk-ui";
import "./index.css";

type Row = { id: string; name: string; amount: number };
const col = createDataTableColumns<Row>();
const columns = col.columns([
  col.accessor("name", { header: "Name" }),
  col.accessor("amount", { header: "Amount", meta: { align: "end" } }),
]);
const rows: Row[] = [{ id: "1", name: "Ada", amount: 42 }];

function App() {
  return (
    <PlonkProvider
      personality="comic"
      locale="en-US"
      style={{ "--plonk-color-focus": "#2f5bff" }}
    >
      <Card title="Smoke test">
        <Switch label="Enabled" defaultChecked />
        <Select label="Fruit">
          <SelectItem id="apple">Apple</SelectItem>
        </Select>
        <Slider label="Volume" defaultValue={40} />
        <DatePicker label="Date" defaultValue={parseDate("2026-11-05")} />
        <DialogTrigger>
          <Button>Open</Button>
          <Dialog title="Hello">Hi</Dialog>
        </DialogTrigger>
        <Button onPress={() => toast.success("Saved")}>Toast</Button>
      </Card>
      <DataTable data={rows} columns={columns} getRowId={(r) => r.id} />
    </PlonkProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
