"use client";

import { Button, Empty, Icon, OverlayMenu, Widget, WidgetEmpty } from "@lance-live/gallery-ui";
import { useEffect, useRef, useState } from "react";

type View = "all" | "checkouts" | "dnd" | "minibar";

const VIEWS: { value: View; label: string }[] = [
  { value: "all", label: "All rooms" },
  { value: "checkouts", label: "Checkouts" },
  { value: "dnd", label: "DND" },
  { value: "minibar", label: "Minibar" },
];

/** Today's departures, floor by floor. */
const FLOORS: { floor: number; rooms: string[] }[] = [
  { floor: 2, rooms: ["210", "211"] },
  { floor: 3, rooms: ["301", "302", "303", "304", "305", "306", "307", "308", "309", "310", "312", "313"] },
  { floor: 4, rooms: ["403", "404", "406", "407", "408", "409", "411", "412"] },
  { floor: 5, rooms: ["501", "502", "503", "504", "505", "510", "512", "513"] },
  { floor: 6, rooms: ["602", "603", "604", "605", "607", "608", "609", "610", "613"] },
  { floor: 7, rooms: ["702", "703", "704", "707", "708", "709", "710", "711", "713"] },
  { floor: 8, rooms: ["801", "802", "804", "805", "808", "809", "812", "813"] },
  { floor: 9, rooms: ["901", "905", "909", "910", "911", "913"] },
  { floor: 10, rooms: ["1001", "1005", "1008", "1009", "1012", "1013"] },
  { floor: 11, rooms: ["1102", "1105", "1108", "1109", "1110", "1112", "1113"] },
];

const STILL_OCCUPIED = ["305", "403", "501", "513", "607", "609", "702", "703", "704", "708", "709", "713", "801", "802", "809", "812", "813", "901", "905", "909", "1113"];
const DND = new Set(["709"]);
/** Checked out, minibar not counted yet. */
const MINIBAR = new Set(["302", "404", "604", "805", "1008"]);

function floorLabel(floor: number | null) {
  return floor === null ? "All floors" : `Floor ${floor}`;
}

const NOTE: Record<View, string> = {
  all: "Switch to Checkouts to change occupancy.",
  checkouts: "Click a room to mark it checked out, or occupied again.",
  dnd: "Rooms on DND stay as they are until the guest takes it off.",
  minibar: "Checked out rooms with the minibar still to count.",
};

const EMPTY: Record<View, { title: string; body: string }> = {
  all: { title: "No departures", body: "No rooms are due out on this floor." },
  checkouts: { title: "No departures", body: "No rooms are due out on this floor." },
  dnd: { title: "No rooms on DND", body: "Every room here can be serviced." },
  minibar: { title: "Minibars counted", body: "Every checked out room is counted." },
};

