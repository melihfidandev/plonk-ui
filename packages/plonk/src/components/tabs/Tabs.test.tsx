import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tab, TabList, TabPanel, Tabs } from "./Tabs";

function Example(props: Partial<React.ComponentProps<typeof Tabs>>) {
  return (
    <Tabs {...props}>
      <TabList aria-label="Ayarlar">
        <Tab id="general">Genel</Tab>
        <Tab id="team">Ekip</Tab>
        <Tab id="billing" isDisabled>
          Fatura
        </Tab>
        <Tab id="security">Güvenlik</Tab>
      </TabList>
      <TabPanel id="general">Genel ayarlar</TabPanel>
      <TabPanel id="team">Ekip üyeleri</TabPanel>
      <TabPanel id="billing">Fatura bilgileri</TabPanel>
      <TabPanel id="security">Güvenlik ayarları</TabPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("sekmeler ve panel doğru rollerle duyurulur", () => {
    render(<Example />);
    expect(
      screen.getByRole("tablist", { name: "Ayarlar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Genel" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Genel ayarlar");
  });

  it("tıklayınca sekme değişir; tek gösterge ilk yüklemede değil değişimde ezilir", async () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <Example onSelectionChange={onSelectionChange} />,
    );
    const indicators = container.querySelectorAll(".plonk-tab-indicator");
    expect(indicators).toHaveLength(1);
    expect(indicators[0]).not.toHaveAttribute("data-plonk-jelly");
    await userEvent.click(screen.getByRole("tab", { name: "Ekip" }));
    expect(onSelectionChange).toHaveBeenCalledWith("team");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Ekip üyeleri");
    expect(indicators[0]).toHaveAttribute("data-plonk-jelly", "squish");
    expect(indicators[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("ok tuşlarıyla gezilir, devre dışı sekme atlanır", async () => {
    render(<Example />);
    await userEvent.tab();
    expect(screen.getByRole("tab", { name: "Genel" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Güvenlik" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Güvenlik ayarları");
  });
});
