import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("etikete tıklayınca işaretlenir ve jöle başlar", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Şartları kabul ediyorum" onChange={onChange} />);
    const box = screen.getByRole("checkbox", {
      name: "Şartları kabul ediyorum",
    });
    await userEvent.click(screen.getByText("Şartları kabul ediyorum"));
    expect(box).toBeChecked();
    expect(onChange).toHaveBeenCalledOnce();
    expect(box.parentElement).toHaveAttribute("data-plonk-jelly", "pop");
  });

  it("boşluk tuşuyla değişir", async () => {
    render(<Checkbox label="Bülten" />);
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("indeterminate hâlini DOM'a yansıtır", () => {
    const { rerender } = render(<Checkbox label="Tümü" indeterminate />);
    const box = screen.getByRole<HTMLInputElement>("checkbox");
    expect(box.indeterminate).toBe(true);
    rerender(<Checkbox label="Tümü" />);
    expect(box.indeterminate).toBe(false);
  });

  it("hata ve açıklamayı bağlar", () => {
    render(<Checkbox label="Şartlar" description="Okudum" error="Zorunlu" />);
    const box = screen.getByRole("checkbox");
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAccessibleDescription("Okudum Zorunlu");
  });

  it("devre dışıyken değişmez", async () => {
    render(<Checkbox label="Kapalı" disabled />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
});
