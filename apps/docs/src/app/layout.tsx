import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Plonk", template: "%s · Plonk" },
  description: "Neo-brutalist React components with switchable personalities.",
};

// Sitenin kendi fontları (Plonk'unkiler kütüphaneyle gelir). Build'de indirilip
// siteyle birlikte sunulur.
const sans = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--site-font-sans",
});
const mono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--site-font-mono",
});

/*
 * Açık / koyu mod sayfa çizilmeden seçilir: yoksa koyu mod kullanan biri her
 * açılışta bir an beyaz sayfa görür. Seçim yoksa sistem ayarı.
 */
const MODE_SCRIPT = `try{var m=localStorage.getItem("plonk-docs-mode");if(m!=="light"&&m!=="dark")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.mode=m}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
