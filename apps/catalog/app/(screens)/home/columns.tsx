import { Children, isValidElement, type CSSProperties, type ReactNode, type Ref } from "react";

/** A widget that takes the whole row. The columns end above it and start again under it. */
export function HomeWide({ children }: { children: ReactNode }) {
  return <div className="home-wide">{children}</div>;
}

function Columns({ items }: { items: ReactNode[] }) {
  const cells = items.map((child, index) => (
    <div key={isValidElement(child) && child.key !== null ? child.key : index} className="home-cell" style={{ order: index } as CSSProperties}>
      {child}
    </div>
  ));
  return (
    <div className="home-tiles">
      <div className="home-col">{cells.filter((_, index) => index % 2 === 0)}</div>
      <div className="home-col">{cells.filter((_, index) => index % 2 === 1)}</div>
    </div>
  );
}

/**
 * Two columns that stack on their own, so a tall widget never leaves a gap beside a short one.
 * Widgets alternate left and right in source order. On a narrow page the columns dissolve and `order` puts them back in that order.
 * A `HomeWide` child breaks the columns and spans the row.
 */
export function HomeColumns({ children, boardRef }: { children: ReactNode; boardRef?: Ref<HTMLDivElement> }) {
  const runs: Array<{ wide: ReactNode } | { items: ReactNode[] }> = [];
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === HomeWide) {
      runs.push({ wide: child });
      continue;
    }
    const last = runs[runs.length - 1];
    if (last && "items" in last) last.items.push(child);
    else runs.push({ items: [child] });
  }
  return (
    <div ref={boardRef} className="home-board">
      {runs.map((run, index) => ("wide" in run ? <div key={isValidElement(run.wide) && run.wide.key !== null ? run.wide.key : index}>{run.wide}</div> : <Columns key={index} items={run.items} />))}
    </div>
  );
}
