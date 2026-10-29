import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("başlıklı kart bir bölge olarak adlandırılır", () => {
    render(
      <Card title="Gelir" description="Son 30 gün">
        ₺12.400
      </Card>,
    );
    expect(screen.getByRole("region", { name: "Gelir" })).toHaveTextContent(
      "₺12.400",
    );
    expect(screen.getByRole("heading", { name: "Gelir" })).toBeInTheDocument();
  });

  it("başlık seviyesi varsayılan h3, headingLevel ile değişir", () => {
    const { rerender } = render(<Card title="Gelir" />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Gelir",
    );
    rerender(<Card title="Gelir" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Gelir",
    );
    // Bölge adı seviyeden bağımsız başlığa bağlı kalır.
    expect(screen.getByRole("region", { name: "Gelir" })).toBeInTheDocument();
  });

  it("başlıksız kart başlık alanı çizmez", () => {
    const { container } = render(<Card>İçerik</Card>);
    expect(container.querySelector("header")).toBeNull();
    expect(container.querySelector("section")).not.toHaveAttribute(
      "aria-labelledby",
    );
  });

  it("kapatma kutusu sadece onClose verilince gelir ve çalışır", async () => {
    const onClose = vi.fn();
    const { rerender } = render(<Card title="Not" />);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<Card title="Not" onClose={onClose} closeLabel="Kapat" />);
    await userEvent.click(screen.getByRole("button", { name: "Kapat" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("eylem, alt bilgi, bant ve eğimi uygular", () => {
    const { container } = render(
      <Card
        title="Plan"
        actions={<button>Düzenle</button>}
        footer={<span>Alt bilgi</span>}
        tape
        tilt="right"
      />,
    );
    const card = container.querySelector("section");
    expect(card).toHaveAttribute("data-tape");
    expect(card).toHaveClass("plonk-tilt-reverse");
    expect(screen.getByRole("button", { name: "Düzenle" })).toBeInTheDocument();
    expect(container.querySelector("footer")).toHaveTextContent("Alt bilgi");
  });
});
