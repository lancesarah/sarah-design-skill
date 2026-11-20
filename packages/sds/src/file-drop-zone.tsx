"use client";

import { useId, useState } from "react";
import { Icon } from "@lance-live/sds";
import "@lance-live/sds/file-drop-zone.css";

type FileDropZoneProps = {
  title: string;
  description: string;
  onChoose: () => void;
  onFilesDropped: (files: File[]) => void;
  disabled?: boolean;
  hasFile?: boolean;
};

/** The picker input and format-specific validation belong to the upload flow. */
export function FileDropZone({ title, description, onChoose, onFilesDropped, disabled, hasFile }: FileDropZoneProps) {
  const descriptionId = useId();
  const [dragging, setDragging] = useState(false);
  return (
    <button type="button" className="sds file-drop-zone" disabled={disabled}
      aria-label={title} aria-describedby={descriptionId}
      data-dragging={dragging && !disabled || undefined} onClick={onChoose}
      onDragOver={event => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={event => {
        event.preventDefault();
        setDragging(false);
        const files = Array.from(event.dataTransfer.files);
        if (!disabled && files.length) onFilesDropped(files);
      }}>
      <Icon name={hasFile ? "doc" : "upload"} size={24} />
      <span>{title}<small id={descriptionId}>{description}</small></span>
    </button>
  );
}
