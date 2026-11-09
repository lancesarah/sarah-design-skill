const RESOLUTION = {
  missed: { label: "Missed" },
  abandoned: { label: "Abandoned" },
  transferred: { label: "Transferred" },
  resolved: { label: "Resolved" },
};

const TYPES = [
  { value: "Front Desk", label: "Front desk" },
  { value: "Housekeeping", label: "Housekeeping" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Sales", label: "Sales" },
  { value: "Management", label: "Management" },
];

const FILTER_LABEL = { type: "Department", resolution: "Resolution" };
const RANGE_MINUTES = { "24h": 24 * 60, "7d": 7 * 24 * 60, "30d": 30 * 24 * 60 };
const COMPLETE_HOLD = 700;

const SEED = [
  ["+1 (917) 822-3169", "The guest requested to be connected to the front desk immediately, expressing frustration with the AI system. The agent acknowledged the request and agreed to transfer the guest.", "transferred", "Front Desk", 26],
  ["+1 (310) 770-6689", "The guest called to confirm a late checkout.", "transferred", "Front Desk", 59],
  ["+1 (559) 269-5184", "The guest needed to be moved to a quieter room.", "transferred", "Front Desk", 60],
  ["+1 (866) 550-1427", "The guest was attempting to reach the restaurant for a reservation.", "resolved", "Food & Beverage", 190],
  ["+1 (408) 555-0148", "The guest called about a missing room key and hung up.", "missed", "Front Desk", 240],
  ["+1 (206) 555-0172", "The guest wanted extra towels sent to the room.", "abandoned", "Housekeeping", 260],
  ["+1 (702) 555-0118", "The guest needed the air conditioning looked at.", "missed", "Maintenance", 330],
  ["+1 (619) 555-0160", "The guest asked whether breakfast is included.", "resolved", "Food & Beverage", 360],
  ["+1 (310) 555-0181", "The guest called yesterday about a parking refund.", "transferred", "Front Desk", 60 * 26],
  ["+1 (323) 555-0159", "The guest called about a wake-up that never came.", "missed", "Front Desk", 60 * 40],
  ["+1 (442) 555-0162", "The guest called last week about a loyalty number.", "transferred", "Sales", 60 * 24 * 10],
  ["+1 (951) 555-0102", "The guest called to ask about pet policy.", "resolved", "Front Desk", 60 * 24 * 22],
];

const sheet = document.querySelector("[data-sheet]");
const empty = document.querySelector("[data-empty]");
const count = document.querySelector("[data-count]");
const sheetCount = document.querySelector("[data-sheet-count]");
const tabs = [...document.querySelectorAll("[data-bucket]")];
const searchInput = document.querySelector("[data-call-search] input");
const chips = document.querySelector("[data-chips]");
const filterMenu = document.querySelector("[data-filter-menu]");
const rowMenu = document.querySelector("#row-menu");
const fieldMenu = document.querySelector("#field-menu");
const confirmDialog = document.querySelector(".confirm-dialog");
const side = document.querySelector("#call-side");

let menuTarget = null;
let fieldButton = null;
let sideCall = null;
let pendingDelete = null;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const editMark = '<svg class="i sheet-edit" width="10" height="10" aria-hidden="true"><use href="#i-chevron"/></svg>';
const warnIcon = '<svg class="i" width="14" height="14" aria-hidden="true"><use href="#i-warn"/></svg>';

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

const CALL_DETAIL = {
  "+1 (917) 822-3169": {
    type: "General",
    sentiment: "mixed",
    csat: "2/5",
    duration: 36,
    origin: "External",
    handler: "Lance AI",
    key: "I know you're not a human being",
    transcript: [
      { who: "Lance AI", initials: "LA", offset: 28, text: "Good morning, thank you for calling SpringHill Suites Belmont, this is Laura, how may I help you today? Mm." },
      { who: "Guest", initials: "G", offset: 39, text: "Hello, I know you're not a human being, and I appreciate that, but I would like to be connected to the front desk right away, please. I'm tired of dealing with the automated system." },
    ],
  },
};

const CALL_KIND = {
  "Front Desk": "General",
  Housekeeping: "Request",
  Maintenance: "Service",
  "Food & Beverage": "Dining",
  Sales: "Reservation",
  Management: "Complaint",
};

function detailFor(row) {
  const [phone, summary, resolution, dept] = row;
  if (CALL_DETAIL[phone]) return CALL_DETAIL[phone];
  const seconds = 24 + (summary.length % 40);
  const sentiment = resolution === "resolved" ? "positive" : resolution === "transferred" ? "mixed" : "negative";
  const csat = resolution === "resolved" ? "4/5" : resolution === "transferred" ? "3/5" : "1/5";
  return {
    type: CALL_KIND[dept] || "General",
    sentiment,
    csat,
    duration: seconds,
    origin: "External",
    handler: "Lance AI",
    key: summary.split(/[,.]/)[0],
    transcript: [
      { who: "Lance AI", initials: "LA", offset: 4, text: "Thank you for calling, how may I help you today?" },
      { who: "Guest", initials: "G", offset: 12, text: summary },
      { who: "Lance AI", initials: "LA", offset: 22, text: resolution === "transferred" ? "I'll connect you now." : resolution === "resolved" ? "You're all set." : "I'm sorry we missed you." },
    ],
  };
}

function callDate(minutes) {
  return new Date(Date.now() - Number(minutes) * 60000);
}

function formatHandled(date, handler) {
  const day = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  return `Handled by ${handler} · ${day} · ${time}`;
}

function formatTurn(date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });
}

