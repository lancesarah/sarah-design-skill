for (const col of document.querySelectorAll(".col")) {
  for (const child of [...col.children]) {
    if (child.classList.contains("k") || child.classList.contains("frame")) continue;
    const frame = document.createElement("div");
    frame.className = "frame";
    child.replaceWith(frame);
    frame.append(child);
  }
}

for (const menu of document.querySelectorAll("[data-menu]")) {
  const button = menu.querySelector("[data-menu-button]");
  const panel = menu.querySelector(".menu");
  const label = button.querySelector("[data-menu-label]");
  const icon = button.querySelector("[data-menu-icon]");
  const search = panel.querySelector("[data-menu-search]");

  const filterOptions = () => {
    if (!search) return;
    const query = search.value.trim().toLowerCase();
    for (const option of panel.querySelectorAll("[data-value]")) {
      option.hidden = query.length > 0 && !option.dataset.value.toLowerCase().includes(query);
    }
  };

  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    closeMenus();
    if (!open) {
      button.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      if (search) search.focus();
    }
  });

  if (search) search.addEventListener("input", filterOptions);

  panel.addEventListener("click", (event) => {
    const item = event.target.closest("[data-value]");
    if (!item) return;
    if (button.getAttribute("aria-label") === "Filters") {
      const on = item.getAttribute("aria-checked") === "true";
      item.setAttribute("role", "menuitemcheckbox");
      item.setAttribute("aria-checked", on ? "false" : "true");
      return;
    }
    if (label) {
      label.textContent = item.dataset.value;
      label.classList.toggle("dim", item.dataset.value === "Anytime");
    }
    if (icon && item.dataset.icon) icon.setAttribute("href", item.dataset.icon);
    for (const other of panel.querySelectorAll("[aria-checked]")) {
      other.setAttribute("aria-checked", other === item ? "true" : "false");
    }
    button.setAttribute("aria-expanded", "false");
    panel.hidden = true;
  });
}

function closeMenus() {
  for (const menu of document.querySelectorAll("[data-menu]")) {
    menu.querySelector("[data-menu-button]").setAttribute("aria-expanded", "false");
    const panel = menu.querySelector(".menu");
    panel.hidden = true;
    const search = panel.querySelector("[data-menu-search]");
    if (search && search.value) {
      search.value = "";
      search.dispatchEvent(new Event("input"));
    }
  }
}

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-menu]")) closeMenus();
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !event.altKey) {
    const input = document.querySelector(".side-search input");
    if (input) {
      event.preventDefault();
      if (document.body.classList.contains("is-side-collapsed")) {
        document.querySelector(".side-top [data-side-collapse]")?.click();
      }
      input.focus();
      input.select();
    }
  }
  const typing = event.target.closest("input, textarea, [contenteditable='true']");
  if (event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey && !typing) {
    if (event.code === "KeyM") {
      event.preventDefault();
      goNav("Messages");
    }
    if (event.code === "KeyN") {
      event.preventDefault();
      goNav("Notifications");
    }
  }
  if (event.key === "Escape") closeMenus();
  const tab = event.target.closest("[role=tab]");
  if (!tab || !event.key.startsWith("Arrow") && event.key !== "Home" && event.key !== "End") return;
  const tabs = [...tab.parentElement.querySelectorAll("[role=tab]")];
  let index = tabs.indexOf(tab);
  if (event.key === "ArrowRight") index = (index + 1) % tabs.length;
  if (event.key === "ArrowLeft") index = (index - 1 + tabs.length) % tabs.length;
  if (event.key === "Home") index = 0;
  if (event.key === "End") index = tabs.length - 1;
  tabs[index].focus();
  tabs[index].click();
  event.preventDefault();
});

let keysTimer = 0;
const keysChangeState = (event) => {
  const field = event.target.closest("input, textarea, [contenteditable='true']");
  if (event.metaKey || event.ctrlKey || event.altKey) return true;
  if (!field) return true;
  return event.key === "Enter" || event.key === "Escape" || event.key === "Tab" || event.key.startsWith("Arrow") || event.key === "Home" || event.key === "End";
};
document.addEventListener("keydown", (event) => {
  if (!keysChangeState(event)) return;
  document.documentElement.classList.add("is-keys");
  window.clearTimeout(keysTimer);
  keysTimer = window.setTimeout(() => document.documentElement.classList.remove("is-keys"), 200);
});
document.addEventListener("pointerdown", () => {
  window.clearTimeout(keysTimer);
  document.documentElement.classList.remove("is-keys");
}, true);

