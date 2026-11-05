/*
 * Paylaşım görseli (Open Graph): link bir yere yapıştırılınca çıkan kart. Tasarım "B · Dört kişilik"
 * (2026-11-05 kullanıcı seçimi): koyu zeminde sayfa başlığı ve açıklaması, altta aynı kelime dört
 * kişiliğin düğmesi olarak.
 *
 * Her sayfa klasöründeki opengraph-image.tsx bunu kendi yoluyla çağırır; başlık ve açıklama o sayfanın
 * page.mdx'indeki `metadata`'dan okunur (tek kaynak). Görseller build'de bir kez üretilir.
 *
 * ImageResponse (Satori) sadece flexbox anlar: birden çok çocuğu olan her kutu `display: flex` ister,
 * fontlar .woff/.ttf olmalı (.woff2 okunmaz).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { NAV } from "@/site/nav";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ROOT = process.cwd();
const INK = "#0f1115";
const PAPER = "#f6f3ec";
const ACCENT = "#7c97ff";

const HOME = {
  title: "Plonk",
  description: "Neo-brutalist React components with switchable personalities.",
  crumb: "docs",
  label: "Plonk",
};

// Dört kişiliğin düğmesi: kişiliğin kendi zemini, fontu, dolgusu, köşesi ve gölgesi.
// `width`: fontun harf başına ortalama genişliği (em); yazı hücreye sığsın diye boyut buna göre.
const PERSONALITIES = [
  {
    canvas: "#FFF7E0",
    font: "Baloo 2",
    width: 0.62,
    upper: false,
    ink: INK,
    fill: "#FFD23F",
    border: INK,
    radius: 12,
    shadow: `7px 7px 0 ${INK}`,
  },
  {
    canvas: "#D8D3C4",
    font: "Tiny5",
    width: 0.6,
    upper: true,
    ink: "#fff",
    fill: "#5B4CFF",
    border: INK,
    radius: 0,
    shadow: `7px 7px 0 ${INK}`,
  },
  {
    canvas: "#FFF3D6",
    font: "Bangers",
    width: 0.5,
    upper: true,
    ink: "#fff",
    fill: "#E3170A",
    border: INK,
    radius: 3,
    shadow: `7px 7px 0 ${INK}`,
  },
  {
    canvas: "#1A1238",
    font: "Bungee",
    width: 0.7,
    upper: true,
    ink: "#fff",
    fill: "#E0006F",
    border: "#F4F0FF",
    radius: 999,
    shadow: "0 7px 0 #23E5FF",
  },
] as const;

const FONTS = [
  ["Space Grotesk", "space-grotesk-latin-500-normal.woff", 500],
  ["Space Grotesk", "space-grotesk-latin-700-normal.woff", 700],
  ["JetBrains Mono", "jetbrains-mono-latin-500-normal.woff", 500],
  ["Baloo 2", "baloo-2-latin-800-normal.woff", 800],
  ["Tiny5", "tiny5-latin-400-normal.woff", 400],
  ["Bangers", "bangers-latin-400-normal.woff", 400],
  ["Bungee", "bungee-latin-400-normal.woff", 400],
] as const;

// Dosya okumaları "use cache" içinde: Cache Components ancak böyle görseli build'de bir kez üretir
// (yoksa her istekte üretilir ve Vercel'de dosyalar sunucu paketinde olmayabilir).
async function readFonts() {
  "use cache";
  cacheLife("max");
  return Promise.all(
    FONTS.map(async ([, file]) => {
      const buf = await readFile(path.join(ROOT, "src/site/og/fonts", file));
      return new Uint8Array(buf);
    }),
  );
}

async function loadFonts() {
  const data = await readFonts();
  return FONTS.map(([name, , weight], i) => ({
    name,
    weight,
    style: "normal" as const,
    data: data[i]!.slice().buffer,
  }));
}

// page.mdx'in `export const metadata = { title, description }` bloğundan iki alanı okur.
async function readPage(href: string) {
  "use cache";
  cacheLife("max");
  const file = path.join(ROOT, "src/app", href, "page.mdx");
  const source = await readFile(file, "utf8");
  const field = (key: string) =>
    source.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
  const title = field("title");
  if (!title) throw new Error(`No metadata title in ${file}`);
  const section = NAV.find((s) => s.pages.some((p) => p.href === href));
  return {
    title,
    // ⌘ yüklenen fontlarda yok; "tt" arasına bağ önleyici (U+200C): Satori bağlı "tt"yi
    // bağsız ölçüp kelimeden sonra boşluk bırakıyordu ("A button  that").
    description: (field("description") ?? "")
      .replaceAll("⌘", "Cmd+")
      .replaceAll("tt", "t\u200Ct"),
    crumb: section ? section.title : "Tools",
    label: title,
  };
}

function LogoMark({ s }: { s: number }) {
  const u = s / 32;
  // 2×2 kare: 2.2 kalın çerçeve ve aralık, 9.8 dolgu (viewBox 32'deki çizimle aynı).
  const tile = 9.8 * u;
  return (
    <div style={{ display: "flex", position: "relative", width: s, height: s }}>
      <div
        style={{
          position: "absolute",
          left: 5 * u,
          top: 5 * u,
          width: 24 * u,
          height: 24 * u,
          background: PAPER,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0.9 * u,
          top: 0.9 * u,
          width: 26.2 * u,
          height: 26.2 * u,
          display: "flex",
          flexWrap: "wrap",
          gap: 2.2 * u,
          padding: 2.2 * u,
          background: INK,
        }}
      >
        {["#FFD23F", "#5B4CFF", "#E3170A", "#23E5FF"].map((c) => (
          <div key={c} style={{ width: tile, height: tile, background: c }} />
        ))}
      </div>
    </div>
  );
}

/** `href`: sayfanın yolu ("/docs/components/button"); "/" ana sayfa. */
export async function renderOgImage(href: string) {
  const page = href === "/" ? HOME : await readPage(href);
  const long = page.title.length > 10;
  // Şeritteki düğme yazısı hücreye sığsın: uzun başlıkta font küçülür.
  const labelSize = (width: number) =>
    Math.min(40, Math.floor(226 / (page.label.length * width)));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: INK,
        color: PAPER,
        fontFamily: "Space Grotesk",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "52px 72px 30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 22,
              letterSpacing: 1.8,
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            {`plonk-ui / ${page.crumb}`}
          </div>
          <LogoMark s={72} />
        </div>
        <div
          style={{
            fontSize: long ? 96 : 132,
            fontWeight: 700,
            letterSpacing: long ? -2.5 : -4,
            lineHeight: 1,
            marginTop: 14,
          }}
        >
          {page.title}
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 500,
            color: "#b9bcc6",
            marginTop: 18,
            maxWidth: 940,
            lineHeight: 1.3,
          }}
        >
          {page.description}
        </div>
      </div>
      <div style={{ display: "flex", height: 190 }}>
        {PERSONALITIES.map((p, i) => (
          <div
            key={p.font}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: p.canvas,
              borderTop: `4px solid ${INK}`,
              borderLeft: i ? `4px solid ${INK}` : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: p.font,
                fontWeight: p.font === "Baloo 2" ? 800 : 400,
                fontSize: labelSize(p.width),
                whiteSpace: "nowrap",
                textTransform: p.upper ? "uppercase" : "none",
                color: p.ink,
                background: p.fill,
                border: `4px solid ${p.border}`,
                borderRadius: p.radius,
                boxShadow: p.shadow,
                padding: "12px 26px",
              }}
            >
              {page.label}
            </div>
          </div>
        ))}
      </div>
    </div>,
    { ...size, fonts: await loadFonts() },
  );
}
