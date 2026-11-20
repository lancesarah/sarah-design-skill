"use client";

import { FileDropZone } from "@lance-live/sds/file-drop-zone";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Button, SuccessCheck, DataTable, EditorDialog, Icon, InfoTooltip, Menu, Meter, OverlayMenu, SettingsCard, SettingsRow, reoutlineInvalidFields } from "@lance-live/sds";
import { useAnchoredMenu } from "./board-parts";
import { SERVICES, type Room, type Service } from "./data";
import { UploadExceptions, type ExceptionPreview } from "./upload-exceptions";

const SOURCE_COLUMNS = ["Room", "Room status", "Cleaning service"];
const SAMPLE_ROWS = [
  ["704", "VD", "full"],
  ["319", "OD", "refresh"],
  ["320", "VC", ""],
];
const MAPPING_FIELDS = { number: "Room Number", status: "Status", service: "Service Type" };
type MappingField = keyof typeof MAPPING_FIELDS;
const DEFAULT_MAPPING: MappingField[] = ["number", "status", "service"];
const MAPPING_OPTIONS = DEFAULT_MAPPING.map(value => ({ value, label: MAPPING_FIELDS[value] }));
const ROOM_STATUSES = { VD: "Vacant Dirty", OD: "Occupied Dirty", VC: "Vacant Clean", OC: "Occupied Clean" };
const STATUS_OPTIONS = Object.entries(ROOM_STATUSES).map(([value, label]) => ({ value, label }));
type ImportStatus = keyof typeof ROOM_STATUSES;
export type UploadMode = "skip_duplicates" | "upsert" | "insert";
type ReviewRoom = { id: string; number: string; status: ImportStatus | ""; service: Service | "" };
export type UploadRoom = Pick<Room, "number" | "state" | "occupied" | "service">;
const IMPORT_OPTIONS: { mode: UploadMode; label: string }[] = [
  { mode: "skip_duplicates", label: "Insert new only" },
  { mode: "upsert", label: "Overwrite duplicates" },
  { mode: "insert", label: "Insert all" },
];
const SCAN_ERROR = "We couldn’t read this board. Try a clearer image or another copy of the file.";

