"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state shell">
      <h1>We couldn’t load this guide.</h1>
      <p>
        The research store may be temporarily unavailable. Your existing guide
        is not changed.
      </p>
      <button className="btn btn-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
