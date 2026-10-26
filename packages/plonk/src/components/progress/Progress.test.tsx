import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("değeri ve etiketi duyurur", () => {
    render(<Progress label="Yükleniyor" value={40} showValue />);
    const bar = screen.getByRole("progressbar", { name: "Yükleniyor" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuetext", "40%");
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("değeri sınırlar içinde tutar", () => {
    render(<Progress label="Dolu" value={140} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });

  it("değer yoksa belirsizdir", () => {
    render(<Progress label="Bekleniyor" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("data-indeterminate");
  });

  it("özel biçim ve max", () => {
    render(
      <Progress
        label="Adım"
        value={2}
        max={5}
        showValue
        formatValue={(v, m) => `${v}/${m}`}
      />,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuetext",
      "2/5",
    );
  });
});
