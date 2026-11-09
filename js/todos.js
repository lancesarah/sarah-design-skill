const PEOPLE = {
  mark: { name: "Mark", initials: "MJ" },
  paul: { name: "Paul", initials: "PG" },
  boris: { name: "Boris", initials: "B" },
  sarah: { name: "Sarah", initials: "SM" },
  manual: { name: "Manual", initials: "M" },
};

const URGENCY = {
  urgent: "Urgent",
  high: "High",
  standard: "Standard",
  low: "Low",
};

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

const NOT_VIEWED = ["mark", "paul", "boris", "sarah"];

const SEED = [
  {
    id: "pillows",
    room: "426",
    title: "Guestroom · Pillows/Bedding",
    type: "Housekeeping",
    urgency: "urgent",
    status: "open",
    assignee: "mark",
    opened: "now",
    description: "Requested Feathered Pillows.",
    open: true,
    activity: [{ who: "manual", text: "Manual created this to-do", when: "Oct 29, 4:22 PM" }],
  },
  {
    id: "other-244",
    room: "244",
    title: "Guestroom · Other",
    type: "Housekeeping",
    urgency: "urgent",
    status: "open",
    assignee: "mark",
    opened: "now",
    description: "",
  },
  {
    id: "other-103",
    room: "103",
    title: "Guestroom · Other",
    type: "Housekeeping",
    urgency: "urgent",
    status: "open",
    assignee: "paul",
    opened: "2h",
    description: "",
  },
  {
    id: "other-244b",
    room: "244",
    title: "Guestroom · Other",
    type: "Housekeeping",
    urgency: "high",
    status: "open",
    assignee: "mark",
    opened: "now",
    description: "",
  },
  {
    id: "other-436",
    room: "436",
    title: "Guestroom · Other",
    type: "Housekeeping",
    urgency: "high",
    status: "open",
    assignee: "paul",
    opened: "2h",
    description: "",
  },
  {
    id: "dryer",
    room: "—",
    title: "Common Areas · Weekly House Dryer Thermistor Inspection — Ensure plenum area behind dryers is clear of lint. Floor should be mopped cleaned.",
    type: "Maintenance",
    urgency: "standard",
    status: "open",
    assignee: "boris",
    opened: "now",
    description: "Ensure plenum area behind dryers is clear of lint. Floor should be mopped cleaned.",
  },
];

const list = document.querySelector("[data-todos]");
const empty = document.querySelector("[data-empty]");
const count = document.querySelector("[data-count]");
const tabs = [...document.querySelectorAll("[data-bucket]")];
const searchInput = document.querySelector("[data-todo-search] input");
const chips = document.querySelector("[data-chips]");
const filterMenu = document.querySelector("[data-filter-menu]");
const autoAssign = document.querySelector("[data-auto-assign]");
const sortButton = document.querySelector("[data-sort]");
const rowMenu = document.querySelector("#row-menu");
const confirmDialog = document.querySelector(".confirm-dialog");
const scroll = document.querySelector(".todos-scroll");
const fade = document.querySelector(".todos-fade");

let menuTarget = null;
let pendingDelete = null;
let sortMode = "none";
let order = 0;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function urgencyChip(key) {
  const icon = key === "urgent" ? '<svg class="i" width="14" height="14"><use href="#i-warn"/></svg>' : "";
  return `<span class="urgency urgency-${key}">${icon}${esc(URGENCY[key])}</span>`;
}

function personButton(id) {
  if (!id || !PEOPLE[id]) return '<span class="avatar mini" aria-hidden="true"></span><span class="cell-quiet">Unassigned</span>';
  const person = PEOPLE[id];
  return `<span class="avatar mini">${esc(person.initials)}</span>${esc(person.name)}`;
}

function menuPeople(selected) {
  return Object.entries(PEOPLE)
    .filter(([id]) => id !== "manual")
    .map(([id, person]) => `<button class="menu-item" type="button" role="menuitemradio" data-kind="assignee" data-value="${id}" aria-checked="${id === selected ? "true" : "false"}"><span class="avatar mini">${esc(person.initials)}</span>${esc(person.name)}<svg class="i check" width="14" height="14"><use href="#i-check"/></svg></button>`)
    .join("");
}

