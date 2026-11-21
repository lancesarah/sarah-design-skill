import type { MouseEvent } from "react";

/** Activate the sole control without capturing clicks on controls or ancestor tab panels. */
export function activateSettingsRow(event: MouseEvent<HTMLElement>, toggle = false) {
  const row = event.currentTarget;
  const target = event.target;
  if (event.defaultPrevented || !(row instanceof HTMLElement) || !(target instanceof Element)) return;
  const interactive = target.closest('button, a, input, select, textarea, [tabindex], [contenteditable], .board-tipped, .tip-host, .info-tooltip, [data-slot="tooltip-trigger"]');
  if (interactive && interactive !== row && row.contains(interactive)) return;
  const label = target.closest('label');
  if (label && row.contains(label) && label.control) return;
  if (row.closest('[hidden], [inert], [aria-hidden="true"], [aria-disabled="true"], [aria-busy="true"]')) return;
  const controls = Array.from(row.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [contenteditable="true"], [role="switch"], [role="checkbox"], [role="combobox"]')).filter(control => {
    if (control.matches('[type="hidden"]') || control.closest('[hidden], [inert], [aria-hidden="true"], .tip-host, .info-tooltip, [data-slot="tooltip-trigger"]')) return false;
    const nestedRow = control.closest('.settings-row');
    if (nestedRow && nestedRow !== row && row.contains(nestedRow)) return false;
    for (let element: HTMLElement | null = control; element; element = element.parentElement) {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (element === row) break;
    }
    return true;
  });
  const toggles = controls.filter(control => control.matches('.theme-switch, [role="switch"], [role="checkbox"], input[type="checkbox"]'));
  const control = toggle && toggles.length === 1 ? toggles[0] : controls.length === 1 ? controls[0] : null;
  if (!control || control.matches(':disabled, [aria-disabled="true"], [readonly]') || control.closest('[aria-disabled="true"], [aria-busy="true"]')) return;
  event.preventDefault();
  control.focus();
  if (control.matches('textarea, select, input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), [contenteditable="true"]')) return;
  control.click();
}
