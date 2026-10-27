import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlonkProvider } from "../../provider/PlonkProvider";
import {
  MIN_TIMEOUT,
  setDefaultToastTape,
  setDefaultToastTimeout,
  toast,
} from "./queue";

// Kuyruk modül düzeyinde; testler birbirine bulaşmasın.
afterEach(() => {
  act(() => toast.dismiss());
  setDefaultToastTimeout(MIN_TIMEOUT);
  setDefaultToastTape(true);
  vi.useRealTimers();
});

const show = (...args: Parameters<typeof toast>) => {
  let key = "";
  act(() => {
    key = toast(...args);
  });
  return key;
};

const region = () => screen.getByRole("region", { name: /notification/i });

describe("Toast", () => {
  it("provider'ın katman kabında, kişiliğiyle birlikte açılır", () => {
    render(<PlonkProvider personality="retro" />);
    expect(screen.queryByRole("region")).toBeNull();
    show("Changes saved", { description: "2 seconds ago" });
    const item = screen.getByRole("alertdialog", { name: "Changes saved" });
    expect(item).toHaveAccessibleDescription("2 seconds ago");
    expect(region().closest("[data-plonk-layer]")).toHaveAttribute(
      "data-plonk-personality",
      "retro",
    );
  });

  it("türü kısayollarla seçilir; açıklama yoksa boş bir açıklamaya bağlanmaz", () => {
    render(<PlonkProvider />);
    act(() => {
      toast.danger("Upload failed");
    });
    const item = screen.getByRole("alertdialog", { name: "Upload failed" });
    expect(item).toHaveAttribute("data-variant", "danger");
    expect(item).not.toHaveAttribute("aria-describedby");
  });

  it("Retro başlık çubuğu türün adını ya da verilen etiketi gösterir", () => {
    render(<PlonkProvider />);
    act(() => {
      toast.warning("Disk almost full");
      toast.success("Sent", { label: "Tamam" });
    });
    const [success, warning] = screen.getAllByRole("alertdialog");
    expect(within(warning!).getByText("Warning")).toBeInTheDocument();
    expect(within(success!).getByText("Tamam")).toBeInTheDocument();
  });

  it("kapatma kutusu toast'u kapatır ve onClose'u çağırır", async () => {
    const onClose = vi.fn();
    render(<PlonkProvider />);
    show("Saved", { onClose });
    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: /close/i,
      }),
    );
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("aksiyon çalışır, ardından toast kapanır", async () => {
    const onPress = vi.fn();
    render(<PlonkProvider />);
    show("Project deleted", { action: { label: "Undo", onPress } });
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onPress).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("süre dolunca kapanır; 5 sn'nin altı 5 sn'ye yükseltilir", () => {
    vi.useFakeTimers();
    render(<PlonkProvider />);
    show("Quick", { timeout: 1000 });
    act(() => vi.advanceTimersByTime(MIN_TIMEOUT - 100));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("aksiyonlu ve timeout: 0 olan toast kendiliğinden kapanmaz", () => {
    vi.useFakeTimers();
    render(<PlonkProvider />);
    show("Undo?", { action: { label: "Undo", onPress: () => {} } });
    show("Uploading…", { timeout: 0 });
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getAllByRole("alertdialog")).toHaveLength(2);
  });

  it("provider'ın toastTimeout ayarı varsayılan süreyi değiştirir", () => {
    vi.useFakeTimers();
    render(<PlonkProvider toastTimeout={9000} />);
    show("Saved");
    act(() => vi.advanceTimersByTime(8000));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1100));
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("en fazla 3 toast görünür, fazlası sırasını bekler", () => {
    render(<PlonkProvider />);
    const keys = ["1", "2", "3", "4"].map((n) => show(`Toast ${n}`));
    expect(screen.getAllByRole("alertdialog")).toHaveLength(3);
    act(() => toast.dismiss(keys[3]));
    expect(screen.getAllByRole("alertdialog")).toHaveLength(3);
    expect(screen.getByRole("alertdialog", { name: "Toast 1" })).toBeVisible();
  });

  it("dismiss() anahtarsız çağrılınca hepsini kapatır", async () => {
    render(<PlonkProvider />);
    show("A");
    show("B");
    act(() => toast.dismiss());
    // Çıkış hareketleri bitince bölge de kalkar.
    expect(screen.queryByRole("alertdialog")).toBeNull();
    await waitFor(() => expect(screen.queryByRole("region")).toBeNull());
  });

  it("fare üstündeyken süreleri durdurur", async () => {
    render(<PlonkProvider />);
    show("Saved");
    expect(region()).not.toHaveAttribute("data-paused");
    await userEvent.hover(screen.getByRole("alertdialog"));
    expect(region()).toHaveAttribute("data-paused");
    await userEvent.unhover(screen.getByRole("alertdialog"));
    expect(region()).not.toHaveAttribute("data-paused");
  });

  it("yana sürükleyince kapanır, kısa sürükleme yerine döner", () => {
    render(<PlonkProvider />);
    show("Saved");
    const item = screen.getByRole("alertdialog");
    const drag = (to: number) => {
      fireEvent.pointerDown(item, { pointerId: 1, button: 0, clientX: 0 });
      fireEvent.pointerMove(item, { pointerId: 1, clientX: to / 2 });
      fireEvent.pointerMove(item, { pointerId: 1, clientX: to });
      fireEvent.pointerUp(item, { pointerId: 1, clientX: to });
    };
    // jsdom'da olayların zaman damgası aynı; hız yüksek çıkar, bu yüzden kısa mesafe.
    drag(12);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(item.style.getPropertyValue("--plonk-toast-drag-x")).toBe("");
    drag(200);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("bant varsayılan açık; toast ya da provider ayarıyla kapanır", () => {
    const tape = (name: string) =>
      screen
        .getByRole("alertdialog", { name })
        .querySelector(".plonk-toast-tape");
    const { unmount } = render(<PlonkProvider />);
    show("Default");
    show("Plain", { tape: false });
    expect(tape("Default")).not.toBeNull();
    expect(tape("Plain")).toBeNull();
    act(() => toast.dismiss());
    unmount();

    render(<PlonkProvider tape={false} />);
    show("Provider off");
    show("Opt in", { tape: true });
    expect(tape("Provider off")).toBeNull();
    expect(tape("Opt in")).not.toBeNull();
  });

  it("iç içe provider'larda tek bölge açılır; toaster={false} açmaz", () => {
    const { unmount } = render(
      <PlonkProvider>
        <PlonkProvider personality="retro" />
      </PlonkProvider>,
    );
    show("Once");
    expect(screen.getAllByRole("region")).toHaveLength(1);
    unmount();

    render(<PlonkProvider toaster={false} />);
    show("Nowhere");
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