function menuUrgency(selected) {
  return Object.keys(URGENCY).map((key) => `<button class="menu-item" type="button" role="menuitemradio" data-kind="urgency" data-value="${key}" aria-checked="${key === selected ? "true" : "false"}">${urgencyChip(key)}<svg class="i check" width="14" height="14"><use href="#i-check"/></svg></button>`).join("");
}

function menuStatus(selected) {
  return Object.entries(STATUS).map(([key, status]) => `<button class="menu-item" type="button" role="menuitemradio" data-kind="status" data-value="${key}" aria-checked="${key === selected ? "true" : "false"}">${status.icon}${esc(status.label)}<svg class="i check" width="14" height="14"><use href="#i-check"/></svg></button>`).join("");
}

function activityHTML(items) {
  return (items || []).map((item) => {
    const person = PEOPLE[item.who] || PEOPLE.manual;
    return `<div class="activity-item"><span class="avatar mini">${esc(person.initials)}</span><span class="person-copy"><span>${esc(item.text)}</span><span class="meta-k">${esc(item.when)}</span></span></div>`;
  }).join("");
}

function viewerMenu() {
  const rows = NOT_VIEWED.map((id) => {
    const person = PEOPLE[id];
    return `<div class="view-row"><span class="avatar mini">${esc(person.initials)}</span>${esc(person.name)}</div>`;
  }).join("");
  return `<p class="menu-k">Not viewed</p>${rows}`;
}