for (const group of document.querySelectorAll("[data-tabs]")) {
  group.addEventListener("click", (event) => {
    const tab = event.target.closest("[role=tab]");
    if (!tab) return;
    for (const other of group.querySelectorAll("[role=tab]")) {
      other.setAttribute("aria-selected", other === tab ? "true" : "false");
    }
  });
}

/* A sliding fill for segmented controls, tabs, and paired buttons.
   The edge facing the new option leads. Keyboard moves snap. */
const mountSlide = (track, selector) => {
  if (!track || track.querySelector(":scope > .slide-pill")) return;
  const pill = document.createElement("span");
  pill.className = "slide-pill";
  pill.setAttribute("aria-hidden", "true");
  track.prepend(pill);
  track.classList.add("has-slide");
  const items = () => [...track.querySelectorAll(`:scope > ${selector}`)];
  const chosen = () => items().find((el) => el.getAttribute("aria-selected") === "true" || el.getAttribute("aria-pressed") === "true");
  let ready = false;
  const place = (animate) => {
    const btn = chosen();
    if (!btn || !btn.offsetWidth) {
      pill.style.opacity = "0";
      return;
    }
    const x = btn.offsetLeft;
    const w = btn.offsetWidth;
    const prev = parseFloat(pill.style.left) || 0;
    const snap = !ready || !animate || document.documentElement.classList.contains("is-keys") || matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!snap && x !== prev) pill.dataset.dir = x > prev ? "right" : "left";
    if (snap) pill.style.transition = "none";
    pill.style.opacity = "1";
    pill.style.top = `${btn.offsetTop}px`;
    pill.style.height = `${btn.offsetHeight}px`;
    pill.style.left = `${x}px`;
    pill.style.right = `${track.clientWidth - x - w}px`;
    if (snap) {
      ready = true;
      void pill.offsetWidth;
      pill.style.transition = "";
    }
  };
  const ro = new ResizeObserver(() => place(false));
  ro.observe(track);
  for (const el of items()) ro.observe(el);
  const mo = new MutationObserver(() => place(true));
  for (const el of items()) mo.observe(el, { attributes: true, attributeFilter: ["aria-selected", "aria-pressed"] });
  place(false);

  let press = null;
  let dragged = false;
  const at = (x) => {
    let best = null;
    let dist = Infinity;
    for (const el of items()) {
      if (el.disabled) continue;
      const r = el.getBoundingClientRect();
      const d = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
      if (d < dist) {
        dist = d;
        best = el;
      }
    }
    return best;
  };
  track.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const opt = event.target.closest(selector);
    if (!opt || !track.contains(opt)) return;
    press = { id: event.pointerId, x: event.clientX };
    dragged = false;
    track.setAttribute("data-pressed", "");
  });
  track.addEventListener("pointermove", (event) => {
    if (!press || press.id !== event.pointerId) return;
    if (Math.abs(event.clientX - press.x) < 4) return;
    dragged = true;
    const opt = at(event.clientX);
    if (!opt) return;
    if (opt.getAttribute("aria-selected") === "true" || opt.getAttribute("aria-pressed") === "true") return;
    opt.click();
  });
  const endPress = (event) => {
    if (!press || event.pointerId !== press.id) return;
    press = null;
    track.removeAttribute("data-pressed");
  };
  track.addEventListener("pointerup", endPress);
  track.addEventListener("pointercancel", endPress);
  track.addEventListener("click", (event) => {
    if (!dragged) return;
    dragged = false;
    event.stopPropagation();
    event.preventDefault();
  }, true);
};

for (const group of document.querySelectorAll(".segmented")) mountSlide(group, ".segment");
for (const group of document.querySelectorAll(".tabs")) {
  if (group.querySelector(":scope > .tab")) mountSlide(group, ".tab");
}
for (const bar of document.querySelectorAll(".dev-switch")) {
  const kids = [...bar.children];
  let group = [];
  const flush = () => {
    if (group.length > 1) {
      const wrap = document.createElement("span");
      wrap.className = "slide-group";
      group[0].before(wrap);
      for (const button of group) wrap.append(button);
      mountSlide(wrap, "button");
    }
    group = [];
  };
  for (const el of kids) {
    if (el.matches("button")) group.push(el);
    else flush();
  }
  flush();
}

