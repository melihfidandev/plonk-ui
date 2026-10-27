import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PlonkProvider } from "../../provider/PlonkProvider";
import { Button } from "../button";
import { DataTable, type DataTableProps } from "./DataTable";
import { createDataTableColumns } from "./features";

// jsdom'da yerleşim yok; sanal liste kaydırma alanını 0 yükseklikte görüp hiç
// satır çizmiyordu. Sadece tablonun kaydırma alanına bir boyut ver.
const sized = (value: number) =>
  function (this: HTMLElement) {
    return this.classList.contains("plonk-table-scroll") ? value : 0;
  };
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get: sized(480),
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: sized(960),
  });
});
afterAll(() => {
  // jsdom'un kendi tanımları prototipte; bizimkileri silince onlara döner.
  delete (HTMLElement.prototype as { clientHeight?: number }).clientHeight;
  delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
});

interface Person {
  id: string;
  name: string;
  status: string;
  amount: number;
}

const PEOPLE: Person[] = [
  { id: "1", name: "Zeytin", status: "Paid", amount: 30 },
  { id: "2", name: "Çınar", status: "Late", amount: 10 },
  { id: "3", name: "Acme", status: "Paid", amount: 200 },
  { id: "4", name: "İpek", status: "Late", amount: 5 },
  { id: "5", name: "Işık", status: "Pending", amount: 70 },
];

const col = createDataTableColumns<Person>();
const COLUMNS = col.columns([
  col.accessor("name", { header: "Name" }),
  col.accessor("status", {
    header: "Status",
    filterFn: "equalsString",
    meta: { filter: { type: "select" } },
  }),
  col.accessor("amount", { header: "Amount", meta: { align: "end" } }),
]);

function Table(props: Partial<DataTableProps<Person>>) {
  return (
    <PlonkProvider locale="tr-TR">
      <DataTable
        aria-label="People"
        data={PEOPLE}
        columns={COLUMNS}
        getRowId={(p) => p.id}
        {...props}
      />
    </PlonkProvider>
  );
}

const names = () =>
  screen
    .getAllByRole("row")
    .filter((r) => r.hasAttribute("data-row-id"))
    .map((r) => within(r).getAllByRole("cell").at(-3)?.textContent);
const header = (name: string) =>
  screen.getByRole("columnheader", { name: new RegExp(name) });

