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

for (const host of document.querySelectorAll(".side .tip-host")) {
  const tip = host.querySelector(".tip");
  if (!tip) continue;
  const place = () => {
    const rect = host.getBoundingClientRect();
    tip.style.left = `${rect.right + 6}px`;
    tip.style.top = `${rect.top + rect.height / 2}px`;
  };
  const placeNext = () => requestAnimationFrame(place);
  host.addEventListener("mouseenter", placeNext);
  host.addEventListener("focus", placeNext);
}

for (const form of document.querySelectorAll("[data-composer]")) {
  const input = form.querySelector("input");
  const sync = () => form.classList.toggle("has-value", input.value.length > 0);
  form.addEventListener("submit", (event) => event.preventDefault());
  input.addEventListener("input", sync);
}

