const PEOPLE = {
  mark: { name: "Mark", initials: "MJ" },
  paul: { name: "Paul", initials: "PG" },
  boris: { name: "Boris", initials: "B" },
  sarah: { name: "Sarah", initials: "SM" },
  manual: { name: "Manual", initials: "M" },
};

const URGENCY = ["urgent", "high", "standard", "low"];
const URGENCY_LABEL = { urgent: "Urgent", high: "High", standard: "Standard", low: "Low" };
const URGENCY_RANK = { urgent: 0, high: 1, standard: 2, low: 3 };
const NEXT_STATUS = { open: "progress", progress: "complete", complete: "open" };
const ADVANCE_LABEL = { open: "Mark in progress", progress: "Mark completed", complete: "Reopen" };
const COMPLETE_HOLD = 700;
const WEEKDAYS = 7;

const STATUS = {
  open: {
    label: "Open",
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="var(--urgency-high)" stroke-width="2"/></svg>',
  },
  progress: {
    label: "In progress",
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="var(--action)" stroke-width="2"/><path d="M9 14.4a5.4 5.4 0 0 0 0-10.8V9l0 5.4Z" fill="var(--action)"/></svg>',
  },
  complete: {
    label: "Completed",
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path fill="var(--status-complete)" fill-rule="evenodd" d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm3.65 6.66-1.05-.86-4 4.9-1.75-1.76-.95.96 2.8 2.8 4.95-6.04Z"/></svg>',
  },
};

