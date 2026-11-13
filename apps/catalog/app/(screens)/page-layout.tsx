import { Fragment, type HTMLAttributes, type ReactNode } from "react";
import { PageHeader, type IconName } from "@lance-live/sds";

/** A page in the title. The last one is the page you are on. Earlier ones stay and go back. */
export type TitlePage = { label: string; onClick?: () => void };

export function PageTitle({
  pages,
  parent,
  current,
  before,
  onBack,
}: {
  /** Full trail. Add a subpage by appending `{ label }`. Give earlier pages an onClick. */
  pages?: TitlePage[];
  parent?: string;
  current?: string;
  /** A crumb between the parent and the current page. It goes back one level. */
  before?: { label: string; onClick: () => void };
  onBack?: () => void;
}) {
  const trail: TitlePage[] = pages ?? [
    { label: parent ?? "", onClick: onBack },
    ...(before ? [before] : []),
    { label: current ?? "" },
  ];
  const last = trail.length - 1;
  return (
    <>
      {trail.map((page, index) => {
        const currentPage = index === last || !page.onClick;
        return (
          <Fragment key={`${page.label}-${index}`}>
            {index > 0 ? <span className="page-crumb" aria-hidden="true">/</span> : null}
            {currentPage ? (
              <span className="page-current">{page.label}</span>
            ) : (
              <button type="button" className="chip page-back" onClick={page.onClick}>
                {page.label}
              </button>
            )}
          </Fragment>
        );
      })}
    </>
  );
}

export function PageLayout({
  icon,
  title,
  count,
  actions,
  tabs,
  toolbar,
  bodyClassName,
  header = true,
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
  /** False leaves the header out, for a page whose content names it, such as Home's greeting. */
  header?: boolean;
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
      {header ? <PageHeader mark={icon} title={title} count={count != null ? String(count) : undefined} actions={actions ?? null} /> : null}
      {bodyClassName ? <div className={bodyClassName}>{below}</div> : below}
    </main>
  );
}
