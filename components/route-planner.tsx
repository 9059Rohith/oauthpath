"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";

const choices = [
  {
    id: "managed",
    title: "Get users connected quickly",
    detail:
      "A managed app could fit. I do not need to own the provider registration.",
  },
  {
    id: "custom",
    title: "Use my own OAuth app",
    detail:
      "I need my own app identity, custom scopes, separate quota, or an unsupported managed method.",
  },
  {
    id: "unsure",
    title: "Help me decide",
    detail:
      "I am still checking the provider, permissions, and launch requirements.",
  },
] as const;
type Route = (typeof choices)[number]["id"];

export function RoutePlanner() {
  const [route, setRoute] = useState<Route>("unsure");
  return (
    <div className="route-planner">
      <fieldset>
        <legend>What do you need for this integration?</legend>
        <div className="route-options">
          {choices.map((choice) => (
            <label
              className={`route-option ${route === choice.id ? "selected" : ""}`}
              key={choice.id}
            >
              <input
                type="radio"
                name="oauth-route"
                value={choice.id}
                checked={route === choice.id}
                onChange={() => setRoute(choice.id)}
              />
              <span>
                <strong>{choice.title}</strong>
                <span>{choice.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <section
        className="route-recommendation"
        aria-labelledby="recommendation-heading"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="eyebrow">
          <CheckCircle2 size={15} aria-hidden="true" /> Your next move
        </span>
        <h2 id="recommendation-heading">
          {route === "custom"
            ? "Map your registration and launch path."
            : route === "managed"
              ? "Check managed availability first."
              : "Check the method, then choose ownership."}
        </h2>
        {route === "custom" ? (
          <>
            <p>
              Use a provider guide to register the app, configure a test
              connection, and understand the requirements for external use. Your
              users will still authorize their own accounts.
            </p>
            <Link prefetch={false} className="btn btn-primary" href="/library">
              Find my provider <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link prefetch={false} className="text-link" href="/generate">
              Research an unfamiliar app{" "}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </>
        ) : (
          <>
            <p>
              {route === "managed"
                ? "Look up the toolkit and its exact OAuth method in Composio’s managed-app directory. If supported, Composio maintains that registration and its credentials. You can then implement the user connection flow."
                : "First list the permissions your agent needs. Check whether the toolkit’s specific OAuth method is managed, then decide whether you need your own app name, custom scopes, or a separate rate-limit quota."}
            </p>
            <a
              className="btn btn-primary"
              href="https://docs.composio.dev/toolkits/managed-auth"
              target="_blank"
              rel="noopener noreferrer"
            >
              Check the managed directory{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <p className="muted">
              Availability has not been checked for your provider here. Open its
              toolkit page to verify the method; support for another auth method
              does not establish OAuth coverage.
            </p>
            <Link prefetch={false} className="text-link" href="/library">
              Need your own app? Open the setup guides{" "}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
