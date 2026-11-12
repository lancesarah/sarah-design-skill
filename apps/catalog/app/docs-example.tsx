"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { USAGE } from "./docs-usage";

const KEYWORDS = new Set(["import", "from", "export", "default", "return", "const", "function"]);

function highlight(line: string) {
  const parts = line.split(/("[^"]*"|'[^']*'|`[^`]*`|\s+|[^\s"']+)/);
  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith('"') || part.startsWith("'") || part.startsWith("`")) {
      return (
        <span className="tok-str" key={index}>
          {part}
        </span>
      );
    }
    if (KEYWORDS.has(part)) {
      return (
        <span className="tok-key" key={index}>
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export type DocsView = "examples" | "usage";

export const DocsContext = createContext<{ page: string; view: DocsView; setView: (view: DocsView) => void }>({
  page: "",
  view: "examples",
  setView: () => {},
});

function inline(text: string) {
  return text.split(/(`[^`]+`)/).map((part, index) =>
    part.startsWith("`") ? <code key={index}>{part.slice(1, -1)}</code> : part,
  );
}

function UsageList({ id, title, items }: { id: string; title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="docs-example docs-usage" id={id} data-example={title}>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{inline(item)}</li>
        ))}
      </ul>
    </section>
  );
}

export function DocPage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const { page, view, setView } = useContext(DocsContext);
  const usage = USAGE[page];
  const showUsage = view === "usage" && usage;
  const tab = (value: DocsView, label: string) => (
    <button
      className="docs-tab"
      type="button"
      role="tab"
      aria-selected={(value === "usage") === Boolean(showUsage)}
      onClick={() => setView(value)}
    >
      {label}
    </button>
  );
  return (
    <article className="docs-article">
      <h1>{title}</h1>
      <p className="docs-lead">{description}</p>
      <div className="docs-tabs" role="tablist" aria-label="View">
        {tab("examples", "Examples")}
        {usage ? tab("usage", "Usage") : null}
      </div>
      {showUsage ? (
        <div className="docs-examples">
          <UsageList id="usage-when" title="When to use" items={usage.when} />
          <UsageList id="usage-when-not" title="When not to use" items={usage.whenNot} />
          <UsageList id="usage-rules" title="Rules" items={usage.rules} />
        </div>
      ) : (
        <div className="docs-examples">{children}</div>
      )}
    </article>
  );
}

export function Example({
  id,
  title,
  description,
  code,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  code: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="docs-example" id={id} data-example={title}>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      <div className="docs-card">
        <div className="docs-stage sds">{children}</div>
        <div className="docs-toolbar">
          <span className="docs-lang">React</span>
          <button
            className="docs-copy"
            type="button"
            onClick={() => {
              const done = () => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              };
              const fallback = () => {
                const area = document.createElement("textarea");
                area.value = code;
                area.setAttribute("readonly", "");
                area.style.position = "fixed";
                area.style.left = "-9999px";
                document.body.append(area);
                area.select();
                const ok = document.execCommand("copy");
                area.remove();
                if (ok) done();
              };
              if (!navigator.clipboard?.writeText) {
                fallback();
                return;
              }
              navigator.clipboard.writeText(code).then(done).catch(fallback);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <rect x="4.5" y="4.5" width="7" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M3.5 9.5h-1a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
            {copied ? "Copied" : "Copy code"}
          </button>
        </div>
        <pre className="docs-code">
          <code>
            {code.split("\n").map((line, index) => (
              <span key={index}>
                {highlight(line)}
                {"\n"}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </section>
  );
}
