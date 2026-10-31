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

for (const form of document.querySelectorAll("form.search")) {
  const input = form.querySelector("input");
  const clear = form.querySelector(".clear");
  const sync = () => {
    const filled = input.value.length > 0;
    form.classList.toggle("has-value", filled);
    if (clear) clear.hidden = !filled;
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

const themeSwitch = document.querySelector("[data-theme-toggle]");
const themeOn = () => document.documentElement.dataset.theme === "dark";
const applyTheme = (dark) => {
  if (dark) document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
  themeSwitch?.setAttribute("aria-pressed", dark ? "true" : "false");
  try { localStorage.setItem("theme", dark ? "dark" : "light"); }
  catch { /* storage can be blocked; the attribute still switches the page */ }
};
applyTheme(themeOn());
themeSwitch?.addEventListener("click", () => applyTheme(!themeOn()));

/* After first paint, so @starting-style does not fade the open panels on load. */
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.classList.add("is-motion");
  });
});

