const PEOPLE = {
  mark: { name: "Mark", initials: "MJ" },
  paul: { name: "Paul", initials: "PG" },
  boris: { name: "Boris", initials: "B" },
  sarah: { name: "Sarah", initials: "SM" },
  manual: { name: "Manual", initials: "M" },
};

const URGENCY = ["urgent", "high", "standard", "low"];
const URGENCY_LABEL = { urgent: "Urgent", high: "High", standard: "Standard", low: "Low" };
const COMPLETE_HOLD = 700;
const WEEKDAYS = 7;

const STATUS = {
  open: {
    label: "Open",
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="var(--urgency-high)" stroke-width="2"/></svg>',
  },
  progress: {
    label: "In progress",
    icon: '<svg class="status-progress" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="var(--action)" stroke-width="2"/><path d="M9 14.4a5.4 5.4 0 0 0 0-10.8V9l0 5.4Z" fill="var(--action)"/></svg>',
  },
  complete: {
    label: "Completed",
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path fill="var(--status-complete)" fill-rule="evenodd" d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm3.65 6.66-1.05-.86-4 4.9-1.75-1.76-.95.96 2.8 2.8 4.95-6.04Z"/></svg>',
  },
};

const ROOMS = ["101", "103", "244", "426", "436"];
const COMPLAINTS = ["Cleanliness", "Noise", "Maintenance", "Temperature", "Amenities", "Service", "Billing", "Other"];
const MOODS = ["Extremely upset", "Upset", "Neutral", "Happy", "Extremely happy"];

