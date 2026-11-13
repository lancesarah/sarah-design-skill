"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "../icons";
import { OverlayMenu } from "./OverlayMenu";
import { PhotoThumb, PhotoViewer, type Photo } from "./SideDetail";

/** The pill editor's fields. Pills flow in one wrapping line; `EditorPillRow` starts a new one. */
export function EditorPills({ children }: { children: ReactNode }) {
  return <div className="editor-pills">{children}</div>;
}

/** Pills that start their own line, such as status and urgency. */
export function EditorPillRow({ children }: { children: ReactNode }) {
  return <div className="editor-pill-row">{children}</div>;
}

/** A field in the pill editor that opens a menu. The menu holds `taskMenuItem` rows. */
export function EditorPill({
  open,
  onToggle,
  value,
  menu,
  icon,
  quiet = false,
  invalid = false,
}: {
  open: boolean;
  onToggle: () => void;
  value: ReactNode;
  menu: ReactNode;
  icon?: IconName;
  /** The value is a placeholder, such as an unset location. */
  quiet?: boolean;
  /** A required choice left empty after a save attempt. Drawn in red. */
  invalid?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={ref}
        type="button"
        className={["editor-pill", quiet && "is-quiet", invalid && "is-invalid"].filter(Boolean).join(" ")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        onClick={onToggle}
      >
        {icon ? <Icon name={icon} size={14} /> : null}
        <span className="editor-pill-value">{value}</span>
      </button>
      <OverlayMenu open={open} anchorRef={ref} onPointerDown={(event) => event.stopPropagation()}>
        {menu}
      </OverlayMenu>
    </>
  );
}

/** A place pill with the room number in a grey track behind it. The track slides out when `open`. */
export function RoomPill({
  lead,
  open = true,
  value,
  onChange,
  invalid = false,
}: {
  /** The place pill: an `EditorPill` location menu, or `<PlacePill />` where the place is fixed. */
  lead: ReactNode;
  open?: boolean;
  value: string;
  onChange: (value: string) => void;
  /** A required room left empty after a save attempt. Drawn in red. */
  invalid?: boolean;
}) {
  return (
    <span className={["editor-pill-group", open && "is-open", open && invalid && "is-invalid"].filter(Boolean).join(" ")}>
      {lead}
      <span className="editor-pill-room-slot" inert={!open}>
        <span>
          <span className="editor-pill-room-field" data-placeholder="Room" data-value={value}>
            <input
              className="editor-pill-room"
              aria-label="Room number"
              aria-invalid={invalid || undefined}
              inputMode="numeric"
              placeholder="Room"
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          </span>
        </span>
      </span>
    </span>
  );
}

/** A place that can't change here, drawn like the location pill. */
export function PlacePill({ children }: { children: ReactNode }) {
  return (
    <span className="editor-pill is-static">
      <Icon name="location" size={14} />
      <span className="editor-pill-value">{children}</span>
    </span>
  );
}

/** The footer's photo control. The photos it adds show in `EditorPhotos`. */
export function PhotoPill({ onAdd }: { onAdd: (photos: Photo[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" className="editor-pill editor-photo-pill" aria-label="Add photo" onClick={() => input.current?.click()}>
        <Icon name="camera" size={14} />
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          onAdd(files.map((file) => ({ src: URL.createObjectURL(file), alt: file.name })));
          event.target.value = "";
        }}
      />
    </>
  );
}

/** Attached photos above the pills. A thumbnail opens the full-size viewer. */
export function EditorPhotos({ photos, onRemove }: { photos: Photo[]; onRemove: (photo: Photo) => void }) {
  const [viewing, setViewing] = useState<number | null>(null);
  if (!photos.length) return null;
  return (
    <div className="side-photos editor-photos">
      {viewing !== null ? <PhotoViewer photos={photos} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} /> : null}
      {photos.map((photo, index) => (
        <figure className="side-photo" key={photo.src}>
          <PhotoThumb photo={photo} onOpen={() => setViewing(index)} />
          <button className="side-photo-remove" type="button" aria-label="Remove photo" onClick={() => onRemove(photo)}>
            <Icon name="close" size={10} />
          </button>
        </figure>
      ))}
    </div>
  );
}

/** Labelled text entries in two columns, such as a guest's contact details. */
export function EditorFields({ children }: { children: ReactNode }) {
  return <div className="editor-fields">{children}</div>;
}

export function EditorField({
  label,
  value,
  onChange,
  placeholder = "Empty",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "text" | "tel" | "email" | "numeric" | "decimal";
}) {
  return (
    <label className="editor-field">
      <span className="editor-field-label">{label}</span>
      <input className="editor-field-input" value={value} placeholder={placeholder} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

/** Centered above the editor card when Save is pressed with a required field empty. A new `id` replays it. */
export function RequiredToast({
  id,
  onDone,
  message = "Please fill out all required fields.",
}: {
  id: number;
  onDone: () => void;
  message?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);

  useLayoutEffect(() => {
    const toast = ref.current;
    const card = document.querySelector(".editor-dialog-card");
    if (!toast || !card) return;
    const box = card.getBoundingClientRect();
    toast.style.left = `${box.left + box.width / 2}px`;
    toast.style.top = `${box.top}px`;
  }, [id]);

  useEffect(() => {
    setLeaving(false);
    const fade = window.setTimeout(() => setLeaving(true), 2800);
    const done = window.setTimeout(onDone, 3000);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(done);
    };
  }, [id, onDone]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div key={id} ref={ref} className={leaving ? "required-toast is-leaving" : "required-toast"} role="status">
      {message}
    </div>,
    document.body,
  );
}
