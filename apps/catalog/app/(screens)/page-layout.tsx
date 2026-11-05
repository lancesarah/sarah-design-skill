import type { HTMLAttributes, ReactNode } from "react";
import { PageHeader, type IconName } from "@lance-live/gallery-ui";

export function PageLayout({
  icon,
  title,
  count,
  actions,
  tabs,
  toolbar,
  children,
  className,
  ...rest
}: {
  icon: IconName;
  title: string;
  count?: ReactNode;
  /** Secondary actions first. The primary action is last, so it sits furthest right. */
  actions?: ReactNode;
  tabs?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <main className={["notes-page", "sds", className].filter(Boolean).join(" ")} {...rest}>
      <PageHeader mark={icon} title={title} count={count != null ? String(count) : undefined} actions={actions ?? null} />
      {tabs || toolbar ? (
        <div className="page-filters">
          {tabs}
          {toolbar}
        </div>
      ) : null}
      {children}
    </main>
  );
}