function clock(total) {
  const seconds = Math.max(0, Math.floor(total));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function durationLabel(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const rest = whole % 60;
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (rest || parts.length === 0) parts.push(`${rest}s`);
  return parts.join(" ");
}

function displayType(value) {
  return TYPES.find((type) => type.value === value)?.label || value || "Front desk";
}

function resolutionKey(call) {
  return call?.dataset.pending || call?.dataset.resolution || "resolved";
}

function whenLabel(minutes) {
  const n = Number(minutes) || 0;
  if (n < 1) return "now";
  if (n < 60) return `${n}m`;
  if (n < 24 * 60) return `${Math.round(n / 60)}h`;
  return `${Math.round(n / (24 * 60))}d`;
}

function selectedBucket() {
  return tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.bucket || "all";
}

function selectedRange() {
  return document.querySelector("[data-range][aria-selected='true']")?.dataset.range || "24h";
}

function inBucket(call, bucket) {
  const key = call.dataset.resolution;
  if (bucket === "all") return true;
  if (bucket === "attention") return key === "missed" || key === "abandoned";
  return key === bucket;
}

function inRange(call) {
  return Number(call.dataset.minutes) <= RANGE_MINUTES[selectedRange()];
}

function paintResolutionButton(button, key) {
  if (!button) return;
  const label = RESOLUTION[key]?.label || "Resolved";
  button.dataset.resolution = key;
  button.innerHTML = `${key === "missed" ? warnIcon : ""}${esc(label)}${editMark}`;
  button.setAttribute("aria-label", `Resolution, ${label}`);
  button.setAttribute("aria-haspopup", "menu");
  if (button.getAttribute("aria-expanded") !== "true") button.setAttribute("aria-expanded", "false");
}

function paintResolutionInfo(node, key) {
  if (!node) return;
  const label = RESOLUTION[key]?.label || "Resolved";
  node.dataset.resolution = key;
  node.innerHTML = `${key === "missed" ? warnIcon : ""}${esc(label)}`;
}

function paintCall(call) {
  const phone = call.querySelector(".call-phone");
  const summary = call.querySelector("[data-summary]");
  const when = call.querySelector("[data-when]");
  if (phone) phone.textContent = call.dataset.phone || "";
  if (summary) summary.textContent = call.dataset.summary || "";
  if (when) when.textContent = whenLabel(call.dataset.minutes);
  paintResolutionInfo(call.querySelector(".sheet-line .call-resolution"), resolutionKey(call));
}

function paintSide(call) {
  if (!side || call !== sideCall) return;
  const detail = call._detail;
  const started = callDate(call.dataset.minutes);
  side.querySelector("[data-side-phone]").textContent = call.dataset.phone || "";
  side.querySelector("[data-side-handled]").textContent = formatHandled(started, detail.handler);
  side.querySelector("[data-side-summary]").textContent = call.dataset.summary || "";
  side.querySelector("[data-side-key]").textContent = detail.key;
  side.querySelectorAll("[data-side-resolution]").forEach((button) => paintResolutionButton(button, resolutionKey(call)));
  const transferred = resolutionKey(call) === "transferred";
  side.querySelector("[data-side-dept-label]").textContent = transferred ? "Transferred to" : "Department";
  const typeButton = side.querySelector("[data-menu-kind=type]");
  const typeLabel = typeButton.querySelector("[data-side-type]");
  typeLabel.textContent = displayType(call.dataset.dept);
  typeButton.dataset.type = call.dataset.dept || "Front Desk";
  typeButton.setAttribute("aria-label", `${transferred ? "Transferred to" : "Department"}, ${displayType(call.dataset.dept)}`);
  side.querySelector("[data-side-kind]").textContent = detail.type;
  side.querySelector("[data-side-sentiment]").textContent = detail.sentiment;
  side.querySelector("[data-side-csat]").textContent = detail.csat;
  side.querySelector("[data-side-length]").textContent = durationLabel(detail.duration);
  side.querySelector("[data-side-origin]").textContent = detail.origin;
  paintTranscript(call, started);
  paintSideActivity(call);
  paintPlayer(call);
}

function activityWhen(minutes) {
  return callDate(minutes).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function activityPill(name, initials) {
  return `<span class="mini-pill"><span class="avatar mini">${esc(initials)}</span>${esc(name)}</span>`;
}

function paintSideActivity(call) {
  const list = side.querySelector("[data-side-activity]");
  if (!list) return;
  list.replaceChildren();
  const rows = [
    ...(call._log || []).map((item) => ({ kind: "log", item })),
    ...(call._comments || []).map((item, index) => ({ kind: "comment", item, index })),
  ].reverse();
  rows.forEach((row, index) => {
    if (row.kind === "log") {
      const node = document.createElement("div");
      node.className = `side-log${index > 0 ? " is-dim" : ""}`;
      node.innerHTML = `${activityPill(row.item.name, row.item.initials)}<span class="side-log-text">${esc(row.item.text)}</span><time>${esc(row.item.when)}</time>`;
      list.append(node);
      return;
    }
    const node = document.createElement("div");
    node.className = "comment";
    node.innerHTML = `<div class="comment-inner"><span class="avatar mini">${esc(row.item.initials)}</span><span class="person-copy"><span class="mini-line">${esc(row.item.name)} <span class="meta-k">${esc(row.item.when)}</span></span><p>${esc(row.item.text)}</p></span></div>`;
    list.append(node);
  });
}

function paintTranscript(call, started) {
  const host = side.querySelector("[data-side-transcript]");
  host.replaceChildren();
  for (const turn of call._detail.transcript) {
    const when = new Date(started.getTime() + turn.offset * 1000);
    const row = document.createElement("div");
    row.className = "call-turn";
    row.dataset.who = turn.who === "Guest" ? "guest" : "agent";
    row.innerHTML = `<span class="call-turn-meta">${esc(turn.who)} <time>${esc(formatTurn(when))}</time></span><p>${esc(turn.text)}</p>`;
    host.append(row);
  }
}

let playerTimer = null;

function stopPlayer() {
  window.clearInterval(playerTimer);
  playerTimer = null;
  if (sideCall) sideCall._playing = false;
}

function paintPlayer(call) {
  if (!side || !call?._detail) return;
  const elapsed = call._elapsed || 0;
  const total = call._detail.duration;
  side.querySelector("[data-elapsed]").textContent = clock(elapsed);
  side.querySelector("[data-duration]").textContent = clock(total);
  side.querySelector("[data-track]").style.width = `${total ? (elapsed / total) * 100 : 0}%`;
  const button = side.querySelector("[data-play]");
  const playing = Boolean(call._playing);
  button.setAttribute("aria-pressed", playing ? "true" : "false");
  button.setAttribute("aria-label", playing ? "Pause recording" : "Play recording");
  button.querySelector("use").setAttribute("href", playing ? "#i-pause" : "#i-play");
}

function togglePlayer() {
  const call = sideCall;
  if (!call) return;
  if (call._playing) {
    stopPlayer();
    paintPlayer(call);
    return;
  }
  if ((call._elapsed || 0) >= call._detail.duration) call._elapsed = 0;
  call._playing = true;
  paintPlayer(call);
  playerTimer = window.setInterval(() => {
    if (sideCall !== call) {
      stopPlayer();
      return;
    }
    call._elapsed = Math.min(call._detail.duration, (call._elapsed || 0) + 1);
    if (call._elapsed >= call._detail.duration) call._playing = false;
    paintPlayer(call);
    if (!call._playing) stopPlayer();
  }, 1000);
}

function buildCall(row, index) {
  const [phone, summary, resolution, dept, minutes] = row;
  const call = document.createElement("article");
  call.className = "sheet";
  call.dataset.phone = phone;
  call.dataset.summary = summary;
  call.dataset.resolution = resolution;
  call.dataset.dept = dept;
  call.dataset.minutes = String(minutes);
  call.dataset.order = String(index);
  call._detail = detailFor(row);
  call._log = [{ name: "Manual", initials: "M", text: "logged this call", when: activityWhen(minutes) }];
  call._comments = [];
  call.innerHTML = `
    <div class="sheet-clip"><div class="sheet-inner">
      <div class="sheet-line">
        <span class="call-phone"></span>
        <span class="call-summary"><span class="call-summary-text" data-summary></span></span>
        <span class="col-reserve">
          <span class="call-resolution" data-resolution></span>
          <span class="fit-label sizer-chip" aria-hidden="true"><span>${warnIcon}Missed</span><span>Abandoned</span><span>Transferred</span><span>Resolved</span></span>
        </span>
        <span class="col-reserve">
          <span class="sheet-when" data-when></span>
          <span class="fit-label sizer-when" aria-hidden="true"><span>59m</span></span>
        </span>
      </div>
    </div></div>`;
  paintCall(call);
  return call;
}

function haystack(call) {
  const key = resolutionKey(call);
  return [call.dataset.phone, call.dataset.summary, RESOLUTION[key]?.label, displayType(call.dataset.dept), call._detail?.key, ...(call._detail?.transcript || []).map((turn) => turn.text)].join(" ").toLowerCase();
}

function selectedFilters() {
  const groups = {};
  for (const item of filterMenu?.querySelectorAll("[data-filter-pick][aria-checked='true']") || []) {
    const key = item.dataset.filterPick;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item.dataset.value);
  }
  return groups;
}

function callField(call, key) {
  if (key === "type") return call.dataset.dept || "";
  if (key === "resolution") return RESOLUTION[call.dataset.resolution]?.label || "";
  return "";
}

function matchesFilters(call) {
  const groups = selectedFilters();
  return Object.entries(groups).every(([key, values]) => values.includes(callField(call, key)));
}

function sortSheet() {
  const rows = [...sheet.querySelectorAll(".sheet")];
  rows.sort((a, b) => Number(a.dataset.minutes) - Number(b.dataset.minutes) || Number(a.dataset.order) - Number(b.dataset.order));
  for (const row of rows) sheet.append(row);
}

function applyFilters() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  const bucket = selectedBucket();
  const totals = { all: 0, attention: 0, transferred: 0, abandoned: 0, missed: 0 };
  let visible = 0;
  let listed = 0;
  sortSheet();
  for (const call of sheet.querySelectorAll(".sheet")) {
    const filtered = inRange(call) && matchesFilters(call);
    const leaving = call.classList.contains("is-leaving");
    if (filtered && !leaving) {
      totals.all += 1;
      if (call.dataset.resolution === "missed" || call.dataset.resolution === "abandoned") totals.attention += 1;
      if (totals[call.dataset.resolution] != null) totals[call.dataset.resolution] += 1;
    }
    const inList = filtered && inBucket(call, bucket) && !leaving;
    if (inList) listed += 1;
    const show = inList && (!query || haystack(call).includes(query));
    if (!leaving) call.hidden = !show;
    if (show && !call.hidden) visible += 1;
  }
  if (empty) empty.hidden = visible !== 0;
  if (count) count.textContent = String(totals.all);
  if (sheetCount) sheetCount.textContent = `Showing ${visible} of ${listed}`;
  for (const tab of tabs) {
    const badge = tab.querySelector("[data-bucket-count]");
    if (!badge) continue;
    const value = totals[tab.dataset.bucket] || 0;
    badge.textContent = String(value);
    badge.classList.toggle("is-live", tab.dataset.bucket === "missed" && value > 0);
  }
}

