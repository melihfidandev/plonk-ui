import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "../button/Button";
import { Tooltip, TooltipTrigger } from "./Tooltip";

function Example() {
  return (
    <TooltipTrigger>
      <Button aria-label="Kaydet">💾</Button>
      <Tooltip>Kaydet (⌘S)</Tooltip>
    </TooltipTrigger>
  );
}

describe("Tooltip", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  // İlk sırada: React Aria açık kalmış bir ipucunu genel olarak "ısınmış"
  // sayar ve sonrakileri beklemeden açar; bu test o durumdan etkilenmemeli.
  it("fareyle 500ms bekleyince açılır", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Example />);
    // React Aria fare ile gezinmeyi bir pointer hareketinden sonra tanır.
    await user.pointer({ target: document.body, coords: { x: 0, y: 0 } });
    await user.hover(screen.getByRole("button"));
    act(() => vi.advanceTimersByTime(300));
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("klavye odağında hemen açılır ve düğmeyi açıklar", async () => {
    render(<Example />);
    await userEvent.tab();
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Kaydet (⌘S)");
    expect(screen.getByRole("button")).toHaveAccessibleDescription(
      "Kaydet (⌘S)",
    );
  });

  it("Esc ile kapanır", async () => {
    render(<Example />);
    await userEvent.tab();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
