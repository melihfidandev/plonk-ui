import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "../button/Button";
import { DialogTrigger } from "../dialog/Dialog";
import { Drawer, type DrawerProps } from "./Drawer";

function Example(props: Partial<DrawerProps>) {
  return (
    <DialogTrigger>
      <Button>Filtreler</Button>
      <Drawer title="Filtreler" closeLabel="Kapat" {...props}>
        <input aria-label="Ara" />
      </Drawer>
    </DialogTrigger>
  );
}

describe("Drawer", () => {
  it("DialogTrigger ile açılır ve yerleşimi işaretler", async () => {
    render(<Example placement="left" />);
    await userEvent.click(screen.getByRole("button", { name: "Filtreler" }));
    const dialog = screen.getByRole("dialog", { name: "Filtreler" });
    expect(dialog.closest(".plonk-drawer")).toHaveAttribute(
      "data-placement",
      "left",
    );
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("varsayılan olarak sağdan gelir; Esc ve kapatma kutusuyla kapanır", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Filtreler" });
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog").closest(".plonk-drawer")).toHaveAttribute(
      "data-placement",
      "right",
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Kapat" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("dışarı tıklayınca kapanır, istenirse kapanmaz", async () => {
    const { unmount } = render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Filtreler" }));
    await userEvent.click(document.querySelector(".plonk-dialog-overlay")!);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    unmount();

    render(<Example isDismissable={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Filtreler" }));
    await userEvent.click(document.querySelector(".plonk-dialog-overlay")!);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
