"use client";

import { useId, type ComponentPropsWithoutRef, type ElementType, type ReactNode, type Ref } from "react";
import { Icon, type IconName } from "../icons";

/** A glance at a list on a dashboard: a grey head with the title, the count, and one action, over the list. */
export function Widget({
  icon,
  title,
  count,
  action,
  className,
  children,
}: {
  icon?: IconName;
  title: string;
  count?: number;
  /** One small control on the right of the head, such as a plus that creates a record. */
  action?: ReactNode;
  className?: string;
  /** A `WidgetList`, or an `Empty` when there is nothing to show. */
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section className={["sds", "widget", className].filter(Boolean).join(" ")} aria-labelledby={id}>
      <div className="widget-head">
        <h2 id={id}>
          {icon ? <Icon name={icon} size={16} /> : null}
          {title}
          {count === undefined ? null : <span className="widget-count">{count}</span>}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** The rows of a widget, and the more link as the last item. */
export function WidgetList({
  fill = false,
  ref,
  children,
}: {
  /** Take the height the card is given instead of growing it. Measure the list to choose how many rows to show. */
  fill?: boolean;
  ref?: Ref<HTMLUListElement>;
  children: ReactNode;
}) {
  return (
    <ul ref={ref} className={fill ? "widget-list is-fill" : "widget-list"}>
      {children}
    </ul>
  );
}

type WidgetRowProps<T extends ElementType> = {
  /** The link to render, such as Next's `Link`. Defaults to `a`. */
  as?: T;
  /** An 18px mark at the start, such as a status. */
  lead?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Muted when the second line is a preview of the record rather than a fact about it. */
  subtitleTone?: "default" | "muted";
  /** A short fact on the first line's right, such as an age. */
  meta?: ReactNode;
  /** A chip on the second line's right, such as a person. */
  trail?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "title" | "children">;

/** One record, two lines: what and where on the left, age and owner on the right. */
export function WidgetRow<T extends ElementType = "a">({ as, lead, title, subtitle, subtitleTone = "default", meta, trail, className, ...rest }: WidgetRowProps<T>) {
  const Link: ElementType = as ?? "a";
  return (
    <li>
      <Link className={["widget-row", subtitleTone === "muted" ? "is-muted" : "", subtitle || trail ? "" : "is-single", lead ? "" : "no-lead", className].filter(Boolean).join(" ")} {...rest}>
        {lead ? <span className="widget-lead">{lead}</span> : null}
        <span className="widget-row-title">{title}</span>
        {subtitle ? <span className="widget-row-subtitle">{subtitle}</span> : null}
        {meta ? <span className="widget-meta">{meta}</span> : null}
        {trail ? <span className="widget-trail">{trail}</span> : null}
      </Link>
    </li>
  );
}

/** A row's subtitle when it lists facts about the record, such as the room and the head count. Muted, with a dot between facts; empty facts drop out. */
export function WidgetFacts({ items }: { items: (ReactNode | null | false | undefined)[] }) {
  const facts = items.filter((item) => item !== null && item !== false && item !== undefined && item !== "");
  return (
    <span className="widget-facts">
      {facts.map((fact, index) => (
        <span key={index}>
          {index ? <span className="widget-facts-dot" aria-hidden="true">·</span> : null}
          {fact}
        </span>
      ))}
    </span>
  );
}

/** The link to the rest of the list. It sits at the bottom of the widget. */
export function WidgetMore<T extends ElementType = "a">({
  as,
  className,
  children,
  ...rest
}: { as?: T; children: ReactNode } & Omit<ComponentPropsWithoutRef<T>, "as" | "children">) {
  const Link: ElementType = as ?? "a";
  return (
    <li className="widget-more-item">
      <Link className={["widget-more", className].filter(Boolean).join(" ")} {...rest}>
        {children}
      </Link>
    </li>
  );
}

/** Holds an `Empty` inside a widget, so it fills the space the rows would. */
export function WidgetEmpty({ children }: { children: ReactNode }) {
  return <div className="widget-empty">{children}</div>;
}

/** A short fact in the head, beside the action, such as today's areas or the week. */
export function WidgetNote({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={["widget-note", className].filter(Boolean).join(" ")}>{children}</span>;
}

/** Blue for the part done, the darker grey for the part set aside, the lighter greys for the rest. Match the part of the meter or chart it names. */
export type WidgetKeyTone = "action" | "strong" | "muted" | "quiet";

/** An 8px dot that ties a stat or a legend to its part of a meter or chart. */
export function WidgetKey({ tone }: { tone: WidgetKeyTone }) {
  return <span className={`widget-key is-${tone}`} aria-hidden="true" />;
}

/** The top of a widget that leads with a number: a `WidgetFigure`, its `WidgetStats` beside it, and a `Meter` with `className="widget-summary-meter"` underneath. */
export function WidgetSummary({
  alone = false,
  className,
  children,
}: {
  /** Drop the rule under it when nothing follows. */
  alone?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return <div className={["widget-summary", alone ? "is-alone" : "", className].filter(Boolean).join(" ")}>{children}</div>;
}

/** One big figure and what it counts, on one line under it. Give `of` for a part of a whole, such as 3 / 8. */
export function WidgetFigure({ value, of, label, className }: { value: ReactNode; of?: ReactNode; label?: ReactNode; className?: string }) {
  return (
    <p className={["widget-figure", className].filter(Boolean).join(" ")}>
      <span className="widget-figure-value">
        {value}
        {of === undefined ? null : <span className="widget-figure-of"> / {of}</span>}
      </span>
      {label ? <span className="widget-figure-label">{label}</span> : null}
    </p>
  );
}

export type WidgetStat = { label: ReactNode; value: ReactNode; key?: WidgetKeyTone };

/** The totals beside a figure. Each value sits over its label; a key ties it to the meter. They wrap in a narrow card. */
export function WidgetStats({ items, className }: { items: WidgetStat[]; className?: string }) {
  return (
    <dl className={["widget-stats", className].filter(Boolean).join(" ")}>
      {items.map((item, index) => (
        <div key={index}>
          <dt>
            {item.key ? <WidgetKey tone={item.key} /> : null}
            {item.label}
          </dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A figure and its answer on one line, with a fact on the right, over a chart or one line per part. */
export function WidgetTally({
  value,
  label,
  aside,
  asideTone = "default",
  className,
}: {
  value: ReactNode;
  label: ReactNode;
  aside?: ReactNode;
  /** Red when the fact is a problem, such as readings overdue. */
  asideTone?: "default" | "warn";
  className?: string;
}) {
  return (
    <p className={["widget-tally", className].filter(Boolean).join(" ")}>
      <span>
        <span className="widget-figure-value">{value}</span>
        <span className="widget-tally-label">{label}</span>
      </span>
      {aside ? <span className={asideTone === "warn" ? "widget-tally-aside is-warn" : "widget-tally-aside"}>{aside}</span> : null}
    </p>
  );
}