const NAV_SECTIONS = {
  home: "Home",
  messages: "Messages",
  notifications: "Notifications",
  boards: "Boards",
  schedule: "Schedule",
  "guest-messages": "Guest messages",
  "wake-up-calls": "Wake-up calls",
  cash: "Cash & bank",
  pm: "PM",
  readings: "Readings",
  knowledge: "Knowledge base",
  sales: "Sales",
};

function linkName(link) {
  return [...link.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function navKeyFrom(href) {
  const url = new URL(href, location.href);
  const file = url.pathname.split("/").pop() || "";
  if (file === "todos-alt.html") return "todos.html";
  if (file === "section.html") return `section:${url.searchParams.get("page") || "home"}`;
  return file;
}

function markNav() {
  const here = navKeyFrom(location.href);
  const links = [...document.querySelectorAll(".side .side-links a")];
  for (const link of links) {
    const on = navKeyFrom(link.getAttribute("href") || "") === here;
    if (on) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  const current = links.filter((link) => link.getAttribute("aria-current") === "page");
  const visible = current.some((link) => {
    const list = link.closest("[data-side-list]");
    return !list || !list.hidden;
  });
  if (!visible && current[0]) {
    const list = current[0].closest("[data-side-list]");
    const button = list?.closest("[data-side-group]")?.querySelector("[data-side-toggle]");
    if (list && button) {
      list.hidden = false;
      button.setAttribute("aria-expanded", "true");
    }
  }
  const page = document.querySelector("[data-section-page]");
  if (!page) return;
  const slug = new URLSearchParams(location.search).get("page") || "home";
  const label = NAV_SECTIONS[slug] || "Home";
  document.title = label;
  const heading = page.querySelector("h1");
  if (heading) heading.textContent = label;
  const mark = page.querySelector(".page-mark");
  const source = [...document.querySelectorAll(".side .side-links a")].find((link) => linkName(link) === label);
  const icon = source?.querySelector("svg");
  if (mark && icon) mark.replaceChildren(icon.cloneNode(true));
}

let navFilterMemory = null;

function filterNav(query) {
  const q = query.trim().toLowerCase();
  const groups = [...document.querySelectorAll(".side [data-side-group]")];
  if (!q) {
    for (const item of document.querySelectorAll(".side .side-item, .side .side-group")) {
      item.classList.remove("is-nav-miss");
    }
    if (navFilterMemory) {
      for (const saved of navFilterMemory) {
        saved.button.setAttribute("aria-expanded", saved.open);
        saved.list.hidden = saved.hidden;
      }
      navFilterMemory = null;
    }
    return;
  }
  if (!navFilterMemory) {
    navFilterMemory = groups.map((group) => {
      const button = group.querySelector("[data-side-toggle]");
      const list = group.querySelector("[data-side-list]");
      return {
        button,
        list,
        open: button?.getAttribute("aria-expanded") || "true",
        hidden: !!list?.hidden,
      };
    });
  }
  for (const group of groups) {
    const button = group.querySelector("[data-side-toggle]");
    const list = group.querySelector("[data-side-list]");
    let shown = 0;
    for (const item of list?.querySelectorAll(":scope > .side-item") || []) {
      const link = item.querySelector("a");
      const match = !!link && linkName(link).toLowerCase().includes(q);
      item.classList.toggle("is-nav-miss", !match);
      if (match) shown += 1;
    }
    group.classList.toggle("is-nav-miss", shown === 0);
    if (shown && button && list) {
      list.hidden = false;
      button.setAttribute("aria-expanded", "true");
    }
  }
  for (const item of document.querySelectorAll(".side-fixed .side-item")) {
    const link = item.querySelector("a");
    item.classList.toggle("is-nav-miss", !link || !linkName(link).toLowerCase().includes(q));
  }
}

function goNav(name) {
  const link = [...document.querySelectorAll(".side .side-links a")].find((item) => linkName(item) === name);
  if (link) location.href = link.href;
}

for (const form of document.querySelectorAll("form.search")) {
  const input = form.querySelector("input");
  const clear = form.querySelector(".clear");
  const sync = () => {
    const filled = input.value.length > 0;
    form.classList.toggle("has-value", filled);
    if (clear) clear.hidden = !filled;
    if (form.classList.contains("side-search")) filterNav(input.value);
  };
  form.addEventListener("submit", (event) => event.preventDefault());
  input.addEventListener("input", sync);
  if (clear) {
    clear.addEventListener("click", () => {
      input.value = "";
      sync();
      input.focus();
    });
  }
}

for (const mic of document.querySelectorAll("[aria-label='Microphone']")) {
  mic.addEventListener("click", () => mic.classList.toggle("is-on"));
}

for (const group of document.querySelectorAll("[data-side-group]")) {
  const button = group.querySelector("[data-side-toggle]");
  const list = group.querySelector("[data-side-list]");
  if (!button || !list) continue;
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", open ? "false" : "true");
    list.hidden = open;
  });
}

for (const host of document.querySelectorAll(".tip-host")) {
  host.addEventListener("click", () => host.classList.add("is-settled"));
  host.addEventListener("pointerleave", () => host.classList.remove("is-quiet", "is-settled"));
  host.addEventListener("blur", () => {
    if (!host.matches(":hover")) host.classList.remove("is-quiet", "is-settled");
  });
}

let tipWarmTimer = 0;
const tipHostFrom = (event) => event.target.closest?.(".tip-host") || null;
const closeTipWarm = () => {
  window.clearTimeout(tipWarmTimer);
  document.documentElement.classList.remove("is-tip-open");
  document.querySelectorAll(".is-tip-source").forEach((host) => host.classList.remove("is-tip-source"));
};
const revealTip = (host) => {
  const tip = host.querySelector(".tip");
  if (!tip || host.classList.contains("is-quiet") || host.classList.contains("is-painting")) return;
  if (!tip.hasAttribute("popover")) tip.popover = "manual";
  const rect = host.getBoundingClientRect();
  const gap = parseFloat(getComputedStyle(host).getPropertyValue("--tip-gap")) || 8;
  const anchor = host.classList.contains("sheet-who") ? (host.querySelector(".avatar") || host) : host;
  const box = anchor.getBoundingClientRect();
  if (host.classList.contains("sheet-status") || host.classList.contains("sheet-who") || host.classList.contains("note-author")) {
    tip.style.left = `${box.left + box.width / 2}px`;
    tip.style.top = `${box.top - gap}px`;
  } else {
    tip.style.left = `${rect.right + gap}px`;
    tip.style.top = `${rect.top + rect.height / 2}px`;
  }
  if (!tip.matches(":popover-open")) tip.showPopover();
};
const hideTip = (host) => {
  const tip = host?.querySelector?.(".tip");
  if (tip?.matches(":popover-open")) tip.hidePopover();
};
document.addEventListener("pointerover", (event) => {
  const host = tipHostFrom(event);
  if (!host || host.contains(event.relatedTarget) || host.classList.contains("is-quiet")) return;
  revealTip(host);
  if (document.documentElement.classList.contains("is-tip-open")) return;
  window.clearTimeout(tipWarmTimer);
  const tip = host.querySelector(".tip");
  const raw = tip ? getComputedStyle(tip).transitionDelay : "0.1s";
  const delay = raw.endsWith("ms") ? parseFloat(raw) : (parseFloat(raw) || 0) * 1000;
  tipWarmTimer = window.setTimeout(() => {
    if (!host.matches(":hover") || host.classList.contains("is-quiet")) return;
    host.classList.add("is-tip-source");
    document.documentElement.classList.add("is-tip-open");
  }, delay);
});
document.addEventListener("pointerout", (event) => {
  const host = tipHostFrom(event);
  if (!host || host.contains(event.relatedTarget) || host.classList.contains("is-painting")) return;
  if (host.matches(":hover") || host.matches(":focus-visible")) return;
  const next = event.relatedTarget?.closest?.(".tip-host");
  if (next && next !== host && !next.classList.contains("is-quiet")) {
    host.classList.remove("is-tip-source");
    if (!host.classList.contains("is-painting")) host.classList.remove("is-quiet", "is-settled");
    revealTip(next);
    hideTip(host);
    return;
  }
  hideTip(host);
  if (!host.classList.contains("is-painting")) host.classList.remove("is-quiet", "is-settled");
  closeTipWarm();
});
document.addEventListener("focusin", (event) => {
  const host = tipHostFrom(event);
  if (host) revealTip(host);
});
document.addEventListener("focusout", (event) => {
  const host = tipHostFrom(event);
  if (!host || host.contains(event.relatedTarget)) return;
  hideTip(host);
});

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

for (const form of document.querySelectorAll("[data-composer]")) {
  const input = form.querySelector("input");
  const sync = () => form.classList.toggle("has-value", input.value.trim().length > 0);
  form.addEventListener("submit", (event) => event.preventDefault());
  input.addEventListener("input", sync);
}

for (const link of document.querySelectorAll(".side .side-links a")) {
  if (link.closest(".side-item")) continue;
  const item = document.createElement("div");
  item.className = "side-item";
  link.before(item);
  item.append(link);
  const actions = document.createElement("span");
  actions.className = "side-actions";
  const inPinned = link.closest(".side-group")?.querySelector(".side-fold")?.textContent.includes("Pinned");
  const pinIcon = inPinned ? "i-unpin" : "i-pin";
  const pinLabel = inPinned ? "Unpin" : "Pin";
  actions.innerHTML = `<button class="side-action" type="button" data-side-drag aria-label="Reorder"><svg class="i" width="14" height="14"><use href="#i-grip"/></svg></button><button class="side-action" type="button" data-side-unpin aria-label="${pinLabel}"><svg class="i" width="14" height="14"><use href="#${pinIcon}"/></svg></button>`;
  item.append(actions);

  actions.querySelector("[data-side-unpin]").addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    item.hidden = true;
  });

  const grip = actions.querySelector("[data-side-drag]");
  grip.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (document.body.classList.contains("is-side-collapsed")) return;
    event.preventDefault();
    const originX = event.clientX;
    const originY = event.clientY;
    const list = item.parentElement;
    let active = null;

    const placeLine = (clientY) => {
      const rows = [...list.querySelectorAll(":scope > .side-item")];
      const from = rows.indexOf(item);
      let to = 0;
      let before = null;
      for (const row of rows) {
        if (row === item) continue;
        const box = row.getBoundingClientRect();
        if (clientY < box.top + box.height / 2) {
          before = row;
          break;
        }
        to += 1;
      }
      if (to === from) {
        active.line.hidden = true;
        active.to = from;
        return;
      }
      const listBox = list.getBoundingClientRect();
      const edge = before ? before.getBoundingClientRect().top : rows.at(-1).getBoundingClientRect().bottom;
      active.line.hidden = false;
      active.line.style.top = `${edge - listBox.top}px`;
      active.to = to;
      active.before = before;
    };

    const onMove = (ev) => {
      if (!active) {
        if (Math.hypot(ev.clientX - originX, ev.clientY - originY) < 4) return;
        const box = link.getBoundingClientRect();
        const ghost = item.cloneNode(true);
        ghost.className = "side-drag";
        ghost.setAttribute("aria-hidden", "true");
        ghost.style.width = `${box.width}px`;
        ghost.style.left = `${box.left}px`;
        ghost.style.top = `${box.top}px`;
        const line = document.createElement("div");
        line.className = "side-drop";
        line.hidden = true;
        list.append(line);
        document.body.append(ghost);
        document.body.classList.add("is-side-reordering");
        item.classList.add("is-dragging");
        active = { ghost, line, originLeft: box.left, originTop: box.top, to: -1, before: null };
      }
      active.ghost.style.left = `${active.originLeft + ev.clientX - originX}px`;
      active.ghost.style.top = `${active.originTop + ev.clientY - originY}px`;
      placeLine(ev.clientY);
    };

    const finish = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      if (!active) return;
      const { ghost, line, before } = active;
      active = null;
      if (!line.hidden) list.insertBefore(item, before);
      ghost.remove();
      line.remove();
      item.classList.remove("is-dragging");
      document.body.classList.remove("is-side-reordering");
    };

    try { grip.setPointerCapture(event.pointerId); } catch { /* the window listeners still receive the release */ }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
  });
}