function buildTodo(data) {
  const todo = document.createElement("div");
  todo.className = "todo";
  todo.dataset.id = data.id;
  todo.dataset.bucket = data.bucket || (data.status === "complete" ? "completed" : "open");
  todo.dataset.type = data.type || "Housekeeping";
  todo.dataset.urgency = data.urgency || "standard";
  todo.dataset.status = data.status || "open";
  todo.dataset.assignee = data.assignee || "";
  todo.dataset.date = data.date || "";
  todo.dataset.opened = data.opened || "now";
  todo.dataset.order = String(order);
  order += 1;
  todo.innerHTML = `
    <div class="todo-clip"><div class="todo-inner">
      <div class="todo-row" tabindex="0" aria-expanded="${data.open ? "true" : "false"}">
        <label class="room"><input value="${esc(data.room || "")}" placeholder="Room" aria-label="Room"></label>
        <span class="task"><textarea class="task-title" rows="1" placeholder="To-do" aria-label="To-do">${esc(data.title || "")}</textarea><button class="task-chevron" type="button" data-toggle aria-expanded="${data.open ? "true" : "false"}" aria-label="${data.open ? "Hide to-do" : "Show to-do"}"><svg class="i task-chev" width="14" height="14"><use href="#i-chevron"/></svg></button></span>
        <span class="type">${esc(data.type || "Housekeeping")}</span>
        <span class="drop" data-todo-menu>
          <button class="urgency-hit" type="button" data-todo-button aria-haspopup="menu" aria-expanded="false" aria-label="Urgency">${urgencyChip(data.urgency || "standard")}</button>
          <div class="menu todo-menu-panel" role="menu" hidden>${menuUrgency(data.urgency || "standard")}</div>
        </span>
        <span class="drop" data-todo-menu>
          <button class="status" type="button" data-todo-button aria-haspopup="menu" aria-expanded="false" aria-label="Status, ${esc(STATUS[data.status || "open"].label)}">${STATUS[data.status || "open"].icon}</button>
          <div class="menu todo-menu-panel" role="menu" hidden>${menuStatus(data.status || "open")}</div>
        </span>
        <span class="drop" data-todo-menu>
          <button class="assign" type="button" data-todo-button aria-haspopup="menu" aria-expanded="false" aria-label="Assigned">${personButton(data.assignee)}</button>
          <div class="menu todo-menu-panel" role="menu" hidden>${menuPeople(data.assignee || "")}</div>
        </span>
        <span class="opened cell-quiet">${esc(data.opened || "now")}</span>
        <button class="note-more" type="button" data-more aria-haspopup="menu" aria-expanded="false" aria-label="More"><svg class="i" width="14" height="14"><use href="#i-dots"/></svg></button>
      </div>
      <div class="todo-detail"${data.open ? "" : " hidden"}>
        <div class="todo-copy">
          <label class="todo-label" for="desc-${esc(data.id)}">Description</label>
          <textarea class="todo-desc" id="desc-${esc(data.id)}" placeholder="${data.draft ? "New to-do" : "Add a description"}">${esc(data.description || "")}</textarea>
          <div class="todo-tools">
            <span class="drop" data-todo-menu>
              <button class="btn btn-secondary" type="button" data-todo-button aria-haspopup="menu" aria-expanded="false"><svg class="i" width="14" height="14"><use href="#i-calendar"/></svg>Schedule for a future date</button>
              <div class="menu todo-menu-panel" role="menu" hidden><label class="schedule-field">Date<input type="date" data-schedule value="${esc(data.date || "")}"></label></div>
            </span>
            <button class="btn btn-secondary btn-icon" type="button" data-attach aria-label="Attach a file"><svg class="i" width="14" height="14"><use href="#i-upload"/></svg></button>
            <input class="file" type="file" hidden>
            <span class="todo-when"></span>
          </div>
          <p class="todo-file" hidden></p>
        </div>
        <div class="todo-activity">
          <div class="activity-head">
            <span>Activity</span>
            <span class="drop view-edit" data-todo-menu>
              <button class="chip view-pick" type="button" data-todo-button aria-haspopup="menu" aria-expanded="false" aria-label="Viewed by"><svg class="i view-eye" width="18" height="18" aria-hidden="true"><use href="#i-eye"/></svg><span class="view-count">0</span><svg class="i meta-chevron" width="10" height="10"><use href="#i-chevron"/></svg></button>
              <div class="menu view-menu todo-menu-panel" role="menu" hidden>${viewerMenu()}</div>
            </span>
          </div>
          <div class="activity-list">${activityHTML(data.activity)}</div>
          <form class="msg" data-composer>
            <span class="lead"><button class="well" type="button" aria-label="Add"><svg class="i" width="16" height="16"><use href="#i-plus"/></svg></button><input aria-label="Write a comment" placeholder="Write a comment..."></span>
            <button class="well" type="submit" aria-label="Send"><svg class="i" width="16" height="16"><use href="#i-up"/></svg></button>
          </form>
        </div>
        <div class="todo-foot">
          <button class="todo-delete" type="button" data-delete><svg class="i" width="14" height="14"><use href="#i-trash"/></svg>Delete</button>
        </div>
      </div>
    </div></div>`;
  if (data.open) todo.classList.add("is-open");
  if (data.room === "—") todo.querySelector(".room input").classList.add("cell-quiet");
  return todo;
}

function fitTitle(field) {
  field.style.height = "auto";
  field.style.height = `${field.scrollHeight}px`;
}

function selectedBucket() {
  return tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.bucket || "open";
}

function selectedTypes() {
  return [...(filterMenu?.querySelectorAll('[data-filter-pick="type"][aria-checked="true"]') || [])].map((item) => item.dataset.value);
}

function matchesType(todo) {
  const types = selectedTypes();
  return types.length === 0 || types.includes(todo.dataset.type);
}

function todoText(todo) {
  return todo.textContent.toLowerCase();
}

function applyFilters() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  const bucket = selectedBucket();
  const totals = { open: 0, scheduled: 0, completed: 0 };
  let visible = 0;
  for (const todo of list.querySelectorAll(":scope > .todo")) {
    const typeMatch = matchesType(todo);
    if (typeMatch) totals[todo.dataset.bucket] = (totals[todo.dataset.bucket] || 0) + 1;
    const show = typeMatch && todo.dataset.bucket === bucket && (!query || todoText(todo).includes(query));
    if (!todo.classList.contains("is-leaving")) todo.hidden = !show;
    if (show) visible += 1;
  }
  if (empty) empty.hidden = visible !== 0;
  if (count) count.textContent = String(list.querySelectorAll(":scope > .todo").length);
  for (const tab of tabs) {
    const badge = tab.querySelector("[data-bucket-count]");
    if (badge) badge.textContent = String(totals[tab.dataset.bucket] || 0);
  }
  placeFades();
}

