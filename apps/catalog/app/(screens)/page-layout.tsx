import type { HTMLAttributes, ReactNode } from "react";
import { PageHeader, type IconName } from "@lance-live/gallery-ui";

export function PageLayout({
  icon,
  title,
  count,
  actions,
  tabs,
  toolbar,
  bodyClassName,
  children,
  className,
  ...rest
}: {
  icon: IconName;
  title: ReactNode;
  count?: ReactNode;
  /** Secondary actions first. The primary action is last, so it sits furthest right. */
  actions?: ReactNode;
  tabs?: ReactNode;
  toolbar?: ReactNode;
  /** Wraps everything under the header. The header stays outside so it can snap while the body moves. */
  bodyClassName?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "title">) {
  const below = (
    <>
      {tabs || toolbar ? (
        <div className="page-filters">
          {tabs}
          {toolbar}
        </div>
      ) : null}
      {children}
    </>
  );
  return (
    <main className={["notes-page", "sds", className].filter(Boolean).join(" ")} {...rest}>
      <PageHeader mark={icon} title={title} count={count != null ? String(count) : undefined} actions={actions ?? null} />
      {bodyClassName ? <div className={bodyClassName}>{below}</div> : below}
    </main>
  );
}
