"use client";

import { LineField } from "./text-entry";
import type { ComponentProps } from "react";
import { Button, Icon } from "@lance-live/sds";
import "@lance-live/sds/add-option.css";

/** The same add control can also open an entry field from a catalog row. */
export function AddOptionButton({ children, ...props }: Omit<ComponentProps<typeof Button>, "variant">) {
  return <Button {...props} variant="secondary"><Icon name="plus" size={14} />{children}</Button>;
}

export type AddOptionFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  onAdd: () => void;
  label: string;
  placeholder?: string;
  addLabel: string;
  addAriaLabel?: string;
  disabled?: boolean;
  /** Prevent adding an invalid or duplicate value while the user corrects it. */
  addDisabled?: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
  className?: string;
};

/** Controlled entry row for adding names, phrases, or other options to a list. */
export function AddOptionField({
  value,
  onValueChange,
  onAdd,
  label,
  placeholder,
  addLabel,
  addAriaLabel,
  disabled = false,
  addDisabled = false,
  autoFocus,
  readOnly,
  className,
}: AddOptionFieldProps) {
  const canAdd = !disabled && !readOnly && !addDisabled && value.trim().length > 0;
  return (
    <div className={["sds add-option-field", className].filter(Boolean).join(" ")}>
      <LineField
        type="text"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        readOnly={readOnly}
        onChange={event => onValueChange(event.target.value)}
        onKeyDown={event => {
          if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
          event.preventDefault();
          if (canAdd) onAdd();
        }}
      />
      <AddOptionButton disabled={!canAdd} aria-label={addAriaLabel ?? addLabel} onClick={onAdd}>
        {addLabel}
      </AddOptionButton>
    </div>
  );
}