function leaveView(call) {
  if (reduceMotion) {
    applyFilters();
    return;
  }
  call.classList.add("is-leaving");
  const clip = call.querySelector(".sheet-clip");
  let gone = false;
  const finish = (event) => {
    if (gone) return;
    if (event && event.propertyName !== "grid-template-rows") return;
    gone = true;
    call.classList.remove("is-leaving");
    applyFilters();
  };
  clip?.addEventListener("transitionend", finish);
  window.setTimeout(finish, 260);
}

function setResolution(call, next) {
  if (!RESOLUTION[next]) return;
  window.clearTimeout(call._hold);
  const committed = call.dataset.resolution;
  if (next === committed) {
    delete call.dataset.pending;
    paintCall(call);
    paintSide(call);
    applyFilters();
    return;
  }
  const bucket = selectedBucket();
  const stays = bucket === "all" || (bucket === "attention" ? next === "missed" || next === "abandoned" : next === bucket);
  if (stays) {
    delete call.dataset.pending;
    call.dataset.resolution = next;
    paintCall(call);
    paintSide(call);
    applyFilters();
    return;
  }
  call.dataset.pending = next;
  paintCall(call);
  paintSide(call);
  call._hold = window.setTimeout(() => {
    call.dataset.resolution = call.dataset.pending || next;
    delete call.dataset.pending;
    paintCall(call);
    leaveView(call);
  }, COMPLETE_HOLD);
}

