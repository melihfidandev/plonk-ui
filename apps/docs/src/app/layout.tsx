import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  Lilita_One,
  Nunito,
  Silkscreen,
} from "next/font/google";
import "./globals.css";

// Kişiliklerin fontları; globals.css bunları token'lara bağlıyor.
const lilita = Lilita_One({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-lilita",
});
const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
});
const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-silkscreen",
});
const plexMono = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Plonk",
  description: "Neo-brutalist React components with switchable personalities.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${lilita.variable} ${nunito.variable} ${silkscreen.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
