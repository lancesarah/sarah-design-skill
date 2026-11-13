const colors: Array<[string, string, string]> = [
  ["--sidebar-grey", "#f8f8f8", "Page background, hovers, table header, search bar"],
  ["--grey", "#eeeeee", "Dividers, strokes, messaging composer"],
  ["--black-50", "#848484", "Secondary text, placeholders, meta labels"],
  ["--black-25", "#c3c3c3", "Tab counts, focus ring, scrollbar"],
  ["--black-12", "#dfdfdf", "Hover outlines, icon-button hover"],
  ["--white", "#ffffff", "Surfaces, text on filled buttons"],
  ["--black", "#000000", "Primary text, toast, tooltip"],
  ["--action", "#3593dd", "Primary button, active send, filter chip"],
  ["--action-hover", "#1f6ca9", "Primary button hover"],
  ["--destructive", "#e34144", "Delete button, danger menu item"],
  ["--tag-text", "#f5c400", "Front desk tag text"],
  ["--tag-bg", "rgb(248 204 6 / 15%)", "Front desk tag fill"],
  ["--dept-housekeeping", "#4ade80", "Housekeeping tag text"],
  ["--dept-maintenance", "#ff8f1f", "Maintenance tag text"],
  ["--dept-food", "#ff4d9a", "Food & Beverage tag text"],
  ["--dept-sales", "#2ad4ea", "Sales tag text"],
  ["--dept-management", "#d08bff", "Management tag text"],
  ["--urgency-urgent", "#f76164", "Urgent label, unread count"],
  ["--urgency-high", "#ff9300", "High urgency label, open status"],
  ["--urgency-low", "#8ccd1a", "Low urgency label"],
  ["--status-complete", "#8ccd1a", "Completed status"],
  ["--filter-chip-bg", "rgb(53 147 221 / 5%)", "Filter chip fill"],
  ["--switch-knob", "#f7f7f7", "Switch knob"],
];

const spaces = ["2", "4", "8", "10", "12", "14", "16", "20", "25"];

const typeRows: Array<[string, string, string, string]> = [
  ["Eligible enrollments", "Record title", "16 / 500", "t-record"],
  ["Internal notes", "Page title", "14 / 400", "t-page"],
  ["4", "Count", "14 / 400", "t-page t-quiet t-num"],
  ["31 Eligible enrollments", "Body", "14 / 400", "t-page"],
  ["New", "Button", "14 / 400", "t-page"],
  ["Guestroom", "Place", "14 / 500", "t-place"],
  ["Housekeeping", "Chip", "13 / 400", "t-chip"],
  ["Comments", "Label", "12 / 500", "t-label"],
  ["Requested Feathered Pillows.", "Note", "12 / 400", "t-note"],
  ["Showing 6 of 6", "Meta", "12 / 400", "t-note t-quiet t-num"],
  ["Room", "Filter", "10 / 400", "t-filter"],
];

export function ColorSwatches() {
  return (
    <div className="sds swatches">
      {colors.map(([token, hex, note]) => (
        <div className="swatch" key={token}>
          <i style={{ background: `var(${token})` }} />
          <b>{token}</b>
          <code>{hex}</code>
          <span>{note}</span>
        </div>
      ))}
    </div>
  );
}

export function SpacingScale() {
  return (
    <div className="sds spaces">
      {spaces.map((step) => (
        <div className="space" key={step}>
          <span>{`--space-${step}`}</span>
          <i style={{ width: `var(--space-${step})` }} />
          <code>{step}px</code>
        </div>
      ))}
    </div>
  );
}

export function TypeScale() {
  return (
    <div className="sds type-list">
      {typeRows.map(([sample, name, spec, kind]) => (
        <div className="type-row" key={name}>
          <p className={`type-sample ${kind}`}>{sample}</p>
          <span>{name}</span>
          <code>{spec}</code>
        </div>
      ))}
    </div>
  );
}
