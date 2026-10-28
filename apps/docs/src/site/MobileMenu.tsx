"use client";

import { useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { Sidebar } from "./Sidebar";

/**
 * Dar ekranda sayfa listesi: soldan kayan tam boy panel. Esc, dışarı dokunma
 * ya da bir sayfaya gitmek kapatır; açıkken odak panelin içinde kalır.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="site-icon-button site-menu-button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="square"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      </button>
      <ModalOverlay
        isOpen={open}
        onOpenChange={setOpen}
        isDismissable
        className="site-menu-overlay"
      >
        <Modal className="site-menu-panel">
          <Dialog aria-label="Menu" className="site-menu-dialog">
            <div className="site-menu-head">
              <span>Menu</span>
              <button
                type="button"
                className="site-icon-button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="square"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <Sidebar
              className="site-menu-list"
              onNavigate={() => setOpen(false)}
            />
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
