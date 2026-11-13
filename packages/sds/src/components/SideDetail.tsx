"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../icons";
import { OverlayMenu } from "./OverlayMenu";
import { taskMenuItem } from "./table-columns";

const factStyle: CSSProperties = {
  width: "max-content",
  maxWidth: "100%",
  height: 20,
  minWidth: 0,
  padding: "0 4px",
  justifyContent: "flex-start",
  textAlign: "left",
  overflow: "hidden",
};

function useMenuCloser(open: boolean, anchor: RefObject<HTMLButtonElement | null>, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target;
      if (anchor.current?.contains(target as Node) || (target instanceof Element && target.closest(".menu"))) return;
      close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, anchor, close]);
}

function choicesFor(value: string, options: readonly string[]) {
  if (!value || options.includes(value)) return options;
  return [value, ...options];
}

/** A fact in the detail panel: a short label and the control beside it. */
export function FactRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="fact-row">
      <span className="sheet-label">{label}</span>
      {children}
    </div>
  );
}

/** A typed fact in the detail panel. The line field, one line, beside its label. */
export function FactLine({
  label,
  value,
  placeholder = "Front desk",
  inputMode,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  inputMode?: "email" | "tel" | "text";
  onChange?: (value: string) => void;
}) {
  return (
    <input
      className="sds line"
      aria-label={label}
      placeholder={placeholder}
      inputMode={inputMode}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}

/** Location or item in the detail panel. The value at rest, a menu of choices that already exist. */
export function FactField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange?: (value: string) => void;
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useMenuCloser(open, anchor, close);
  const choices = choicesFor(value, options);
  return (
    <>
      <button
        ref={anchor}
        className={value ? "side-field" : "side-field is-empty"}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        style={factStyle}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{value || label}</span>
        <Icon name="chevron" size={10} className="sheet-edit" />
      </button>
      <OverlayMenu open={open} anchorRef={anchor} label={label} onPointerDown={(event) => event.stopPropagation()}>
        {choices.map((option) =>
          taskMenuItem(option, option === value, () => {
            onChange?.(option);
            setOpen(false);
          }, option),
        )}
      </OverlayMenu>
    </>
  );
}

/** The room square on a to-do. Clicking it types the number in that same square. */
export function SideRoom({
  value,
  onChange,
  readOnly = false,
}: {
  value: string;
  /** Kept so existing callers still compile. The number is typed. */
  options?: readonly string[];
  onChange?: (value: string) => void;
  /** A view-only panel shows the number. No room shows a quiet dash. */
  readOnly?: boolean;
}) {
  if (readOnly) {
    return (
      <span className={value ? "todo-side-room is-static" : "todo-side-room is-static is-quiet"} aria-label="Room">
        {value || "—"}
      </span>
    );
  }
  return (
    <input
      className={value ? "todo-side-room" : "todo-side-room is-quiet"}
      aria-label="Room"
      value={value}
      placeholder="412"
      onPointerDown={(event) => event.stopPropagation()}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}

/** The photo tile's dashed stroke. A CSS border can't set the dash and gap length. */
export function PhotoAddFrame() {
  return (
    <svg className="side-photo-add-frame" aria-hidden="true">
      <rect />
    </svg>
  );
}

export type Photo = { src: string; alt: string };

/** A thumbnail that opens its photo full size. */
export function PhotoThumb({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  return (
    <button className="side-photo-open" type="button" aria-label={`Open ${photo.alt || "photo"}`} onClick={onOpen}>
      <img src={photo.src} alt={photo.alt || "Photo"} />
    </button>
  );
}

/** One photo full size over the page. Arrows step through the rest. Escape closes only the viewer. */
export function PhotoViewer({ photos, index, onIndex, onClose }: { photos: Photo[]; index: number; onIndex: (index: number) => void; onClose: () => void }) {
  const state = useRef({ index, onIndex, onClose, count: photos.length });
  state.current = { index, onIndex, onClose, count: photos.length };

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const { index, onIndex, onClose, count } = state.current;
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft" && count > 1) onIndex((index - 1 + count) % count);
      else if (event.key === "ArrowRight" && count > 1) onIndex((index + 1) % count);
      else return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  const photo = photos[index];
  if (!photo || typeof document === "undefined") return null;
  const step = (by: number) => onIndex((index + by + photos.length) % photos.length);

  return createPortal(
    <div className="photo-viewer" role="dialog" aria-modal="true" aria-label={photo.alt || "Photo"}>
      <button type="button" className="photo-viewer-scrim" aria-label="Close" onClick={onClose} />
      <img className="photo-viewer-image" src={photo.src} alt={photo.alt || "Photo"} />
      <button type="button" className="photo-viewer-button photo-viewer-close" aria-label="Close" onClick={onClose}>
        <Icon name="close" size={14} />
      </button>
      {photos.length > 1 ? (
        <>
          <button type="button" className="photo-viewer-button photo-viewer-prev" aria-label="Previous photo" onClick={() => step(-1)}>
            <Icon name="chevron" size={14} />
          </button>
          <button type="button" className="photo-viewer-button photo-viewer-next" aria-label="Next photo" onClick={() => step(1)}>
            <Icon name="chevron" size={14} />
          </button>
          <p className="photo-viewer-count">
            {index + 1} of {photos.length}
          </p>
        </>
      ) : null}
    </div>,
    document.body,
  );
}

/** Photos on a record. None is allowed. A new file is added beside the ones already there. */
export function SidePhotos({ label = "Photos" }: { label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewing, setViewing] = useState<number | null>(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(
    () => () => {
      for (const photo of photosRef.current) URL.revokeObjectURL(photo.src);
    },
    [],
  );

  return (
    <div className="todo-side-photos">
      <span className="sheet-label">{label}</span>
      <div className="side-photos">
        {photos.map((photo, index) => (
          <figure className="side-photo" key={photo.src}>
            <PhotoThumb photo={photo} onOpen={() => setViewing(index)} />
            <button
              className="side-photo-remove"
              type="button"
              aria-label="Remove photo"
              onClick={() => {
                URL.revokeObjectURL(photo.src);
                setPhotos((current) => current.filter((item) => item.src !== photo.src));
              }}
            >
              <Icon name="close" size={10} />
            </button>
          </figure>
        ))}
        <button className="side-photo-add" type="button" aria-label="Add photo" onClick={() => input.current?.click()}>
          <PhotoAddFrame />
          <Icon name="camera" size={18} />
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          const files = [...(event.target.files ?? [])].filter((file) => file.type.startsWith("image/"));
          setPhotos((current) => [...current, ...files.map((file) => ({ src: URL.createObjectURL(file), alt: file.name }))]);
          event.target.value = "";
        }}
      />
      {viewing !== null ? <PhotoViewer photos={photos} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} /> : null}
    </div>
  );
}
