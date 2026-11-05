/**
 * Grow a row that was just inserted. The sheet `is-entering` rule sets the clip
 * to `0fr`, but this table's subgrid track stays at the line's minimum, so the
 * clip height is what actually opens the row. 200ms matches the sheet enter.
 * Reduced motion leaves the row at full height.
 */
export function playEnter(entered: Element | null) {
  if (!(entered instanceof HTMLElement)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const clip = entered.querySelector<HTMLElement>(".sheet-clip") ?? entered;
  const full = clip.getBoundingClientRect().height;
  if (full <= 0) return;
  clip.style.overflow = "hidden";
  clip.style.transition = "none";
  clip.style.height = "0px";
  clip.getBoundingClientRect();
  requestAnimationFrame(() => {
    if (!clip.isConnected) return;
    clip.style.transition = "height 200ms var(--ease-out)";
    clip.style.height = `${full}px`;
    let finished = false;
    const finish = (event?: TransitionEvent) => {
      if (finished || (event && event.propertyName !== "height")) return;
      finished = true;
      clip.style.height = "";
      clip.style.overflow = "";
      clip.style.transition = "";
      clip.removeEventListener("transitionend", finish);
    };
    clip.addEventListener("transitionend", finish);
    window.setTimeout(() => finish(), 260);
  });
}

/** Measure the rows under a removed record, then play the close after React commits. */
export function captureClose(removed: Element | null) {
  const list = removed?.parentElement;
  if (!list || !removed) return () => {};
  const nodes = [...list.children];
  const index = nodes.indexOf(removed);
  if (index < 0) return () => {};
  const movers = nodes.slice(index + 1).filter((node): node is HTMLElement => node instanceof HTMLElement);
  const before = new Map(movers.map((row) => [row, row.getBoundingClientRect().top]));
  return () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (const row of movers) {
      if (!row.isConnected) continue;
      const delta = (before.get(row) ?? 0) - row.getBoundingClientRect().top;
      if (!delta) continue;
      row.style.transition = "none";
      row.style.transform = `translateY(${delta}px)`;
    }
    list.getBoundingClientRect();
    requestAnimationFrame(() => {
      for (const row of movers) {
        if (!row.isConnected) continue;
        row.style.transition = "transform 180ms var(--ease-out)";
        row.style.transform = "translateY(0)";
      }
    });
    window.setTimeout(() => {
      for (const row of movers) {
        if (!row.isConnected) continue;
        row.style.transition = "";
        row.style.transform = "";
      }
    }, 220);
  };
}
