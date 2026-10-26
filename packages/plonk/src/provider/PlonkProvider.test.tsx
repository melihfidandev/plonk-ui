import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlonkProvider, usePersonality } from "./PlonkProvider";

function Probe() {
  return <span>{usePersonality()}</span>;
}

describe("PlonkProvider", () => {
  it("kişiliği hem DOM'a hem bağlama verir", () => {
    render(
      <PlonkProvider personality="retro" data-testid="root">
        <Probe />
      </PlonkProvider>,
    );
    expect(screen.getByTestId("root")).toHaveAttribute(
      "data-plonk-personality",
      "retro",
    );
    expect(screen.getByText("retro")).toBeInTheDocument();
  });

  it("provider yokken varsayılan kişiliği döner", () => {
    render(<Probe />);
    expect(screen.getByText("sticker")).toBeInTheDocument();
  });

  it("iç içe kullanımda en yakın provider kazanır", () => {
    render(
      <PlonkProvider personality="retro">
        <PlonkProvider personality="sticker">
          <Probe />
        </PlonkProvider>
      </PlonkProvider>,
    );
    expect(screen.getByText("sticker")).toBeInTheDocument();
  });

  it("hareket azaltma sadece istenince işaretlenir", () => {
    const { rerender } = render(<PlonkProvider data-testid="root" />);
    expect(screen.getByTestId("root")).not.toHaveAttribute("data-plonk-motion");
    rerender(<PlonkProvider data-testid="root" motion="reduce" />);
    expect(screen.getByTestId("root")).toHaveAttribute(
      "data-plonk-motion",
      "reduce",
    );
  });

  it("className'i birleştirir ve diğer özellikleri aktarır", () => {
    render(<PlonkProvider data-testid="root" className="p-4" id="app" />);
    const root = screen.getByTestId("root");
    expect(root).toHaveClass("plonk", "p-4");
    expect(root).toHaveAttribute("id", "app");
  });

  it("jelly ayarını token'a çevirir, diğer stilleri korur", () => {
    render(
      <PlonkProvider data-testid="root" jelly={0.3} style={{ color: "red" }} />,
    );
    const root = screen.getByTestId("root");
    expect(root.style.getPropertyValue("--plonk-jelly-amount")).toBe("0.3");
    expect(root.style.color).toBe("red");
  });

  it("katman kabı sadece CSS değişkenlerini taşır", () => {
    render(
      <PlonkProvider
        personality="retro"
        style={{ padding: 20, ["--plonk-tilt" as string]: "3deg" }}
      />,
    );
    const layer = document.querySelector<HTMLElement>("[data-plonk-layer]")!;
    expect(layer).toHaveAttribute("data-plonk-personality", "retro");
    expect(layer.style.getPropertyValue("--plonk-tilt")).toBe("3deg");
    expect(layer.style.padding).toBe("");
  });
});
