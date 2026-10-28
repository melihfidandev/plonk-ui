"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Autocomplete,
  Dialog,
  Input,
  Menu,
  MenuItem,
  Modal,
  ModalOverlay,
  SearchField,
  useFilter,
} from "react-aria-components";
import { READY_PAGES } from "./nav";

/**
 * Site araması (⌘K / Ctrl+K). Sitenin kendi parçası: Plonk'un Komut paleti
 * bileşen sayfasında sergilenen bir eser, burada kullanılmaz.
 */
export function Search() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { contains } = useFilter({ sensitivity: "base" });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        className="site-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search the docs"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="square"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.5-4.5" />
        </svg>
        <span>Search the docs…</span>
        <kbd>⌘K</kbd>
      </button>
      <ModalOverlay
        isOpen={open}
        onOpenChange={setOpen}
        isDismissable
        className="site-search-overlay"
      >
        <Modal className="site-search-modal">
          <Dialog aria-label="Search the docs" className="site-search">
            <Autocomplete filter={contains}>
              <SearchField aria-label="Search" autoFocus>
                <Input placeholder="Search pages…" />
              </SearchField>
              <Menu
                items={READY_PAGES}
                renderEmptyState={() => (
                  <div className="site-search-empty">No pages found.</div>
                )}
                onAction={(href) => {
                  setOpen(false);
                  router.push(String(href));
                }}
              >
                {(page) => (
                  <MenuItem id={page.href} textValue={page.title}>
                    {page.title}
                    <small>{page.section}</small>
                  </MenuItem>
                )}
              </Menu>
            </Autocomplete>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
