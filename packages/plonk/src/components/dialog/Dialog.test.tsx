import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlonkProvider } from "../../provider/PlonkProvider";
import { Button } from "../button/Button";
import { Dialog, DialogTrigger } from "./Dialog";

function Example(props: Partial<React.ComponentProps<typeof Dialog>>) {
  return (
    <DialogTrigger>
      <Button>Aç</Button>
      <Dialog
        title="Projeyi sil"
        description="Bu işlem geri alınamaz."
        closeLabel="Kapat"
        footer={({ close }) => <Button onPress={close}>Vazgeç</Button>}
        {...props}
      >
        <input aria-label="Proje adı" />
      </Dialog>
    </DialogTrigger>
  );
}

const open = () => userEvent.click(screen.getByRole("button", { name: "Aç" }));

describe("Dialog", () => {
  it("Button ile açılır, başlık ve açıklamayla duyurulur", async () => {
    render(<Example />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await open();
    const dialog = screen.getByRole("dialog", { name: "Projeyi sil" });
    expect(dialog).toHaveAccessibleDescription("Bu işlem geri alınamaz.");
  });

  it("odağı içeri alır, Esc ile kapanır ve odağı açan düğmeye geri verir", async () => {
    render(<Example />);
    await open();
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    // React Aria odağı bir sonraki karede geri verir.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Aç" })).toHaveFocus(),
    );
  });

  it("Tab odağı dialog içinde tutar", async () => {
    render(<Example />);
    await open();
    const dialog = screen.getByRole("dialog");
    for (let i = 0; i < 5; i++) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("kapatma kutusu ve footer'daki close çalışır", async () => {
    render(<Example />);
    await open();
    await userEvent.click(screen.getByRole("button", { name: "Kapat" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await open();
    await userEvent.click(screen.getByRole("button", { name: "Vazgeç" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("dışarı tıklayınca kapanır", async () => {
    render(<Example />);
    await open();
    await userEvent.click(document.querySelector(".plonk-dialog-overlay")!);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("alertdialog dışarı tıklayınca kapanmaz ve kapatma kutusu yoktur", async () => {
    render(<Example role="alertdialog" />);
    await open();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Kapat" })).toBeNull();
    await userEvent.click(document.querySelector(".plonk-dialog-overlay")!);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("kontrollü kullanılabilir", async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [isOpen, setOpen] = useState(true);
      return (
        <Dialog
          title="Ayarlar"
          isOpen={isOpen}
          onOpenChange={(v) => {
            onOpenChange(v);
            setOpen(v);
          }}
          closeLabel="Kapat"
        />
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole("button", { name: "Kapat" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("provider'ın kişiliğini taşıyan katmanda açılır", async () => {
    render(
      <PlonkProvider personality="retro" motion="reduce" jelly={0.4}>
        <Example />
      </PlonkProvider>,
    );
    await open();
    const layer = screen.getByRole("dialog").closest("[data-plonk-layer]");
    expect(layer).toHaveAttribute("data-plonk-personality", "retro");
    expect(layer).toHaveAttribute("data-plonk-motion", "reduce");
    expect(
      (layer as HTMLElement).style.getPropertyValue("--plonk-jelly-amount"),
    ).toBe("0.4");
  });
});

describe("Dialog geri sayımı", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function Timed(props: Partial<React.ComponentProps<typeof Dialog>>) {
    const [isOpen, setOpen] = useState(true);
    return (
      <Dialog
        role="alertdialog"
        title="Oturumun kapanmak üzere"
        isOpen={isOpen}
        onOpenChange={setOpen}
        countdown={12}
        countdownLabel="Devam?"
        countdownMessage={(s) => `${s} saniye kaldı`}
        {...props}
      />
    );
  }
  const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));
  const shown = () =>
    document.querySelector(".plonk-countdown-n")?.textContent ?? null;

  it("saniye saniye azalır; görünen sayı ekran okuyuculardan gizli", () => {
    vi.useFakeTimers();
    render(<Timed />);
    expect(shown()).toBe("12");
    expect(document.querySelector(".plonk-countdown-n")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    tick(3000);
    expect(shown()).toBe("9");
  });

  it("ekran okuyucuya her saniye değil, sadece 10 ve 5 saniye kala söyler", () => {
    vi.useFakeTimers();
    render(<Timed />);
    const live = document.querySelector(".plonk-countdown [aria-live]");
    expect(live).toHaveTextContent("");
    tick(1000);
    expect(live).toHaveTextContent("");
    tick(1000);
    expect(live).toHaveTextContent("10 saniye kaldı");
    tick(1000);
    expect(live).toHaveTextContent("10 saniye kaldı");
    tick(4000);
    expect(live).toHaveTextContent("5 saniye kaldı");
  });

  it("bitince onCountdownEnd'i bir kez çağırır, close ile kapatılabilir", () => {
    vi.useFakeTimers();
    const onEnd = vi.fn(({ close }: { close: () => void }) => close());
    render(<Timed onCountdownEnd={onEnd} />);
    tick(11_000);
    expect(onEnd).not.toHaveBeenCalled();
    tick(1000);
    expect(onEnd).toHaveBeenCalledTimes(1);
    tick(5000);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("onCountdownEnd verilmezse süre bitince dialog kapanır", async () => {
    vi.useFakeTimers();
    render(<Timed countdown={2} />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    tick(2000);
    vi.useRealTimers();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });

  it("countdown verilmezse sayaç yok", () => {
    render(<Timed countdown={undefined} />);
    expect(document.querySelector(".plonk-countdown")).toBeNull();
  });
});
