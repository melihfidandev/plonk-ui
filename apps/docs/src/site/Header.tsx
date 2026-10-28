import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { ModeToggle } from "./ModeToggle";
import { Search } from "./Search";

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="site-logo">
        plonk.<small>/ ui</small>
      </Link>
      <nav aria-label="Main" className="site-nav">
        <Link href="/docs">Docs</Link>
        <Link href="/docs/components/button">Components</Link>
      </nav>
      <div className="site-header-end">
        <Search />
        <ModeToggle />
        <MobileMenu />
      </div>
    </header>
  );
}