function setOpen(call, open) {
  if (!call) return;
  if (!open || sideCall !== call) stopPlayer();
  for (const other of sheet.querySelectorAll(".sheet.is-open")) {
    if (other !== call) other.classList.remove("is-open");
  }
  call.classList.toggle("is-open", open);
  if (open) {
    sideCall = call;
    side.hidden = false;
    paintSide(call);
    return;
  }
  if (sideCall === call) {
    sideCall = null;
    side.hidden = true;
  }
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
  if (fieldMenu) fieldMenu.hidden = true;
  if (rowMenu) rowMenu.hidden = true;
  if (fieldButton) fieldButton.setAttribute("aria-expanded", "false");
  fieldButton = null;
  document.querySelector("[data-side-more]")?.setAttribute("aria-expanded", "false");
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

function resolutionChip(key) {
  const label = RESOLUTION[key].label;
  return `<span class="call-resolution" data-resolution="${key}">${key === "missed" ? warnIcon : ""}${esc(label)}</span>`;
}

function openFieldMenu(button) {
  const call = button.closest(".sheet") || sideCall;
  const kind = button.dataset.menuKind;
  if (!call) return;
  const open = button.getAttribute("aria-expanded") === "true";
  closePanels();
  if (open) return;
  menuTarget = call;
  fieldButton = button;
  button.setAttribute("aria-expanded", "true");
  if (kind === "resolution") {
    const current = resolutionKey(call);
    fieldMenu.innerHTML = Object.keys(RESOLUTION).map((key) => menuButton("resolution", key, resolutionChip(key), current)).join("");
  } else if (kind === "type") {
    fieldMenu.innerHTML = TYPES.map((type) => menuButton(
      "type",
      type.value,
      `<span class="dept" data-dept="${esc(type.value)}">${esc(type.label)}</span>`,
      call.dataset.dept,
    )).join("");
  }
  const box = button.getBoundingClientRect();
  placePanel(fieldMenu, box.left, box.bottom + 4);
}

function openRowMenu(x, y, target, more) {
  menuTarget = target;
  closePanels();
  if (more) more.setAttribute("aria-expanded", "true");
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
    const shown = item.dataset.filterPick === "type" ? displayType(item.dataset.value) : item.dataset.value;
    const button = document.createElement("button");
    button.className = "chip chip-filter";
    button.type = "button";
    button.innerHTML = `<span class="chip-k">${esc(label)}</span>: ${esc(shown)} <svg class="i x" width="10" height="10"><use href="#i-plus"/></svg>`;
    button.addEventListener("click", () => {
      item.setAttribute("aria-checked", "false");
      paintChips();
      applyFilters();
    });
    chips.append(button);
  }
}

