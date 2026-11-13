"use client";

export type ShareTone = "action" | "strong" | "muted" | "quiet" | "faint";

export type Share = { id: string; label: string; value: number; tone: ShareTone };

/** One whole split into shares, such as tickets by channel. A solid bar with a part per share, then a key that names each one. */
export function ShareBar({
  shares,
  label,
  percent = false,
  className,
}: {
  shares: Share[];
  /** What the bar says, read aloud. Defaults to each share and its figure. */
  label?: string;
  /** The key writes each share as a percent of the whole instead of its count. */
  percent?: boolean;
  className?: string;
}) {
  const visible = shares.filter((item) => item.value > 0);
  const total = shares.reduce((sum, item) => sum + item.value, 0);
  const figure = (value: number) => (percent ? `${total ? Math.round((value / total) * 100) : 0}%` : String(value));
  return (
    <div className={["sds", "share-bar", className].filter(Boolean).join(" ")}>
      <div className="share-bar-track" role="img" aria-label={label ?? shares.map((item) => `${item.label} ${figure(item.value)}`).join(", ")}>
        {visible.map((item) => (
          <div key={item.id} className={`share-bar-part is-${item.tone}`} style={{ flexGrow: item.value }} />
        ))}
      </div>
      <dl className="share-bar-key">
        {shares.map((item) => (
          <div key={item.id}>
            <dt>
              <span className={`share-bar-dot is-${item.tone}`} aria-hidden="true" />
              {item.label}
            </dt>
            <dd>{figure(item.value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
