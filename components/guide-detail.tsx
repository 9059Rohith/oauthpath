"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Clock3,
  Download,
  ExternalLink,
  FileCheck2,
  Flag,
  Printer,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { Guide, Source } from "@/lib/schema";
import { guideMarkdown } from "@/lib/export";

const sections = [
  ["overview", "At a glance"],
  ["requirements", "Before you start"],
  ["steps", "Your launch path"],
  ["blockers", "When you get stuck"],
  ["technical", "Technical details"],
  ["handoff", "Agent + you"],
  ["evidence", "What we checked"],
  ["sources", "Sources"],
] as const;

const checklistMemory = new Map<string, string>();
const checklistEvent = "oauthpath-checklist-change";
const emptyChecklist = () => "[]";

function readChecklist(key: string): string {
  const memory = checklistMemory.get(key);
  if (memory !== undefined) return memory;
  try {
    return window.localStorage.getItem(key) ?? "[]";
  } catch {
    return "[]";
  }
}

function safeUrl(value: string): string | undefined {
  try {
    const parsed = new URL(value);
    return ["https:", "http:"].includes(parsed.protocol)
      ? parsed.href
      : undefined;
  } catch {
    return undefined;
  }
}

function readableDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not available"
    : new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
}

function SourceLinks({ ids, sources }: { ids: string[]; sources: Source[] }) {
  const linked = ids
    .map((id) => sources.find((source) => source.id === id))
    .filter((source): source is Source => Boolean(source));
  if (!linked.length)
    return <span className="muted">No supporting source confirmed.</span>;
  return (
    <span className="source-links" aria-label="Supporting sources">
      {linked.map((source) => (
        <a
          key={source.id}
          href={`#source-${encodeURIComponent(source.id)}`}
          title={source.title}
        >
          <FileCheck2 size={12} aria-hidden="true" /> {source.title}
        </a>
      ))}
    </span>
  );
}

