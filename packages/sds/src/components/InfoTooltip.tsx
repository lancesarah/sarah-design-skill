"use client";

import type { ReactNode } from "react";
import { Icon } from "../icons";
import { TooltipTarget } from "./TooltipTarget";

/** Info tooltips always open above their icon. */
export function InfoTooltip({ label, className, children }: { label: string; className?: string; children?: ReactNode }) {
  return <TooltipTarget label={label} className={["sds info-tooltip", className].filter(Boolean).join(" ")} focusable>
    {children}
    <Icon name="info" size={14} />
  </TooltipTarget>;
}