/* Arm the thumb bounce on the click, before the pressed state flips. */
document.addEventListener("click", (event) => {
  const toggle = event.target.closest(".theme-switch");
  if (toggle) toggle.classList.add("is-init");
}, true);

const themeSwitches = [...document.querySelectorAll("[data-theme-toggle]")];
const themeOn = () => document.documentElement.dataset.theme === "dark";
const applyTheme = (dark) => {
  if (dark) document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
  for (const toggle of themeSwitches) toggle.setAttribute("aria-pressed", dark ? "true" : "false");
  try { localStorage.setItem("theme", dark ? "dark" : "light"); }
  catch { /* storage can be blocked; the attribute still switches the page */ }
};
applyTheme(themeOn());
for (const toggle of themeSwitches) {
  toggle.addEventListener("click", () => applyTheme(!themeOn()));
}

const sheetLayoutButtons = [...document.querySelectorAll(".dev-switch [data-sheet-layout]")];
const applySheetLayout = (mode) => {
  const chips = mode === "chips";
  if (chips) document.documentElement.dataset.sheetLayout = "chips";
  else delete document.documentElement.dataset.sheetLayout;
  for (const button of sheetLayoutButtons) {
    button.setAttribute("aria-pressed", button.dataset.sheetLayout === (chips ? "chips" : "lines") ? "true" : "false");
  }
  try { localStorage.setItem("sheet-layout", chips ? "chips" : "lines"); }
  catch { /* storage can be blocked; the attribute still switches the page */ }
};
let savedSheetLayout = "lines";
try { savedSheetLayout = localStorage.getItem("sheet-layout") === "chips" ? "chips" : "lines"; }
catch { /* keep the ruled table */ }
if (sheetLayoutButtons.length) applySheetLayout(savedSheetLayout);
for (const button of sheetLayoutButtons) {
  button.addEventListener("click", () => applySheetLayout(button.dataset.sheetLayout));
}