/** Today's departures as a map: one row per floor, one square per room. Occupied rooms are orange, checked out rooms are checked, and DND adds the moon. */
export function RoomMapWidget() {
  const [view, setView] = useState<View>("all");
  const [floor, setFloor] = useState<number | null>(null);
  const [occupied, setOccupied] = useState(() => new Set(STILL_OCCUPIED));
  const [open, setOpen] = useState(false);
  /** The field whose options are open beside the menu. */
  const [branch, setBranch] = useState<"type" | "floor" | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const branchRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) setBranch(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (trigger.current?.contains(target) || (target as Element).closest?.(".home-map-menu")) return;
      setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const all = FLOORS.flatMap((row) => row.rooms);
  const stillOccupied = all.filter((room) => occupied.has(room)).length;
  const shownIn = (room: string) => (view === "dnd" ? DND.has(room) : view === "minibar" ? MINIBAR.has(room) && !occupied.has(room) : true);
  const floors = FLOORS.filter((row) => floor === null || row.floor === floor)
    .map((row) => ({ ...row, rooms: row.rooms.filter(shownIn) }))
    .filter((row) => row.rooms.length);
  const viewLabel = VIEWS.find((item) => item.value === view)?.label ?? "All rooms";
  const label = [viewLabel, floor === null ? null : floorLabel(floor)].filter(Boolean).join(" · ");

  function pick(apply: () => void) {
    apply();
    setOpen(false);
    setBranch(null);
  }

  function toggle(room: string) {
    setOccupied((current) => {
      const next = new Set(current);
      if (next.has(room)) next.delete(room);
      else next.add(room);
      return next;
    });
  }

  return (
    <Widget
      icon="grid"
      title="Room map"
      action={
        <>
          <Button ref={trigger} variant="secondary" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((next) => !next)}>
            <Icon name="filter" size={14} />
            {label}
          </Button>
          <OverlayMenu open={open} anchorRef={trigger} align="end" label="Room map filters" className="home-map-menu">
            {(["type", "floor"] as const).map((field) => (
              <button
                key={field}
                ref={branch === field ? branchRef : undefined}
                className="menu-item"
                type="button"
                aria-haspopup="menu"
                aria-expanded={branch === field}
                onMouseEnter={() => setBranch(field)}
                onClick={() => setBranch(field)}
              >
                {field === "type" ? "Type" : "Floor"}
                <span className="home-map-menu-value">{field === "type" ? viewLabel : floorLabel(floor)}</span>
                <Icon name="chevron" size={14} className="menu-next" />
              </button>
            ))}
          </OverlayMenu>
          <OverlayMenu key={branch ?? "closed"} open={open && branch !== null} anchorRef={branchRef} placement="side" label={branch === "floor" ? "Floor" : "Type"} className="home-map-menu">
            {branch === "type"
              ? VIEWS.map((item) => (
                  <button key={item.value} className="menu-item" type="button" role="menuitemradio" aria-checked={view === item.value} onClick={() => pick(() => setView(item.value))}>
                    {item.label}
                    <Icon name="check" className="check" />
                  </button>
                ))
              : null}
            {branch === "floor"
              ? [null, ...FLOORS.map((row) => row.floor)].map((value) => (
                  <button key={value ?? "all"} className="menu-item" type="button" role="menuitemradio" aria-checked={floor === value} onClick={() => pick(() => setFloor(value))}>
                    {floorLabel(value)}
                    <Icon name="check" className="check" />
                  </button>
                ))
              : null}
          </OverlayMenu>
        </>
      }
    >
      <dl className="home-key home-map-key">
        <div>
          <dt>
            <span className="home-map-key-mark is-occupied" aria-hidden="true" />
            Still occupied
          </dt>
          <dd>{stillOccupied}</dd>
        </div>
        <div>
          <dt>
            <span className="home-map-key-mark is-out" aria-hidden="true" />
            Checked out
          </dt>
          <dd>{all.length - stillOccupied}</dd>
        </div>
        <div>
          <dt>
            <Icon name="moon" size={12} />
            DND
          </dt>
          <dd>{DND.size}</dd>
        </div>
      </dl>
      {floors.length ? (
        <div className="home-map">
          {floors.map((row) => (
            <section key={row.floor} className="home-map-floor" aria-label={`Floor ${row.floor}`}>
              <h3>Floor {row.floor}</h3>
              <ul>
                {row.rooms.map((room) => {
                  const isOccupied = occupied.has(room);
                  const said = `${room}, ${isOccupied ? "still occupied" : "checked out"}${DND.has(room) ? ", DND" : ""}`;
                  const body = (
                    <>
                      <span className="home-map-number">{room}</span>
                      <span className="home-map-marks" aria-hidden="true">
                        {isOccupied ? <span className="home-map-ring" /> : <Icon name="check" size={10} />}
                        {DND.has(room) ? <Icon name="moon" size={10} /> : null}
                      </span>
                    </>
                  );
                  const className = isOccupied ? "home-map-room is-occupied" : "home-map-room";
                  return (
                    <li key={room}>
                      {view === "checkouts" ? (
                        <button type="button" className={className} aria-label={said} aria-pressed={!isOccupied} onClick={() => toggle(room)}>
                          {body}
                        </button>
                      ) : (
                        <span className={className} role="img" aria-label={said}>
                          {body}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <WidgetEmpty>
          <Empty icon="grid" title={EMPTY[view].title}>
            {EMPTY[view].body}
          </Empty>
        </WidgetEmpty>
      )}
      <p className="home-map-note">{NOTE[view]}</p>
    </Widget>
  );
}
