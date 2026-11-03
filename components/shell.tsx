import Link from "next/link";
import { ArrowUpRight, Code2 as Github, Route } from "lucide-react";
export function Header() {
  return (
    <header className="site-header">
      <div className="shell nav-inner">
        <Link href="/" className="wordmark" aria-label="OAuthPath home">
          <Route size={27} strokeWidth={1.7} />
          <span>
            OAuthPath<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/library">Library</Link>
          <Link href="/methodology">How it works</Link>
          <a
            className="github-link"
            href="https://github.com/9059Rohith/oauthpath"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={17} /> <span>GitHub</span>
          </a>
          <Link className="btn btn-small" href="/generate">
            Generate a guide <ArrowUpRight size={15} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer shell">
      <Link href="/" className="wordmark">
        <Route size={21} />
        <span>OAuthPath.</span>
      </Link>
      <span>A clearer path from idea to integration.</span>
      <div>
        <Link href="/methodology">Our methodology</Link>
        <a href="https://github.com/9059Rohith/oauthpath">
          View source <ArrowUpRight size={13} />
        </a>
      </div>
    </footer>
  );
}