function sampleRooms(mapping: MappingField[]): ReviewRoom[] {
  return SAMPLE_ROWS.map((values, index) => {
    const status = values[mapping.indexOf("status")];
    const service = values[mapping.indexOf("service")];
    return {
      id: String(index),
      number: values[mapping.indexOf("number")],
      status: Object.hasOwn(ROOM_STATUSES, status) ? status as ImportStatus : "",
      service: SERVICES.find(item => item.value === service)?.value ?? "",
    };
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function FileThumbnail({ file }: { file: File }) {
  const [url, setUrl] = useState<string>();
  const [failed, setFailed] = useState(false);
  const isImage = file.type.startsWith("image/");

  useEffect(() => {
    if (!isImage || typeof URL.createObjectURL !== "function") return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isImage]);

  if (url && !failed) {
    return <img className="board-upload-thumbnail" src={url} alt="" onError={() => setFailed(true)} />;
  }

  const fileType = isImage ? "Image" : /\.csv$/i.test(file.name) ? "CSV" : /\.pdf$/i.test(file.name) || file.type === "application/pdf" ? "PDF" : "File";
  return <span className="board-upload-thumbnail" aria-hidden="true">{fileType}</span>;
}

function fileKey(file: File) {
  return JSON.stringify([file.name, file.size, file.lastModified]);
}

export function UploadBoard({ date, onClose, roomNumbers = [], onImport, onMarkDnd }: {
  date?: string;
  onClose: () => void;
  roomNumbers?: string[];
  onImport?: (rooms: UploadRoom[], mode: UploadMode) => void;
  onMarkDnd?: (numbers: string[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const importAnchor = useRef<HTMLDivElement>(null);
  const importButton = useRef<HTMLButtonElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [failedFiles, setFailedFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"upload" | "scan" | "mapping" | "review" | "dnd" | "success" | "error">("upload");
  const [scanProgress, setScanProgress] = useState(0);
  const [mapping, setMapping] = useState(DEFAULT_MAPPING);
  const [reviewRooms, setReviewRooms] = useState<ReviewRoom[]>([]);
  const [dndInput, setDndInput] = useState("");
  const [importedCount, setImportedCount] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [exceptionPreview, setExceptionPreview] = useState<ExceptionPreview | null>(null);
  const importMenu = useAnchoredMenu<"import">({ closeOnEscape: false });
  const needsMapping = files.some(file => /\.csv$/i.test(file.name));
  const validMapping = new Set(mapping).size === DEFAULT_MAPPING.length;
  const existingRooms = new Set(roomNumbers);
  const dndRooms = [...new Set(dndInput.split(/[\s,]+/).filter(Boolean))];
  const unknownDndRooms = dndRooms.filter(number => !existingRooms.has(number));
  const visibleFiles = phase === "error" ? failedFiles : files;
  const hasFiles = visibleFiles.length > 0;
  const processLabel = `Process ${files.length} ${files.length === 1 ? "File" : "Files"}`;
  const visibleError = phase === "error" ? error || SCAN_ERROR : phase === "upload" ? error : "";
  const title = { upload: "Upload boards", error: "Upload boards", scan: "Scanning…", mapping: "Verify Column Mapping", review: "Review & Import", dnd: "Mark DND Rooms", success: "Boards imported" }[phase];

  function dropdown(key: string) {
    return {
      className: "board-upload-dropdown",
      open: activeDropdown === key,
      onOpenChange: (open: boolean) => setActiveDropdown(current => open ? key : current === key ? null : current),
    };
  }

  function changeReviewRoom(id: string, patch: Partial<ReviewRoom>) {
    setReviewRooms(current => current.map(room => room.id === id ? { ...room, ...patch } : room));
  }

  function roomsForMode(mode: UploadMode) {
    return mode === "skip_duplicates" ? reviewRooms.filter(room => !existingRooms.has(room.number.trim())) : reviewRooms;
  }

  function canImport(mode: UploadMode) {
    const rows = roomsForMode(mode);
    return rows.length > 0 && rows.every(room => /^\d+$/.test(room.number.trim()) && room.status && room.service);
  }

  function importRooms(mode: UploadMode) {
    if (!canImport(mode)) {
      importMenu.close();
      reoutlineInvalidFields(body.current);
      return;
    }
    const imported = roomsForMode(mode).flatMap(({ number, service, status }): UploadRoom[] => service && status ? [{
      number: number.trim(), service,
      occupied: status.startsWith("O"),
      state: status.endsWith("C") ? "clean" : "dirty",
    }] : []);
    importMenu.close();
    onImport?.(imported, mode);
    setImportedCount(imported.length);
    setPhase("dnd");
  }

  function openImport() {
    if (!IMPORT_OPTIONS.some(({ mode }) => canImport(mode))) {
      reoutlineInvalidFields(body.current);
      return;
    }
    if (importAnchor.current) importMenu.open("import", importAnchor.current);
  }

  function add(incoming: File[]) {
    if (!incoming.length) return;
    const supported = incoming.filter(file => file.type.startsWith("image/") || file.type === "application/pdf" || /\.(csv|pdf)$/i.test(file.name));
    const allowed = supported.filter(file => file.size > 0);
    const message = supported.length !== incoming.length
      ? "Choose images, PDFs, or CSV files."
      : supported.length !== allowed.length ? "One or more files are empty. Choose a file with content." : "";
    setError(message);
    setFailedFiles(allowed.length ? [] : [...new Map(incoming.map(file => [fileKey(file), file])).values()]);
    setPhase(allowed.length ? "upload" : "error");
    setFiles(current => [...new Map([...current, ...allowed].map(file => [fileKey(file), file])).values()]);
  }

  function backToFiles() {
    setError("");
    setFailedFiles([]);
    setPhase("upload");
  }

  function remove(key: string) {
    if (phase === "error") {
      const remaining = failedFiles.filter(file => fileKey(file) !== key);
      if (remaining.length) setFailedFiles(remaining);
      else backToFiles();
      return;
    }
    setFiles(current => current.filter(file => fileKey(file) !== key));
  }

  function dragOver(event: DragEvent) {
    event.preventDefault();
    setDragging(true);
  }

  function drop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    add(Array.from(event.dataTransfer.files));
  }

  useEffect(() => {
    if (phase !== "upload" || exceptionPreview) return;
    function paste(event: ClipboardEvent) {
      const images = Array.from(event.clipboardData?.files ?? []).filter(file => file.type.startsWith("image/"));
      if (images.length) { event.preventDefault(); add(images); }
    }
    document.addEventListener("paste", paste);
    return () => document.removeEventListener("paste", paste);
  }, [phase, exceptionPreview]);

  useEffect(() => {
    if (phase !== "scan") return;
    const startedAt = performance.now();
    const duration = 1600;
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      if (elapsed >= duration) {
        window.clearInterval(timer);
        if (needsMapping) {
          setMapping(DEFAULT_MAPPING);
          setPhase("mapping");
        } else {
          setReviewRooms(sampleRooms(DEFAULT_MAPPING));
          setPhase("review");
        }
      } else {
        setScanProgress(Math.floor(100 * elapsed / duration));
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, needsMapping]);

  if (exceptionPreview) return <UploadExceptions preview={exceptionPreview} date={date ?? new Date().toISOString().slice(0, 10)}
    onPreview={setExceptionPreview} onBack={() => setExceptionPreview(null)} onClose={onClose}
    onReview={service => {
      setReviewRooms(sampleRooms(DEFAULT_MAPPING).map((room, index) => index === 0 && service ? { ...room, service } : room));
      setExceptionPreview(null);
      setPhase("review");
    }} />;

  return (
    <EditorDialog
      kicker={title}
      title=""
      layout="pills"
      className={`board-upload-dialog${hasFiles ? " is-staged" : ""}${phase !== "upload" && phase !== "error" ? " is-processing" : ""}${phase === "review" ? " is-review" : ""}${phase === "success" ? " is-success" : ""}`}
      onClose={onClose}
      bodyRef={body}
      onEscape={() => {
        if (activeDropdown !== null) {
          setActiveDropdown(null);
          return true;
        }
        if (importMenu.target === null) return false;
        importMenu.close();
        importButton.current?.focus();
        return true;
      }}
      footer={phase === "error" ? (
        <div className="board-upload-actions">
          <Button variant="secondary" onClick={backToFiles}>Back to files</Button>
          <Button onClick={() => input.current?.click()}><Icon name="upload" />Choose files</Button>
        </div>
      ) : phase === "scan" ? null : phase === "mapping" ? (
        <div className="board-upload-actions">
          <Button variant="secondary" onClick={backToFiles}>Back to files</Button>
          <Button onClick={() => {
            if (!validMapping) { reoutlineInvalidFields(body.current); return; }
            setReviewRooms(sampleRooms(mapping));
            setPhase("review");
          }}>Continue</Button>
        </div>
      ) : phase === "review" ? (
        <div className="board-upload-actions">
          <Button variant="secondary" onClick={() => { importMenu.close(); setPhase(needsMapping ? "mapping" : "upload"); }}>{needsMapping ? "Back to mapping" : "Back to files"}</Button>
          <div className="board-upload-import" ref={importAnchor}>
            <Button ref={importButton} aria-haspopup="menu" aria-expanded={importMenu.target !== null} onClick={openImport}><Icon name="upload" />Import {reviewRooms.length}</Button>
          </div>
        </div>
      ) : phase === "dnd" ? (
        <div className="board-upload-actions">
          <Button variant="secondary" onClick={() => setPhase("success")}>Skip</Button>
          <Button disabled={!dndRooms.length} onClick={() => {
            if (unknownDndRooms.length) { reoutlineInvalidFields(body.current); return; }
            onMarkDnd?.(dndRooms);
            setPhase("success");
          }}><Icon name="moon" />Mark DND</Button>
        </div>
      ) : phase === "success" ? (
        <div key="success" className="board-upload-actions">
          <Button autoFocus onClick={onClose}>Continue</Button>
        </div>
      ) : hasFiles ? (
        <div className="board-upload-actions">
          <Button variant="secondary" onClick={() => input.current?.click()}><Icon name="plus" />Add more</Button>
          <Button variant="primary" onClick={() => { setScanProgress(0); setPhase("scan"); }}><Icon name="upload" />{processLabel}</Button>
        </div>
      ) : (
        <div className="board-upload-start-actions">
          <span className="hk-help board-upload-hint"><Icon name="clipboard" /> Paste an image with ⌘V or Ctrl+V</span>
          <button type="button" className="board-upload-preview-link" onClick={() => setExceptionPreview("choose")}>Preview exceptions</button>
        </div>
      )}
    >
      <input ref={input} type="file" hidden multiple accept="image/*,.pdf,.csv" onChange={event => { add(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
      {phase === "scan" ? (
        <div className="board-upload-scanning">
          <div className="board-upload-scan-heading">
            <span className="board-upload-scan-symbol"><Icon name="sparkle" size={20} /></span>
            <span className="board-upload-scan-percent" aria-hidden="true">{scanProgress}%</span>
          </div>
          <div className="board-upload-scan-track" role="progressbar" aria-label="Scan progress" aria-valuenow={scanProgress}>
            <div aria-hidden="true">
              <Meter value={scanProgress} max={100} label="" />
              {scanProgress > 0 && <span className="board-upload-scan-light" style={{ insetInlineStart: `${scanProgress}%` }} />}
            </div>
          </div>
          <div className="board-upload-scan-copy">
            <p role="status">Scanning with AI…</p>
            <p className="hk-help">Usually takes 30–60 seconds</p>
          </div>
        </div>
      ) : phase === "mapping" ? (
        <>
          <p className="hk-help">Match each source column to the corresponding Boards field.</p>
          <SettingsCard label="Column mapping">
            {SOURCE_COLUMNS.map((column, index) => (
              <SettingsRow key={column} label={column} description={SAMPLE_ROWS[0][index]}>
                <Menu {...dropdown(`mapping-${index}`)} triggerLabel={`Map ${column}`} placeholderIcon="list" items={MAPPING_OPTIONS} value={mapping[index]} invalid={mapping.indexOf(mapping[index]) !== mapping.lastIndexOf(mapping[index])} onValueChange={field =>
                  setMapping(current => current.map((value, position) => position === index ? field as MappingField : value))
                } />
              </SettingsRow>
            ))}
          </SettingsCard>
          {!validMapping && <p className="board-upload-error" role="alert">Use each Boards field once.</p>}
        </>
      ) : phase === "review" ? (
        <>
          <DataTable rows={reviewRooms} interactive columns={[
            { id: "room", title: "Room", minWidth: 160, measure: () => null, render: (room) => (
              <div className="board-upload-review-room">
                <input className="sds line" aria-label={`Room number for row ${Number(room.id) + 1}`} inputMode="numeric" value={room.number} aria-invalid={!/^\d+$/.test(room.number.trim())} onChange={event => changeReviewRoom(room.id, { number: event.target.value })} />
                {existingRooms.has(room.number.trim()) && <InfoTooltip className="mini-pill board-upload-dupe" label="We found two records for the same room.">Dupe</InfoTooltip>}
              </div>
            ) },
            { id: "status", title: "Status", minWidth: 180, measure: () => null, flex: true, render: room => (
              <Menu {...dropdown(`status-${room.id}`)} triggerLabel={`Status for row ${Number(room.id) + 1}`} placeholder="Choose status" placeholderIcon="bed" items={STATUS_OPTIONS} value={room.status} invalid={!room.status} onValueChange={status => changeReviewRoom(room.id, { status: status as ImportStatus })} />
            ) },
            { id: "service", title: "Service", minWidth: 140, flex: true, render: room => (
              <Menu {...dropdown(`service-${room.id}`)} triggerLabel={`Service for row ${Number(room.id) + 1}`} placeholder="Choose service" placeholderIcon="clean-full" items={SERVICES} value={room.service} invalid={!room.service} onValueChange={service => changeReviewRoom(room.id, { service: service as Service })} />
            ) },
          ]} />
          {reviewRooms.some(room => !/^\d+$/.test(room.number.trim()) || !room.status || !room.service) && <p className="board-upload-error">Resolve the highlighted fields before importing those rooms.</p>}
          <OverlayMenu open={importMenu.target !== null} anchorRef={importMenu.anchorRef} marker={importMenu.marker} align="end" label="Import options" className="board-upload-import-menu">
            {IMPORT_OPTIONS.map(({ mode, label }) => (
              <button key={mode} className="menu-item" type="button" role="menuitem" disabled={!roomsForMode(mode).length} aria-disabled={!canImport(mode) || undefined} onClick={() => importRooms(mode)}>{label}</button>
            ))}
          </OverlayMenu>
        </>
      ) : phase === "dnd" ? (
        <>
          <p className="hk-help">Enter room numbers separated by commas or spaces.</p>
          <input className="sds line" aria-label="Room numbers" aria-invalid={unknownDndRooms.length > 0} value={dndInput} onChange={event => setDndInput(event.target.value)} />
          {unknownDndRooms.length > 0 && <p className="board-upload-error" role="alert">Not on this board: {unknownDndRooms.join(", ")}.</p>}
        </>
      ) : phase === "success" ? (
        <div className="board-upload-success" role="status">
          <SuccessCheck />
          <p>{importedCount} {importedCount === 1 ? "room" : "rooms"} imported.</p>
        </div>
      ) : hasFiles ? (
        <ul className="board-upload-files" aria-label="Selected files" data-dragging={dragging || undefined} onDragOver={dragOver} onDragLeave={() => setDragging(false)} onDrop={drop}>
          {visibleFiles.map(file => (
            <li key={fileKey(file)}>
              <FileThumbnail file={file} />
              <div className="board-upload-file-details">
                <span>{file.name}</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
              <Button icon variant="danger-light" className="board-upload-remove" aria-label={`Remove ${file.name}`} onClick={() => remove(fileKey(file))}>
                <span aria-hidden="true">−</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <FileDropZone title="Upload files" description="Drop or select multiple images, PDFs, or CSV files"
          onChoose={() => input.current?.click()} onFilesDropped={add} />
      )}
      {visibleError ? <p className="board-upload-error" role="alert">{visibleError}</p> : null}
    </EditorDialog>
  );
}