const TYPES = [
  { value: "Front Desk", label: "Front desk" },
  { value: "Housekeeping", label: "Housekeeping" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Sales", label: "Sales" },
  { value: "Management", label: "Management" },
];

function displayType(value) {
  return TYPES.find((type) => type.value === value)?.label || value || "Front desk";
}

const SEED = [
  { id: "sheets-426", room: "426", guest: "Elena Vasquez", title: "Cleanliness", phone: "+1 (415) 555-0142", email: "elena.vasquez@email.com", loyalty: "Gold", mood: "Extremely upset", type: "Housekeeping", urgency: "urgent", status: "open", assignee: "mark", opened: "now", description: "Sheets were stained on arrival. Asked for the room to be remade.", activity: [{ who: "manual", text: "logged this complaint", when: "Nov 2, 3:10 PM" }] },
  { id: "hall-244", room: "244", guest: "James Okonkwo", title: "Noise", phone: "+1 (917) 555-0168", email: "j.okonkwo@email.com", loyalty: "Member", mood: "Upset", type: "Front Desk", urgency: "high", status: "progress", assignee: "paul", opened: "1h", description: "Hall noise past midnight. Asked to move to a quieter room.", activity: [{ who: "sarah", text: "logged this complaint", when: "Nov 2, 2:05 PM" }, { who: "paul", text: "offered room 436", when: "Nov 2, 2:40 PM" }] },
  { id: "ac-103", room: "103", guest: "Priya Shah", title: "Temperature", phone: "+1 (650) 555-0194", email: "priya.shah@email.com", loyalty: "", mood: "Upset", type: "Maintenance", urgency: "urgent", status: "open", assignee: "boris", opened: "2h", description: "Air conditioning is blowing warm air. Room is still hot.", activity: [{ who: "manual", text: "logged this complaint", when: "Nov 2, 1:20 PM" }] },
  { id: "faucet-436", room: "436", guest: "Noah Berg", title: "Maintenance", phone: "+1 (510) 555-0117", email: "noah.berg@email.com", loyalty: "Silver", mood: "Neutral", type: "Maintenance", urgency: "high", status: "open", assignee: "", opened: "3h", description: "Bathroom faucet will not shut off all the way.", activity: [{ who: "sarah", text: "logged this complaint", when: "Nov 2, 12:15 PM" }] },
  { id: "coffee-101", room: "101", guest: "Helen Cho", title: "Amenities", phone: "+1 (408) 555-0133", email: "helen.cho@email.com", loyalty: "Member", mood: "Neutral", type: "Housekeeping", urgency: "standard", status: "open", assignee: "mark", opened: "4h", description: "In-room coffee maker had no pods. Requested a restock.", activity: [{ who: "manual", text: "logged this complaint", when: "Nov 2, 11:40 AM" }] },
  { id: "service-426b", room: "426", guest: "Elena Vasquez", title: "Service", phone: "+1 (415) 555-0142", email: "elena.vasquez@email.com", loyalty: "Gold", mood: "Upset", type: "Food & Beverage", urgency: "high", status: "progress", assignee: "sarah", opened: "5h", description: "Room service breakfast arrived cold, forty minutes late.", activity: [{ who: "sarah", text: "logged this complaint", when: "Nov 2, 10:05 AM" }] },
  { id: "minibar-244", room: "244", guest: "James Okonkwo", title: "Billing", phone: "+1 (917) 555-0168", email: "j.okonkwo@email.com", loyalty: "Member", mood: "Extremely upset", type: "Front Desk", urgency: "high", status: "open", assignee: "paul", opened: "6h", description: "Minibar charge for items the guest says were already open.", activity: [{ who: "paul", text: "logged this complaint", when: "Nov 2, 9:30 AM" }] },
  { id: "towels-103", room: "103", guest: "Priya Shah", title: "Cleanliness", phone: "+1 (650) 555-0194", email: "priya.shah@email.com", loyalty: "", mood: "Happy", type: "Housekeeping", urgency: "low", status: "complete", assignee: "mark", opened: "1d", description: "Asked for extra towels. Delivered and the guest was satisfied.", activity: [{ who: "mark", text: "logged this complaint", when: "Nov 1, 8:15 PM" }, { who: "mark", text: "marked this completed", when: "Nov 1, 8:40 PM" }] },
  { id: "followup-436", room: "436", guest: "Noah Berg", title: "Service", phone: "+1 (510) 555-0117", email: "noah.berg@email.com", loyalty: "Silver", mood: "Neutral", type: "Management", urgency: "standard", status: "open", assignee: "sarah", bucket: "scheduled", date: "2026-11-04", opened: "now", description: "Follow-up call about the faucet, scheduled with the manager.", activity: [{ who: "sarah", text: "scheduled a follow-up", when: "Nov 2, 12:20 PM" }] },
];

const page = document.querySelector(".complaints-page");
const sheet = document.querySelector("[data-sheet]");
const empty = document.querySelector("[data-empty]");
const count = document.querySelector("[data-count]");
const sheetCount = document.querySelector("[data-sheet-count]");
const tabs = [...document.querySelectorAll("[data-bucket]")];
const searchInput = document.querySelector("[data-complaint-search] input");
const chips = document.querySelector("[data-chips]");
const filterMenu = document.querySelector("[data-filter-menu]");
const rowMenu = document.querySelector("#row-menu");
const fieldMenu = document.querySelector("#field-menu");
const confirmDialog = document.querySelector(".confirm-dialog");
const side = document.querySelector("#complaint-side");

let menuTarget = null;
let fieldButton = null;
let sideComplaint = null;
let calMonth = new Date();
let pendingDelete = null;
let order = 0;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const editMark = '<svg class="i sheet-edit" width="10" height="10" aria-hidden="true"><use href="#i-chevron"/></svg>';
const warnIcon = '<svg class="i" width="14" height="14" aria-hidden="true"><use href="#i-warn"/></svg>';

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function stamp() {
  return new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function personBits(id) {
  if (!id || !PEOPLE[id]) return `<span class="avatar mini is-empty" aria-hidden="true"></span><span class="who-name">Unassigned</span>${editMark}`;
  const person = PEOPLE[id];
  return `<span class="avatar mini">${esc(person.initials)}</span><span class="who-name">${esc(person.name)}</span>${editMark}`;
}

function pill(id) {
  if (!id || !PEOPLE[id]) return `<span class="mini-pill is-empty"><span class="avatar mini is-empty" aria-hidden="true"></span>Unassigned</span>`;
  const person = PEOPLE[id];
  return `<span class="mini-pill"><span class="avatar mini">${esc(person.initials)}</span>${esc(person.name)}</span>`;
}

function selectedBucket() {
  return tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.bucket || "open";
}

function syncBucket(complaint) {
  if (complaint.dataset.status === "complete") complaint.dataset.bucket = "completed";
  else if (complaint.dataset.date) complaint.dataset.bucket = "scheduled";
  else complaint.dataset.bucket = "open";
}

function roomText(complaint) {
  return (complaint.dataset.room || "").trim();
}

function paintRoom(complaint) {
  const value = complaint.dataset.room || "";
  const label = value || "—";
  const button = complaint.querySelector(".sheet-room");
  if (button) {
    const roomLabel = button.querySelector("[data-room-label]");
    if (roomLabel) roomLabel.textContent = label;
    else button.textContent = label;
    button.classList.toggle("cell-quiet", !value);
    button.setAttribute("aria-label", value ? `Room, ${label}` : "Room");
  }
  if (complaint !== sideComplaint) return;
  const sideRoom = side?.querySelector("[data-side-room]");
  if (!sideRoom) return;
  sideRoom.textContent = label;
  sideRoom.classList.toggle("is-quiet", !value);
  sideRoom.setAttribute("aria-label", value ? `Room, ${label}` : "Room");
}

function guestText(complaint) {
  return (complaint.querySelector(".sheet-guest")?.value || "").trim();
}

function titleText(complaint) {
  return (complaint.dataset.complaint || "").trim();
}

function buildComplaint(data) {
  const complaint = document.createElement("article");
  complaint.className = "sheet";
  complaint.dataset.id = data.id;
  complaint.dataset.bucket = data.bucket || (data.status === "complete" ? "completed" : "open");
  complaint.dataset.type = data.type || "Front Desk";
  complaint.dataset.urgency = data.urgency || "standard";
  complaint.dataset.status = data.status || "open";
  complaint.dataset.assignee = data.assignee || "";
  complaint.dataset.date = data.date || "";
  complaint.dataset.complaint = data.title || "";
  complaint.dataset.phone = data.phone || "";
  complaint.dataset.email = data.email || "";
  complaint.dataset.loyalty = data.loyalty || "";
  complaint.dataset.mood = data.mood || "";
  complaint.dataset.room = !data.room || data.room === "—" ? "" : data.room;
  complaint.dataset.opened = data.opened || "now";
  complaint.dataset.order = data.order != null ? String(data.order) : String(order);
  if (data.order == null) order += 1;
  complaint.innerHTML = `
    <div class="sheet-clip"><div class="sheet-inner">
      <div class="sheet-line">
        <button class="sheet-status tip-host" type="button" data-menu-kind="status" aria-haspopup="menu" aria-expanded="false" aria-label="Change status"><span class="sheet-status-icon"></span><span class="tip" aria-hidden="true">Change status</span></button>
        <button class="sheet-room" type="button" data-menu-kind="room" aria-haspopup="menu" aria-expanded="false"><span data-room-label></span><svg class="i sheet-edit" width="10" height="10"><use href="#i-chevron"/></svg></button>
        <span class="sheet-guest-col"><input class="sheet-guest" value="${esc(data.guest || "")}" placeholder="Guest" aria-label="Guest"></span>
        <div class="sheet-copy">
          <div class="sheet-facts">
            <button class="side-field" type="button" data-menu-kind="complaint" aria-haspopup="menu" aria-expanded="false"><span data-complaint></span></button>
          </div>
          <input class="sheet-note" value="${esc(data.description || "")}" placeholder="Add a note" aria-label="Description">
        </div>
        <span class="col-reserve">
          <button class="urgency" type="button" data-menu-kind="urgency" aria-haspopup="menu" aria-expanded="false"></button>
          <span class="fit-label sizer-chip sizer-urgency" aria-hidden="true"><span>${warnIcon}Urgent</span>${URGENCY.filter((key) => key !== "urgent").map((key) => `<span>${esc(URGENCY_LABEL[key])}</span>`).join("")}</span>
        </span>
        <button class="sheet-who" type="button" data-menu-kind="assignee" aria-haspopup="menu" aria-expanded="false"><span class="fit-label"><span class="mini-pill" data-who-label></span><span class="mini-pill" aria-hidden="true"><span class="avatar mini">MJ</span></span></span></button>
        <span class="col-reserve">
          <span class="sheet-when"></span>
          <span class="fit-label sizer-when" aria-hidden="true"><span>May 30</span><span>12h</span><span>now</span></span>
        </span>
      </div>
    </div></div>`;
  complaint._log = data.activity ? data.activity.map((item) => ({ ...item })) : [];
  complaint._comments = data.comments ? data.comments.map((item) => ({ ...item })) : [];
  paintStatus(complaint);
  paintRoom(complaint);
  paintComplaint(complaint);
  paintUrgency(complaint);
  paintWho(complaint);
  paintWhen(complaint);
  return complaint;
}

function paintComplaint(complaint) {
  const value = complaint.dataset.complaint || "";
  const label = value || "Complaint";
  const row = complaint.querySelector("[data-complaint]");
  if (row) {
    row.textContent = label;
    const button = row.closest("button");
    button.classList.toggle("is-empty", !value);
    button.setAttribute("aria-label", value ? `Complaint, ${value}` : "Complaint");
  }
  if (complaint !== sideComplaint) return;
  const sideLabel = side?.querySelector("[data-side-complaint]");
  if (!sideLabel) return;
  sideLabel.textContent = label;
  const sideButton = sideLabel.closest("button");
  sideButton.classList.toggle("is-empty", !value);
  sideButton.setAttribute("aria-label", value ? `Complaint, ${value}` : "Complaint");
}

function paintStatus(complaint) {
  const key = complaint.dataset.status || "open";
  const status = STATUS[key] || STATUS.open;
  const button = complaint.querySelector(".sheet-status");
  button.classList.add("tip-host");
  const icon = button.querySelector(".sheet-status-icon");
  const tip = button.querySelector(".tip");
  icon.innerHTML = status.icon;
  tip.textContent = "Change status";
  button.setAttribute("aria-label", "Change status");
}

function paintUrgency(complaint) {
  const key = complaint.dataset.urgency || "standard";
  const button = complaint.querySelector("[data-menu-kind=urgency]");
  button.className = `urgency urgency-${key}`;
  button.innerHTML = `${key === "urgent" ? warnIcon : ""}${esc(URGENCY_LABEL[key])}${editMark}`;
  button.setAttribute("aria-label", `Urgency, ${URGENCY_LABEL[key]}`);
  button.setAttribute("aria-haspopup", "menu");
  button.setAttribute("aria-expanded", "false");
}

function paintWho(complaint) {
  const who = complaint.querySelector(".sheet-who");
  const person = PEOPLE[complaint.dataset.assignee];
  who.classList.add("tip-host");
  who.classList.toggle("is-empty", !person);
  who.querySelector("[data-who-label]").innerHTML = personBits(complaint.dataset.assignee);
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

function paintWhen(complaint) {
  const when = complaint.querySelector(".sheet-when");
  if (complaint.dataset.date) {
    const text = formatDate(complaint.dataset.date);
    when.textContent = text;
    when.setAttribute("aria-label", `Scheduled ${text}`);
  } else {
    const text = complaint.dataset.opened || "now";
    when.textContent = text;
    when.setAttribute("aria-label", `Opened ${text}`);
  }
}

function fitField(field) {
  field.style.height = "auto";
  field.style.height = `${field.scrollHeight}px`;
}

function sideWhen(complaint) {
  if (complaint.dataset.date) {
    return new Date(`${complaint.dataset.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return complaint.dataset.opened || "now";
}

function paintSideActivity(complaint) {
  const list = side.querySelector("[data-side-activity]");
  list.replaceChildren();
  const rows = [
    ...(complaint._log || []).map((item) => ({ kind: "log", item })),
    ...complaint._comments.map((item, index) => ({ kind: "comment", item, index })),
  ].reverse();
  rows.forEach((row, index) => {
    if (row.kind === "log") {
      const node = document.createElement("div");
      node.className = `side-log${index > 0 ? " is-dim" : ""}`;
      node.innerHTML = `${pill(row.item.who)}<span class="side-log-text">${esc(row.item.text)}</span><time>${esc(row.item.when)}</time>`;
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

function paintSide(complaint) {
  if (!side || !complaint) return;
  sideComplaint = complaint;
  paintRoom(complaint);
  const guest = side.querySelector("[data-side-guest]");
  if (document.activeElement !== guest) guest.value = complaint.querySelector(".sheet-guest").value;
  guest.classList.toggle("is-empty", !guest.value.trim());
  fitField(guest);
  paintComplaint(complaint);
  side.querySelector("[data-side-when]").textContent = sideWhen(complaint);
  const desc = side.querySelector("[data-side-desc]");
  const note = complaint.querySelector(".sheet-note");
  if (document.activeElement !== desc) {
    desc.value = note?.value || "";
    fitField(desc);
  }
  const typeName = complaint.dataset.type || "Front Desk";
  const typeLabel = side.querySelector("[data-side-type]");
  const typeButton = typeLabel.closest("button");
  typeLabel.textContent = displayType(typeName);
  typeButton.dataset.type = typeName;
  typeButton.setAttribute("aria-label", `Type, ${displayType(typeName)}`);
  const who = side.querySelector("[data-side-who]");
  who.innerHTML = personBits(complaint.dataset.assignee);
  who.classList.toggle("is-empty", !PEOPLE[complaint.dataset.assignee]);
  who.setAttribute("aria-label", PEOPLE[complaint.dataset.assignee]?.name || "Unassigned");
  const status = STATUS[complaint.dataset.status] || STATUS.open;
  side.querySelector("[data-side-status-icon]").innerHTML = status.icon;
  side.querySelector("[data-side-status-label]").textContent = status.label;
  const urgency = side.querySelector("[data-side-urgency]");
  const key = complaint.dataset.urgency || "standard";
  urgency.className = `urgency urgency-${key}`;
  urgency.innerHTML = `${key === "urgent" ? warnIcon : ""}${esc(URGENCY_LABEL[key])}${editMark}`;
  urgency.setAttribute("aria-label", `Urgency, ${URGENCY_LABEL[key]}`);
  urgency.setAttribute("aria-haspopup", "menu");
  paintGuestFacts(complaint);
  paintSideActivity(complaint);
}

function paintGuestFacts(complaint) {
  if (!side || complaint !== sideComplaint) return;
  for (const [key, selector] of [["phone", "[data-side-phone]"], ["email", "[data-side-email]"], ["loyalty", "[data-side-loyalty]"]]) {
    const field = side.querySelector(selector);
    if (field && document.activeElement !== field) field.value = complaint.dataset[key] || "";
    if (field) fitField(field);
  }
  const mood = complaint.dataset.mood || "";
  const button = side.querySelector("[data-menu-kind=mood]");
  const label = button?.querySelector("[data-side-mood]");
  if (!button || !label) return;
  label.textContent = mood || "Guest mood";
  button.classList.toggle("is-empty", !mood);
  button.setAttribute("aria-label", mood ? `Guest mood, ${mood}` : "Guest mood");
}

function setOpen(complaint, open) {
  if (!complaint) return;
  if (open) {
    for (const other of sheet.querySelectorAll(".sheet.is-open")) {
      if (other !== complaint) other.classList.remove("is-open");
    }
  }
  complaint.classList.toggle("is-open", open);
  if (!side) return;
  if (open) {
    side.hidden = false;
    paintSide(complaint);
    return;
  }
  if (sideComplaint === complaint) {
    side.hidden = true;
    sideComplaint = null;
  }
}

function haystack(complaint) {
  const who = PEOPLE[complaint.dataset.assignee]?.name || "";
  return [
    roomText(complaint),
    guestText(complaint),
    titleText(complaint),
    complaint.querySelector(".sheet-note")?.value || "",
    complaint.dataset.phone || "",
    complaint.dataset.email || "",
    complaint.dataset.loyalty || "",
    complaint.dataset.mood || "",
    displayType(complaint.dataset.type),
    URGENCY_LABEL[complaint.dataset.urgency] || "",
    STATUS[complaint.dataset.status]?.label || "",
    who,
  ].join(" ").toLowerCase();
}

const FILTER_LABEL = {
  type: "Type",
  status: "Status",
  urgency: "Urgency",
  assigned: "Assigned",
  room: "Room",
  guest: "Guest",
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

function complaintField(complaint, key) {
  if (key === "type") return complaint.dataset.type || "";
  if (key === "status") return STATUS[complaint.dataset.status]?.label || "";
  if (key === "urgency") return URGENCY_LABEL[complaint.dataset.urgency] || "";
  if (key === "assigned") return PEOPLE[complaint.dataset.assignee]?.name || "Unassigned";
  if (key === "room") return roomText(complaint);
  if (key === "guest") return guestText(complaint);
  return "";
}

function matchesFilters(complaint) {
  const groups = selectedFilters();
  return Object.entries(groups).every(([key, values]) => values.includes(complaintField(complaint, key)));
}

function applyFilters() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  const bucket = selectedBucket();
  const totals = { open: 0, scheduled: 0, completed: 0 };
  let visible = 0;
  let listed = 0;
  for (const complaint of sheet.querySelectorAll(".sheet")) {
    const filtered = matchesFilters(complaint);
    if (filtered) totals[complaint.dataset.bucket] = (totals[complaint.dataset.bucket] || 0) + 1;
    const inList = filtered && complaint.dataset.bucket === bucket && !complaint.classList.contains("is-leaving");
    if (inList) listed += 1;
    const show = inList && (!query || haystack(complaint).includes(query));
    if (!complaint.classList.contains("is-leaving")) complaint.hidden = !show;
    if (show) visible += 1;
  }
  if (empty) empty.hidden = visible !== 0;
  if (count) count.textContent = String(sheet.querySelectorAll(".sheet:not(.is-leaving)").length);
  if (sheetCount) sheetCount.textContent = `Showing ${visible} of ${listed}`;
  for (const tab of tabs) {
    const badge = tab.querySelector("[data-bucket-count]");
    if (badge) badge.textContent = String(totals[tab.dataset.bucket] || 0);
  }
}

function leaveView(complaint) {
  const stays = complaint.dataset.bucket === selectedBucket() && matchesFilters(complaint);
  if (stays || reduceMotion) {
    applyFilters();
    return;
  }
  complaint.classList.add("is-leaving");
  const clip = complaint.querySelector(".sheet-clip");
  let gone = false;
  const finish = (event) => {
    if (gone) return;
    if (event && event.propertyName !== "grid-template-rows") return;
    gone = true;
    complaint.classList.remove("is-leaving");
    applyFilters();
  };
  clip.addEventListener("transitionend", finish);
  window.setTimeout(finish, 260);
}

function closeFilterSubs() {
  if (!filterMenu) return;
  for (const sub of filterMenu.querySelectorAll(".filter-sub")) sub.hidden = true;
  for (const button of filterMenu.querySelectorAll("[data-filter-cat]")) button.setAttribute("aria-expanded", "false");
}

function openFilterSub(button) {
  const sub = button.parentElement.querySelector(".filter-sub");
  if (!sub) return;
  if (button.getAttribute("aria-expanded") === "true" && !sub.hidden) return;
  closeFilterSubs();
  button.setAttribute("aria-expanded", "true");
  sub.hidden = false;
  sub.classList.remove("is-left");
  if (sub.getBoundingClientRect().right > window.innerWidth - 8) sub.classList.add("is-left");
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
    rowMenu.hidden = true;
    resetCalendar();
  }
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

function paintCalendar(complaint) {
  const grid = rowMenu.querySelector("[data-cal-grid]");
  const title = rowMenu.querySelector("[data-cal-title]");
  const prev = rowMenu.querySelector("[data-cal-prev]");
  const clear = rowMenu.querySelector(".cal-pop [data-clear-date]");
  const selected = complaint?.dataset.date || "";
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const today = isoDate(startOfToday());
  title.textContent = calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  prev.disabled = calMonth.getTime() <= monthFloor().getTime();
  clear.hidden = !selected;
  const pad = new Date(year, month, 1).getDay();
  const countDays = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < pad; i += 1) cells.push("<span></span>");
  for (let day = 1; day <= countDays; day += 1) {
    const date = new Date(year, month, day);
    const iso = isoDate(date);
    const past = date < startOfToday();
    const classes = ["cal-day"];
    if (iso === selected) classes.push("is-selected");
    if (iso === today) classes.push("is-today");
    const label = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    cells.push(`<button class="${classes.join(" ")}" type="button" ${past ? "disabled" : `data-cal-day="${iso}"`} aria-pressed="${iso === selected ? "true" : "false"}" aria-label="${esc(label)}">${day}</button>`);
  }
  const tail = (WEEKDAYS - ((pad + countDays) % WEEKDAYS)) % WEEKDAYS;
  for (let i = 0; i < tail; i += 1) cells.push("<span></span>");
  grid.innerHTML = cells.join("");
}

function placeCalendar() {
  const pop = rowMenu.querySelector(".cal-pop");
  const button = rowMenu.querySelector("[data-menu-schedule]");
  pop.style.top = "0px";
  pop.classList.remove("is-left");
  if (pop.getBoundingClientRect().right > window.innerWidth - 8) pop.classList.add("is-left");
  const overflow = pop.getBoundingClientRect().bottom - (window.innerHeight - 8);
  if (overflow > 0) pop.style.top = `${-overflow}px`;
  const originY = Math.max(16, -parseFloat(pop.style.top || "0") + button.offsetHeight / 2);
  const edge = pop.classList.contains("is-left") ? "right" : "left";
  pop.style.transformOrigin = `${edge} ${originY}px`;
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

function scheduleComplaint(complaint, iso) {
  const previous = complaint.dataset.date || "";
  complaint.dataset.date = iso;
  if (complaint.dataset.status === "complete" && iso) complaint.dataset.status = "open";
  syncBucket(complaint);
  paintStatus(complaint);
  paintWhen(complaint);
  if (iso && iso !== previous) complaint._log.push({ who: "sarah", text: `scheduled this for ${formatDate(iso)}`, when: stamp() });
  if (!iso && previous) complaint._log.push({ who: "sarah", text: "cleared the schedule", when: stamp() });
  if (complaint === sideComplaint) paintSide(complaint);
  closePanels();
  leaveView(complaint);
}

function placePanel(panel, x, y) {
  panel.hidden = false;
  panel.style.left = "0px";
  panel.style.top = "0px";
  const box = panel.getBoundingClientRect();
  panel.style.left = `${Math.max(8, Math.min(x, window.innerWidth - box.width - 8))}px`;
  panel.style.top = `${Math.max(8, Math.min(y, window.innerHeight - box.height - 8))}px`;
}

function menuButton(kind, value, inner, selected) {
  return `<button class="menu-item" type="button" role="menuitemradio" data-kind="${kind}" data-value="${esc(value)}" aria-checked="${value === selected ? "true" : "false"}">${inner}<svg class="i check" width="14" height="14"><use href="#i-check"/></svg></button>`;
}

function openFieldMenu(button) {
  const complaint = button.closest(".sheet") || sideComplaint;
  const kind = button.dataset.menuKind;
  if (!complaint) return;
  const open = button.getAttribute("aria-expanded") === "true";
  closePanels();
  if (open) return;
  menuTarget = complaint;
  fieldButton = button;
  button.setAttribute("aria-expanded", "true");
  fieldMenu.classList.toggle("is-status", kind === "status");
  if (kind === "urgency") {
    fieldMenu.innerHTML = URGENCY.map((key) => menuButton(
      "urgency",
      key,
      `<span class="urgency urgency-${key}">${key === "urgent" ? warnIcon : ""}${esc(URGENCY_LABEL[key])}</span>`,
      complaint.dataset.urgency,
    )).join("");
  } else if (kind === "type") {
    fieldMenu.innerHTML = TYPES.map((type) => menuButton(
      "type",
      type.value,
      `<span class="dept" data-dept="${esc(type.value)}">${esc(type.label)}</span>`,
      complaint.dataset.type,
    )).join("");
  } else if (kind === "assignee") {
    const people = [{ id: "", name: "Unassigned" }, ...Object.entries(PEOPLE).filter(([id]) => id !== "manual").map(([id, person]) => ({ id, name: person.name }))];
    fieldMenu.innerHTML = people.map((person) => menuButton("assignee", person.id, pill(person.id), complaint.dataset.assignee || "")).join("");
  } else if (kind === "status") {
    fieldMenu.innerHTML = Object.entries(STATUS).map(([key, status]) => menuButton(
      "status",
      key,
      `${status.icon}<span class="menu-name">${esc(status.label)}</span>`,
      complaint.dataset.status,
    )).join("");
  } else if (kind === "room") {
    const current = complaint.dataset.room || "";
    fieldMenu.innerHTML = ROOMS.map((room) => menuButton("room", room, esc(room), current)).join("");
  } else if (kind === "complaint") {
    const current = complaint.dataset.complaint || "";
    const values = !current || COMPLAINTS.includes(current) ? COMPLAINTS : [current, ...COMPLAINTS];
    fieldMenu.innerHTML = values.map((value) => menuButton("complaint", value, esc(value), current)).join("");
  } else if (kind === "mood") {
    const current = complaint.dataset.mood || "";
    const values = !current || MOODS.includes(current) ? MOODS : [current, ...MOODS];
    fieldMenu.innerHTML = values.map((value) => menuButton("mood", value, esc(value), current)).join("");
  }
  const box = button.getBoundingClientRect();
  placePanel(fieldMenu, box.left, box.bottom + 4);
}

function logChange(complaint, text) {
  complaint._log.push({ who: "sarah", text, when: stamp() });
}

function choose(complaint, kind, value) {
  if (kind === "urgency") {
    if (complaint.dataset.urgency === value) return;
    complaint.dataset.urgency = value;
    paintUrgency(complaint);
    logChange(complaint, `set urgency to ${URGENCY_LABEL[value]}`);
  } else if (kind === "type") {
    if (complaint.dataset.type === value) return;
    complaint.dataset.type = value;
    logChange(complaint, `filed this under ${displayType(value)}`);
  } else if (kind === "assignee") {
    if ((complaint.dataset.assignee || "") === value) return;
    complaint.dataset.assignee = value;
    paintWho(complaint);
    logChange(complaint, value ? `assigned this to ${PEOPLE[value].name}` : "cleared the assignee");
  } else if (kind === "status") {
    setStatus(complaint, value);
    return;
  } else if (kind === "room") {
    if ((complaint.dataset.room || "") === value) return;
    complaint.dataset.room = value;
    paintRoom(complaint);
    logChange(complaint, `set the room to ${value}`);
    paintOptionList("room");
  } else if (kind === "complaint") {
    if ((complaint.dataset.complaint || "") === value) return;
    complaint.dataset.complaint = value;
    paintComplaint(complaint);
    logChange(complaint, `set the complaint to ${value}`);
  } else if (kind === "mood") {
    if ((complaint.dataset.mood || "") === value) return;
    complaint.dataset.mood = value;
    logChange(complaint, `set the guest mood to ${value}`);
  }
  if (complaint === sideComplaint) paintSide(complaint);
  applyFilters();
}

function setStatus(complaint, next) {
  const previous = complaint.dataset.status;
  if (previous === next) return;
  window.clearTimeout(complaint._hold);
  complaint.dataset.status = next;
  paintStatus(complaint);
  logChange(complaint, `marked this ${STATUS[next].label.toLowerCase()}`);
  if (complaint === sideComplaint) paintSide(complaint);
  if (next === "complete" && selectedBucket() !== "completed") {
    complaint._hold = window.setTimeout(() => {
      syncBucket(complaint);
      leaveView(complaint);
    }, COMPLETE_HOLD);
    return;
  }
  syncBucket(complaint);
  leaveView(complaint);
}

function paintOptionList(key) {
  const sub = filterMenu?.querySelector(`[data-filter-${key}]`);
  if (!sub) return;
  const checked = new Set([...sub.querySelectorAll("[aria-checked='true']")].map((item) => item.dataset.value));
  const values = [];
  for (const complaint of sheet.querySelectorAll(".sheet")) {
    const value = key === "room" ? roomText(complaint) : guestText(complaint);
    if (value && !values.includes(value)) values.push(value);
  }
  sub.innerHTML = values.map((value) => `<button class="menu-item" type="button" role="menuitemcheckbox" data-filter-pick="${key}" data-value="${esc(value)}" aria-checked="${checked.has(value) ? "true" : "false"}">${esc(value)}<svg class="i check" width="14" height="14"><use href="#i-check"/></svg></button>`).join("");
}

function paintChips() {
  chips.replaceChildren();
  for (const item of filterMenu?.querySelectorAll("[data-filter-pick][aria-checked='true']") || []) {
    const label = FILTER_LABEL[item.dataset.filterPick] || item.dataset.filterPick;
    const button = document.createElement("button");
    button.className = "chip chip-filter";
    button.type = "button";
    button.innerHTML = `<span class="chip-k">${esc(label)}</span>: ${esc(item.dataset.value)} <svg class="i x" width="10" height="10"><use href="#i-plus"/></svg>`;
    button.addEventListener("click", () => {
      item.setAttribute("aria-checked", "false");
      paintChips();
      applyFilters();
    });
    chips.append(button);
  }
}

function openRowMenu(x, y, target, more) {
  menuTarget = target;
  closePanels();
  const sheetItem = target.classList.contains("sheet");
  for (const part of rowMenu.querySelectorAll("[data-sheet-only]")) part.hidden = !sheetItem;
  resetCalendar();
  if (more) more.setAttribute("aria-expanded", "true");
  placePanel(rowMenu, x, y);
  if (!more) return;
  const box = more.getBoundingClientRect();
  const width = rowMenu.getBoundingClientRect().width;
  placePanel(rowMenu, box.right - width, box.bottom + 4);
}

function askDelete(target) {
  pendingDelete = target;
  const title = confirmDialog.querySelector("#confirm-title");
  const copy = confirmDialog.querySelector("p");
  const comment = target.classList.contains("comment");
  title.textContent = comment ? "Delete this comment?" : "Delete this complaint?";
  const name = comment
    ? (target.querySelector("p")?.textContent.trim() || "this comment")
    : (titleText(target) || "this complaint");
  copy.textContent = `“${name}” will be permanently removed for the whole team.`;
  confirmDialog.classList.remove("is-closing");
  confirmDialog.showModal();
}

function closeConfirm() {
  if (!confirmDialog?.open || confirmDialog.classList.contains("is-closing")) return;
  const card = confirmDialog.querySelector(".confirm");
  if (reduceMotion) {
    confirmDialog.close();
    return;
  }
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

function removeTarget(target) {
  const comment = target.classList.contains("comment");
  let gone = false;
  const finish = () => {
    if (gone) return;
    gone = true;
    if (comment && sideComplaint) {
      const index = Number(target.dataset.index);
      if (!Number.isNaN(index)) sideComplaint._comments.splice(index, 1);
      paintSideActivity(sideComplaint);
    }
    if (!comment && target === sideComplaint) setOpen(target, false);
    target.remove();
    paintOptionList("room");
    paintOptionList("guest");
    applyFilters();
  };
  if (reduceMotion) {
    finish();
    return;
  }
  target.classList.add("is-leaving");
  const clip = comment ? target : target.querySelector(".sheet-clip");
  const done = (event) => {
    if (event && event.propertyName !== "grid-template-rows") return;
    clip.removeEventListener("transitionend", done);
    finish();
  };
  clip.addEventListener("transitionend", done);
  window.setTimeout(() => { if (target.isConnected) finish(); }, 280);
}

function createComplaint() {
  const openTab = tabs.find((tab) => tab.dataset.bucket === "open");
  for (const tab of tabs) tab.setAttribute("aria-selected", tab === openTab ? "true" : "false");
  const complaint = buildComplaint({
    id: `complaint-${Date.now()}`,
    room: "",
    guest: "",
    title: "",
    type: "Front Desk",
    urgency: "standard",
    status: "open",
    assignee: "",
    opened: "now",
    description: "",
    order: -Date.now(),
    activity: [{ who: "sarah", text: "logged this complaint", when: stamp() }],
  });
  if (!reduceMotion) complaint.classList.add("is-entering");
  sheet.prepend(complaint);
  if (!reduceMotion) {
    complaint.getBoundingClientRect();
    complaint.classList.remove("is-entering");
  }
  setOpen(complaint, true);
  applyFilters();
  complaint.querySelector(".sheet-guest").focus();
}

function syncText(complaint) {
  const guest = complaint.querySelector(".sheet-guest");
  if (complaint === sideComplaint) {
    const sideGuest = side.querySelector("[data-side-guest]");
    if (document.activeElement !== sideGuest) sideGuest.value = guest.value;
    sideGuest.classList.toggle("is-empty", !sideGuest.value.trim());
    fitField(sideGuest);
  }
  paintOptionList("guest");
}

SEED.forEach((data) => sheet.append(buildComplaint(data)));
paintOptionList("room");
paintOptionList("guest");
applyFilters();

document.querySelector("[data-new]")?.addEventListener("click", createComplaint);

searchInput?.addEventListener("input", applyFilters);
searchInput?.form?.querySelector(".clear")?.addEventListener("click", () => {
  window.setTimeout(applyFilters, 0);
});

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
  event.stopPropagation();
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

sheet.addEventListener("pointerdown", (event) => {
  const field = event.target.closest("input");
  const complaint = event.target.closest(".sheet");
  if (!field || !complaint || complaint.classList.contains("is-open")) return;
  event.preventDefault();
});

sheet.addEventListener("click", (event) => {
  if (event.target.closest("button")) return;
  const complaint = event.target.closest(".sheet");
  if (!complaint) return;
  const field = event.target.closest("input");
  if (field && complaint.classList.contains("is-open")) return;
  setOpen(complaint, field ? true : !complaint.classList.contains("is-open"));
});

sheet.addEventListener("input", (event) => {
  const complaint = event.target.closest(".sheet");
  if (!complaint) return;
  if (event.target.classList.contains("sheet-guest")) syncText(complaint);
  if (event.target.classList.contains("sheet-note") && complaint === sideComplaint) {
    const desc = side.querySelector("[data-side-desc]");
    if (document.activeElement !== desc) {
      desc.value = event.target.value;
      fitField(desc);
    }
  }
  applyFilters();
});

side?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  if (!event.target.matches("[data-side-guest], [data-side-phone], [data-side-email], [data-side-loyalty]")) return;
  event.preventDefault();
});

side?.addEventListener("input", (event) => {
  if (!sideComplaint) return;
  if (event.target.matches("[data-side-guest]")) {
    const clean = event.target.value.replace(/\n+/g, " ");
    if (clean !== event.target.value) event.target.value = clean;
    fitField(event.target);
    sideComplaint.querySelector(".sheet-guest").value = event.target.value;
    syncText(sideComplaint);
  }
  if (event.target.matches("[data-side-desc]")) {
    const note = sideComplaint.querySelector(".sheet-note");
    if (note && document.activeElement !== note) note.value = event.target.value;
    fitField(event.target);
  }
  if (event.target.matches("[data-side-phone], [data-side-email], [data-side-loyalty]")) {
    const clean = event.target.value.replace(/\n+/g, " ");
    if (clean !== event.target.value) event.target.value = clean;
    fitField(event.target);
  }
  if (event.target.matches("[data-side-phone]")) sideComplaint.dataset.phone = event.target.value.trim();
  if (event.target.matches("[data-side-email]")) sideComplaint.dataset.email = event.target.value.trim();
  if (event.target.matches("[data-side-loyalty]")) sideComplaint.dataset.loyalty = event.target.value.trim();
  applyFilters();
});

side?.addEventListener("focusin", (event) => {
  if (event.target.matches("[data-side-phone], [data-side-email], [data-side-loyalty]")) {
    event.target.dataset.was = event.target.value.trim();
  }
});

side?.addEventListener("focusout", (event) => {
  if (!sideComplaint) return;
  const names = { "data-side-phone": ["phone", "phone"], "data-side-email": ["email", "email"], "data-side-loyalty": ["loyalty", "loyalty number"] };
  const match = Object.keys(names).find((selector) => event.target.matches(`[${selector}]`));
  if (!match) return;
  const [key, label] = names[match];
  const next = event.target.value.trim();
  const previous = event.target.dataset.was || "";
  sideComplaint.dataset[key] = next;
  if (next === previous) return;
  logChange(sideComplaint, next ? `set the ${label} to ${next}` : `cleared the ${label}`);
  paintSideActivity(sideComplaint);
});

side?.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-composer]");
  if (!form || !sideComplaint) return;
  event.preventDefault();
  const input = form.querySelector("input");
  const text = input.value.trim();
  if (!text) return;
  sideComplaint._comments.push({ who: "sarah", text, when: stamp() });
  input.value = "";
  form.classList.remove("has-value");
  paintSideActivity(sideComplaint);
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-side-back]")) {
    if (sideComplaint) setOpen(sideComplaint, false);
    return;
  }
  const field = event.target.closest("[data-menu-kind]");
  if (field) {
    openFieldMenu(field);
    return;
  }
  const more = event.target.closest("[data-more], [data-side-more]");
  if (more) {
    const open = more.getAttribute("aria-expanded") === "true";
    const target = more.closest(".comment") || sideComplaint;
    if (open) closePanels();
    else {
      const box = more.getBoundingClientRect();
      openRowMenu(box.right - 168, box.bottom + 4, target, more);
    }
    return;
  }
  if (event.target.closest("[data-side-schedule]") && sideComplaint) {
    openRowMenu(event.target.getBoundingClientRect().left, event.target.getBoundingClientRect().bottom + 4, sideComplaint);
    toggleCalendar();
    return;
  }
  if (event.target.closest("#field-menu")) {
    const choice = event.target.closest("[data-kind]");
    if (choice && menuTarget) choose(menuTarget, choice.dataset.kind, choice.dataset.value);
    if (choice) closePanels();
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
      scheduleComplaint(menuTarget, day.dataset.calDay);
      return;
    }
    if (event.target.closest(".cal-pop [data-clear-date]") && menuTarget) {
      scheduleComplaint(menuTarget, "");
    }
    return;
  }
  if (!event.target.closest("[data-filter-menu]")) closePanels();
  if (side && !side.hidden && sideComplaint && !event.target.closest("#complaint-side, .sheet, #row-menu, #field-menu, .confirm-dialog, [data-new]")) {
    setOpen(sideComplaint, false);
  }
});

document.addEventListener("contextmenu", (event) => {
  const comment = event.target.closest(".comment");
  if (comment) {
    event.preventDefault();
    openRowMenu(event.clientX, event.clientY, comment);
    return;
  }
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

const lanceInput = document.querySelector(".lance input");
for (const chip of document.querySelectorAll("[data-suggest]")) {
  chip.addEventListener("click", () => {
    if (!lanceInput) return;
    lanceInput.value = chip.textContent.trim();
    lanceInput.dispatchEvent(new Event("input", { bubbles: true }));
    lanceInput.focus();
  });
}

const collapseButton = document.querySelector(".side-top [data-side-collapse]");
const lanceCollapse = document.querySelector("#lance [data-lance-collapse]");
const SIDE_OPEN_AT = 1564;
const LANCE_OPEN_AT = 1341;
let sideChosen = false;
let sideHeldOpen = false;
let lanceChosen = false;
let lanceHeldOpen = false;
try {
  sideChosen = sessionStorage.getItem("side-chosen") === "1";
  sideHeldOpen = sessionStorage.getItem("side-held-open") === "1";
} catch (error) {}

function rememberSide() {
  try {
    sessionStorage.setItem("side-chosen", sideChosen ? "1" : "0");
    sessionStorage.setItem("side-held-open", sideHeldOpen ? "1" : "0");
  } catch (error) {}
}

function setSideCollapsed(collapsed) {
  if (document.body.classList.contains("is-side-collapsed") !== collapsed) {
    document.body.classList.toggle("is-side-collapsed", collapsed);
  }
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
  if (width >= SIDE_OPEN_AT && sideHeldOpen) {
    sideHeldOpen = false;
    rememberSide();
  }
  if (width >= LANCE_OPEN_AT) lanceHeldOpen = false;
  setSideCollapsed((width < SIDE_OPEN_AT && !sideHeldOpen) || sideChosen);
  setLanceCollapsed((width < LANCE_OPEN_AT && !lanceHeldOpen) || lanceChosen);
}

collapseButton?.addEventListener("click", () => {
  const next = !document.body.classList.contains("is-side-collapsed");
  sideChosen = next;
  sideHeldOpen = !next && window.innerWidth < SIDE_OPEN_AT;
  rememberSide();
  setSideCollapsed(next);
});

lanceCollapse?.addEventListener("click", () => {
  const next = !document.body.classList.contains("is-lance-collapsed");
  lanceChosen = next;
  lanceHeldOpen = !next && window.innerWidth < LANCE_OPEN_AT;
  setLanceCollapsed(next);
});

applyPanelLimits();
window.addEventListener("resize", applyPanelLimits);