function syncBucket(todo) {
  if (todo.dataset.status === "complete") todo.dataset.bucket = "completed";
  else if (todo.dataset.date) todo.dataset.bucket = "scheduled";
  else todo.dataset.bucket = "open";
}

function hideIfFiltered(todo) {
  const bucket = selectedBucket();
  const stays = todo.dataset.bucket === bucket && matchesType(todo);
  if (stays) {
    applyFilters();
    return;
  }
  if (reduceMotion) {
    applyFilters();
    return;
  }
  todo.classList.add("is-leaving");
  const clip = todo.querySelector(".todo-clip");
  const finish = (event) => {
    if (event && event.propertyName !== "grid-template-rows") return;
    todo.hidden = true;
    todo.classList.remove("is-leaving");
    applyFilters();
  };
  clip.addEventListener("transitionend", finish, { once: true });
  window.setTimeout(() => {
    if (todo.classList.contains("is-leaving")) finish();
  }, 260);
}

function setOpen(todo, open) {
  todo.classList.toggle("is-open", open);
  const row = todo.querySelector(".todo-row");
  const detail = todo.querySelector(".todo-detail");
  row.setAttribute("aria-expanded", open ? "true" : "false");
  const toggle = todo.querySelector("[data-toggle]");
  toggle?.setAttribute("aria-expanded", open ? "true" : "false");
  toggle?.setAttribute("aria-label", open ? "Hide to-do" : "Show to-do");
  detail.hidden = !open;
  if (open) fitTitle(todo.querySelector(".task-title"));
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
  for (const menu of document.querySelectorAll("[data-todo-menu]")) {
    if (menu === except) continue;
    menu.querySelector("[data-todo-button]")?.setAttribute("aria-expanded", "false");
    const panel = menu.querySelector(".menu");
    if (panel) panel.hidden = true;
  }
  for (const more of document.querySelectorAll("[data-more]")) more.setAttribute("aria-expanded", "false");
  if (rowMenu) rowMenu.hidden = true;
}

