import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-24">
      <h1 className="text-6xl font-black tracking-tight">Plonk</h1>
      <p className="max-w-prose text-lg opacity-75">
        Neo-brutalist React components with switchable personalities. Site
        tasarımı Aşama 5&apos;te gelecek.
      </p>
      <Link
        href="/lab"
        className="w-max rounded-full border-2 border-current px-5 py-2 font-semibold"
      >
        Laboratuvara git →
      </Link>
    </main>
  );
}
