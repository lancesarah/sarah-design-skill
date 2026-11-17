import { DND_LIST, SERVICES, UNASSIGNED, placeOf, type CustomList, type Role, type Room, type Staff } from "./data";

const STATUS = { dirty: "Not started", cleaning: "Cleaning", clean: "Clean", inspected: "Inspected" };

export function printBoard(date: string, rooms: Room[], staff: Staff[], lists: CustomList[]) {
  const frame = document.createElement("iframe");
  frame.title = "Printable boards";
  frame.className = "board-print-frame";
  frame.setAttribute("aria-hidden", "true");
  document.body.append(frame);
  const page = frame.contentDocument;
  const printWindow = frame.contentWindow;
  if (!page || !printWindow) {
    frame.remove();
    return;
  }

  function append(parent: HTMLElement, tag: string, text?: string) {
    const element = page!.createElement(tag);
    if (text) element.textContent = text;
    parent.append(element);
    return element;
  }

  page.title = `Boards · ${date}`;
  append(page.head, "style", `
    @page { size: landscape; margin: 14mm; }
    body { color: #111; font: 11pt system-ui, sans-serif; }
    h1 { font-size: 20pt; margin: 0 0 6px; }
    h2 { font-size: 15pt; margin: 18px 0 8px; }
    h3 { font-size: 11pt; margin: 14px 0 4px; }
    h2, h3 { break-after: avoid; }
    table { width: 100%; border-collapse: collapse; }
    td, th { border-bottom: 1px solid #ddd; padding: 4px 8px; text-align: left; }
    tr { break-inside: avoid; }
    .print-role + .print-role { break-before: page; }
  `);
  append(page.body, "h1", page.title);

  const roles: Role[] = ["housekeeper", "inspector"];
  for (const role of roles) {
    const section = append(page.body, "section");
    section.className = "print-role";
    append(section, "h2", role === "housekeeper" ? "Housekeepers" : "Inspectors");
    const people = staff.filter(person => person.role === role);
    const places = [
      ...people.map(person => ({ id: person.id, name: person.name })),
      { id: UNASSIGNED, name: "Unassigned" },
      ...(role === "housekeeper" ? [{ id: DND_LIST, name: "Do not disturb" }] : []),
      ...lists.filter(list => list.role === role).map(list => ({ id: `list:${list.id}`, name: list.name })),
    ];
    const placeIds = new Set(places.map(place => place.id));
    for (const place of places) {
      const assigned = rooms.filter(room => (placeIds.has(placeOf(room, role)) ? placeOf(room, role) : UNASSIGNED) === place.id);
      if (!assigned.length) continue;
      append(section, "h3", `${place.name} (${assigned.length})`);
      const table = append(section, "table");
      const header = append(append(table, "thead"), "tr");
      for (const label of ["Room", "Type", "Service", "Status", "Checkout", "Notes"]) {
        append(header, "th", label).setAttribute("scope", "col");
      }
      const body = append(table, "tbody");
      assigned.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
      for (const room of assigned) {
        const row = append(body, "tr");
        const service = SERVICES.find(item => item.value === room.service)?.label;
        for (const value of [room.number, room.type, service, room.dnd ? "Do not disturb" : STATUS[room.state], room.dueOut, room.notes]) {
          append(row, "td", value || "—");
        }
      }
    }
  }

  printWindow.addEventListener("afterprint", () => frame.remove(), { once: true });
  printWindow.focus();
  printWindow.print();
}