describe("DataTable", () => {
  it("başlıkları, satırları ve sayacı gösterir", () => {
    render(<Table />);
    expect(screen.getByRole("table", { name: "People" })).toBeInTheDocument();
    expect(names()).toEqual(["Zeytin", "Çınar", "Acme", "İpek", "Işık"]);
    expect(screen.getByText("5 rows")).toBeInTheDocument();
  });

  it("başlığa tıklayınca artan → azalan → sırasız; metinler dile göre (tr)", async () => {
    render(<Table />);
    const sort = within(header("Name")).getByRole("button");
    await userEvent.click(sort);
    expect(header("Name")).toHaveAttribute("aria-sort", "ascending");
    expect(names()).toEqual(["Acme", "Çınar", "Işık", "İpek", "Zeytin"]);
    await userEvent.click(sort);
    expect(header("Name")).toHaveAttribute("aria-sort", "descending");
    expect(names()[0]).toBe("Zeytin");
    await userEvent.click(sort);
    expect(header("Name")).toHaveAttribute("aria-sort", "none");
    expect(names()).toEqual(["Zeytin", "Çınar", "Acme", "İpek", "Işık"]);
  });

  it("sayılar da artandan başlar", async () => {
    render(<Table />);
    await userEvent.click(within(header("Amount")).getByRole("button"));
    expect(names()).toEqual(["İpek", "Çınar", "Zeytin", "Işık", "Acme"]);
  });

  it("arama dile göre küçük harfe çevirir: 'ışık' Işık'ı bulur", async () => {
    render(<Table />);
    await userEvent.type(screen.getByRole("searchbox"), "ışık");
    expect(names()).toEqual(["Işık"]);
    expect(screen.getByText("1 of 5 rows")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Clear filters" }),
    );
    expect(names()).toHaveLength(5);
  });

  it("sütun filtresi (kontrollü) satırları süzer", () => {
    render(<Table columnFilters={[{ id: "status", value: "late" }]} />);
    expect(names()).toEqual(["Çınar", "İpek"]);
  });

  it("gizlenen sütun tablodan çıkar", () => {
    render(<Table columnVisibility={{ status: false }} />);
    expect(screen.queryByRole("columnheader", { name: /Status/ })).toBeNull();
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
  });

  it("satır seçilince işlem çubuğu gelir; toplu işlem kimlikleri alır", async () => {
    const onShip = vi.fn();
    render(
      <Table
        selectable
        bulkActions={({ ids }) => (
          <Button onPress={() => onShip(ids)}>Ship</Button>
        )}
      />,
    );
    const boxes = screen.getAllByRole("checkbox", { name: "Select row" });
    await userEvent.click(boxes[1]!);
    await userEvent.click(boxes[3]!);
    const bar = screen.getByRole("toolbar", { name: "2 selected" });
    expect(
      screen.getByRole("checkbox", { name: "Select all rows" }),
    ).toHaveProperty("indeterminate", true);
    await userEvent.click(within(bar).getByRole("button", { name: "Ship" }));
    expect(onShip).toHaveBeenCalledWith(["2", "4"]);
  });

  it("tümünü seç ve temizle; çubuk çıkar", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<Table selectable />);
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Select all rows" }),
    );
    expect(
      screen.getByRole("toolbar", { name: "5 selected" }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Clear selection" }),
    );
    // Çıkış animasyonu jsdom'da yok; güvenlik süresinden sonra kalkar.
    expect(screen.getByRole("toolbar")).toHaveAttribute("data-exiting");
    act(() => vi.advanceTimersByTime(1100));
    expect(screen.queryByRole("toolbar")).toBeNull();
    vi.useRealTimers();
  });

  it("silinen satırların seçimi kendiliğinden temizlenir", async () => {
    const { rerender } = render(<Table selectable />);
    const boxes = screen.getAllByRole("checkbox", { name: "Select row" });
    await userEvent.click(boxes[0]!);
    await userEvent.click(boxes[1]!);
    rerender(<Table selectable data={PEOPLE.slice(1)} />);
    expect(
      screen.getByRole("toolbar", { name: "1 selected" }),
    ).toBeInTheDocument();
  });

  it("boş ve yükleniyor durumları", () => {
    const { rerender } = render(<Table data={[]} emptyState="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    rerender(<Table data={[]} isLoading />);
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("No results")).toBeNull();
  });

  it("binlerce satırda sadece görünenler çizilir (sanal kaydırma)", () => {
    const many = Array.from({ length: 5000 }, (_, i) => ({
      id: String(i),
      name: `Person ${i}`,
      status: "Paid",
      amount: i,
    }));
    render(<Table data={many} />);
    const rendered = screen
      .getAllByRole("row")
      .filter((r) => r.hasAttribute("data-row-id"));
    expect(rendered.length).toBeGreaterThan(5);
    expect(rendered.length).toBeLessThan(60);
    expect(screen.getByRole("table")).toHaveAttribute("aria-rowcount", "5001");
  });

  it("Shift ile çoklu sıralama başlıkta sıra numarası gösterir", async () => {
    render(<Table />);
    await userEvent.click(within(header("Status")).getByRole("button"));
    fireEvent.click(within(header("Amount")).getByRole("button"), {
      shiftKey: true,
    });
    expect(within(header("Status")).getByText("1")).toBeInTheDocument();
    expect(within(header("Amount")).getByText("2")).toBeInTheDocument();
    expect(names().slice(0, 2)).toEqual(["İpek", "Çınar"]);
  });
});
