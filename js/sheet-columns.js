/* Drag a header line to set that column. Double-click returns it. */
(function () {
  const FLEX_MIN = 120;
  const KEY = `sheet-columns:${location.pathname}`;

  document.querySelectorAll(".sheet-page .sheet-grid").forEach(init);

  function init(grid) {
    const head = grid.querySelector(":scope > .sheet-head");
    if (!head || head.querySelector(".col-resize")) return;
    const defaults = splitTracks(getComputedStyle(grid).getPropertyValue("--cols"));
    const cells = [...head.children];
    if (!defaults.length || defaults.length !== cells.length) return;
    const flexIndex = defaults.findIndex((track) => track.includes("fr"));
    let widths = load(defaults.length) || defaults.map(() => null);

    cells.forEach((cell, index) => {
      const label = document.createElement("span");
      label.className = "col-label";
      while (cell.firstChild) label.appendChild(cell.firstChild);
      const handle = document.createElement("span");
      handle.className = "col-resize";
      handle.tabIndex = 0;
      handle.role = "separator";
      handle.setAttribute("aria-orientation", "vertical");
      handle.setAttribute("aria-label", `Resize ${label.textContent.trim()}`);
      handle.dataset.col = String(index);
      cell.append(label, handle);

      handle.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        drag(index, event, handle);
      });
      handle.addEventListener("dblclick", (event) => {
        event.preventDefault();
        event.stopPropagation();
        widths[index] = null;
        if (widths.every((width) => width == null)) widths = blank();
        paint();
        save();
      });
      handle.addEventListener("keydown", (event) => {
        const step = event.key === "ArrowRight" ? 8 : event.key === "ArrowLeft" ? -8 : 0;
        if (!step) return;
        event.preventDefault();
        applyDelta(index, step, measure());
        paint();
        save();
      });
    });

    clampWidths();
    paint();
    const host = grid.parentElement;
    if (host && typeof ResizeObserver !== "undefined") {
      new ResizeObserver(() => paint()).observe(host);
    }

    function blank() {
      return defaults.map(() => null);
    }

    function drag(index, event, handle) {
      const startX = event.clientX;
      const start = measure();
      const guide = document.createElement("div");
      guide.className = "col-guide";
      grid.appendChild(guide);
      handle.classList.add("is-dragging");
      document.body.style.userSelect = "none";
      handle.setPointerCapture(event.pointerId);

      function move(ev) {
        applyDelta(index, ev.clientX - startX, start);
        paint();
        placeGuide(index, guide);
      }
      function end() {
        handle.classList.remove("is-dragging");
        document.body.style.userSelect = "";
        guide.remove();
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", end);
        handle.removeEventListener("pointercancel", end);
        save();
      }
      placeGuide(index, guide);
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", end);
      handle.addEventListener("pointercancel", end);
    }

    function floorFor(index) {
      const cell = cells[index];
      const label = cell.querySelector(".col-label");
      const pad = parseFloat(getComputedStyle(cell).marginInlineStart) || 0;
      const end = parseFloat(getComputedStyle(cell).marginInlineEnd) || 0;
      const title = label ? label.scrollWidth : 0;
      const titleFloor = Math.ceil(pad + end + title);
      if (index === flexIndex) return Math.max(FLEX_MIN, titleFloor);
      const fixed = /^[\d.]+px$/.test(defaults[index].trim()) ? parseFloat(defaults[index]) : 0;
      return Math.max(titleFloor, fixed, contentFloor(index));
    }

    function contentFloor(index) {
      const cell = cells[index];
      const pad = parseFloat(getComputedStyle(cell).marginInlineStart) || 0;
      const end = parseFloat(getComputedStyle(cell).marginInlineEnd) || 0;
      let content = 0;
      grid.querySelectorAll(".sheet-line").forEach((line) => {
        const item = line.children[index];
        if (!item || item.closest("[hidden]")) return;
        content = Math.max(content, intrinsic(item));
      });
      return Math.ceil(pad + end + content);
    }

    function intrinsic(item) {
      const previous = item.style.width;
      item.style.width = "max-content";
      const width = item.offsetWidth;
      item.style.width = previous;
      return width;
    }

    function clampWidths() {
      if (!widths) return;
      widths = widths.map((width, index) => (
        width == null ? null : Math.max(floorFor(index), Math.round(width))
      ));
    }

    function applyDelta(index, delta, start) {
      const floor = floorFor(index);
      let next = Math.round(start[index] + delta);
      if (index !== flexIndex && flexIndex >= 0) {
        const room = start[flexIndex] - floorFor(flexIndex);
        const grow = next - start[index];
        if (grow > room) next = start[index] + room;
      }
      next = Math.max(floor, next);
      if (!widths) widths = blank();
      widths[index] = next;
      if (index !== flexIndex && flexIndex >= 0 && widths[flexIndex] != null) {
        widths[flexIndex] = Math.max(floorFor(flexIndex), Math.round(start[flexIndex] - (next - start[index])));
      }
    }

    function paint() {
      const hug = hugTemplate();
      grid.style.minWidth = "";
      if (grid.style.gridTemplateColumns !== hug) grid.style.gridTemplateColumns = hug;
      const host = grid.parentElement;
      if (host && host.scrollWidth > host.clientWidth + 1) {
        const fitted = fitTemplate();
        if (fitted.columns !== grid.style.gridTemplateColumns) grid.style.gridTemplateColumns = fitted.columns;
        if (fitted.minWidth) grid.style.minWidth = fitted.minWidth;
      }
      cells.forEach((cell, index) => {
        const handle = cell.querySelector(".col-resize");
        if (widths && widths[index] != null) handle.setAttribute("aria-valuenow", String(widths[index]));
        else handle.removeAttribute("aria-valuenow");
      });
    }

    function hugTemplate() {
      return defaults.map((track, index) => {
        const floor = floorFor(index);
        if (index === flexIndex) return `minmax(${floor}px, 1fr)`;
        if (widths && widths[index] != null) return `${Math.max(floor, widths[index])}px`;
        if (/^[\d.]+px$/.test(track.trim())) return track.trim();
        return `minmax(${floor}px, max-content)`;
      }).join(" ");
    }

    function fitTemplate() {
      const host = grid.parentElement;
      const style = getComputedStyle(grid);
      const pad = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      const gap = parseFloat(style.columnGap) || 0;
      const budget = Math.floor(host.clientWidth - pad - gap * (cells.length - 1));
      if (budget <= 0) return { columns: hugTemplate(), minWidth: "" };
      const floors = cells.map((_, index) => floorFor(index));
      const tracks = floors.slice();
      cells.forEach((_, index) => {
        if (!(widths && widths[index] != null)) return;
        tracks[index] = Math.max(floors[index], widths[index]);
      });
      let extra = tracks.reduce((sum, width) => sum + width, 0) - budget;
      if (extra > 0 && flexIndex >= 0) {
        const give = Math.min(extra, Math.max(0, tracks[flexIndex] - floors[flexIndex]));
        tracks[flexIndex] -= give;
        extra -= give;
      }
      const minWidth = extra > 0
        ? `${Math.ceil(pad + gap * (cells.length - 1) + tracks.reduce((sum, width) => sum + width, 0))}px`
        : "";
      return {
        columns: tracks.map((width, index) => (
          index === flexIndex
            ? `minmax(${floors[index]}px, 1fr)`
            : `${Math.round(width)}px`
        )).join(" "),
        minWidth
      };
    }

    function placeGuide(index, guide) {
      const gridBox = grid.getBoundingClientRect();
      const cellBox = cells[index].getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
      guide.style.left = `${cellBox.right - gridBox.left + gap / 2}px`;
    }

    function measure() {
      return cells.map((cell) => cell.getBoundingClientRect().width);
    }

    function save() {
      try {
        if (!widths || widths.every((width) => width == null)) localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, JSON.stringify(widths));
      } catch (error) {
        /* this page can still resize without storage */
      }
    }
  }

  function load(count) {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!Array.isArray(saved) || saved.length !== count) return null;
      return saved.map((width) => (Number.isFinite(width) ? width : null));
    } catch (error) {
      return null;
    }
  }

  function splitTracks(value) {
    const tracks = [];
    let current = "";
    let depth = 0;
    for (const char of value.trim()) {
      if (char === "(") depth += 1;
      if (char === ")") depth -= 1;
      if (/\s/.test(char) && depth === 0) {
        if (current) tracks.push(current);
        current = "";
      } else current += char;
    }
    if (current) tracks.push(current);
    return tracks;
  }
})();
