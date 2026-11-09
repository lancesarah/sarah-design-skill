"use client";

import { forwardRef, useEffect, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode, type CSSProperties, type Ref } from "react";
import { Icon } from "../icons";

const chipRing: CSSProperties = {
  boxShadow: "0 0 0 1px var(--black-12)",
};

export const DEPARTMENTS = [
  { value: "Front desk", dept: "Front Desk" },
  { value: "Housekeeping", dept: "Housekeeping" },
  { value: "Maintenance", dept: "Maintenance" },
  { value: "Food & Beverage", dept: "Food & Beverage" },
  { value: "Sales", dept: "Sales" },
  { value: "Management", dept: "Management" },
] as const;

export type DepartmentValue = (typeof DEPARTMENTS)[number]["value"];

type ChipProps = {
  name: string;
  className?: string;
  children?: ReactNode;
  /** Pins the button treatment for a gallery specimen. */
  state?: "hover" | "open";
  /** Circle and name only. The tag is not a control and has no stroke. */
  plain?: boolean;
};

type DepartmentChipProps = ChipProps &
  (
    | ({ as?: "span" } & HTMLAttributes<HTMLSpanElement>)
    | ({ as: "button" } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

function useDepartmentFill() {
  const [fill, setFill] = useState("var(--grey)");
  useEffect(() => {
    const read = () => setFill(document.documentElement.dataset.theme === "dark" ? "var(--black-12)" : "var(--grey)");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return fill;
}

function chevronBox(shown: boolean, open: boolean): CSSProperties {
  return {
    display: "inline-flex",
    flex: "none",
    width: shown ? 10 : 0,
    minWidth: shown ? 10 : 0,
    maxWidth: shown ? 10 : 0,
    height: 10,
    marginInlineStart: shown ? 4 : 0,
    overflow: "hidden",
    opacity: shown ? 1 : 0,
    color: "var(--black-50)",
    pointerEvents: "none",
    transform: open ? "rotate(180deg)" : undefined,
  };
}

function DepartmentButton({
  name,
  className,
  children,
  style,
  dept,
  buttonRef,
  state,
  ...rest
}: ChipProps & { dept: string; buttonRef: Ref<HTMLButtonElement> } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const [hot, setHot] = useState(false);
  const fill = useDepartmentFill();
  const expanded = state === "open" || rest["aria-expanded"] === true || rest["aria-expanded"] === "true";
  const shown = hot || state === "hover" || expanded;
  const dark = fill === "var(--black-12)";
  return (
    <button
      ref={buttonRef}
      className={className}
      data-dept={dept}
      {...rest}
      style={{
        ...chipRing,
        ...style,
        ...(shown
          ? {
              background: fill,
              color: "var(--black)",
              ...(dark ? { boxShadow: "0 0 0 1px var(--black-25)" } : {}),
            }
          : {}),
      }}
      onMouseEnter={(event) => {
        setHot(true);
        rest.onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setHot(false);
        rest.onMouseLeave?.(event);
      }}
    >
      {name}
      {children}
      <span className="dept-chevron" style={chevronBox(shown, expanded)}>
        <Icon name="chevron" size={10} />
      </span>
    </button>
  );
}

/** Gallery department tag. A button keeps the table type-chip hover: grey fill and chevron, including while the menu is open. */
export const DepartmentChip = forwardRef<HTMLSpanElement | HTMLButtonElement, DepartmentChipProps>(function DepartmentChip(
  { name, className, children, as = "span", style, state, plain, ...rest },
  ref,
) {
  const dept = DEPARTMENTS.find((item) => item.value === name)?.dept ?? name;
  const classes = ["sds", "dept", plain ? "dept-plain" : "", className].filter(Boolean).join(" ");
  if (as === "button" && !plain) {
    return (
      <DepartmentButton
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
        name={name}
        className={classes}
        style={style}
        state={state}
        dept={dept}
        buttonRef={ref as Ref<HTMLButtonElement>}
      >
        {children}
      </DepartmentButton>
    );
  }
  return (
    <span ref={ref as Ref<HTMLSpanElement>} className={classes} data-dept={dept} style={plain ? style : { ...chipRing, ...style }} {...(rest as HTMLAttributes<HTMLSpanElement>)}>
      {name}
      {children}
    </span>
  );
});
