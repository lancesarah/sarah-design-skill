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
      <Link className={["widget-row", subtitleTone === "muted" ? "is-muted" : "", subtitle || trail ? "" : "is-single", className].filter(Boolean).join(" ")} {...rest}>
        {lead ? <span className="widget-lead">{lead}</span> : null}
        <span className="widget-row-title">{title}</span>
        {subtitle ? <span className="widget-row-subtitle">{subtitle}</span> : null}
        {meta ? <span className="widget-meta">{meta}</span> : null}
        {trail ? <span className="widget-trail">{trail}</span> : null}
      </Link>
    </li>
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
