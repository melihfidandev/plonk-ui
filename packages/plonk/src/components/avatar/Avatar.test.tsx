import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarGroup, initials } from "./Avatar";

describe("initials", () => {
  it("ilk ve son kelimenin baş harfleri", () => {
    expect(initials("Melih Fidan")).toBe("MF");
    expect(initials("ayşe nur yılmaz")).toBe("AY");
    expect(initials("plonk")).toBe("P");
    expect(initials("  ")).toBe("");
  });
});

describe("Avatar", () => {
  it("resmi adıyla gösterir", () => {
    render(<Avatar name="Melih Fidan" src="/m.png" />);
    expect(screen.getByRole("img", { name: "Melih Fidan" })).toHaveAttribute(
      "src",
      "/m.png",
    );
  });

  it("resim yüklenemezse baş harflere düşer", () => {
    render(<Avatar name="Melih Fidan" src="/yok.png" />);
    fireEvent.error(screen.getByRole("img"));
    const fallback = screen.getByRole("img", { name: "Melih Fidan" });
    expect(fallback).toHaveTextContent("MF");
  });

  it("aynı isim her zaman aynı rengi alır", () => {
    const { container } = render(
      <>
        <Avatar name="Deniz" />
        <Avatar name="Deniz" />
      </>,
    );
    const [a, b] = container.querySelectorAll(".plonk-avatar");
    expect(a!.className).toBe(b!.className);
  });
});

describe("AvatarGroup", () => {
  it("fazlasını +N olarak gösterir ve boyutu aktarır", () => {
    const { container } = render(
      <AvatarGroup max={2} size="sm" aria-label="Ekip">
        <Avatar name="Ali" />
        <Avatar name="Berk" />
        <Avatar name="Cem" />
        <Avatar name="Dila" />
      </AvatarGroup>,
    );
    expect(screen.getByRole("group", { name: "Ekip" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "2 more" })).toHaveTextContent("+2");
    expect(screen.queryByRole("img", { name: "Cem" })).toBeNull();
    expect(container.querySelector(".plonk-avatar")).toHaveClass("size-8");
  });
});