export function GuideDetail({ guide }: { guide: Guide }) {
  const [notice, setNotice] = useState("");
  const storageKey = `oauthpath:steps:${guide.slug}:${guide.updatedAt}:${guide.generation?.promptVersion ?? "curated-v1"}`;
  const subscribe = useCallback(
    (notify: () => void) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === storageKey || event.key === null) {
          checklistMemory.delete(storageKey);
          notify();
        }
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(checklistEvent, notify);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(checklistEvent, notify);
      };
    },
    [storageKey],
  );
  const getSnapshot = useCallback(
    () => readChecklist(storageKey),
    [storageKey],
  );
  const checklistSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    emptyChecklist,
  );
  const completed = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(checklistSnapshot);
      return Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === "string")
        : [];
    } catch {
      return [];
    }
  }, [checklistSnapshot]);
  const documentScan = guide.generation?.mode === "document-scan";
  const sourceIds = guide.sources.map((source) => source.id);
  const firstStep = guide.steps[0];
  const completedCount = guide.steps.filter((step) =>
    completed.includes(step.id),
  ).length;

  function toggleStep(id: string) {
    const next = completed.includes(id)
      ? completed.filter((item) => item !== id)
      : [...completed, id];
    const serialized = JSON.stringify(next);
    checklistMemory.set(storageKey, serialized);
    try {
      window.localStorage.setItem(storageKey, serialized);
    } catch {
      setNotice(
        "Checklist updated for this visit. Your browser could not save it.",
      );
    }
    window.dispatchEvent(new Event(checklistEvent));
  }

  async function shareGuide() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice(
        "Guide link copied. Your personal checklist stays on this browser.",
      );
    } catch {
      setNotice(`Copy this link to share: ${window.location.href}`);
    }
  }

  function exportGuide() {
    try {
      const blob = new Blob([guideMarkdown(guide)], {
        type: "text/markdown;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${guide.slug}-oauth-guide.md`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Markdown export downloaded with source links.");
    } catch {
      setNotice(
        "The download could not start. Use Print to save a copy instead.",
      );
    }
  }

  function printGuide() {
    try {
      window.print();
    } catch {
      setNotice(
        "Printing is unavailable. Use Export Markdown to save this guide.",
      );
    }
  }

  return (
    <div className="guide-layout">
      <aside className="guide-nav" aria-label="Guide navigation">
        <a className="muted" href="/library">
          <ArrowLeft size={15} aria-hidden="true" /> All guides
        </a>
        <nav aria-label="On this page">
          {sections.map(([id, label], index) => (
            <a key={id} href={`#${id}`}>
              <span className="muted">
                {String(index + 1).padStart(2, "0")}
              </span>{" "}
              {label}
            </a>
          ))}
        </nav>
        <div className="callout">
          <CheckCircle2 size={19} aria-hidden="true" />
          <p>
            {completedCount} of {guide.steps.length} steps checked
          </p>
          <progress
            value={completedCount}
            max={Math.max(guide.steps.length, 1)}
            aria-label="Checklist completion"
          />
          <p className="muted">
            Saved on this device. Checking a step is your confirmation, not
            provider approval.
          </p>
        </div>
      </aside>

      <article className="guide-main">
        <header className="guide-heading" id="overview">
          <a className="muted" href="/library">
            <ArrowLeft size={14} aria-hidden="true" /> Guide library
          </a>
          <div className="step-header">
            <span
              className="provider-icon"
              style={{
                color: /^#[\da-fA-F]{3,8}$/.test(guide.color)
                  ? guide.color
                  : "#77e7cf",
              }}
              aria-hidden="true"
            >
              {guide.name.slice(0, 1)}
            </span>
            <span className="eyebrow">
              {guide.category} / OAuth launch guide
            </span>
          </div>
          <h1>
            {guide.name}
            <span className="muted">. Your path to launch.</span>
          </h1>
          {documentScan ? (
            <p className="badge badge-amber">
              Public-document scan · setup requirements unverified
            </p>
          ) : guide.generation?.mode === "live" ? (
            <p className="badge badge-blue">AI researched · review sources</p>
          ) : (
            <p className="badge badge-blue">
              Curated guide · documentation reviewed
            </p>
          )}
          <p className="guide-summary">{guide.summary}</p>
          <p className="muted">
            <strong>For this scenario:</strong> {guide.scenario}
          </p>
          <p className="muted">
            Documentation reviewed {readableDate(guide.updatedAt)} ·
            Requirements can change.
          </p>
          <SourceLinks ids={sourceIds} sources={guide.sources} />
          <div className="guide-actions">
            <button className="btn btn-primary" onClick={shareGuide}>
              <Clipboard size={15} aria-hidden="true" /> Share guide
            </button>
            <button className="btn btn-ghost" onClick={exportGuide}>
              <Download size={15} aria-hidden="true" /> Export Markdown
            </button>
            <button className="btn btn-ghost" onClick={printGuide}>
              <Printer size={15} aria-hidden="true" /> Print / PDF
            </button>
            <a
              className="btn btn-ghost"
              href={`/generate?q=${encodeURIComponent(guide.domain)}&refresh=1`}
            >
              <Sparkles size={15} aria-hidden="true" /> Research again
            </a>
          </div>
          <p className="muted" role="status" aria-live="polite">
            {notice}
          </p>
        </header>

        <section className="guide-section" aria-labelledby="overview-title">
          <h2 className="section-heading" id="overview-title">
            The launch picture
          </h2>
          <div className="fact-grid">
            <div className="fact-card">
              <ShieldCheck size={19} aria-hidden="true" />
              <span className="eyebrow">Setup complexity</span>
              <h3>{guide.difficulty}</h3>
              <p className="muted">
                An editorial assessment of this scenario, not a provider rating.
              </p>
            </div>
            <div className="fact-card">
              <Clock3 size={19} aria-hidden="true" />
              <span className="eyebrow">Hands-on work</span>
              <p>{guide.effort}</p>
            </div>
            <div className="fact-card">
              <Clock3 size={19} aria-hidden="true" />
              <span className="eyebrow">Waiting on others</span>
              <p>{guide.wait}</p>
              <SourceLinks ids={sourceIds} sources={guide.sources} />
            </div>
            <div className="fact-card">
              <Flag size={19} aria-hidden="true" />
              <span className="eyebrow">Approval route</span>
              <p>{guide.approval}</p>
              <SourceLinks ids={sourceIds} sources={guide.sources} />
            </div>
          </div>
          {firstStep && (
            <div className="callout next-action">
              <span className="eyebrow">Start here</span>
              <h3>{firstStep.title}</h3>
              <p>{firstStep.description}</p>
              <SourceLinks ids={firstStep.sourceIds} sources={guide.sources} />
              <a
                className="btn btn-primary"
                href={`#step-${encodeURIComponent(firstStep.id)}`}
              >
                Open the first step{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          )}
        </section>

        <section
          className="guide-section"
          id="requirements"
          aria-labelledby="requirements-title"
        >
          <h2 className="section-heading" id="requirements-title">
            {documentScan ? "Requirements to confirm" : "Before you start"}
          </h2>
          <p className="muted">
            {documentScan
              ? "These public-document excerpts need review. Confirm which requirements apply to your use case before acting."
              : "Gather these requirements before opening the developer console."}
          </p>
          {guide.requirements.map((requirement, index) => (
            <div className="check-row" key={index}>
              <FileCheck2 size={18} aria-hidden="true" />
              <div>
                <p>
                  {requirement.text}{" "}
                  <span
                    className={`badge ${requirement.evidence === "documented" ? "badge-blue" : "badge-amber"}`}
                  >
                    {requirement.evidence}
                  </span>
                </p>
                <SourceLinks
                  ids={requirement.sourceIds}
                  sources={guide.sources}
                />
              </div>
            </div>
          ))}
        </section>

        <section
          className="guide-section"
          id="steps"
          aria-labelledby="steps-title"
        >
          <h2 className="section-heading" id="steps-title">
            Your launch path
          </h2>
          <p className="muted">
            Each step has an owner, a completion check and a way forward if
            blocked.
          </p>
          {guide.steps.map((step, index) => (
            <details
              className="step-card"
              id={`step-${encodeURIComponent(step.id)}`}
              key={step.id}
              open={index === 0}
            >
              <summary className="step-header">
                <span className="step-number">
                  {completed.includes(step.id) ? (
                    <Check size={16} aria-label="Checked" />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
                <span className="step-title">{step.title}</span>
                <span className="owner">
                  {step.owner === "Agent" ? (
                    <Bot size={13} aria-hidden="true" />
                  ) : (
                    <UserRound size={13} aria-hidden="true" />
                  )}{" "}
                  {step.owner}
                </span>
                <ChevronDown size={16} aria-hidden="true" />
              </summary>
              <div className="step-body">
                <p>{step.description}</p>
                <p>
                  <strong>Done when:</strong> {step.doneWhen}
                </p>
                <p className="muted">
                  <strong>If blocked:</strong> {step.ifBlocked}
                </p>
                <SourceLinks ids={step.sourceIds} sources={guide.sources} />
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={completed.includes(step.id)}
                    onChange={() => toggleStep(step.id)}
                  />{" "}
                  I have completed this step
                </label>
              </div>
            </details>
          ))}
        </section>

        <section
          className="guide-section"
          id="blockers"
          aria-labelledby="blockers-title"
        >
          <h2 className="section-heading" id="blockers-title">
            When you get stuck
          </h2>
          {guide.blockers.map((blocker, index) => (
            <div className="callout" key={index}>
              <h3>{blocker.title}</h3>
              <p>{blocker.description}</p>
              <p>
                <strong>Next action:</strong> {blocker.action}
              </p>
              <SourceLinks ids={blocker.sourceIds} sources={guide.sources} />
            </div>
          ))}
        </section>

        <section
          className="guide-section"
          id="technical"
          aria-labelledby="technical-title"
        >
          <h2 className="section-heading" id="technical-title">
            Technical details
          </h2>
          <dl>
            {guide.technical.map((item, index) => (
              <div className="check-row" key={index}>
                <dt>{item.label}</dt>
                <dd>
                  <p>{item.value}</p>
                  <SourceLinks ids={item.sourceIds} sources={guide.sources} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          className="guide-section"
          id="handoff"
          aria-labelledby="handoff-title"
        >
          <h2 className="section-heading" id="handoff-title">
            An agent can help. You stay in control.
          </h2>
          <p className="muted">
            These are possible next tasks, not actions this guide has already
            performed.
          </p>
          <div className="split-grid">
            <div className="fact-card">
              <Bot size={23} aria-hidden="true" />
              <h3>The agent can prepare</h3>
              <ul>
                {guide.agentCan.map((task, index) => (
                  <li key={index}>{task}</li>
                ))}
              </ul>
            </div>
            <div className="fact-card">
              <UserRound size={23} aria-hidden="true" />
              <h3>You take over for</h3>
              <ul>
                {guide.humanMust.map((task, index) => (
                  <li key={index}>{task}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          className="guide-section"
          id="evidence"
          aria-labelledby="evidence-title"
        >
          <h2 className="section-heading" id="evidence-title">
            What we checked. What we did not.
          </h2>
          {guide.probes?.length ? (
            <>
              <p className="muted">
                The following HTTP observations were recorded during research.
                They do not establish successful authentication, account
                eligibility or provider approval.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table className="probe-table">
                  <caption>Observed HTTP checks</caption>
                  <thead>
                    <tr>
                      <th scope="col">Target</th>
                      <th scope="col">Status</th>
                      <th scope="col">Time</th>
                      <th scope="col">Observation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guide.probes.map((probe, index) => (
                      <tr key={`${probe.url}-${index}`}>
                        <td>
                          {safeUrl(probe.url) ? (
                            <a
                              href={safeUrl(probe.url)}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                            >
                              {probe.url}
                            </a>
                          ) : (
                            probe.url
                          )}
                          <br />
                          <span className="muted">
                            {readableDate(probe.at)}
                          </span>
                        </td>
                        <td>{probe.status || "No response"}</td>
                        <td>{Math.round(probe.latencyMs)} ms</td>
                        <td>{probe.finding}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="callout">
              <FileCheck2 size={20} aria-hidden="true" />
              <p>
                Documentation reviewed. No authenticated OAuth setup was
                performed.
              </p>
              <p className="muted">
                No account was created, token exchanged or approval request
                submitted for this guide.
              </p>
            </div>
          )}
          <h3>What remains uncertain</h3>
          <ul>
            {guide.uncertainties.map((uncertainty, index) => (
              <li key={index}>{uncertainty}</li>
            ))}
          </ul>
        </section>

        <section
          className="guide-section"
          id="sources"
          aria-labelledby="sources-title"
        >
          <h2 className="section-heading" id="sources-title">
            Go to the source
          </h2>
          <p className="muted">
            Review the provider&apos;s current requirements before making launch
            commitments.
          </p>
          <ol className="source-list">
            {guide.sources.map((source) => (
              <li
                key={source.id}
                id={`source-${encodeURIComponent(source.id)}`}
              >
                {safeUrl(source.url) ? (
                  <a
                    href={safeUrl(source.url)}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {source.title} <ExternalLink size={14} aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <span>{source.title}</span>
                )}
                <p className="muted">
                  {safeUrl(source.url)
                    ? new URL(source.url).hostname
                    : "Source URL unavailable"}
                  {source.fetchedAt
                    ? ` · Retrieved ${readableDate(source.fetchedAt)}`
                    : ""}
                </p>
                {source.excerpt && <blockquote>{source.excerpt}</blockquote>}
              </li>
            ))}
          </ol>
        </section>
      </article>
    </div>
  );
}
