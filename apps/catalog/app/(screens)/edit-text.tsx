import { Icon } from "@lance-live/gallery-ui";
import type { ReactNode } from "react";

/** Pencil that appears when editable detail text is hovered. Not for table cells. */
export function EditText({ children, fill = false }: { children: ReactNode; fill?: boolean }) {
  return (
    <span className={fill ? "edit-text is-fill" : "edit-text"}>
      {children}
      <Icon name="edit" size={14} className="edit-text-mark" />
    </span>
  );
}