function placePanel(panel, x, y) {
  panel.hidden = false;
  panel.style.left = "0px";
  panel.style.top = "0px";
  const box = panel.getBoundingClientRect();
  const left = Math.max(8, Math.min(x, window.innerWidth - box.width - 8));
  const top = Math.max(8, Math.min(y, window.innerHeight - box.height - 8));
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

function openRowMenu(x, y, target, more) {
  menuTarget = target;
  closePanels();
  if (more) more.setAttribute("aria-expanded", "true");
  placePanel(rowMenu, x, y);
}

function paintUrgency(todo) {
  const button = todo.querySelector(".urgency-hit");
  button.innerHTML = urgencyChip(todo.dataset.urgency);
  button.setAttribute("aria-label", `Urgency, ${URGENCY[todo.dataset.urgency]}`);
}

function paintStatus(todo) {
  const button = todo.querySelector(".status");
  const status = STATUS[todo.dataset.status];
  button.innerHTML = status.icon;
  button.setAttribute("aria-label", `Status, ${status.label}`);
}

function paintAssignee(todo) {
  const button = todo.querySelector(".assign");
  button.innerHTML = personButton(todo.dataset.assignee);
}

function formatDate(iso) {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function paintWhen(todo) {
  const when = todo.querySelector(".todo-when");
  const opened = todo.querySelector(".opened");
  if (todo.dataset.date) {
    const label = formatDate(todo.dataset.date);
    when.textContent = label;
    opened.textContent = label;
  } else {
    when.textContent = "";
    opened.textContent = todo.dataset.opened || "now";
  }
}

const COMPLETE_HOLD = 700;
const settleTimers = new WeakMap();

function clearSettle(todo) {
  const timer = settleTimers.get(todo);
  if (timer) window.clearTimeout(timer);
  settleTimers.delete(todo);
  delete todo.dataset.settling;
}

function choose(todo, kind, value) {
  if (kind === "urgency") {
    todo.dataset.urgency = value;
    paintUrgency(todo);
  }
  if (kind === "status") {
    clearSettle(todo);
    todo.dataset.status = value;
    paintStatus(todo);
    if (value === "complete" && selectedBucket() !== "completed") {
      todo.dataset.settling = "1";
      const timer = window.setTimeout(() => {
        settleTimers.delete(todo);
        delete todo.dataset.settling;
        if (!todo.isConnected || todo.dataset.status !== "complete") return;
        syncBucket(todo);
        hideIfFiltered(todo);
      }, COMPLETE_HOLD);
      settleTimers.set(todo, timer);
      return;
    }
    syncBucket(todo);
    hideIfFiltered(todo);
    return;
  }
  if (kind === "assignee") {
    todo.dataset.assignee = value;
    paintAssignee(todo);
  }
}

function assignUnowned() {
  for (const todo of list.querySelectorAll(":scope > .todo")) {
    if (todo.dataset.assignee) continue;
    todo.dataset.assignee = "mark";
    paintAssignee(todo);
    const menu = todo.querySelector('[data-kind="assignee"]')?.closest(".menu");
    if (!menu) continue;
    for (const item of menu.querySelectorAll("[data-kind=assignee]")) {
      item.setAttribute("aria-checked", item.dataset.value === "mark" ? "true" : "false");
    }
  }
}

function paintTypeChips() {
  chips.replaceChildren();
  for (const value of selectedTypes()) {
    const chip = document.createElement("button");
    chip.className = "chip chip-filter";
    chip.type = "button";
    chip.innerHTML = `<span class="chip-k">Type</span>: ${esc(value)} <svg class="i x" width="10" height="10"><use href="#i-plus"/></svg>`;
    chip.addEventListener("click", () => {
      const item = [...filterMenu.querySelectorAll("[data-filter-pick=type]")].find((node) => node.dataset.value === value);
      item?.setAttribute("aria-checked", "false");
      paintTypeChips();
      applyFilters();
    });
    chips.append(chip);
  }
}

function urgencyRank(todo) {
  return { urgent: 0, high: 1, standard: 2, low: 3 }[todo.dataset.urgency] ?? 4;
}

function sortTodos() {
  const rows = [...list.querySelectorAll(":scope > .todo")];
  rows.sort((a, b) => {
    if (sortMode === "none") return Number(a.dataset.order) - Number(b.dataset.order);
    const diff = urgencyRank(a) - urgencyRank(b);
    if (diff) return sortMode === "ascending" ? diff : -diff;
    return Number(a.dataset.order) - Number(b.dataset.order);
  });
  for (const row of rows) list.append(row);
}

function addComment(todo, text) {
  const item = document.createElement("div");
  item.className = "comment";
  item.innerHTML = `<div class="comment-inner"><span class="avatar mini">SM</span><span class="person-copy"><span class="mini-line">Sarah <span class="meta-k">now</span></span><p>${esc(text)}</p></span><button class="note-more" type="button" data-more aria-haspopup="menu" aria-expanded="false" aria-label="More"><svg class="i" width="14" height="14"><use href="#i-dots"/></svg></button></div>`;
  todo.querySelector(".activity-list").append(item);
}

function removeTarget(target) {
  if (target.classList.contains("comment")) {
    if (reduceMotion) {
      target.remove();
      return;
    }
    target.classList.add("is-leaving");
    const done = (event) => {
      if (event && event.propertyName !== "grid-template-rows") return;
      target.remove();
    };
    target.addEventListener("transitionend", done, { once: true });
    window.setTimeout(() => { if (target.isConnected) target.remove(); }, 240);
    return;
  }
  const finish = () => {
    target.remove();
    applyFilters();
    if (!list.querySelector(".todo")) createTodo();
  };
  if (reduceMotion) {
    finish();
    return;
  }
  target.classList.add("is-leaving");
  const clip = target.querySelector(".todo-clip");
  const done = (event) => {
    if (event && event.propertyName !== "grid-template-rows") return;
    finish();
  };
  clip.addEventListener("transitionend", done, { once: true });
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
    : (target.querySelector(".task-title")?.value.trim() || "this to-do");
  copy.textContent = `“${name}” will be permanently removed for the whole team.`;
  confirmDialog.classList.remove("is-closing");
  confirmDialog.showModal();
}

function closeConfirm() {
  if (!confirmDialog.open || confirmDialog.classList.contains("is-closing")) return;
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
    assignee: autoAssign?.getAttribute("aria-pressed") === "true" ? "mark" : "",
    opened: "now",
    description: "",
    open: true,
    draft: true,
    activity: [],
  });
  if (!reduceMotion) todo.classList.add("is-entering");
  list.prepend(todo);
  fitTitle(todo.querySelector(".task-title"));
  if (!reduceMotion) {
    todo.getBoundingClientRect();
    todo.classList.remove("is-entering");
  }
  applyFilters();
  todo.querySelector(".task-title").focus();
  scroll.scrollTop = 0;
}

