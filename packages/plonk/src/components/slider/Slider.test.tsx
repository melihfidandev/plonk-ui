import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlonkProvider } from "../../provider/PlonkProvider";
import { Slider } from "./Slider";

// jsdom'da yerleşim yok; rayı 0–200 px genişliğinde varsayalım.
const mockTrack = () =>
  vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockReturnValue({ left: 0, width: 200, top: 0, height: 20 } as DOMRect);

describe("Slider", () => {
  it("etiketli bir slider olarak duyurulur, biçimli değer okunur", () => {
    render(
      <Slider label="Volume" defaultValue={40} formatValue={(v) => `${v}%`} />,
    );
    const thumb = screen.getByRole("slider", { name: "Volume" });
    expect(thumb).toHaveAttribute("aria-valuenow", "40");
    expect(thumb).toHaveAttribute("aria-valuetext", "40%");
    expect(thumb).toHaveAttribute("aria-valuemin", "0");
    expect(thumb).toHaveAttribute("aria-valuemax", "100");
  });

  it("klavyeyle değişir: oklar, PageUp, Home, End", async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    render(
      <Slider
        label="Volume"
        defaultValue={50}
        step={5}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />,
    );
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "55");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(thumb).toHaveAttribute("aria-valuenow", "45");
    await userEvent.keyboard("{PageUp}");
    expect(thumb).toHaveAttribute("aria-valuenow", "55");
    await userEvent.keyboard("{End}");
    expect(thumb).toHaveAttribute("aria-valuenow", "100");
    await userEvent.keyboard("{Home}");
    expect(thumb).toHaveAttribute("aria-valuenow", "0");
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(onChangeEnd).toHaveBeenCalledTimes(6);
  });

  it("aralıkta tutamaçlar birbirini geçemez ve sınırlarını duyurur", async () => {
    const onChange = vi.fn();
    render(
      <Slider
        label="Price"
        defaultValue={[20, 60]}
        thumbLabels={["Min price", "Max price"]}
        onChange={onChange}
      />,
    );
    const low = screen.getByRole("slider", { name: /min price/i });
    const high = screen.getByRole("slider", { name: /max price/i });
    expect(low).toHaveAttribute("aria-valuemax", "60");
    expect(high).toHaveAttribute("aria-valuemin", "20");
    low.focus();
    await userEvent.keyboard("{End}");
    expect(low).toHaveAttribute("aria-valuenow", "60");
    expect(onChange).toHaveBeenLastCalledWith([60, 60]);
  });

  it("minGap ile tutamaçlar birbirine bu kadardan fazla yaklaşamaz", async () => {
    const onChange = vi.fn();
    render(
      <Slider
        label="Price"
        defaultValue={[300, 1200]}
        max={2000}
        step={50}
        minGap={100}
        thumbLabels={["Min price", "Max price"]}
        onChange={onChange}
      />,
    );
    const low = screen.getByRole("slider", { name: /min price/i });
    const high = screen.getByRole("slider", { name: /max price/i });
    expect(low).toHaveAttribute("aria-valuemax", "1100");
    expect(high).toHaveAttribute("aria-valuemin", "400");
    low.focus();
    await userEvent.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith([1100, 1200]);
    high.focus();
    await userEvent.keyboard("{Home}");
    expect(high).toHaveAttribute("aria-valuenow", "1200");
  });

  it("fareyle tıklanan noktaya en yakın tutamaç gider", () => {
    const spy = mockTrack();
    const onChangeEnd = vi.fn();
    const { container } = render(
      <Slider
        label="Price"
        defaultValue={[20, 60]}
        onChangeEnd={onChangeEnd}
      />,
    );
    const area = container.querySelector(".plonk-slider")!;
    fireEvent.pointerDown(area, { button: 0, pointerId: 1, clientX: 180 });
    fireEvent.pointerUp(area, { pointerId: 1, clientX: 180 });
    expect(onChangeEnd).toHaveBeenCalledWith([20, 90]);
    spy.mockRestore();
  });

  it("provider'ın diline göre biçimlenir, formla gönderilir", () => {
    const { container } = render(
      <PlonkProvider locale="tr-TR">
        <Slider
          label="Fiyat"
          name="price"
          defaultValue={[300, 1200]}
          max={2000}
          formatOptions={{
            style: "currency",
            currency: "TRY",
            maximumFractionDigits: 0,
          }}
        />
      </PlonkProvider>,
    );
    expect(screen.getAllByRole("slider")[1]).toHaveAttribute(
      "aria-valuetext",
      "₺1.200",
    );
    const inputs = container.querySelectorAll<HTMLInputElement>(
      'input[name="price"]',
    );
    expect([...inputs].map((i) => i.value)).toEqual(["300", "1200"]);
  });

  it("sağdan sola dillerde sağ ok değeri azaltır", async () => {
    render(
      <PlonkProvider locale="ar-EG">
        <Slider aria-label="Level" defaultValue={50} />
      </PlonkProvider>,
    );
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "49");
  });

  it("aralıkta balonlar çakışınca birleşir, uzaklaşınca ayrılır", async () => {
    // Ray 300 px, tek değerli yazı 40 px, balon çerçevesi 16 px.
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains("plonk-slider")) return 300;
        if (this.classList.contains("plonk-slider-bubble-one")) return 40;
        if (this.classList.contains("plonk-slider-bubble")) return 56;
        return 0;
      },
    );
    render(
      <Slider label="Price" defaultValue={[200, 800]} min={0} max={1000} />,
    );
    const box = document.querySelector(".plonk-slider")!;
    const [low] = screen.getAllByRole("slider");
    // 600 birim = 180 px: balonlar (56 px) rahat sığar.
    expect(box).not.toHaveAttribute("data-merged");

    // Alttakini 750'ye yaklaştır: 50 birim = 15 px, balonlar çakışır.
    low!.focus();
    await userEvent.keyboard("{PageUp}".repeat(5) + "{ArrowRight}".repeat(50));
    expect(low).toHaveAttribute("aria-valuenow", "750");
    expect(box).toHaveAttribute("data-merged");
    expect(
      document.querySelector(".plonk-slider-bubble-both"),
    ).toHaveTextContent("750 – 800");

    await userEvent.keyboard("{Home}");
    expect(box).not.toHaveAttribute("data-merged");
    expect(box).toHaveAttribute("data-split");
    vi.restoreAllMocks();
  });

  it("devre dışıyken değişmez ve odaklanmaz", async () => {
    const onChange = vi.fn();
    render(
      <Slider
        label="Locked"
        defaultValue={30}
        isDisabled
        onChange={onChange}
      />,
    );
    const thumb = screen.getByRole("slider");
    expect(thumb).toHaveAttribute("aria-disabled", "true");
    expect(thumb).not.toHaveAttribute("tabindex");
    fireEvent.keyDown(thumb, { key: "End" });
    expect(onChange).not.toHaveBeenCalled();
  });
});