const LOCATIONS = ["Guestroom", "Lobby", "Common area"];
const ITEMS = ["Bedding", "Towels", "Dryer"];
const TYPES = [
  { value: "Front Desk", label: "Front desk" },
  { value: "Housekeeping", label: "Housekeeping" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Sales", label: "Sales" },
  { value: "Management", label: "Management" },
];

function displayType(value) {
  return TYPES.find((type) => type.value === value)?.label || value || "Housekeeping";
}

const SEED = [
  { id: "pillows", room: "426", title: "Guestroom · Pillows/Bedding", type: "Housekeeping", urgency: "urgent", status: "open", assignee: "mark", opened: "now", description: "Requested Feathered Pillows.", activity: [{ who: "manual", text: "Manual created this to-do", when: "Oct 29, 4:22 PM" }, { who: "sarah", text: "Sarah assigned this to Mark", when: "Oct 29, 4:24 PM" }], comments: [{ who: "mark", text: "I'll bring feather pillows up to 426.", when: "Oct 29, 5:05 PM" }] },
  { id: "other-244", room: "244", title: "Guestroom · Other", type: "Housekeeping", urgency: "urgent", status: "open", assignee: "mark", opened: "now", description: "" },
  { id: "other-103", room: "103", title: "Guestroom · Other", type: "Housekeeping", urgency: "urgent", status: "open", assignee: "paul", opened: "2h", description: "" },
  { id: "other-244b", room: "244", title: "Guestroom · Other", type: "Housekeeping", urgency: "high", status: "open", assignee: "mark", opened: "now", description: "" },
  { id: "other-436", room: "436", title: "Guestroom · Other", type: "Housekeeping", urgency: "high", status: "open", assignee: "paul", opened: "2h", description: "" },
  { id: "dryer", room: "—", title: "Common Areas · Weekly House Dryer Thermistor Inspection — Ensure plenum area behind dryers is clear of lint. Floor should be mopped cleaned.", type: "Maintenance", urgency: "standard", status: "open", assignee: "boris", opened: "now", description: "Ensure plenum area behind dryers is clear of lint. Floor should be mopped cleaned." },
];

const page = document.querySelector(".sheet-page");
if (page) page.dataset.view = "head";

const sheet = document.querySelector("[data-sheet]");
const empty = document.querySelector("[data-empty]");
const count = document.querySelector("[data-count]");
const sheetCount = document.querySelector("[data-sheet-count]");
const tabs = [...document.querySelectorAll("[data-bucket]")];
const searchInput = document.querySelector("[data-todo-search] input");
const chips = document.querySelector("[data-chips]");
const filterMenu = document.querySelector("[data-filter-menu]");
const autoAssign = document.querySelector("[data-auto-assign]");
const rowMenu = document.querySelector("#row-menu");
const fieldMenu = document.querySelector("#field-menu");
const confirmDialog = document.querySelector(".confirm-dialog");
const scroll = document.querySelector(".sheet-scroll");
const fade = document.querySelector(".sheet-fade");

let menuTarget = null;
let fieldButton = null;
let calMonth = new Date();
let pendingDelete = null;
const settleTimers = new WeakMap();
let order = 0;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

const editMark = '<svg class="i sheet-edit" width="10" height="10" aria-hidden="true"><use href="#i-chevron"/></svg>';

function personBits(id) {
  if (!id || !PEOPLE[id]) return `<span class="avatar mini is-empty" aria-hidden="true"></span><span class="who-name">Unassigned</span>${editMark}`;
  const person = PEOPLE[id];
  return `<span class="avatar mini">${esc(person.initials)}</span><span class="who-name">${esc(person.name)}</span>${editMark}`;
}

function activityHTML(items) {
  return (items || []).map((item) => {
    const person = PEOPLE[item.who] || PEOPLE.manual;
    const text = String(item.text || "").replace(new RegExp(`^${person.name}\\s+`, "i"), "");
    return `<div class="activity-item"><span class="mini-pill"><span class="avatar mini">${esc(person.initials)}</span>${esc(person.name)}</span><span class="person-copy"><span>${esc(text)}</span><span class="meta-k">${esc(item.when)}</span></span></div>`;
  }).join("");
}

function fitField(field) {
  field.style.height = "auto";
  field.style.height = `${field.scrollHeight}px`;
}

function buildTodo(data) {
  const todo = document.createElement("article");
  todo.className = "sheet";
  todo.dataset.id = data.id;
  todo.dataset.bucket = data.bucket || (data.status === "complete" ? "completed" : "open");
  todo.dataset.type = data.type || "Housekeeping";
  todo.dataset.urgency = data.urgency || "standard";
  todo.dataset.status = data.status || "open";
  todo.dataset.assignee = data.assignee || "";
  todo.dataset.date = data.date || "";
  todo.dataset.opened = data.opened || "now";
  todo.dataset.order = data.order != null ? String(data.order) : String(order);
  if (data.pin) todo.dataset.pin = "1";
  if (data.order == null) order += 1;
  const noteHolder = "Add a note";
  todo.innerHTML = `
    <div class="sheet-clip"><div class="sheet-inner">
      <div class="sheet-line">
        <button class="sheet-status" type="button" data-advance></button>
        <input class="sheet-room${data.room === "—" || !data.room ? " cell-quiet" : ""}" value="${esc(!data.room || data.room === "—" ? "—" : data.room)}" aria-label="Room">
        <div class="sheet-copy">
          <div class="sheet-facts">
            <button class="side-field" type="button" data-menu-kind="location" aria-haspopup="menu" aria-expanded="false"><span data-location></span></button>
            <span class="sheet-dot" aria-hidden="true">·</span>
            <button class="side-field" type="button" data-menu-kind="item" aria-haspopup="menu" aria-expanded="false"><span data-item></span></button>
          </div>
          <input class="sheet-title" value="${esc(data.title || "")}" hidden>
          <input class="sheet-note" value="${esc(data.description || "")}" placeholder="${noteHolder}" aria-label="Note">
        </div>
        <span class="col-reserve">
          <button class="urgency" type="button" data-menu-kind="urgency" aria-haspopup="menu" aria-expanded="false"></button>
          <span class="fit-label sizer-chip" aria-hidden="true"><span><svg class="i" width="14" height="14" aria-hidden="true"><use href="#i-warn"/></svg>Urgent</span>${URGENCY.filter((key) => key !== "urgent").map((key) => `<span>${esc(URGENCY_LABEL[key])}</span>`).join("")}</span>
        </span>
        <span class="col-reserve sheet-type-slot">
          <button class="sheet-type" type="button" data-menu-kind="type" aria-haspopup="menu" aria-expanded="false"><span data-type-label></span>${editMark}</button>
          <span class="fit-label sizer-chip" aria-hidden="true">${TYPES.map((type) => `<span>${esc(type.label)}</span>`).join("")}</span>
        </span>
        <button class="sheet-who" type="button" data-menu-kind="assignee" aria-haspopup="menu" aria-expanded="false"><span class="fit-label"><span class="mini-pill" data-who-label></span><span class="mini-pill" aria-hidden="true"><span class="avatar mini">MJ</span></span></span></button>
        <span class="col-reserve">
          <span class="sheet-when"></span>
          <span class="fit-label sizer-when" aria-hidden="true"><span>May 30</span><span>12h</span><span>now</span></span>
        </span>
      </div>
    </div></div>`;
  todo._log = data.activity || [];
  todo._comments = data.comments || [];
  todo._photos = [];
  paintStatus(todo);
  paintFacts(todo);
  paintUrgency(todo);
  paintType(todo);
  paintWho(todo);
  paintWhen(todo);
  return todo;
}

function selectedBucket() {
  return tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.bucket || "open";
}

function syncBucket(todo) {
  if (todo.dataset.status === "complete") todo.dataset.bucket = "completed";
  else if (todo.dataset.date) todo.dataset.bucket = "scheduled";
  else todo.dataset.bucket = "open";
}

function paintStatus(todo) {
  const key = todo.dataset.status || "open";
  const status = STATUS[key] || STATUS.open;
  const button = todo.querySelector("[data-advance]");
  button.classList.add("tip-host");
  let icon = button.querySelector(".sheet-status-icon");
  let tip = button.querySelector(".tip");
  if (!icon || !tip) {
    button.innerHTML = `<span class="sheet-status-icon"></span><span class="tip" aria-hidden="true"></span>`;
    icon = button.querySelector(".sheet-status-icon");
    tip = button.querySelector(".tip");
  }
  paintingStatus = true;
  button.classList.add("is-painting");
  icon.innerHTML = status.icon;
  tip.textContent = status.label;
  paintingStatus = false;
  button.classList.remove("is-painting");
  button.setAttribute("aria-label", `${status.label}. ${ADVANCE_LABEL[key] || "Mark in progress"}`);
  if (button.classList.contains("is-tip") || button.matches(":hover")) {
    button.classList.add("is-tip");
    placeStatusTip(button);
  }
}

function placeStatusTip(button) {
  const tip = button.querySelector(".tip");
  if (!tip) return;
  const rect = button.getBoundingClientRect();
  const gap = parseFloat(getComputedStyle(button).getPropertyValue("--tip-gap")) || 8;
  tip.style.left = `${rect.left + rect.width / 2}px`;
  tip.style.top = `${rect.top - gap}px`;
}

let paintingStatus = false;

function stickStatusTip() {
  const button = sheet.querySelector(".sheet-status.is-tip");
  if (button) placeStatusTip(button);
}

function paintUrgency(todo) {
  const key = todo.dataset.urgency || "standard";
  const button = todo.querySelector("[data-menu-kind=urgency]");
  button.className = `urgency urgency-${key}`;
  const icon = key === "urgent" ? '<svg class="i" width="14" height="14" aria-hidden="true"><use href="#i-warn"/></svg>' : "";
  button.innerHTML = `${icon}${esc(URGENCY_LABEL[key])}${editMark}`;
  button.setAttribute("aria-label", `Urgency, ${URGENCY_LABEL[key]}`);
}

function paintType(todo) {
  const type = todo.dataset.type || "Housekeeping";
  const label = todo.querySelector("[data-type-label]");
  label.textContent = displayType(type);
  label.closest("button").dataset.type = type;
}

function paintWho(todo) {
  const who = todo.querySelector(".sheet-who");
  const person = PEOPLE[todo.dataset.assignee];
  who.classList.add("tip-host");
  who.classList.toggle("is-empty", !person);
  who.querySelector("[data-who-label]").innerHTML = personBits(todo.dataset.assignee);
  let tip = who.querySelector(":scope > .tip");
  if (!tip) {
    tip = document.createElement("span");
    tip.className = "tip";
    tip.setAttribute("aria-hidden", "true");
    who.append(tip);
  }
  tip.textContent = person ? person.name : "Unassigned";
  who.setAttribute("aria-label", person ? person.name : "Unassigned");
}

function formatDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function paintWhen(todo) {
  const when = todo.querySelector(".sheet-when");
  if (todo.dataset.date) {
    const text = formatDate(todo.dataset.date);
    when.textContent = text;
    when.setAttribute("aria-label", `Scheduled ${text}`);
  } else {
    const text = todo.dataset.opened || "now";
    when.textContent = text;
    when.setAttribute("aria-label", `Opened ${text}`);
  }
}

const side = document.querySelector("#todo-side");
let sideTodo = null;

function paintFacts(todo) {
  const title = todo.querySelector(".sheet-title");
  const location = todo.querySelector("[data-location]");
  const item = todo.querySelector("[data-item]");
  if (!title || !location || !item) return;
  const parts = splitTitle(title.value);
  const emptyLocation = !title.value.trim() || parts.location === "—";
  const emptyItem = !title.value.trim() || parts.item === "—";
  location.textContent = emptyLocation ? "Location" : parts.location;
  item.textContent = emptyItem ? "Item" : parts.item;
  location.closest("button").classList.toggle("is-empty", emptyLocation);
  item.closest("button").classList.toggle("is-empty", emptyItem);
  location.closest("button").setAttribute("aria-label", `Location, ${emptyLocation ? "Location" : parts.location}`);
  item.closest("button").setAttribute("aria-label", `Item, ${emptyItem ? "Item" : parts.item}`);
}

function splitTitle(title) {
  const parts = String(title || "").split(" · ");
  return {
    location: parts[0] || "—",
    item: parts.length > 1 ? parts.slice(1).join(" · ") : "—",
  };
}

function sideWhen(todo) {
  if (todo.dataset.date) {
    return new Date(`${todo.dataset.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  const when = todo._log?.[0]?.when || "";
  const dated = when.match(/^([A-Z][a-z]{2} \d{1,2})/);
  if (dated) return `${dated[1]}, ${new Date().getFullYear()}`;
  return todo.dataset.opened || "now";
}

function paintSidePhotos(todo) {
  const list = side.querySelector("[data-side-photos]");
  const photos = (todo._photos || []).map((photo, index) => `<figure class="side-photo"><img src="${esc(photo.src)}" alt="${esc(photo.alt || "Photo")}"><button class="side-photo-remove" type="button" data-side-photo-remove data-index="${index}" aria-label="Remove photo"><svg class="i" width="10" height="10"><use href="#i-close"/></svg></button></figure>`).join("");
  list.innerHTML = `${photos}<button class="side-photo-add" type="button" data-side-photo aria-label="Add photo"><svg class="i" width="24" height="24"><use href="#i-camera"/></svg></button>`;
}

function paintSideActivity(todo) {
  const list = side.querySelector("[data-side-activity]");
  list.replaceChildren();
  const rows = [
    ...(todo._log || []).map((item) => ({ kind: "log", item })),
    ...todo._comments.map((item, index) => ({ kind: "comment", item, index })),
  ].reverse();
  rows.forEach((row, index) => {
    const dim = index > 0;
    if (row.kind === "log") {
      const person = PEOPLE[row.item.who] || PEOPLE.manual;
      const node = document.createElement("div");
      node.className = `side-log${dim ? " is-dim" : ""}`;
      node.innerHTML = `<span class="avatar mini">${esc(person.initials)}</span><span class="side-log-text">${esc(row.item.text)}</span><time>${esc(row.item.when)}</time>`;
      list.append(node);
      return;
    }
    const person = PEOPLE[row.item.who] || PEOPLE.sarah;
    const node = document.createElement("div");
    node.className = "comment";
    node.dataset.index = String(row.index);
    node.innerHTML = `<div class="comment-inner"><span class="avatar mini">${esc(person.initials)}</span><span class="person-copy"><span class="mini-line">${esc(person.name)} <span class="meta-k">${esc(row.item.when)}</span></span><p>${esc(row.item.text)}</p></span><button class="note-more" type="button" data-more aria-haspopup="menu" aria-expanded="false" aria-label="More"><svg class="i" width="14" height="14"><use href="#i-dots"/></svg></button></div>`;
    list.append(node);
  });
}

function paintSide(todo) {
  if (!side || !todo) return;
  sideTodo = todo;
  const sideRoom = side.querySelector("[data-side-room]");
  if (document.activeElement !== sideRoom) {
    const roomValue = todo.querySelector(".sheet-room").value || "—";
    sideRoom.value = roomValue;
    sideRoom.classList.toggle("is-quiet", roomValue === "—" || roomValue === "");
  }
  const title = todo.querySelector(".sheet-title").value;
  const emptyTitle = !title.trim();
  const titleEl = side.querySelector("[data-side-title]");
  const facts = side.querySelector("[data-side-facts]");
  titleEl.hidden = true;
  facts.hidden = false;
  titleEl.textContent = title;
  side.querySelector("[data-side-meta-location]").hidden = emptyTitle;
  side.querySelector("[data-side-meta-item]").hidden = emptyTitle;
  const parts = splitTitle(title);
  const emptyLocation = emptyTitle || parts.location === "—";
  const emptyItem = emptyTitle || parts.item === "—";
  for (const location of side.querySelectorAll("[data-side-location]")) {
    location.textContent = emptyLocation ? "Location" : parts.location;
    const button = location.closest("button");
    button?.classList.toggle("is-empty", emptyLocation);
    button?.setAttribute("aria-label", `Location, ${emptyLocation ? "Location" : parts.location}`);
  }
  for (const item of side.querySelectorAll("[data-side-item]")) {
    item.textContent = emptyItem ? "Item" : parts.item;
    const button = item.closest("button");
    button?.classList.toggle("is-empty", emptyItem);
    button?.setAttribute("aria-label", `Item, ${emptyItem ? "Item" : parts.item}`);
  }
  const typeName = todo.dataset.type || "Housekeeping";
  const typeLabel = side.querySelector("[data-side-type]");
  const typeButton = typeLabel.closest("button");
  typeLabel.textContent = displayType(typeName);
  typeButton.dataset.type = typeName;
  typeButton.setAttribute("aria-label", `Type, ${typeName}`);
  const desc = side.querySelector("[data-side-desc]");
  if (document.activeElement !== desc) {
    desc.value = todo.querySelector(".sheet-note").value;
    fitField(desc);
  }
  side.querySelector("[data-side-when]").textContent = sideWhen(todo);
  const who = side.querySelector("[data-side-who]");
  who.innerHTML = personBits(todo.dataset.assignee);
  const status = STATUS[todo.dataset.status] || STATUS.open;
  side.querySelector("[data-side-status-icon]").innerHTML = status.icon;
  side.querySelector("[data-side-status-label]").textContent = status.label;
  const urgency = side.querySelector("[data-side-urgency]");
  const key = todo.dataset.urgency || "standard";
  urgency.className = `urgency urgency-${key}`;
  const icon = key === "urgent" ? '<svg class="i" width="14" height="14" aria-hidden="true"><use href="#i-warn"/></svg>' : "";
  urgency.innerHTML = `${icon}${esc(URGENCY_LABEL[key])}${editMark}`;
  urgency.setAttribute("aria-label", `Urgency, ${URGENCY_LABEL[key]}`);
  paintSidePhotos(todo);
  paintSideActivity(todo);
}

function setOpen(todo, open) {
  if (!todo) return;
  if (open) {
    for (const other of sheet.querySelectorAll(".sheet.is-open")) {
      if (other === todo) continue;
      other.classList.remove("is-open");
      const otherToggle = other.querySelector("[data-toggle]");
      otherToggle?.setAttribute("aria-expanded", "false");
      otherToggle?.setAttribute("aria-label", "Show to-do");
    }
  }
  todo.classList.toggle("is-open", open);
  const toggle = todo.querySelector("[data-toggle]");
  toggle?.setAttribute("aria-expanded", open ? "true" : "false");
  toggle?.setAttribute("aria-label", open ? "Hide to-do" : "Show to-do");
  if (!side) return;
  if (open) {
    side.hidden = false;
    paintSide(todo);
    return;
  }
  if (!sheet.querySelector(".sheet.is-open")) {
    side.hidden = true;
    sideTodo = null;
  }
}

function haystack(todo) {
  const who = PEOPLE[todo.dataset.assignee]?.name || "";
  return [
    todo.querySelector(".sheet-room").value,
    todo.querySelector(".sheet-title").value,
    todo.querySelector(".sheet-note").value,
    todo.dataset.type,
    URGENCY_LABEL[todo.dataset.urgency] || "",
    who,
  ].join(" ").toLowerCase();
}

function sortSheet() {
  const rows = [...sheet.querySelectorAll(".sheet")];
  rows.sort((a, b) => {
    const pin = (a.dataset.pin === "1" ? 0 : 1) - (b.dataset.pin === "1" ? 0 : 1);
    if (pin) return pin;
    const urgency = (URGENCY_RANK[a.dataset.urgency] ?? 2) - (URGENCY_RANK[b.dataset.urgency] ?? 2);
    if (urgency) return urgency;
    return Number(a.dataset.order) - Number(b.dataset.order);
  });
  if (rows.every((row, index) => row === sheet.querySelectorAll(".sheet")[index])) return;
  const openTip = sheet.querySelector(".sheet-status.is-tip");
  for (const row of rows) sheet.append(row);
  if (!openTip) return;
  const tip = openTip.querySelector(".tip");
  if (!tip) return;
  if (!tip.hasAttribute("popover")) tip.popover = "manual";
  if (!tip.matches(":popover-open")) tip.showPopover();
  placeStatusTip(openTip);
}

const FILTER_LABEL = {
  type: "Type",
  status: "Status",
  urgency: "Urgency",
  assigned: "Assigned",
  room: "Room",
  area: "Area",
  item: "Item",
  detail: "Detail",
  source: "Source",
};

function selectedFilters() {
  const groups = {};
  for (const item of filterMenu?.querySelectorAll("[data-filter-pick][aria-checked='true']") || []) {
    const key = item.dataset.filterPick;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item.dataset.value);
  }
  return groups;
}

function todoField(todo, key) {
  const title = todo.querySelector(".sheet-title")?.value || "";
  const note = todo.querySelector(".sheet-note")?.value || "";
  const room = todo.querySelector(".sheet-room")?.value || "";
  if (key === "type") return todo.dataset.type || "";
  if (key === "status") return STATUS[todo.dataset.status]?.label || "";
  if (key === "urgency") return URGENCY_LABEL[todo.dataset.urgency] || "";
  if (key === "assigned") return PEOPLE[todo.dataset.assignee]?.name || "";
  if (key === "room") return room === "—" ? "" : room;
  if (key === "area") {
    const head = title.split("·")[0].trim().toLowerCase();
    if (head.startsWith("guest")) return "Guestroom";
    if (head.startsWith("lobby")) return "Lobby";
    if (head.startsWith("common")) return "Common area";
    return "";
  }
  if (key === "item") {
    const blob = title.toLowerCase();
    if (/pillow|bedding|bed/.test(blob)) return "Bedding";
    if (/towel/.test(blob)) return "Towels";
    if (/dryer/.test(blob)) return "Dryer";
    return "";
  }
  if (key === "detail") {
    const blob = `${title} ${note}`.toLowerCase();
    if (/request|feather/.test(blob)) return "Guest request";
    if (/inspect/.test(blob)) return "Inspection";
    return "";
  }
  if (key === "source") {
    const activity = (todo._log || []).map((item) => item.text).join(" ");
    if (/guest/i.test(activity) && !/manual/i.test(activity)) return "Guest";
    return "Manual";
  }
  return "";
}

function matchesFilters(todo) {
  const groups = selectedFilters();
  return Object.entries(groups).every(([key, values]) => values.includes(todoField(todo, key)));
}

function applyFilters() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  const bucket = selectedBucket();
  const totals = { open: 0, scheduled: 0, completed: 0 };
  let visible = 0;
  let listed = 0;
  sortSheet();
  for (const todo of sheet.querySelectorAll(".sheet")) {
    const filtered = matchesFilters(todo);
    if (filtered) totals[todo.dataset.bucket] = (totals[todo.dataset.bucket] || 0) + 1;
    const inList = filtered && todo.dataset.bucket === bucket && !todo.classList.contains("is-leaving");
    if (inList) listed += 1;
    const show = inList && (!query || haystack(todo).includes(query));
    if (!todo.classList.contains("is-leaving")) todo.hidden = !show;
    if (show && !todo.hidden) visible += 1;
  }
  if (empty) empty.hidden = visible !== 0;
  if (count) count.textContent = String(sheet.querySelectorAll(".sheet").length);
  if (sheetCount) sheetCount.textContent = `Showing ${visible} of ${listed}`;
  for (const tab of tabs) {
    const badge = tab.querySelector("[data-bucket-count]");
    if (badge) badge.textContent = String(totals[tab.dataset.bucket] || 0);
  }
  placeFades();
  stickStatusTip();
}

function leaveView(todo) {
  const stays = todo.dataset.bucket === selectedBucket() && matchesFilters(todo);
  if (!stays) {
    const status = todo.querySelector(".sheet-status");
    status?.classList.remove("is-tip");
    const statusTip = status?.querySelector(".tip");
    if (statusTip?.matches(":popover-open")) statusTip.hidePopover();
  }
  if (stays || reduceMotion) {
    applyFilters();
    return;
  }
  todo.classList.add("is-leaving");
  const clip = todo.querySelector(".sheet-clip");
  const finish = (event) => {
    if (event && event.propertyName !== "grid-template-rows") return;
    todo.hidden = true;
    todo.classList.remove("is-leaving");
    applyFilters();
  };
  clip.addEventListener("transitionend", finish, { once: true });
  window.setTimeout(() => { if (todo.classList.contains("is-leaving")) finish(); }, 260);
}

function closeFilterSubs() {
  if (!filterMenu) return;
  for (const sub of filterMenu.querySelectorAll(".filter-sub")) sub.hidden = true;
  for (const button of filterMenu.querySelectorAll("[data-filter-cat]")) button.setAttribute("aria-expanded", "false");
}

function openFilterSub(button) {
  const sub = button.parentElement.querySelector(".filter-sub");
  if (button.getAttribute("aria-expanded") === "true" && !sub.hidden) return;
  closeFilterSubs();
  button.setAttribute("aria-expanded", "true");
  sub.hidden = false;
  sub.classList.remove("is-left");
  const edge = sub.getBoundingClientRect().right;
  if (edge > window.innerWidth - 8) sub.classList.add("is-left");
}

function closePanels(except) {
  if (filterMenu && filterMenu !== except) {
    filterMenu.querySelector("[data-filter-button]")?.setAttribute("aria-expanded", "false");
    const panel = filterMenu.querySelector(".filter-menu");
    if (panel) panel.hidden = true;
    closeFilterSubs();
  }
  for (const button of document.querySelectorAll("[data-menu-kind], [data-more], [data-side-more]")) {
    if (button === except) continue;
    button.setAttribute("aria-expanded", "false");
  }
  if (rowMenu) {
    rowMenu.classList.remove("is-cal-only");
    rowMenu.hidden = true;
  }
  resetCalendar();
  if (fieldMenu) fieldMenu.hidden = true;
  fieldButton = null;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function monthFloor() {
  const today = startOfToday();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

function isoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function monthOf(iso) {
  const floor = monthFloor();
  if (!iso) return floor;
  const date = new Date(`${iso}T12:00:00`);
  const month = new Date(date.getFullYear(), date.getMonth(), 1);
  return month < floor ? floor : month;
}

function resetCalendar() {
  const pop = rowMenu?.querySelector(".cal-pop");
  const button = rowMenu?.querySelector("[data-menu-schedule]");
  if (pop) {
    pop.hidden = true;
    pop.classList.remove("is-in", "is-left");
    pop.style.top = "0px";
  }
  button?.setAttribute("aria-expanded", "false");
}

function paintCalendar(todo) {
  const grid = rowMenu.querySelector("[data-cal-grid]");
  const title = rowMenu.querySelector("[data-cal-title]");
  const prev = rowMenu.querySelector("[data-cal-prev]");
  const clear = rowMenu.querySelector(".cal-pop [data-clear-date]");
  const selected = todo?.dataset.date || "";
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const today = isoDate(startOfToday());
  title.textContent = calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  prev.disabled = calMonth.getTime() <= monthFloor().getTime();
  clear.hidden = !selected;
  const pad = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < pad; i += 1) cells.push(`<span></span>`);
  for (let day = 1; day <= count; day += 1) {
    const date = new Date(year, month, day);
    const iso = isoDate(date);
    const past = date < startOfToday();
    const classes = ["cal-day"];
    if (iso === selected) classes.push("is-selected");
    if (iso === today) classes.push("is-today");
    const label = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    cells.push(`<button class="${classes.join(" ")}" type="button" ${past ? "disabled" : `data-cal-day="${iso}"`} aria-pressed="${iso === selected ? "true" : "false"}" aria-label="${esc(label)}">${day}</button>`);
  }
  const tail = (WEEKDAYS - ((pad + count) % WEEKDAYS)) % WEEKDAYS;
  for (let i = 0; i < tail; i += 1) cells.push(`<span></span>`);
  grid.innerHTML = cells.join("");
}

function placeCalendar() {
  const pop = rowMenu.querySelector(".cal-pop");
  const button = rowMenu.querySelector("[data-menu-schedule]");
  pop.style.top = "0px";
  pop.classList.remove("is-left");
  const rect = pop.getBoundingClientRect();
  if (rect.right > window.innerWidth - 8) pop.classList.add("is-left");
  const next = pop.getBoundingClientRect();
  const overflow = next.bottom - (window.innerHeight - 8);
  if (overflow > 0) pop.style.top = `${-overflow}px`;
  const originY = Math.max(16, -parseFloat(pop.style.top || "0") + button.offsetHeight / 2);
  const side = pop.classList.contains("is-left") ? "right" : "left";
  pop.style.transformOrigin = `${side} ${originY}px`;
}

function toggleCalendar() {
  const pop = rowMenu.querySelector(".cal-pop");
  const button = rowMenu.querySelector("[data-menu-schedule]");
  const open = button.getAttribute("aria-expanded") === "true";
  if (open) {
    resetCalendar();
    return;
  }
  calMonth = monthOf(menuTarget?.dataset.date);
  paintCalendar(menuTarget);
  button.setAttribute("aria-expanded", "true");
  pop.hidden = false;
  pop.classList.remove("is-in");
  placeCalendar();
  if (reduceMotion) {
    pop.classList.add("is-in");
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => pop.classList.add("is-in")));
}

function shiftCalendar(delta) {
  const next = new Date(calMonth.getFullYear(), calMonth.getMonth() + delta, 1);
  if (next < monthFloor()) return;
  calMonth = next;
  paintCalendar(menuTarget);
  placeCalendar();
}

function scheduleTodo(todo, iso) {
  todo.dataset.date = iso;
  syncBucket(todo);
  paintWhen(todo);
  if (todo === sideTodo) paintSide(todo);
  closePanels();
  leaveView(todo);
}

function fillRowMenu(target, mode) {
  const sheetItem = mode !== "delete" && target.classList.contains("sheet");
  for (const part of rowMenu.querySelectorAll("[data-sheet-only]")) part.hidden = !sheetItem;
  resetCalendar();
  if (!sheetItem) return;
  calMonth = monthOf(target.dataset.date);
  paintCalendar(target);
}

function placePanel(panel, x, y) {
  panel.hidden = false;
  panel.style.left = "0px";
  panel.style.top = "0px";
  const box = panel.getBoundingClientRect();
  panel.style.left = `${Math.max(8, Math.min(x, window.innerWidth - box.width - 8))}px`;
  panel.style.top = `${Math.max(8, Math.min(y, window.innerHeight - box.height - 8))}px`;
}

function radio(kind, value, label, selected, icon) {
  return `<button class="menu-item" type="button" role="menuitemradio" data-kind="${kind}" data-value="${esc(value)}" aria-checked="${value === selected ? "true" : "false"}">${icon || ""}${esc(label)}<svg class="i check" width="14" height="14"><use href="#i-check"/></svg></button>`;
}

function openFieldMenu(button) {
  const todo = button.closest(".sheet") || sideTodo;
  const kind = button.dataset.menuKind;
  if (!todo) return;
  const open = button.getAttribute("aria-expanded") === "true";
  closePanels();
  if (open) return;
  menuTarget = todo;
  fieldButton = button;
  button.setAttribute("aria-expanded", "true");
  fieldMenu.classList.toggle("is-status", kind === "status");
  if (kind === "urgency") {
    fieldMenu.innerHTML = URGENCY.map((key) => radio("urgency", key, URGENCY_LABEL[key], todo.dataset.urgency)).join("");
  } else if (kind === "type") {
    fieldMenu.innerHTML = TYPES.map((type) => radio("type", type.value, "", todo.dataset.type, `<span class="dept" data-dept="${esc(type.value)}">${esc(type.label)}</span>`)).join("");
  } else if (kind === "assignee") {
    fieldMenu.innerHTML = Object.entries(PEOPLE)
      .filter(([id]) => id !== "manual")
      .map(([id, person]) => radio("assignee", id, person.name, todo.dataset.assignee, `<span class="avatar mini">${esc(person.initials)}</span>`))
      .join("");
  } else if (kind === "status") {
    fieldMenu.innerHTML = Object.entries(STATUS)
      .map(([key, status]) => radio("status", key, status.label, todo.dataset.status, status.icon))
      .join("");
  } else if (kind === "location" || kind === "item") {
    const parts = splitTitle(todo.querySelector(".sheet-title").value);
    const current = kind === "location" ? parts.location : parts.item;
    const base = kind === "location" ? LOCATIONS : ITEMS;
    const values = !current || current === "—" || base.includes(current) ? base : [current, ...base];
    fieldMenu.innerHTML = values.map((value) => radio(kind, value, value, current)).join("");
  } else {
    const clear = todo.dataset.date ? `<button class="menu-item" type="button" data-clear-date>Clear date</button>` : "";
    fieldMenu.innerHTML = `<label class="menu-item schedule-field">Date<input type="date" data-schedule value="${esc(todo.dataset.date || "")}"></label>${clear}`;
  }
  const box = button.getBoundingClientRect();
  placePanel(fieldMenu, box.left, box.bottom + 4);
}

function choose(todo, kind, value) {
  if (kind === "urgency") {
    todo.dataset.urgency = value;
    paintUrgency(todo);
    applyFilters();
    if (todo === sideTodo) paintSide(todo);
    return;
  }
  if (kind === "type") {
    todo.dataset.type = value;
    paintType(todo);
    if (todo === sideTodo) paintSide(todo);
    leaveView(todo);
    return;
  }
  if (kind === "assignee") {
    todo.dataset.assignee = value;
    paintWho(todo);
    if (todo === sideTodo) paintSide(todo);
    return;
  }
  if (kind === "status") setStatus(todo, value);
  if (kind === "location" || kind === "item") {
    const title = todo.querySelector(".sheet-title");
    const parts = splitTitle(title.value);
    if (kind === "location") parts.location = value;
    else parts.item = value;
    title.value = parts.item && parts.item !== "—" ? `${parts.location} · ${parts.item}` : parts.location;
    paintFacts(todo);
    applyFilters();
    if (todo === sideTodo) paintSide(todo);
  }
}

function clearSettle(todo) {
  const timer = settleTimers.get(todo);
  if (timer) window.clearTimeout(timer);
  settleTimers.delete(todo);
  delete todo.dataset.settling;
}

function setStatus(todo, next) {
  clearSettle(todo);
  todo.dataset.status = next;
  paintStatus(todo);
  if (todo === sideTodo) paintSide(todo);
  if (next === "complete" && selectedBucket() !== "completed") {
    todo.dataset.settling = "1";
    const timer = window.setTimeout(() => {
      settleTimers.delete(todo);
      delete todo.dataset.settling;
      if (!todo.isConnected || todo.dataset.status !== "complete") return;
      syncBucket(todo);
      leaveView(todo);
    }, COMPLETE_HOLD);
    settleTimers.set(todo, timer);
    return;
  }
  syncBucket(todo);
  leaveView(todo);
}

function advance(todo) {
  setStatus(todo, NEXT_STATUS[todo.dataset.status] || "progress");
}

function openRowMenu(x, y, target, more, mode) {
  menuTarget = target;
  closePanels();
  if (more) more.setAttribute("aria-expanded", "true");
  fillRowMenu(target, mode);
  placePanel(rowMenu, x, y);
  if (!more) return;
  const box = more.getBoundingClientRect();
  const width = rowMenu.getBoundingClientRect().width;
  placePanel(rowMenu, box.right - width, box.bottom + 4);
}

function paintChips() {
  chips.replaceChildren();
  for (const item of filterMenu?.querySelectorAll("[data-filter-pick][aria-checked='true']") || []) {
    const label = FILTER_LABEL[item.dataset.filterPick] || item.dataset.filterPick;
    chips.append(chip(`${label}: ${item.dataset.value}`, () => {
      item.setAttribute("aria-checked", "false");
      paintChips();
      applyFilters();
    }));
  }
}

function chip(label, onRemove) {
  const button = document.createElement("button");
  button.className = "chip chip-filter";
  button.type = "button";
  const [name, ...rest] = label.split(": ");
  const body = rest.length
    ? `<span class="chip-k">${esc(name)}</span>: ${esc(rest.join(": "))}`
    : esc(label);
  button.innerHTML = `${body} <svg class="i x" width="10" height="10"><use href="#i-plus"/></svg>`;
  button.addEventListener("click", onRemove);
  return button;
}

function assignUnowned() {
  for (const todo of sheet.querySelectorAll(".sheet")) {
    if (todo.dataset.assignee) continue;
    todo.dataset.assignee = "mark";
    paintWho(todo);
  }
}

function addComment(todo, text) {
  todo._comments.push({ who: "sarah", text, when: "now" });
  if (todo === sideTodo) paintSideActivity(todo);
}

function removeTarget(target) {
  const comment = target.classList.contains("comment");
  let gone = false;
  const finish = () => {
    if (gone) return;
    gone = true;
    if (comment && sideTodo) {
      const index = Number(target.dataset.index);
      if (!Number.isNaN(index)) sideTodo._comments.splice(index, 1);
    }
    target.remove();
    if (comment) return;
    applyFilters();
    if (!sheet.querySelector(".sheet")) createTodo();
  };
  if (reduceMotion) { finish(); return; }
  target.classList.add("is-leaving");
  const clip = comment ? target : target.querySelector(".sheet-clip");
  const done = (event) => {
    if (event && event.propertyName !== "grid-template-rows") return;
    clip.removeEventListener("transitionend", done);
    finish();
  };
  clip.addEventListener("transitionend", done);
  window.setTimeout(() => { if (target.isConnected) finish(); }, 260);
}

function askDelete(target) {
  pendingDelete = target;
  const title = confirmDialog.querySelector("#confirm-title");
  const copy = confirmDialog.querySelector("p");
  const comment = target.classList.contains("comment");
  title.textContent = comment ? "Delete this comment?" : "Delete this to-do?";
  const name = comment
    ? (target.querySelector("p")?.textContent.trim() || "this comment")
    : (target.querySelector(".sheet-title")?.value.trim() || "this to-do");
  copy.textContent = `“${name}” will be permanently removed for the whole team.`;
  confirmDialog.classList.remove("is-closing");
  confirmDialog.showModal();
}

function closeConfirm() {
  if (!confirmDialog?.open || confirmDialog.classList.contains("is-closing")) return;
  const card = confirmDialog.querySelector(".confirm");
  if (reduceMotion) { confirmDialog.close(); return; }
  confirmDialog.classList.add("is-closing");
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    confirmDialog.classList.remove("is-closing");
    confirmDialog.close();
  };
  card.addEventListener("animationend", finish, { once: true });
  window.setTimeout(finish, 240);
}

function createTodo() {
  const openTab = tabs.find((tab) => tab.dataset.bucket === "open");
  for (const tab of tabs) tab.setAttribute("aria-selected", tab === openTab ? "true" : "false");
  const todo = buildTodo({
    id: `todo-${Date.now()}`,
    room: "",
    title: "",
    type: "Housekeeping",
    urgency: "standard",
    status: "open",
    order: -Date.now(),
    pin: true,
    assignee: autoAssign?.getAttribute("aria-pressed") === "true" ? "mark" : "",
    opened: "now",
    description: "",
    draft: true,
  });
  if (!reduceMotion) todo.classList.add("is-entering");
  sheet.prepend(todo);
  if (!reduceMotion) {
    todo.getBoundingClientRect();
    todo.classList.remove("is-entering");
  }
  applyFilters();
  setOpen(todo, true);
  todo.querySelector("[data-menu-kind=location]").focus();
  todo.scrollIntoView({ block: "nearest" });
}

function placeFades() {
  if (!scroll || !fade) return;
  const down = scroll.scrollHeight - scroll.clientHeight;
  fade.classList.toggle("is-fade-bottom", down > 1 && scroll.scrollTop < down - 1);
}

for (const data of SEED) {
  const todo = buildTodo(data);
  sheet.append(todo);
  if (data.open) setOpen(todo, true);
}
applyFilters();

document.querySelector("[data-new]")?.addEventListener("click", createTodo);

autoAssign?.addEventListener("click", (event) => {
  event.stopPropagation();
  const on = autoAssign.getAttribute("aria-pressed") !== "true";
  autoAssign.setAttribute("aria-pressed", on ? "true" : "false");
  if (on) assignUnowned();
});

searchInput?.addEventListener("input", applyFilters);
searchInput?.form?.querySelector(".clear")?.addEventListener("click", applyFilters);

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    for (const other of tabs) other.setAttribute("aria-selected", other === tab ? "true" : "false");
    closePanels();
    applyFilters();
  });
}

filterMenu?.addEventListener("pointerover", (event) => {
  const cat = event.target.closest("[data-filter-cat]");
  if (!cat || filterMenu.querySelector(".filter-menu")?.hidden) return;
  openFilterSub(cat);
});

filterMenu?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter-button]");
  if (button) {
    const open = button.getAttribute("aria-expanded") === "true";
    closePanels(filterMenu);
    button.setAttribute("aria-expanded", open ? "false" : "true");
    filterMenu.querySelector(".filter-menu").hidden = open;
    if (open) closeFilterSubs();
    return;
  }
  const cat = event.target.closest("[data-filter-cat]");
  if (cat) {
    openFilterSub(cat);
    return;
  }
  const choice = event.target.closest("[data-filter-pick]");
  if (!choice) return;
  const on = choice.getAttribute("aria-checked") === "true";
  choice.setAttribute("aria-checked", on ? "false" : "true");
  paintChips();
  applyFilters();
});

sheet.addEventListener("input", (event) => {
  const todo = event.target.closest(".sheet");
  if (!todo) return;
  if (event.target.classList.contains("sheet-room")) {
    event.target.classList.toggle("cell-quiet", event.target.value === "—" || event.target.value === "");
  }
  if (event.target.classList.contains("sheet-title") || event.target.classList.contains("sheet-note") || event.target.classList.contains("sheet-room")) {
    if (todo === sideTodo) paintSide(todo);
  }
  const form = event.target.closest("[data-composer]");
  if (form) form.classList.toggle("has-value", event.target.value.trim().length > 0);
});

function clearRoomDash(input) {
  if (!input.classList.contains("sheet-room") || input.value !== "—") return;
  input.value = "";
  input.classList.remove("cell-quiet");
  const todo = input.closest(".sheet");
  const sideRoom = todo === sideTodo ? side?.querySelector("[data-side-room]") : null;
  if (sideRoom) {
    sideRoom.value = "";
    sideRoom.classList.remove("is-quiet");
  }
}

sheet.addEventListener("pointerdown", (event) => {
  if (event.target.classList.contains("sheet-room")) clearRoomDash(event.target);
});

sheet.addEventListener("focusin", (event) => {
  if (event.target.classList.contains("sheet-room")) clearRoomDash(event.target);
  if (!event.target.matches(".sheet-title")) return;
  setOpen(event.target.closest(".sheet"), true);
});

sheet.addEventListener("click", (event) => {
  const line = event.target.closest(".sheet-line");
  if (!line || event.target.closest("button, input, textarea")) return;
  const todo = line.closest(".sheet");
  setOpen(todo, !todo.classList.contains("is-open"));
});

sheet.addEventListener("submit", (event) => {
  const form = event.target.closest(".sheet [data-composer]");
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector("input");
  const text = input.value.trim();
  if (!text) return;
  addComment(form.closest(".sheet"), text);
  input.value = "";
  form.classList.remove("has-value");
});

sheet.addEventListener("focusout", (event) => {
  if (event.target.classList.contains("sheet-room")) {
    const input = event.target;
    const value = input.value.trim();
    const empty = !value || value === "—";
    input.value = empty ? "—" : value;
    input.classList.toggle("cell-quiet", empty);
    const todo = input.closest(".sheet");
    const sideRoom = todo === sideTodo ? side?.querySelector("[data-side-room]") : null;
    if (sideRoom && document.activeElement !== sideRoom) {
      sideRoom.value = input.value;
      sideRoom.classList.toggle("is-quiet", empty);
    }
  }
  const todo = event.target.closest(".sheet");
  if (!todo || todo.dataset.pin !== "1") return;
  if (todo.contains(event.relatedTarget)) return;
  delete todo.dataset.pin;
  applyFilters();
});

sheet.addEventListener("pointerover", (event) => {
  if (paintingStatus) return;
  const button = event.target.closest(".sheet-status");
  if (!button || button.classList.contains("is-quiet")) return;
  button.classList.add("is-tip");
  placeStatusTip(button);
});

sheet.addEventListener("pointerout", (event) => {
  if (paintingStatus) return;
  const button = event.target.closest(".sheet-status");
  if (!button || button.contains(event.relatedTarget)) return;
  const rect = button.getBoundingClientRect();
  const { clientX: x, clientY: y } = event;
  if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return;
  button.classList.remove("is-tip");
});

function placeWhoTip(button) {
  const tip = button.querySelector(":scope > .tip");
  const anchor = button.querySelector(".avatar") || button;
  if (!tip) return;
  const rect = anchor.getBoundingClientRect();
  const gap = parseFloat(getComputedStyle(button).getPropertyValue("--tip-gap")) || 8;
  tip.style.left = `${rect.left + rect.width / 2}px`;
  tip.style.top = `${rect.top - gap}px`;
}

document.querySelector(".sheet-scroll")?.addEventListener("scroll", () => {
  const button = sheet.querySelector(".sheet-status:hover");
  if (button) placeStatusTip(button);
  const who = sheet.querySelector(".sheet-who:hover");
  if (who) placeWhoTip(who);
}, { passive: true });

function openSideSchedule(button) {
  if (!sideTodo) return;
  const schedule = rowMenu.querySelector("[data-menu-schedule]");
  const open = rowMenu.classList.contains("is-cal-only") && schedule?.getAttribute("aria-expanded") === "true";
  if (open) {
    closePanels();
    return;
  }
  menuTarget = sideTodo;
  closePanels();
  fillRowMenu(sideTodo);
  rowMenu.classList.add("is-cal-only");
  const box = button.getBoundingClientRect();
  placePanel(rowMenu, box.left, box.bottom + 4);
  toggleCalendar();
  const pop = rowMenu.querySelector(".cal-pop");
  pop.style.position = "fixed";
  pop.style.left = `${box.left}px`;
  pop.style.top = `${box.bottom + 4}px`;
}

side?.addEventListener("focusin", (event) => {
  const room = event.target.closest("[data-side-room]");
  if (!room || room.value !== "—") return;
  room.value = "";
  room.classList.remove("is-quiet");
});

side?.addEventListener("focusout", (event) => {
  const roomField = event.target.closest("[data-side-room]");
  if (!roomField || !sideTodo) return;
  const room = sideTodo.querySelector(".sheet-room");
  const value = roomField.value.trim();
  const empty = !value || value === "—";
  room.value = empty ? "—" : value;
  room.classList.toggle("cell-quiet", empty);
  roomField.value = room.value;
  roomField.classList.toggle("is-quiet", empty);
});

side?.addEventListener("input", (event) => {
  if (!sideTodo) return;
  if (event.target.matches("[data-side-room]")) {
    const room = sideTodo.querySelector(".sheet-room");
    const value = event.target.value;
    room.value = value;
    const quiet = value === "—" || value === "";
    room.classList.toggle("cell-quiet", quiet);
    event.target.classList.toggle("is-quiet", quiet);
  }
  if (event.target.matches("[data-side-desc]")) {
    sideTodo.querySelector(".sheet-note").value = event.target.value;
    fitField(event.target);
  }
  const form = event.target.closest("[data-composer]");
  if (form) form.classList.toggle("has-value", event.target.value.trim().length > 0);
});

side?.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-composer]");
  if (!form || !sideTodo) return;
  event.preventDefault();
  const input = form.querySelector("input");
  const text = input.value.trim();
  if (!text) return;
  addComment(sideTodo, text);
  input.value = "";
  form.classList.remove("has-value");
});

side?.addEventListener("change", (event) => {
  if (!event.target.matches("[data-side-file]") || !sideTodo) return;
  for (const file of event.target.files || []) {
    if (!file.type.startsWith("image/")) continue;
    sideTodo._photos.push({ src: URL.createObjectURL(file), alt: file.name });
  }
  event.target.value = "";
  paintSidePhotos(sideTodo);
});

document.addEventListener("click", (event) => {
  const schedule = event.target.closest("[data-side-schedule]");
  if (schedule) {
    openSideSchedule(schedule);
    return;
  }
  const sideMore = event.target.closest("[data-side-more]");
  if (sideMore && sideTodo) {
    const open = sideMore.getAttribute("aria-expanded") === "true";
    if (open) closePanels();
    else {
      const box = sideMore.getBoundingClientRect();
      openRowMenu(box.right - 168, box.bottom + 4, sideTodo, sideMore, "delete");
    }
    return;
  }
  const addPhoto = event.target.closest("[data-side-photo]");
  if (addPhoto) {
    side.querySelector("[data-side-file]").click();
    return;
  }
  const removePhoto = event.target.closest("[data-side-photo-remove]");
  if (removePhoto && sideTodo) {
    const index = Number(removePhoto.dataset.index);
    const photo = sideTodo._photos[index];
    if (photo?.src?.startsWith("blob:")) URL.revokeObjectURL(photo.src);
    sideTodo._photos.splice(index, 1);
    paintSidePhotos(sideTodo);
    return;
  }
  const toggle = event.target.closest("[data-toggle]");
  if (toggle) {
    const todo = toggle.closest(".sheet");
    setOpen(todo, !todo.classList.contains("is-open"));
    closePanels();
    return;
  }
  const attach = event.target.closest("[data-attach]");
  if (attach) {
    attach.closest(".sheet").querySelector(".file").click();
    return;
  }
  const advanceButton = event.target.closest("[data-advance]");
  if (advanceButton) {
    advance(advanceButton.closest(".sheet"));
    closePanels();
    return;
  }
  const field = event.target.closest("[data-menu-kind]");
  if (field) {
    openFieldMenu(field);
    return;
  }
  const more = event.target.closest("[data-more]");
  if (more) {
    const open = more.getAttribute("aria-expanded") === "true";
    const target = more.closest(".comment") || more.closest(".sheet");
    if (open) closePanels();
    else {
      const box = more.getBoundingClientRect();
      openRowMenu(box.right - 168, box.bottom + 4, target, more);
    }
    return;
  }
  if (event.target.closest("#field-menu")) {
    const choice = event.target.closest("[data-kind]");
    if (choice && menuTarget) choose(menuTarget, choice.dataset.kind, choice.dataset.value);
    if (event.target.closest("[data-clear-date]") && menuTarget) {
      menuTarget.dataset.date = "";
      syncBucket(menuTarget);
      paintWhen(menuTarget);
      leaveView(menuTarget);
    }
    if (choice || event.target.closest("[data-clear-date]")) closePanels();
    return;
  }
  if (event.target.closest("#row-menu")) {
    if (event.target.closest("[data-menu-delete]") && menuTarget) {
      askDelete(menuTarget);
      closePanels();
      return;
    }
    if (event.target.closest("[data-menu-schedule]")) {
      toggleCalendar();
      return;
    }
    if (event.target.closest("[data-cal-prev]")) {
      shiftCalendar(-1);
      return;
    }
    if (event.target.closest("[data-cal-next]")) {
      shiftCalendar(1);
      return;
    }
    const day = event.target.closest("[data-cal-day]");
    if (day && menuTarget) {
      scheduleTodo(menuTarget, day.dataset.calDay);
      return;
    }
    if (event.target.closest(".cal-pop [data-clear-date]") && menuTarget) {
      scheduleTodo(menuTarget, "");
      return;
    }
    return;
  }
  if (!event.target.closest("[data-filter-menu]")) closePanels();
  if (side && !side.hidden && sideTodo && !event.target.closest("#todo-side, .sheet, #row-menu, #field-menu, .confirm-dialog, [data-new]")) {
    setOpen(sideTodo, false);
  }
});

document.addEventListener("input", (event) => {
  if (!event.target.matches("[data-schedule]") || !menuTarget) return;
  menuTarget.dataset.date = event.target.value;
  syncBucket(menuTarget);
  paintWhen(menuTarget);
  closePanels();
  leaveView(menuTarget);
});

document.addEventListener("contextmenu", (event) => {
  const comment = event.target.closest(".comment");
  if (comment) {
    event.preventDefault();
    openRowMenu(event.clientX, event.clientY, comment);
    return;
  }
  if (event.target.closest(".sheet-detail")) return;
  const row = event.target.closest(".sheet-line");
  if (!row) return;
  event.preventDefault();
  openRowMenu(event.clientX, event.clientY, row.closest(".sheet"));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePanels();
});

confirmDialog?.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-confirm]");
  if (choice?.dataset.confirm === "delete" && pendingDelete) {
    const target = pendingDelete;
    pendingDelete = null;
    removeTarget(target);
  }
  if (choice) closeConfirm();
});

confirmDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  pendingDelete = null;
  closeConfirm();
});

scroll?.addEventListener("scroll", () => { closePanels(); placeFades(); }, { passive: true });

const collapseButton = document.querySelector(".side-top [data-side-collapse]");
const lanceCollapse = document.querySelector("#lance [data-lance-collapse]");
const SIDE_OPEN_AT = 1564;
const LANCE_OPEN_AT = 1341;
let sideChosen = false;
let sideHeldOpen = false;
let lanceChosen = false;
let lanceHeldOpen = false;

function setSideCollapsed(collapsed) {
  if (document.body.classList.contains("is-side-collapsed") === collapsed) return;
  document.body.classList.toggle("is-side-collapsed", collapsed);
  document.body.classList.remove("is-side-settling");
  collapseButton?.setAttribute("aria-expanded", collapsed ? "false" : "true");
  collapseButton?.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
}

function setLanceCollapsed(collapsed) {
  if (document.body.classList.contains("is-lance-collapsed") === collapsed) return;
  document.body.classList.toggle("is-lance-collapsed", collapsed);
  lanceCollapse?.setAttribute("aria-expanded", collapsed ? "false" : "true");
  lanceCollapse?.setAttribute("aria-label", collapsed ? "Open chat" : "Collapse chat");
}

function applyPanelLimits() {
  const width = window.innerWidth;
  if (width >= SIDE_OPEN_AT) sideHeldOpen = false;
  if (width >= LANCE_OPEN_AT) lanceHeldOpen = false;
  setSideCollapsed((width < SIDE_OPEN_AT && !sideHeldOpen) || sideChosen);
  setLanceCollapsed((width < LANCE_OPEN_AT && !lanceHeldOpen) || lanceChosen);
}

collapseButton?.addEventListener("click", () => {
  const next = !document.body.classList.contains("is-side-collapsed");
  sideChosen = next;
  sideHeldOpen = !next && window.innerWidth < SIDE_OPEN_AT;
  setSideCollapsed(next);
});

lanceCollapse?.addEventListener("click", () => {
  const next = !document.body.classList.contains("is-lance-collapsed");
  lanceChosen = next;
  lanceHeldOpen = !next && window.innerWidth < LANCE_OPEN_AT;
  setLanceCollapsed(next);
});

applyPanelLimits();
window.addEventListener("resize", () => { closePanels(); placeFades(); applyPanelLimits(); });

function edgeFade(el, axis) {
  const update = () => {
    const max = axis === "x" ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
    const pos = axis === "x" ? el.scrollLeft : el.scrollTop;
    const host = el.closest(".scroll-fade") || el;
    host.classList.toggle("is-fade-start", max > 1 && pos > 1);
    host.classList.toggle("is-fade-end", max > 1 && pos < max - 1);
  };
  update();
  el.addEventListener("scroll", update, { passive: true });
  new ResizeObserver(update).observe(el);
}

const sideScroll = document.querySelector(".side-scroll");
if (sideScroll) edgeFade(sideScroll, "y");
const deptStrip = document.querySelector(".page-filters .tabs");
if (deptStrip) {
  edgeFade(deptStrip, "x");
  const host = deptStrip.parentElement;
  const thumb = document.createElement("div");
  thumb.className = "tabs-bar-thumb";
  thumb.hidden = true;
  host.append(thumb);
  const placeThumb = () => {
    const max = deptStrip.scrollWidth - deptStrip.clientWidth;
    if (max <= 1) { thumb.hidden = true; return; }
    thumb.hidden = false;
    const track = deptStrip.clientWidth - 4;
    const size = Math.max(32, track * (deptStrip.clientWidth / deptStrip.scrollWidth));
    const x = 2 + (deptStrip.scrollLeft / max) * (track - size);
    thumb.style.width = `${size}px`;
    thumb.style.transform = `translateX(${x}px)`;
  };
  placeThumb();
  deptStrip.addEventListener("scroll", placeThumb, { passive: true });
  new ResizeObserver(placeThumb).observe(deptStrip);
}

if (scroll) new ResizeObserver(placeFades).observe(scroll);
