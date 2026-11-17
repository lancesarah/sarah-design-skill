const outlines = new WeakMap<HTMLElement, Animation>();

/** Re-emphasize the invalid controls after a blocked submit or Continue. */
export function reoutlineInvalidFields(container: HTMLElement | null) {
  if (!container) return;
  const fields = Array.from(container.querySelectorAll<HTMLElement>('[aria-invalid="true"]'))
    .filter(field => field.getClientRects().length && getComputedStyle(field).visibility !== "hidden");
  fields[0]?.focus();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const field of fields) {
    const style = getComputedStyle(field);
    const red = style.getPropertyValue("--destructive").trim();
    outlines.get(field)?.cancel();
    if (!red || !field.animate) continue;
    const outline = field.animate([
      { outline: `2px solid ${red}`, outlineOffset: "0px" },
      { outline: "2px solid transparent", outlineOffset: "4px" },
    ], { duration: 260, easing: style.getPropertyValue("--ease-out").trim() || "ease-out" });
    outlines.set(field, outline);

    field.classList.remove("is-shaking");
    void field.offsetWidth;
    field.classList.add("t-input", "is-shaking");
    const shake = field.getAnimations().find(animation =>
      "animationName" in animation && animation.animationName === "t-input-shake",
    );
    if (shake) {
      void shake.finished.then(
        () => field.classList.remove("is-shaking", "t-input"),
        () => {},
      );
    } else {
      field.classList.remove("is-shaking", "t-input");
    }
  }
}
