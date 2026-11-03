import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state shell">
      <span className="section-index">404 / UNMAPPED</span>
      <h1>This path hasn’t been mapped.</h1>
      <p>Explore a researched guide or investigate a new integration.</p>
      <Link className="btn btn-primary" href="/library">
        Explore the library
      </Link>
    </div>
  );
}
