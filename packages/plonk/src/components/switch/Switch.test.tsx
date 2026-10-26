import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("switch rolüyle duyurulur ve değişir", async () => {
    const onChange = vi.fn();
    render(<Switch label="Bildirimler" onChange={onChange} />);
    const sw = screen.getByRole("switch", { name: "Bildirimler" });
    expect(sw).not.toBeChecked();
    await userEvent.click(sw);
    expect(sw).toBeChecked();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("değişince topuz ezilir", async () => {
    const { container } = render(<Switch label="Karanlık mod" />);
    await userEvent.click(screen.getByRole("switch"));
    expect(container.querySelector("[data-plonk-jelly]")).toHaveAttribute(
      "data-plonk-jelly",
      "squish",
    );
  });

  it("formda checkbox gibi gönderilir", () => {
    render(
      <form data-testid="form">
        <Switch label="Bülten" name="newsletter" defaultChecked />
      </form>,
    );
    const data = new FormData(screen.getByTestId<HTMLFormElement>("form"));
    expect(data.get("newsletter")).toBe("on");
  });

  it("açıklamayı bağlar", () => {
    render(<Switch label="Bülten" description="Haftada bir" />);
    expect(screen.getByRole("switch")).toHaveAccessibleDescription(
      "Haftada bir",
    );
  });
});
