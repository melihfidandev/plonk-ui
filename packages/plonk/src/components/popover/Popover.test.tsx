import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "../button/Button";
import { DialogTrigger } from "../dialog/Dialog";
import { Popover } from "./Popover";

function Example() {
  return (
    <DialogTrigger>
      <Button>Paylaş</Button>
      <Popover title="Bağlantıyı paylaş">
        {({ close }) => <Button onPress={close}>Kopyala</Button>}
      </Popover>
    </DialogTrigger>
  );
}

describe("Popover", () => {
  it("açılır, başlığıyla adlandırılır ve odağı içeri alır", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Paylaş" });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const dialog = screen.getByRole("dialog", { name: "Bağlantıyı paylaş" });
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("Esc ve içerideki close ile kapanır", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Paylaş" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Kopyala" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("dışarı tıklayınca kapanır", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Paylaş" }));
    await userEvent.click(document.body);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