function askDelete(target) {
  pendingDelete = target;
  const title = confirmDialog.querySelector("#confirm-title");
  const copy = confirmDialog.querySelector("p");
  title.textContent = "Delete this call?";
  copy.textContent = `“${target.dataset.phone || "This call"}” will be permanently removed for the whole team.`;
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

function removeCall(call) {
  if (sideCall === call) setOpen(call, false);
  const finish = () => {
    call.remove();
    applyFilters();
  };
  if (reduceMotion) {
    finish();
    return;
  }
  call.classList.add("is-leaving");
  const clip = call.querySelector(".sheet-clip");
  let gone = false;
  const done = (event) => {
    if (gone) return;
    if (event && event.propertyName !== "grid-template-rows") return;
    gone = true;
    finish();
  };
  clip?.addEventListener("transitionend", done);
  window.setTimeout(done, 260);
}

SEED.forEach((row, index) => sheet.append(buildCall(row, index)));
applyFilters();

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

for (const range of document.querySelectorAll("[data-range]")) {
  range.addEventListener("click", () => {
    window.setTimeout(applyFilters, 0);
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

sheet.addEventListener("click", (event) => {
  if (event.target.closest("button, a, input, textarea")) return;
  const call = event.target.closest(".sheet");
  if (!call) return;
  setOpen(call, !call.classList.contains("is-open"));
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-side-back]")) {
    if (sideCall) setOpen(sideCall, false);
    return;
  }
  const field = event.target.closest("[data-menu-kind]");
  if (field) {
    openFieldMenu(field);
    return;
  }
  const more = event.target.closest("[data-side-more]");
  if (more) {
    const open = more.getAttribute("aria-expanded") === "true";
    if (open) closePanels();
    else openRowMenu(0, 0, sideCall, more);
    return;
  }
  if (event.target.closest("#field-menu")) {
    const choice = event.target.closest("[data-kind]");
    if (choice && menuTarget) {
      if (choice.dataset.kind === "resolution") setResolution(menuTarget, choice.dataset.value);
      if (choice.dataset.kind === "type" && menuTarget.dataset.dept !== choice.dataset.value) {
        menuTarget.dataset.dept = choice.dataset.value;
        paintSide(menuTarget);
        applyFilters();
      }
    }
    if (choice) closePanels();
    return;
  }
  if (event.target.closest("#row-menu")) {
    if (event.target.closest("[data-menu-delete]") && menuTarget) {
      askDelete(menuTarget);
      closePanels();
    }
    return;
  }
  if (!event.target.closest("[data-filter-menu]")) closePanels();
  if (side && !side.hidden && sideCall && !event.target.closest("#call-side, .sheet, #row-menu, #field-menu, .confirm-dialog, [data-filter-menu]")) {
    setOpen(sideCall, false);
  }
});

document.addEventListener("contextmenu", (event) => {
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
    removeCall(target);
  }
  if (choice) closeConfirm();
});

confirmDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  pendingDelete = null;
  closeConfirm();
});

