import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Accordion, AccordionItem } from "./Accordion";

function Example(props: Partial<React.ComponentProps<typeof Accordion>>) {
  return (
    <Accordion {...props}>
      <AccordionItem id="a" title="Ücretli mi?">
        Hayır, tamamen açık kaynak.
      </AccordionItem>
      <AccordionItem id="b" title="Hangi kişilikler var?">
        Sticker ve Eski Bilgisayar.
      </AccordionItem>
    </Accordion>
  );
}

const trigger = (name: string) => screen.getByRole("button", { name });

describe("Accordion", () => {
  it("başlıklar düğme olarak duyurulur ve paneli kontrol eder", async () => {
    render(<Example />);
    const a = trigger("Ücretli mi?");
    expect(a).toHaveAttribute("aria-expanded", "false");
    expect(a.closest("h3")).toBeInTheDocument();
    await userEvent.click(a);
    expect(a).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Hayır, tamamen açık kaynak.")).toBeVisible();
  });

  it("varsayılan olarak bir bölüm açık kalır", async () => {
    render(<Example />);
    await userEvent.click(trigger("Ücretli mi?"));
    await userEvent.click(trigger("Hangi kişilikler var?"));
    expect(trigger("Ücretli mi?")).toHaveAttribute("aria-expanded", "false");
    expect(trigger("Hangi kişilikler var?")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("allowsMultipleExpanded ile birden çok bölüm açılabilir", async () => {
    render(<Example allowsMultipleExpanded />);
    await userEvent.click(trigger("Ücretli mi?"));
    await userEvent.click(trigger("Hangi kişilikler var?"));
    expect(trigger("Ücretli mi?")).toHaveAttribute("aria-expanded", "true");
  });

  it("klavyeyle açılır", async () => {
    render(<Example defaultExpandedKeys={["b"]} />);
    expect(trigger("Hangi kişilikler var?")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(trigger("Ücretli mi?")).toHaveAttribute("aria-expanded", "true");
  });
});