function placeFades() {
  if (!scroll || !fade) return;
  const down = scroll.scrollHeight - scroll.clientHeight;
  const across = scroll.scrollWidth - scroll.clientWidth;
  fade.classList.toggle("is-fade-bottom", down > 1 && scroll.scrollTop < down - 1);
  fade.classList.toggle("is-fade-right", across > 1 && scroll.scrollLeft < across - 1);
}

for (const data of SEED) {
  const todo = buildTodo(data);
  list.append(todo);
  fitTitle(todo.querySelector(".task-title"));
  if (data.date) paintWhen(todo);
}
applyFilters();

document.querySelector("[data-new]")?.addEventListener("click", createTodo);
document.querySelector("[data-print]")?.addEventListener("click", () => window.print());

autoAssign?.addEventListener("click", () => {
  const on = autoAssign.getAttribute("aria-pressed") !== "true";
  autoAssign.setAttribute("aria-pressed", on ? "true" : "false");
  if (on) assignUnowned();
});

sortButton?.addEventListener("click", () => {
  sortMode = sortMode === "none" ? "ascending" : sortMode === "ascending" ? "descending" : "none";
  sortButton.setAttribute("aria-sort", sortMode);
  sortTodos();
});

searchInput?.addEventListener("input", applyFilters);
searchInput?.form?.querySelector(".clear")?.addEventListener("click", applyFilters);

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    for (const other of tabs) other.setAttribute("aria-selected", other === tab ? "true" : "false");
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
  if (choice.dataset.filterPick === "type") {
    paintTypeChips();
    applyFilters();
  }
});

list.addEventListener("click", (event) => {
  const todo = event.target.closest(".todo");
  if (!todo) return;

  if (event.target.closest("[data-toggle]")) {
    setOpen(todo, !todo.classList.contains("is-open"));
    return;
  }
  if (event.target.closest("[data-delete]")) {
    askDelete(todo);
    return;
  }
  if (event.target.closest("[data-attach]")) {
    todo.querySelector(".file").click();
    return;
  }

  const menuButton = event.target.closest("[data-todo-button]");
  if (menuButton) {
    const wrap = menuButton.closest("[data-todo-menu]");
    const panel = wrap.querySelector(".menu");
    const open = menuButton.getAttribute("aria-expanded") === "true";
    closePanels();
    if (!open) {
      menuButton.setAttribute("aria-expanded", "true");
      const box = menuButton.getBoundingClientRect();
      placePanel(panel, box.left, box.bottom + 4);
    }
    return;
  }

  const choice = event.target.closest("[data-kind]");
  if (choice) {
    const panel = choice.closest(".menu");
    for (const other of panel.querySelectorAll("[aria-checked]")) {
      other.setAttribute("aria-checked", other === choice ? "true" : "false");
    }
    choose(todo, choice.dataset.kind, choice.dataset.value);
    closePanels();
    return;
  }

  if (event.target.closest("input, textarea, button, a, .menu")) return;
  if (!todo.classList.contains("is-open")) setOpen(todo, true);
});

list.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const row = event.target.closest(".todo-row");
  if (!row || event.target !== row) return;
  setOpen(row.closest(".todo"), row.getAttribute("aria-expanded") !== "true");
});

