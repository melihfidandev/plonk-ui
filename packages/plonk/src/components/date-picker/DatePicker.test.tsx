import { CalendarDate } from "@internationalized/date";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlonkProvider } from "../../provider/PlonkProvider";
import { Calendar, RangeCalendar } from "./Calendar";
import { DatePicker, DateRangePicker } from "./DatePicker";

const OCT = new CalendarDate(2026, 10, 14);

describe("DatePicker", () => {
  it("etiketli bir alan ve takvim düğmesi gösterir; takvim açılıp gün seçilir", async () => {
    const onChange = vi.fn();
    render(
      <PlonkProvider locale="en-US">
        <DatePicker label="Due date" defaultValue={OCT} onChange={onChange} />
      </PlonkProvider>,
    );
    expect(screen.getByRole("group", { name: "Due date" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /calendar/i }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading")).toHaveTextContent(
      "October 2026",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: /October 20, 2026/ }),
    );
    expect(onChange).toHaveBeenCalledWith(new CalendarDate(2026, 10, 20));
  });

  it("provider'ın locale'ine göre biçimlenir: Türkçe ay adı, pazartesiyle başlayan hafta", () => {
    render(
      <PlonkProvider locale="tr-TR">
        <Calendar aria-label="Takvim" defaultValue={OCT} />
      </PlonkProvider>,
    );
    expect(screen.getByRole("heading")).toHaveTextContent("Ekim 2026");
    // Gün başlıkları ekran okuyucudan gizli (her hücre tam tarihi okur).
    const firstDay = document.querySelector(".plonk-cal-dow");
    expect(firstDay).toHaveTextContent(/pzt/i);
  });

  it("seçili gün sticker işaretini taşır", () => {
    render(
      <PlonkProvider locale="en-US">
        <Calendar aria-label="Calendar" defaultValue={OCT} />
      </PlonkProvider>,
    );
    const selected = screen.getByRole("button", { name: /October 14, 2026/ });
    expect(selected).toHaveAttribute("data-selected");
    expect(selected.querySelector(".plonk-cal-dot")).not.toBeNull();
  });

  it("kapalı günler seçilemez", async () => {
    const onChange = vi.fn();
    render(
      <PlonkProvider locale="en-US">
        <Calendar
          aria-label="Calendar"
          defaultFocusedValue={OCT}
          isDateUnavailable={(d) => d.day === 15}
          onChange={onChange}
        />
      </PlonkProvider>,
    );
    const off = screen.getByRole("button", { name: /October 15, 2026/ });
    expect(off).toHaveAttribute("data-unavailable");
    await userEvent.click(off);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("hata mesajı verilince alan geçersiz sayılır ve mesaj gösterilir", () => {
    render(
      <PlonkProvider locale="en-US">
        <DatePicker label="Due date" error="Pick a future date" />
      </PlonkProvider>,
    );
    expect(screen.getByRole("group", { name: "Due date" })).toHaveAttribute(
      "data-invalid",
    );
    expect(screen.getByText("Pick a future date")).toBeInTheDocument();
  });

  it("ok tuşlarıyla ay değişir ve eski sayfa geçici bir kopya olarak bırakılır", async () => {
    render(
      <PlonkProvider locale="en-US">
        <Calendar aria-label="Calendar" defaultValue={OCT} />
      </PlonkProvider>,
    );
    // React Aria ekran okuyucular için görünmez ikinci bir "Next" ekler.
    await userEvent.click(
      document.querySelector<HTMLElement>('[slot="next"]')!,
    );
    expect(screen.getByRole("heading")).toHaveTextContent("November 2026");
    // jsdom'da animasyon yok; kopya hemen kaldırılır, erişilebilirlik ağacına hiç girmez.
    expect(document.querySelectorAll(".plonk-cal-old")).toHaveLength(0);
    expect(screen.getAllByRole("grid")).toHaveLength(1);
  });
});

describe("DateRangePicker", () => {
  it("iki gün seçilince aralık oluşur; uçlar ve ara günler işaretlenir", async () => {
    const onChange = vi.fn();
    render(
      <PlonkProvider locale="en-US">
        <RangeCalendar
          aria-label="Range"
          defaultFocusedValue={OCT}
          onChange={onChange}
        />
      </PlonkProvider>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /October 12, 2026/ }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /October 16, 2026/ }),
    );
    expect(onChange).toHaveBeenCalledWith({
      start: new CalendarDate(2026, 10, 12),
      end: new CalendarDate(2026, 10, 16),
    });
    const middle = screen.getByRole("button", { name: /October 14, 2026/ });
    expect(middle.querySelector(".plonk-cal-hl")).not.toBeNull();
    expect(middle.querySelector(".plonk-cal-dot")).toBeNull();
  });

  it("hazır seçenek aralığı seçer ve alana yazar", async () => {
    const onChange = vi.fn();
    const range = {
      start: new CalendarDate(2026, 9, 1),
      end: new CalendarDate(2026, 9, 30),
    };
    render(
      <PlonkProvider locale="en-US">
        <DateRangePicker
          label="Report"
          defaultValue={{ start: OCT, end: OCT }}
          presets={[{ label: "September", range: () => range }]}
          onChange={onChange}
        />
      </PlonkProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /calendar/i }));
    await userEvent.click(
      await screen.findByRole("button", { name: "September" }),
    );
    expect(onChange).toHaveBeenCalledWith(range);
  });
});