const fontButtons = [...document.querySelectorAll(".dev-switch [data-font]")];
const applyFont = (face) => {
  const switzer = face === "switzer";
  if (switzer) document.documentElement.dataset.font = "switzer";
  else delete document.documentElement.dataset.font;
  for (const button of fontButtons) {
    button.setAttribute("aria-pressed", button.dataset.font === (switzer ? "switzer" : "jakarta") ? "true" : "false");
  }
  try { localStorage.setItem("font", switzer ? "switzer" : "jakarta"); }
  catch { /* storage can be blocked; the attribute still switches the page */ }
};
let savedFont = "jakarta";
try { savedFont = localStorage.getItem("font") === "switzer" ? "switzer" : "jakarta"; }
catch { /* keep Plus Jakarta Sans */ }
if (fontButtons.length) applyFont(savedFont);
for (const button of fontButtons) {
  button.addEventListener("click", () => applyFont(button.dataset.font));
}

/* After first paint, so @starting-style does not fade the open panels on load. */
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.classList.add("is-motion");
  });
});

/* Menus sit in the page, and the page clips overflow, so they paint under the rails.
   Pin an open menu to the viewport at the layer that clears a panel. */
function liftMenu(panel) {
  if (panel.hidden || panel.dataset.lifted === "1") return;
  if (panel.closest(".side, .lance-side")) return;
  if (getComputedStyle(panel).position === "fixed") return;
  const rect = panel.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  panel.dataset.lifted = "1";
  panel.style.position = "fixed";
  panel.style.left = `${rect.left}px`;
  panel.style.top = `${rect.top}px`;
  panel.style.right = "auto";
  panel.style.bottom = "auto";
  panel.style.width = `${rect.width}px`;
  panel.style.zIndex = "80";
}

