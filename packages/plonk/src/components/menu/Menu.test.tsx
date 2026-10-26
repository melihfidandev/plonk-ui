import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button/Button";
import {
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from "./Menu";

function Example({
  onAction = vi.fn(),
}: {
  onAction?: (key: unknown) => void;
}) {
  return (
    <MenuTrigger>
      <Button>Eylemler</Button>
      <Menu onAction={onAction}>
        <MenuSection title="Dosya">
          <MenuItem
            id="edit"
            shortcut="⌘E"
            description="Adı ve açıklamayı değiştir"
          >
            Düzenle
          </MenuItem>
          <MenuItem id="copy">Kopyasını oluştur</MenuItem>
          <MenuItem id="archive" isDisabled>
            Arşivle
          </MenuItem>
        </MenuSection>
        <MenuSeparator />
        <MenuItem id="delete" variant="danger">
          Sil
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

describe("Menu", () => {
  it("Button ile açılır, seçenekler menuitem olarak duyurulur", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Eylemler" }));
    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(4);
    expect(
      screen.getByRole("menuitem", { name: "Düzenle" }),
    ).toHaveAccessibleDescription(expect.stringContaining("Adı ve açıklamayı"));
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("klavyeyle açılır, ok tuşlarıyla gezilir ve seçilir; devre dışı atlanır", async () => {
    const onAction = vi.fn();
    render(<Example onAction={onAction} />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("menuitem", { name: /Düzenle/ })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Sil" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onAction.mock.calls[0]?.[0]).toBe("delete");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("yazarak seçeneğe atlar", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Eylemler" }));
    await userEvent.keyboard("k");
    expect(
      screen.getByRole("menuitem", { name: "Kopyasını oluştur" }),
    ).toHaveFocus();
  });

  it("Esc ile kapanır ve odak düğmeye döner", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Eylemler" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("seçim modunda seçili öğe işaretlenir", async () => {
    render(
      <MenuTrigger>
        <Button>Görünüm</Button>
        <Menu selectionMode="single" defaultSelectedKeys={["grid"]}>
          <MenuItem id="list">Liste</MenuItem>
          <MenuItem id="grid">Izgara</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Görünüm" }));
    expect(
      screen.getByRole("menuitemradio", { name: "Izgara" }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
