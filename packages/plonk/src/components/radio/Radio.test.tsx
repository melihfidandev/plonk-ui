import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Radio, RadioGroup } from "./Radio";

function Plans(props: Partial<React.ComponentProps<typeof RadioGroup>>) {
  return (
    <RadioGroup label="Plan" {...props}>
      <Radio value="free" label="Ücretsiz" />
      <Radio value="pro" label="Pro" />
      <Radio value="team" label="Ekip" />
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  it("grubu etiketiyle duyurur ve aynı adı paylaşır", () => {
    render(<Plans name="plan" />);
    expect(screen.getByRole("group", { name: "Plan" })).toBeInTheDocument();
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("name", "plan");
    }
  });

  it("kontrolsüz: başlangıç değeri ve seçim", async () => {
    const onValueChange = vi.fn();
    render(<Plans defaultValue="pro" onValueChange={onValueChange} />);
    expect(screen.getByLabelText("Pro")).toBeChecked();
    await userEvent.click(screen.getByLabelText("Ekip"));
    expect(screen.getByLabelText("Ekip")).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith("team");
  });

  it("kontrollü: değer dışarıdan gelir", async () => {
    function Controlled() {
      const [value, setValue] = useState("free");
      return (
        <>
          <Plans value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByLabelText("Pro"));
    expect(screen.getByRole("status")).toHaveTextContent("pro");
    expect(screen.getByLabelText("Pro")).toBeChecked();
  });

  it("kontrollü ve boş (null) başlayıp seçime uyarısız geçer", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    function Empty() {
      const [value, setValue] = useState<string | null>(null);
      return <Plans value={value} onValueChange={setValue} />;
    }
    render(<Empty />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).not.toBeChecked();
    }
    await userEvent.click(screen.getByLabelText("Ekip"));
    expect(screen.getByLabelText("Ekip")).toBeChecked();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it("ok tuşlarıyla gezinir", async () => {
    render(<Plans defaultValue="free" />);
    await userEvent.tab();
    expect(screen.getByLabelText("Ücretsiz")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByLabelText("Pro")).toBeChecked();
  });

  it("hata grubu ve seçenekleri işaretler", () => {
    render(<Plans error="Bir plan seç" />);
    expect(screen.getByRole("group")).toHaveAccessibleDescription(
      "Bir plan seç",
    );
    expect(screen.getByLabelText("Pro")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("devre dışı grup tüm seçenekleri kapatır", () => {
    render(<Plans disabled />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
  });

  it("grup dışında kullanılırsa açık bir hata verir", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Radio value="x" />)).toThrow(/RadioGroup/);
  });
});