function dropMenu(panel) {
  if (panel.dataset.lifted !== "1") return;
  delete panel.dataset.lifted;
  panel.style.position = "";
  panel.style.left = "";
  panel.style.top = "";
  panel.style.right = "";
  panel.style.bottom = "";
  panel.style.width = "";
  panel.style.zIndex = "";
}

if (document.querySelector("main.notes-page")) {
  const menuLift = new MutationObserver((records) => {
    for (const record of records) {
      const panel = record.target;
      if (!(panel instanceof HTMLElement)) continue;
      if (panel.hidden) dropMenu(panel);
      else liftMenu(panel);
    }
  });

  const watchMenu = (panel) => {
    if (!(panel instanceof HTMLElement) || panel.dataset.menuWatch === "1") return;
    panel.dataset.menuWatch = "1";
    menuLift.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
    if (!panel.hidden) liftMenu(panel);
  };

  document.querySelectorAll(".menu").forEach(watchMenu);
  new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.classList.contains("menu")) watchMenu(node);
        node.querySelectorAll?.(".menu").forEach(watchMenu);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

  document.addEventListener("scroll", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest(".menu")) return;
    for (const panel of document.querySelectorAll(".menu[data-lifted='1']")) panel.hidden = true;
  }, true);
}

markNav();

if (document.body.hasAttribute("data-nav-shell")) {
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
  window.addEventListener("resize", applyPanelLimits);
}

