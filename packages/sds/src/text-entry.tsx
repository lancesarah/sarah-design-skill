import type { ComponentPropsWithRef } from "react";

/** A native single-line field with the catalog line-field appearance. */
export function LineField({ className, ...props }: ComponentPropsWithRef<"input">) {
  return <input {...props} className={["sds line", className].filter(Boolean).join(" ")} />;
}

/** A multiline field that retains native labeling, selection and form behavior. */
export function TextWell({ className, ...props }: ComponentPropsWithRef<"textarea">) {
  return <textarea {...props} className={["sds text-well", className].filter(Boolean).join(" ")} />;
}
