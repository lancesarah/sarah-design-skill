"use client";

import { useId, type ReactNode, type InputHTMLAttributes } from "react";
import { Icon, type IconName } from "../icons";
import { ThemeSwitch } from "./Fields";
import { Menu, type MenuProps } from "./Menu";

/** Described headings introduce a whole settings area; default headers label its subsections. */
export function SectionHeader({ title, icon, aside, info, description, variant = "default", level = 2 }: {
  title: string;
  icon?: IconName;
  aside?: ReactNode;
  info?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "described";
  /** Use level 3 for a subsection beneath a described area heading. */
  level?: 2 | 3;
}) {
  const Heading = level === 3 ? "h3" : "h2";
  return <header className={["sds section-header", variant === "described" ? "section-header-described" : ""].filter(Boolean).join(" ")}>
    <div className="section-header-copy"><Heading>{icon ? <Icon name={icon} size={16} /> : null}{title}{info}</Heading>{description ? <p className="section-header-description">{description}</p> : null}</div>
    {aside ? <span className="section-header-aside">{aside}</span> : null}
  </header>;
}

/** Shared vertical rhythm: whole areas are 40px apart; their subsections are 25px apart. */
export function SettingsSections({ children, spacing = "subsections", className }: {
  children: ReactNode;
  spacing?: "areas" | "subsections";
  className?: string;
}) {
  return <div className={["sds settings-sections", `settings-sections-${spacing}`, className].filter(Boolean).join(" ")}>{children}</div>;
}

/** Related editable settings; omit a header for a standalone single-row card. */
export function SettingsCard({ children, label, className, variant = "default", actions }: { children: ReactNode; label: string; className?: string; variant?: "default" | "destructive"; actions?: ReactNode }) {
  return <div className={["sds settings-card", variant === "destructive" ? "settings-card-destructive" : "", className].filter(Boolean).join(" ")} role="group" aria-label={label}>{children}{actions ? <div className="settings-card-actions">{actions}</div> : null}</div>;
}

export type SettingsRowProps = {
  label: string;
  description?: ReactNode;
  inlineDescription?: boolean;
  /** Inline keeps compact selectors to the right; stacked puts larger controls below the copy. */
  layout?: "inline" | "stacked";
  info?: ReactNode;
  icon?: IconName;
  children: ReactNode;
  className?: string;
  /** Only switch rows delegate background clicks to their switch. */
  toggle?: boolean;
};

export function SettingsRow({ label, description, inlineDescription, info, icon, children, className, toggle, layout = "inline" }: SettingsRowProps) {
  return <div className={["sds settings-row", `settings-row-${layout}`, inlineDescription ? "has-inline-description" : "", toggle ? "is-toggle" : "", className].filter(Boolean).join(" ")} role={layout === "stacked" ? "group" : undefined} aria-label={layout === "stacked" ? label : undefined} onClick={event => {
    if (event.defaultPrevented || (event.target as Element).closest("button, a, label, input, select, textarea, [tabindex], [contenteditable], .board-tipped")) return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [contenteditable="true"]')).filter(control => !control.matches('[type="hidden"], [aria-hidden="true"], [hidden]'));
    if (!toggle && controls.length !== 1) return;
    const toggles = controls.filter(control => control.matches('.theme-switch, [role="switch"], [role="checkbox"], input[type="checkbox"]'));
    if (toggles.length !== 1) return;
    const control = toggles[0];
    if (!control.matches('.theme-switch, [role="switch"], [role="checkbox"], input[type="checkbox"]') || control.matches(':disabled, [aria-disabled="true"]')) return;
    control.click();
  }}>
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
