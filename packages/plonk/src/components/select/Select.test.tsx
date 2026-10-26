import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select, SelectItem } from "./Select";

function Example(props: Partial<React.ComponentProps<typeof Select>>) {
  return (
    <Select label="Ülke" placeholder="Seç…" name="country" {...props}>
      <SelectItem id="tr">Türkiye</SelectItem>
      <SelectItem id="de">Almanya</SelectItem>
      <SelectItem id="jp">Japonya</SelectItem>
    </Select>
  );
}

describe("Select", () => {
  it("etiketle duyurulur, tıklayınca liste açılır ve seçim yapılır", async () => {
    const onSelectionChange = vi.fn();
    render(<Example onSelectionChange={onSelectionChange} />);
    const trigger = screen.getByRole("button", { name: /Ülke/ });
    expect(trigger).toHaveTextContent("Seç…");
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "Almanya" }));
    expect(onSelectionChange).toHaveBeenCalledWith("de");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(trigger).toHaveTextContent("Almanya");
  });

  it("klavyeyle açılır ve seçilir", async () => {
    render(<Example />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(screen.getByRole("button", { name: /Ülke/ })).toHaveTextContent(
      "Almanya",
    );
  });

  it("seçili seçenek işaretlenir", async () => {
    render(<Example defaultSelectedKey="jp" />);
    await userEvent.click(screen.getByRole("button", { name: /Ülke/ }));
    expect(screen.getByRole("option", { name: "Japonya" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("hata mesajını gösterir ve bağlar", () => {
    render(<Example error="Bir ülke seç" />);
    expect(screen.getByText("Bir ülke seç")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Ülke/ }),
    ).toHaveAccessibleDescription(expect.stringContaining("Bir ülke seç"));
  });

  it("formda seçili değerle gönderilir", async () => {
    render(
      <form data-testid="form">
        <Example defaultSelectedKey="tr" />
      </form>,
    );
    const data = new FormData(screen.getByTestId<HTMLFormElement>("form"));
    expect(data.get("country")).toBe("tr");
  });

  it("düğmede açıklama değil sadece seçeneğin adı görünür", () => {
    render(
      <Select label="Plan" defaultSelectedKey="free">
        <SelectItem id="free" description="1 proje, 3 üye">
          Ücretsiz
        </SelectItem>
      </Select>,
    );
    const trigger = screen.getByRole("button", { name: /Plan/ });
    expect(trigger).toHaveTextContent("Ücretsiz");
    expect(trigger).not.toHaveTextContent("1 proje");
  });
});