list.addEventListener("input", (event) => {
  if (event.target.classList.contains("task-title")) fitTitle(event.target);
  const form = event.target.closest("[data-composer]");
  if (form) form.classList.toggle("has-value", event.target.value.trim().length > 0);
  if (event.target.matches("[data-schedule]")) {
    const todo = event.target.closest(".todo");
    todo.dataset.date = event.target.value;
    syncBucket(todo);
    paintWhen(todo);
    closePanels();
    hideIfFiltered(todo);
  }
  const room = event.target.closest(".room input");
  if (room) room.classList.toggle("cell-quiet", room.value === "—" || room.value === "");
});

list.addEventListener("change", (event) => {
  if (!event.target.classList.contains("file")) return;
  const file = event.target.files?.[0];
  const line = event.target.closest(".todo").querySelector(".todo-file");
  if (!file) {
    line.hidden = true;
    line.textContent = "";
    return;
  }
  line.hidden = false;
  line.textContent = file.name;
});

list.addEventListener("submit", (event) => {
  const form = event.target.closest(".todo [data-composer]");
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector("input");
  const text = input.value.trim();
  if (!text) return;
  addComment(form.closest(".todo"), text);
  input.value = "";
  form.classList.remove("has-value");
});

document.addEventListener("click", (event) => {
  const more = event.target.closest("[data-more]");
  if (more) {
    const open = more.getAttribute("aria-expanded") === "true";
    const target = more.closest(".comment") || more.closest(".todo");
    if (open) closePanels();
    else {
      const box = more.getBoundingClientRect();
      openRowMenu(box.right - 132, box.bottom + 4, target, more);
    }
    return;
  }
  if (event.target.closest("#row-menu")) {
    if (event.target.closest("[data-menu-delete]") && menuTarget) askDelete(menuTarget);
    closePanels();
    return;
  }
  if (event.target.closest("[data-filter-menu]")) return;
  if (!event.target.closest("[data-todo-menu]")) closePanels();
});

document.addEventListener("contextmenu", (event) => {
  const comment = event.target.closest(".comment");
  if (comment) {
    event.preventDefault();
    openRowMenu(event.clientX, event.clientY, comment);
    return;
  }
  const row = event.target.closest(".todo-row");
  if (!row) return;
  event.preventDefault();
  openRowMenu(event.clientX, event.clientY, row.closest(".todo"));
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
  if (choice || event.target === confirmDialog) closeConfirm();
});

confirmDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  pendingDelete = null;
  closeConfirm();
});

scroll?.addEventListener("scroll", () => {
  closePanels();
  placeFades();
}, { passive: true });
window.addEventListener("resize", () => {
  closePanels();
  placeFades();
  applyPanelLimits();
});

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
    document.body.classList.remove("is-side-settling");
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
  const observer = new ResizeObserver(update);
  observer.observe(el);
  for (const child of el.children) observer.observe(child);
}

const sideScroll = document.querySelector(".side-scroll");
if (sideScroll) edgeFade(sideScroll, "y");

const deptStrip = document.querySelector(".page-filters .tabs");
if (deptStrip) {
  edgeFade(deptStrip, "x");
  const host = deptStrip.parentElement;
  const thumb = document.createElement("div");
  thumb.className = "tabs-bar-thumb";
  thumb.setAttribute("aria-hidden", "true");
  thumb.hidden = true;
  host.append(thumb);
  const placeThumb = () => {
    const max = deptStrip.scrollWidth - deptStrip.clientWidth;
    if (max <= 1) {
      thumb.hidden = true;
      return;
    }
    thumb.hidden = false;
    const inset = 2;
    const track = deptStrip.clientWidth - inset * 2;
    const size = Math.max(32, track * (deptStrip.clientWidth / deptStrip.scrollWidth));
    const x = inset + (deptStrip.scrollLeft / max) * (track - size);
    thumb.style.width = `${size}px`;
    thumb.style.transform = `translateX(${x}px)`;
  };
  placeThumb();
  deptStrip.addEventListener("scroll", placeThumb, { passive: true });
  new ResizeObserver(placeThumb).observe(deptStrip);
}

new ResizeObserver(placeFades).observe(scroll);
