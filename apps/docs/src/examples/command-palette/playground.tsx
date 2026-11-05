"use client";

import { useRef, useState } from "react";
import {
  CommandGroup,
  CommandItem,
  CommandPage,
  CommandPalette,
  CommandPaletteTrigger,
} from "plonk-ui";
import { Playground } from "@/site/Playground";

const CUSTOMERS = [
  "Acme Studio",
  "Atlas Logistics",
  "Bora Textiles",
  "Çınar Foods",
  "Deniz Architects",
  "İpek Cosmetics",
  "Işık Electric",
];

/**
 * Command Palette sayfasının oyun alanı ve sayfadaki tek canlı palet: açık
 * durumu modül düzeyinde ortak, birden çok palet birlikte açılırdı. ⌘K docs
 * sitesinin aramasına ait, bu yüzden `shortcut={false}`.
 */
export default function CommandPalettePlayground() {
  const [last, setLast] = useState("nothing yet");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const request = useRef(0);
  const run = (what: string) => () => setLast(what);

  // Sahte sunucu: 600 ms sonra eşleşen müşteriler.
  const searchCustomers = (search: string) => {
    const id = ++request.current;
    if (search.trim().length < 2) {
      setLoading(false);
      setResults([]);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (id !== request.current) return;
      const query = search.toLocaleLowerCase();
      setResults(
        CUSTOMERS.filter((c) => c.toLocaleLowerCase().includes(query)),
      );
      setLoading(false);
    }, 600);
  };

  return (
    <Playground
      component="CommandPalette"
      controls={{
        title: { type: "text", default: "Go to" },
        placeholder: { type: "text", default: "Search pages and actions…" },
        emptyLabel: { type: "text", default: "Nothing found" },
      }}
      childrenCode={[
        '<CommandGroup heading="Pages">',
        '  <CommandItem onAction={() => go("/invoices")}>Invoices</CommandItem>',
        "  …",
        "</CommandGroup>",
      ].join("\n")}
      wrapCode={(jsx, indent) =>
        `<>\n  <CommandPaletteTrigger />\n${indent(jsx)}\n</>`
      }
      render={({ title, placeholder, emptyLabel }) => (
        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <CommandPaletteTrigger>
            Search pages and actions…
          </CommandPaletteTrigger>
          <span className="font-bold">Last command: {last}</span>
          <CommandPalette
            shortcut={false}
            title={title || undefined}
            placeholder={placeholder || undefined}
            emptyLabel={emptyLabel || undefined}
            onSearchChange={searchCustomers}
          >
            <CommandGroup heading="Pages">
              <CommandItem icon="📊" onAction={run("Dashboard")}>
                Dashboard
              </CommandItem>
              <CommandItem
                icon="🧾"
                keywords={["billing", "payments"]}
                onAction={run("Invoices")}
              >
                Invoices
              </CommandItem>
              <CommandItem
                icon="⚙️"
                description="Account, team, billing"
                keywords={["preferences"]}
                onAction={run("Settings")}
              >
                Settings
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Actions">
              <CommandItem
                icon="➕"
                shortcut="⌘N"
                onAction={run("New invoice")}
              >
                New invoice
              </CommandItem>
              <CommandItem icon="🎨" page="theme">
                Change theme
              </CommandItem>
              <CommandItem icon="📤" isDisabled>
                Export everything
              </CommandItem>
            </CommandGroup>
            {(loading || results.length > 0) && (
              <CommandGroup
                heading="Customers"
                filter={false}
                isLoading={loading}
                loadingLabel="Searching…"
              >
                {results.map((customer) => (
                  <CommandItem
                    key={customer}
                    icon="🏢"
                    onAction={run(customer)}
                  >
                    {customer}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandPage id="theme">
              <CommandGroup heading="Theme">
                <CommandItem onAction={run("Light theme")}>Light</CommandItem>
                <CommandItem onAction={run("Dark theme")}>Dark</CommandItem>
                <CommandItem onAction={run("System theme")}>System</CommandItem>
              </CommandGroup>
            </CommandPage>
          </CommandPalette>
        </div>
      )}
    />
  );
}
