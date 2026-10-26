import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("varsayılan olarak type=button ile render edilir", () => {
    render(<Button>Kaydet</Button>);
    expect(screen.getByRole("button", { name: "Kaydet" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("tıklanınca işleyiciyi çağırır ve jöleyi başlatır", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Kaydet</Button>);
    const button = screen.getByRole("button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(button).toHaveAttribute("data-plonk-jelly", "pop");
  });

  it("klavyeyle de çalışır", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Kaydet</Button>);
    await userEvent.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("devre dışıyken tıklanmaz", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Kaydet
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("yüklenirken tıklanmaz ama odaklanabilir ve adını korur", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Kaydet
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Kaydet" });
    expect(button).toHaveAttribute("data-pending");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button).not.toHaveAttribute("data-plonk-jelly");
  });

  it("yüklenirken form göndermez", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading>
          Gönder
        </Button>
      </form>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("ikonları ekran okuyuculardan gizler", () => {
    render(
      <Button iconStart={<svg data-testid="icon" />} iconEnd={<svg />}>
        Ekle
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveAccessibleName("Ekle");
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("varyant ve boyut sınıflarını uygular, className'i birleştirir", () => {
    render(
      <Button variant="danger" size="lg" className="w-full">
        Sil
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-plonk-danger", "h-12", "w-full");
  });

  it("ref'i düğmeye iletir", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Tamam</Button>);
    expect(ref.current).toBe(screen.getByRole("button"));
  });

  it("HTML'deki disabled ile isDisabled aynı işi görür", () => {
    render(
      <>
        <Button disabled>A</Button>
        <Button isDisabled>B</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "A" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "B" })).toBeDisabled();
  });

  it("dokunma ve klavye için onPress de çalışır", async () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Kaydet</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledOnce();
  });
});
