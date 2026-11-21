"use client";

import type { ComponentPropsWithRef } from "react";

type SettingsSwitchProps = Omit<ComponentPropsWithRef<"button">, "onChange" | "onClick" | "role" | "aria-checked" | "children"> & {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
};

export function SettingsSwitch({ checked, label, onCheckedChange, className, ...props }: SettingsSwitchProps) {
  return (
    <button {...props} type="button" role="switch" aria-checked={checked} aria-label={label}
      className={["sds theme-switch", className].filter(Boolean).join(" ")}
      onClick={() => onCheckedChange(!checked)}>
      <span className="theme-switch-label">{label}</span>
      <span className="theme-switch-track" aria-hidden="true"><span className="theme-switch-knob" /></span>
    </button>
  );
}