side.querySelector("[data-play]")?.addEventListener("click", (event) => {
  event.stopPropagation();
  togglePlayer();
});

side?.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-composer]");
  if (!form || !sideCall) return;
  event.preventDefault();
  const input = form.querySelector("input");
  const text = input.value.trim();
  if (!text) return;
  sideCall._comments.push({ name: "Sarah", initials: "SM", text, when: activityWhen(0) });
  input.value = "";
  form.classList.remove("has-value");
  paintSideActivity(sideCall);
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

function edgeFade(el, axis) {
  const update = () => {
    const max = axis === "x" ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
    const pos = axis === "x" ? el.scrollLeft : el.scrollTop;
    const fade = el.closest(".scroll-fade") || el.closest(".side-scroll-frame") || el;
    fade.classList.toggle("is-fade-start", max > 1 && pos > 1);
    fade.classList.toggle("is-fade-end", max > 1 && pos < max - 1);
  };
  update();
  el.addEventListener("scroll", update, { passive: true });
  const observer = new ResizeObserver(update);
  observer.observe(el);
  for (const child of el.children) observer.observe(child);
}

const sideScroll = document.querySelector(".side-scroll");
if (sideScroll) edgeFade(sideScroll, "y");
const bucketStrip = document.querySelector(".page-filters .tabs");
if (bucketStrip) {
  edgeFade(bucketStrip, "x");
  const fade = bucketStrip.parentElement;
  const thumb = document.createElement("div");
  thumb.className = "tabs-bar-thumb";
  thumb.setAttribute("aria-hidden", "true");
  thumb.hidden = true;
  fade.appendChild(thumb);
  const placeThumb = () => {
    const max = bucketStrip.scrollWidth - bucketStrip.clientWidth;
    if (max <= 1) {
      thumb.hidden = true;
      return;
    }
    thumb.hidden = false;
    const inset = 2;
    const track = bucketStrip.clientWidth - inset * 2;
    const size = Math.max(32, track * (bucketStrip.clientWidth / bucketStrip.scrollWidth));
    const x = inset + (bucketStrip.scrollLeft / max) * (track - size);
    thumb.style.width = `${size}px`;
    thumb.style.transform = `translateX(${x}px)`;
  };
  placeThumb();
  fade.addEventListener("wheel", (event) => {
    const max = bucketStrip.scrollWidth - bucketStrip.clientWidth;
    if (max <= 1) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    const next = Math.max(0, Math.min(max, bucketStrip.scrollLeft + delta));
    if (next === bucketStrip.scrollLeft) return;
    event.preventDefault();
    bucketStrip.scrollLeft = next;
  }, { passive: false });
  bucketStrip.addEventListener("scroll", placeThumb, { passive: true });
  const thumbObserver = new ResizeObserver(placeThumb);
  thumbObserver.observe(bucketStrip);
  for (const child of bucketStrip.children) thumbObserver.observe(child);
  let drag = null;
  thumb.addEventListener("pointerdown", (event) => {
    drag = { x: event.clientX, left: bucketStrip.scrollLeft };
    thumb.setPointerCapture(event.pointerId);
    thumb.style.cursor = "grabbing";
  });
  thumb.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const max = bucketStrip.scrollWidth - bucketStrip.clientWidth;
    const room = Math.max(1, bucketStrip.clientWidth - thumb.getBoundingClientRect().width);
    bucketStrip.scrollLeft = drag.left + ((event.clientX - drag.x) / room) * max;
  });
  const endDrag = () => {
    drag = null;
    thumb.style.cursor = "";
  };
  thumb.addEventListener("pointerup", endDrag);
  thumb.addEventListener("pointercancel", endDrag);
}
