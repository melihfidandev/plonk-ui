import { Header } from "@/site/Header";
import { Pager } from "@/site/Pager";
import { Sidebar } from "@/site/Sidebar";
import { Toc, TocBar } from "@/site/Toc";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="site">
      <Header />
      <div className="site-shell">
        <Sidebar />
        <main className="site-main">
          <TocBar />
          <article className="site-prose">{children}</article>
          <Pager />
        </main>
        <Toc />
      </div>
    </div>
  );
}
