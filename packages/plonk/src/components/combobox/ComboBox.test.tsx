import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlonkProvider } from "../../provider/PlonkProvider";
import { ComboBox, ComboBoxItem } from "./ComboBox";

const CITIES = ["İstanbul", "İzmir", "Ankara", "Antalya", "Eskişehir"];

function Example(props: Partial<React.ComponentProps<typeof ComboBox>>) {
  return (
    <ComboBox label="Şehir" emptyMessage="Sonuç yok" {...props}>
      {CITIES.map((c) => (
        <ComboBoxItem key={c} id={c}>
          {c}
        </ComboBoxItem>
      ))}
    </ComboBox>
  );
}

describe("ComboBox", () => {
  it("yazdıkça filtreler ve eşleşen kısmı vurgular", async () => {
    render(<Example />);
    await userEvent.type(screen.getByRole("combobox", { name: "Şehir" }), "an");
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    // "İstanbul" da "an" içerir.
    expect(options).toEqual(["İstanbul", "Ankara", "Antalya"]);
    const mark = within(
      screen.getByRole("option", { name: "Antalya" }),
    ).getByText("An");
    expect(mark.tagName).toBe("MARK");
  });

  it("vurguyu provider'ın diline göre yapar (tarayıcının dili değil)", async () => {
    // İngilizce kurala göre "İzmir" küçültülünce "i̇zmir" olur, "iz" bulunmazdı.
    render(
      <PlonkProvider locale="tr-TR" toaster={false}>
        <Example />
      </PlonkProvider>,
    );
    await userEvent.type(screen.getByRole("combobox"), "iz");
    const mark = within(
      screen.getByRole("option", { name: "İzmir" }),
    ).getByText("İz");
    expect(mark.tagName).toBe("MARK");
  });

  it("eşleşme yoksa boş durum mesajını gösterir", async () => {
    render(<Example />);
    await userEvent.type(screen.getByRole("combobox"), "xyz");
    expect(screen.getByText("Sonuç yok")).toBeInTheDocument();
  });

  it("ok tuşları ve Enter ile seçer", async () => {
    const onSelectionChange = vi.fn();
    render(<Example onSelectionChange={onSelectionChange} />);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "ank");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onSelectionChange).toHaveBeenCalledWith("Ankara");
    expect(input).toHaveValue("Ankara");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });

  it("ok düğmesiyle tüm liste açılır", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getAllByRole("option")).toHaveLength(CITIES.length);
  });

  it("hata durumunu bildirir", () => {
    render(<Example error="Şehir seç" />);
    expect(screen.getByRole("combobox")).toHaveAccessibleDescription(
      expect.stringContaining("Şehir seç"),
    );
  });
});
