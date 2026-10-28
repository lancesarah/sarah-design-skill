const rows = [...document.querySelectorAll("[data-note]")];
const search = document.querySelector(".page-head .search input");
const count = document.querySelector("[data-count]");
const deptTabs = [...document.querySelectorAll(".page-filters [data-dept]")];

function selectedDept() {
  return deptTabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.dept || "All";
}

function applyFilters() {
  const query = (search?.value || "").trim().toLowerCase();
  const dept = selectedDept();
  const totals = {};
  for (const title of rows) {
    const cells = [title, title.nextElementSibling, title.nextElementSibling?.nextElementSibling, title.nextElementSibling?.nextElementSibling?.nextElementSibling];
    const text = cells.map((cell) => cell?.textContent || "").join(" ").toLowerCase();
    const rowDept = (title.nextElementSibling?.textContent || "").trim();
    totals[rowDept] = (totals[rowDept] || 0) + 1;
    const match = (!query || text.includes(query)) && (dept === "All" || rowDept === dept);
    for (const cell of cells) if (cell) cell.hidden = !match;
  }
  if (count) count.textContent = String(rows.length);
  for (const tab of deptTabs) {
    const badge = tab.querySelector("[data-dept-count]");
    if (!badge) continue;
    badge.textContent = tab.dataset.dept === "All" ? String(rows.length) : String(totals[tab.dataset.dept] || 0);
  }
}

search?.addEventListener("input", applyFilters);
for (const tab of deptTabs) {
  tab.addEventListener("click", () => {
    for (const other of deptTabs) other.setAttribute("aria-selected", other === tab ? "true" : "false");
    applyFilters();
  });
}

function selectNote(title) {
  for (const other of rows) other.setAttribute("aria-pressed", other === title ? "true" : "false");
  const id = title.dataset.note;
  let matched = false;
  for (const panel of document.querySelectorAll("[data-detail]")) {
    const on = panel.dataset.detail === id;
    panel.hidden = !on;
    if (on) matched = true;
  }
  if (!matched) {
    const fresh = document.querySelector("[data-detail]");
    fresh.hidden = false;
    fresh.querySelector(".meta-v").textContent = title.childNodes[0].textContent.trim();
    fresh.querySelector("p").textContent = "New note. Write the first reply below.";
    const comment = fresh.querySelector(".comment");
    if (comment) comment.hidden = true;
  }
}

for (const title of rows) title.addEventListener("click", () => selectNote(title));

const lanceInput = document.querySelector(".lance input");
for (const chip of document.querySelectorAll("[data-suggest]")) {
  chip.addEventListener("click", () => {
    if (!lanceInput) return;
    lanceInput.value = chip.textContent.trim();
    lanceInput.dispatchEvent(new Event("input"));
    lanceInput.focus();
  });
}

const sideLinks = [...document.querySelectorAll(".side .side-links a")];
for (const link of sideLinks) {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    for (const other of sideLinks) {
      if (other === link) other.setAttribute("aria-current", "page");
      else other.removeAttribute("aria-current");
    }
  });
}

const collapseButton = document.querySelector(".side-top [data-side-collapse]");

function setSideCollapsed(collapsed) {
  document.body.classList.toggle("is-side-collapsed", collapsed);
  document.body.classList.remove("is-side-settling");
  collapseButton?.setAttribute("aria-expanded", collapsed ? "false" : "true");
  collapseButton?.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
}

collapseButton?.addEventListener("click", () => {
  setSideCollapsed(!document.body.classList.contains("is-side-collapsed"));
});

const lanceCollapse = document.querySelector("#lance [data-lance-collapse]");

function setLanceCollapsed(collapsed) {
  document.body.classList.toggle("is-lance-collapsed", collapsed);
  lanceCollapse?.setAttribute("aria-expanded", collapsed ? "false" : "true");
  lanceCollapse?.setAttribute("aria-label", collapsed ? "Open chat" : "Collapse chat");
}

lanceCollapse?.addEventListener("click", () => {
  setLanceCollapsed(!document.body.classList.contains("is-lance-collapsed"));
});

function edgeFade(el, axis) {
  const update = () => {
    const max = axis === "x" ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
    const pos = axis === "x" ? el.scrollLeft : el.scrollTop;
    const fade = el.closest(".side-scroll-frame") || el;
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
const deptStrip = document.querySelector(".page-filters .tabs");
if (deptStrip) edgeFade(deptStrip, "x");

document.querySelector("[data-new]")?.addEventListener("click", () => {
  const title = prompt("Note title");
  if (!title) return;
  const grid = document.querySelector(".notes-grid");
  const button = document.createElement("button");
  button.className = "row cell-task";
  button.type = "button";
  button.setAttribute("role", "row");
  button.dataset.note = "new-" + Date.now();
  button.innerHTML = title + ' <svg class="i chev" width="14" height="14"><use href="#i-chevron"/></svg>';
  const dept = document.createElement("div");
  dept.className = "row";
  dept.innerHTML = '<span class="dept">Front Desk</span>';
  const replies = document.createElement("div");
  replies.className = "row";
  replies.textContent = "0";
  const opened = document.createElement("div");
  opened.className = "row cell-open";
  opened.textContent = "now";
  grid.append(button, dept, replies, opened);
  rows.push(button);
  button.addEventListener("click", () => selectNote(button));
  selectNote(button);
  applyFilters();
});

for (const host of document.querySelectorAll(".tip-host")) {
  const settle = () => host.classList.add("is-quiet", "is-settled");
  host.addEventListener("pointerdown", () => host.classList.add("is-quiet"));
  host.addEventListener("click", () => {
    settle();
    host.blur();
  });
  host.addEventListener("pointerleave", () => host.classList.remove("is-quiet", "is-settled"));
  host.addEventListener("blur", () => {
    if (!host.matches(":hover")) host.classList.remove("is-quiet", "is-settled");
  });
}

for (const host of document.querySelectorAll(".side .tip-host")) {
  const tip = host.querySelector(".tip");
  if (!tip) continue;
  let placeFrame = 0;
  const place = () => {
    placeFrame = 0;
    if (host.classList.contains("is-quiet")) return;
    const rect = host.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(host).getPropertyValue("--tip-gap")) || 8;
    tip.style.left = `${rect.right + gap}px`;
    tip.style.top = `${rect.top + rect.height / 2}px`;
  };
  let followUntil = 0;
  const follow = (until) => {
    const tick = (now) => {
      if (followUntil !== until) return;
      place();
      if (now < until) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const placeNext = () => {
    if (host.classList.contains("is-quiet")) return;
    cancelAnimationFrame(placeFrame);
    placeFrame = requestAnimationFrame(place);
  };
  host.addEventListener("mouseenter", () => {
    followUntil = performance.now() + 200;
    follow(followUntil);
  });
  host.addEventListener("focus", placeNext);
  host.addEventListener("pointerdown", () => {
    followUntil = 0;
    cancelAnimationFrame(placeFrame);
  });
}
