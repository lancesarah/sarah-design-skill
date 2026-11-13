"use client";

import type { ReactNode } from "react";
import { Icon, type IconName } from "../icons";

/** A page or a list with nothing in it. The title and the line are one group. An action, when there is one, sits below. */
export function Empty({
  icon,
  title,
  children,
  action,
}: {
  icon: IconName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="sds empty">
      <div className="empty-copy">
        <span className="empty-mark" aria-hidden="true">
          <Icon name={icon} size={24} />
        </span>
        <h2>{title}</h2>
        {children ? <p>{children}</p> : null}
      </div>
      {action}
    </div>
  );
}
