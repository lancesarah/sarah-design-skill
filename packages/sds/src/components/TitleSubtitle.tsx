"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { TableChip, taskMenuItem } from "./table-columns";

/** Title text sits this far inside the chip and the field. The subtitle uses the same inset. */
export const TITLE_TEXT_INSET = 4;

const clip: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

function titleText(title: boolean): CSSProperties {
  return {
    fontSize: title ? "var(--text-16)" : "var(--text-14)",
    fontWeight: 400,
    lineHeight: title ? "20px" : "16px",
    ...clip,
  };
}

export type TitleDropdownValue = {
  value: string;
  options: readonly string[];
  /** Muted stand-in shown while `value` is empty, such as Location or Item. */
  placeholder?: string;
  onChange?: (value: string) => void;
  open?: boolean;
  onToggle?: () => void;
};

type Shared = {
  subtitle: string;
  onSubtitleChange?: (value: string) => void;
  subtitleLabel?: string;
  subtitlePlaceholder?: string;
  /** Table rows stay 14. The side title stays 16, the size location and item used before. */
  size?: "row" | "title";
};

export type TitleSubtitleProps = Shared &
  (
    | { variant: "dropdown"; title: TitleDropdownValue | readonly TitleDropdownValue[] }
    | { variant: "editable"; title: string; onTitleChange?: (value: string) => void; titleLabel?: string; titlePlaceholder?: string }
  );

function choicesFor(value: string, options: readonly string[]) {
  if (!value || options.includes(value)) return options;
  return [value, ...options];
}

function DropdownTitle({ part, shrink, title }: { part: TitleDropdownValue; shrink: boolean; title: boolean }) {
  const [value, setValue] = useState(part.value);
  const [localOpen, setLocalOpen] = useState(false);
  useEffect(() => setValue(part.value), [part.value]);
  const open = part.onToggle ? Boolean(part.open) : localOpen;
  const toggle = () => {
    if (part.onToggle) part.onToggle();
    else setLocalOpen((current) => !current);
  };
  const options = choicesFor(value, part.options);
  const muted = !value && Boolean(part.placeholder);
  const pick = (next: string) => {
    setValue(next);
    part.onChange?.(next);
    if (part.onToggle) part.onToggle();
    else setLocalOpen(false);
  };
  return (
    <TableChip
      open={open}
      onToggle={toggle}
      className={muted ? "title-sub-chip is-empty" : "title-sub-chip"}
      style={{
        ...(shrink ? { minWidth: 0, maxWidth: "100%", width: "auto", overflow: "hidden" } : { maxWidth: "100%" }),
        ...(title ? { padding: "0 4px" } : {}),
      }}
      menu={options.map((option) => taskMenuItem(option, option === value, () => pick(option), option))}
    >
      <span style={{ ...titleText(title), color: muted ? "var(--black-50)" : undefined }}>{muted ? part.placeholder : value}</span>
    </TableChip>
  );
}

function EditableTitle({ value, onChange, label, placeholder }: { value: string; onChange?: (value: string) => void; label?: string; placeholder?: string }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <input
      className="title-sub-field"
      aria-label={label ?? "Title"}
      placeholder={placeholder}
      value={text}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => {
        setText(event.target.value);
        onChange?.(event.target.value);
      }}
    />
  );
}

function Subtitle({ value, onChange, label, placeholder }: { value: string; onChange?: (value: string) => void; label?: string; placeholder?: string }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  if (!onChange && !text && !placeholder) return null;
  if (!onChange) {
    return <span className={text ? "title-sub-note" : "title-sub-note is-hint"}>{text || placeholder}</span>;
  }
  return (
    <input
      className="title-sub-note"
      aria-label={label ?? "Subtitle"}
      placeholder={placeholder}
      value={text}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => {
        setText(event.target.value);
        onChange(event.target.value);
      }}
    />
  );
}

export function TitleSubtitle(props: TitleSubtitleProps) {
  const titles = props.variant === "dropdown" ? (Array.isArray(props.title) ? props.title : [props.title]) : [];
  return (
    <div className="title-sub">
      <div className="title-sub-titles">
        {props.variant === "editable" ? (
          <EditableTitle value={props.title} onChange={props.onTitleChange} label={props.titleLabel} placeholder={props.titlePlaceholder} />
        ) : (
          titles.map((part, index) => (
            <span key={`${part.value}-${index}`} className="title-sub-part">
              {index > 0 ? <span className="sheet-dot">·</span> : null}
              <DropdownTitle part={part} shrink={index === titles.length - 1} title={props.size === "title"} />
            </span>
          ))
        )}
      </div>
      <Subtitle value={props.subtitle} onChange={props.onSubtitleChange} label={props.subtitleLabel} placeholder={props.subtitlePlaceholder} />
    </div>
  );
}
