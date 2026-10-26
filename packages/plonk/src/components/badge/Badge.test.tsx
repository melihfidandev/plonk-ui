import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";
import { Kbd } from "../kbd/Kbd";

describe("Badge", () => {
  it("varyant rengini ve noktayı uygular", () => {
    const { container } = render(
      <Badge variant="success" dot>
        Aktif
      </Badge>,
    );
    expect(screen.getByText("Aktif")).toHaveClass("bg-plonk-success");
    expect(container.querySelector("[aria-hidden]")).toBeInTheDocument();
  });
});

describe("Kbd", () => {
  it("kbd öğesi olarak render edilir", () => {
    render(<Kbd>⌘</Kbd>);
    expect(screen.getByText("⌘").tagName).toBe("KBD");
  });
});
