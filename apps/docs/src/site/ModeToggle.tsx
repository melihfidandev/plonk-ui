"use client";

/**
 * Açık / koyu mod düğmesi. Mod `<html data-mode>`'da durur (ilk değeri kök
 * düzendeki betik, sayfa çizilmeden koyar); düğme sadece değiştirir ve hatırlar.
 */
export function ModeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.mode === "dark" ? "light" : "dark";
    root.dataset.mode = next;
    try {
      localStorage.setItem("plonk-docs-mode", next);
    } catch {
      // Gizli pencere vb.: seçim bu sekmeyle sınırlı kalır.
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="site-icon-button site-mode"
    >
      <svg
        className="sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="square"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        className="moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="square"
        aria-hidden="true"
      >
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
      </svg>
    </button>
  );
}
