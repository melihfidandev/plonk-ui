import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("etiketi alana bağlar", async () => {
    render(<Input label="E-posta" />);
    const input = screen.getByLabelText("E-posta");
    await userEvent.type(input, "a@b.co");
    expect(input).toHaveValue("a@b.co");
  });

  it("açıklama ve hatayı aria-describedby ile bağlar", () => {
    render(
      <Input
        label="E-posta"
        description="İş adresin"
        error="Geçerli bir adres yaz"
        aria-describedby="dis"
      />,
    );
    const input = screen.getByLabelText("E-posta");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      expect.stringContaining("Geçerli bir adres yaz"),
    );
    expect(input).toHaveAccessibleDescription(
      expect.stringContaining("İş adresin"),
    );
    expect(input.getAttribute("aria-describedby")).toMatch(/^dis /);
  });

  it("mesajsız hata işaretlemesini destekler", () => {
    render(<Input label="Ad" error />);
    const input = screen.getByLabelText("Ad");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("hata yeni gelince kutuyu sallar, ilk render'da sallamaz", () => {
    const { rerender, container } = render(<Input label="Ad" error="Boş" />);
    const box = container.querySelector(".plonk-field");
    expect(box).not.toHaveAttribute("data-plonk-jelly");
    rerender(<Input label="Ad" />);
    rerender(<Input label="Ad" error="Boş" />);
    expect(box).toHaveAttribute("data-plonk-jelly", "shake");
  });

  it("zorunlu alanda yıldız sadece görseldir", () => {
    render(<Input label="Ad" required />);
    expect(screen.getByRole("textbox", { name: "Ad" })).toBeRequired();
  });

  it("verilen id'yi kullanır ve ref'i iletir", () => {
    let node: HTMLInputElement | null = null;
    render(
      <Input
        label="Ad"
        id="ad"
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(screen.getByLabelText("Ad")).toHaveAttribute("id", "ad");
    expect(node).toBe(screen.getByLabelText("Ad"));
  });
});
