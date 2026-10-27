import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlonkProvider } from "../../provider/PlonkProvider";
import {
  CommandGroup,
  CommandItem,
  CommandPage,
  CommandPalette,
  CommandPaletteTrigger,
  commandPalette,
} from "./CommandPalette";
import { fuzzy } from "./fuzzy";

afterEach(() => act(() => commandPalette.close()));

function Example({ onTheme = vi.fn(), onNew = vi.fn() }) {
  return (
    <PlonkProvider locale="tr-TR">
      <CommandPaletteTrigger />
      <CommandPalette title="Komutlar">
        <CommandGroup heading="Sayfalar">
          <CommandItem>Panel</CommandItem>
          <CommandItem keywords={["tercihler"]}>Ayarlar</CommandItem>
        </CommandGroup>
        <CommandGroup heading="İşlemler">
          <CommandItem shortcut="⌘N" onAction={onNew}>
            Yeni fatura
          </CommandItem>
          <CommandItem isDisabled>Dışa aktar</CommandItem>
          <CommandItem page="theme">Tema değiştir</CommandItem>
        </CommandGroup>
        <CommandPage id="theme">
          <CommandItem onAction={onTheme}>Retro</CommandItem>
        </CommandPage>
      </CommandPalette>
    </PlonkProvider>
  );
}

const options = () => screen.getAllByRole("option").map((o) => o.textContent);
const active = () =>
  document.querySelector('[role="option"][aria-selected="true"]')?.textContent;

describe("fuzzy", () => {
  it("harfleri sırayla bulur, ardışık ve kelime başı eşleşmeleri öne alır", () => {
    expect(fuzzy("Yeni fatura", "yfat")?.hits).toEqual([0, 5, 6, 7]);
    expect(fuzzy("Panel", "lp")).toBeNull();
    const word = fuzzy("Faturalar", "fat")!.score;
    const loose = fuzzy("Ayarları getir", "fat");
    expect(loose === null || loose.score < word).toBe(true);
  });

  it("Türkçede i ile ı'yı ayırır", () => {
    expect(fuzzy("Işık", "ışı", "tr-TR")).not.toBeNull();
    expect(fuzzy("Işık", "isi", "tr-TR")).toBeNull();
    expect(fuzzy("İpek", "ipek", "tr-TR")).not.toBeNull();
  });
});

describe("CommandPalette", () => {
  it("⌘K ile açılır, arama kutusu odaklanır ve combobox olarak duyurulur", async () => {
    render(<Example />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.keyboard("{Meta>}k{/Meta}");
    expect(
      screen.getByRole("dialog", { name: "Komutlar" }),
    ).toBeInTheDocument();
    const input = screen.getByRole("combobox");
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("aria-activedescendant");
    expect(active()).toBe("Panel");
  });

  it("tetikleyici paleti açar", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("yazdıkça bulanık süzer, anahtar kelimelerle de bulur, boşta 'sonuç yok'", async () => {
    render(<Example />);
    act(() => commandPalette.open());
    await userEvent.keyboard("yfat");
    expect(options()).toEqual(["Yeni fatura⌘N"]);
    await userEvent.clear(screen.getByRole("combobox"));
    await userEvent.keyboard("tercih");
    expect(options()).toEqual(["Ayarlar"]);
    await userEvent.keyboard("zzz");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("ok tuşları devre dışı öğeyi atlar; Enter çalıştırır ve kapatır", async () => {
    const onNew = vi.fn();
    render(<Example onNew={onNew} />);
    act(() => commandPalette.open());
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Yeni fatura⌘N");
    await userEvent.keyboard("{ArrowDown}");
    expect(active()).toBe("Tema değiştir");
    await userEvent.keyboard("{ArrowUp}{Enter}");
    expect(onNew).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("alt sayfa açılır; Esc önce geri getirir, ikinci Esc kapatır", async () => {
    const onTheme = vi.fn();
    render(<Example onTheme={onTheme} />);
    act(() => commandPalette.open());
    await userEvent.keyboard("tema{Enter}");
    expect(options()).toEqual(["Retro"]);
    expect(screen.getByText("Tema değiştir")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(options()).toContain("Panel");
    await userEvent.keyboard("tema{Enter}{Backspace}");
    expect(options()).toContain("Panel");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("filter={false} grubu sunucu sonuçlarını olduğu gibi gösterir; yükleniyor satırı", () => {
    render(
      <PlonkProvider>
        <CommandPalette isOpen>
          <CommandGroup heading="Customers" filter={false} isLoading>
            <CommandItem>Acme</CommandItem>
          </CommandGroup>
        </CommandPalette>
      </PlonkProvider>,
    );
    expect(options()).toEqual(["Acme"]);
    expect(screen.getByText("Searching…")).toBeInTheDocument();
  });
});
