import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("etiketli ve yazılabilir", async () => {
    render(<Textarea label="Not" />);
    const area = screen.getByRole("textbox", { name: "Not" });
    await userEvent.type(area, "Merhaba");
    expect(area).toHaveValue("Merhaba");
    expect(area).toHaveAttribute("rows", "3");
  });

  it("hata durumunu bildirir", () => {
    render(<Textarea label="Not" error="Çok kısa" />);
    const area = screen.getByRole("textbox");
    expect(area).toHaveAttribute("aria-invalid", "true");
    expect(area).toHaveAccessibleDescription("Çok kısa");
  });

  it("autoResize ile içeriğe göre boyutlanır", () => {
    render(<Textarea label="Not" autoResize />);
    expect(screen.getByRole("textbox")).toHaveClass("field-sizing-content");
  });
});
