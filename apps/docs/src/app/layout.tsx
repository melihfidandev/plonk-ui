import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plonk",
  description: "Neo-brutalist React components with switchable personalities.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
