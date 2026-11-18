"use client";

import { useId, type ReactNode, type InputHTMLAttributes } from "react";
import { Icon, type IconName } from "../icons";
import { ThemeSwitch } from "./Fields";
import { Menu, type MenuProps } from "./Menu";

/** A page-surface heading, separate from the card it introduces. */
export function SectionHeader({ title, icon, aside, info, description, variant = "default" }: {
  title: string;
  icon?: IconName;
  aside?: ReactNode;
  info?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "described";
}) {
  return <header className={["sds section-header", variant === "described" ? "section-header-described" : ""].filter(Boolean).join(" ")}>
    <div className="section-header-copy"><h2>{icon ? <Icon name={icon} size={16} /> : null}{title}{info}</h2>{description ? <p className="section-header-description">{description}</p> : null}</div>
    {aside ? <span className="section-header-aside">{aside}</span> : null}
  </header>;
}

/** Related editable settings; omit a header for a standalone single-row card. */
export function SettingsCard({ children, label, className, variant = "default" }: { children: ReactNode; label: string; className?: string; variant?: "default" | "destructive" }) {
  return <div className={["sds settings-card", variant === "destructive" ? "settings-card-destructive" : "", className].filter(Boolean).join(" ")} role="group" aria-label={label}>{children}</div>;
}

export type SettingsRowProps = {
  label: string;
  description?: ReactNode;
  inlineDescription?: boolean;
  /** Stack custom controls below the label and supporting copy. */
  layout?: "inline" | "stacked";
  info?: ReactNode;
  icon?: IconName;
  children: ReactNode;
  className?: string;
  /** Only switch rows delegate background clicks to their switch. */
  toggle?: boolean;
};

export function SettingsRow({ label, description, inlineDescription, info, icon, children, className, toggle, layout = "inline" }: SettingsRowProps) {
  return <div className={["sds settings-row", layout === "stacked" ? "settings-row-stacked" : "", inlineDescription ? "has-inline-description" : "", toggle ? "is-toggle" : "", className].filter(Boolean).join(" ")} role={layout === "stacked" ? "group" : undefined} aria-label={layout === "stacked" ? label : undefined} onClick={toggle ? event => {
    if ((event.target as HTMLElement).closest("button, a, input, select, textarea, [tabindex], .board-tipped")) return;
    event.currentTarget.querySelector<HTMLButtonElement>(".theme-switch")?.click();
  } : undefined}>
    <div className="settings-row-leading">
      {icon ? <Icon name={icon} size={16} /> : null}
      <div className="settings-row-copy"><span className="settings-row-label">{label}{info}</span>{description ? <span className="settings-row-description">{description}</span> : null}</div>
    </div>
    <div className="settings-row-control">{children}</div>
  </div>;
}

type RowCopy = Omit<SettingsRowProps, "children" | "toggle">;
export function SettingsToggleRow({ value, onValueChange, ...props }: RowCopy & { value: boolean; onValueChange: (value: boolean) => void }) {
  return <SettingsRow {...props} toggle><ThemeSwitch label={props.label} pressed={value} onPressedChange={onValueChange} /></SettingsRow>;
}
export function SettingsMenuRow({ items, value, onValueChange, menuClassName, ...props }: RowCopy & Pick<MenuProps, "items" | "value" | "onValueChange"> & { menuClassName?: string }) {
  return <SettingsRow {...props}><Menu className={menuClassName} items={items} value={value} onValueChange={onValueChange} /></SettingsRow>;
}
export function SettingsInputRow({ input, ...props }: RowCopy & { input: InputHTMLAttributes<HTMLInputElement> }) {
  const id = useId();
  return <SettingsRow {...props}><input {...input} id={input.id ?? id} aria-label={input["aria-label"] ?? props.label} className={["sds line settings-input", input.className].filter(Boolean).join(" ")} /></SettingsRow>;
}
