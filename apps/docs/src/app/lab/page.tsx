import type { Metadata } from "next";
import { cn } from "plonk";

export const metadata: Metadata = { title: "Laboratuvar · Plonk" };

const STAGES = [
  { n: 1, title: "Token'lar ve kişilik sistemi", done: false },
  { n: 2, title: "Temel bileşenler", done: false },
  { n: 3, title: "Etkileşimli bileşenler", done: false },
  { n: 4, title: "Komut paleti, slider, veri tablosu", done: false },
];

export default function Lab() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16">
      <p className="text-xs font-bold tracking-widest uppercase opacity-50">
        Geçici çalışma alanı
      </p>
      <h1 className="mt-2 text-5xl font-black tracking-tight">Laboratuvar</h1>
      <p className="mt-4 max-w-prose opacity-75">
        Her aşamada geliştirilen bileşenler burada, iki kişilikte yan yana
        denenecek.
      </p>
      <ol className="mt-10 grid gap-3">
        {STAGES.map((s) => (
          <li
            key={s.n}
            className={cn(
              "flex items-center gap-4 rounded-xl border-2 border-black/80 px-5 py-4",
              s.done ? "bg-lime-200" : "bg-white",
            )}
          >
            <span className="font-mono text-sm opacity-60">0{s.n}</span>
            <span className="font-semibold">{s.title}</span>
            <span className="ml-auto text-sm opacity-60">
              {s.done ? "hazır" : "sırada"}
            </span>
          </li>
        ))}
      </ol>
    </main>
  );
}
