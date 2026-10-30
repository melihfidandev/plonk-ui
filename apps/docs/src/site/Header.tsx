import Link from "next/link";
import { LogoMark } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { THEME_BUILDER } from "./nav";
import { ModeToggle } from "./ModeToggle";
import { Search } from "./Search";

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="site-logo">
        <LogoMark />
        plonk.<small>/ ui</small>
      </Link>
      <nav aria-label="Main" className="site-nav">
        <Link href="/docs">Docs</Link>
        <Link href="/docs/components/button">Components</Link>
        <Link href={THEME_BUILDER.href} className="site-nav-tool">
          {THEME_BUILDER.title}
        </Link>
      </nav>
      <div className="site-header-end">
        <Search />
        <ModeToggle />
        <MobileMenu />
      </div>
    </header>
  );
}
