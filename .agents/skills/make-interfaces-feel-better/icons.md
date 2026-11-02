# Icons

Icon weight, states, sizing, and direction: the details that make icons sit naturally in an interface.

## Match the project's icons

Use the icon construction the project already has. One stroke weight for the set. In this system the painted stroke is `1`, and a new icon is an outlined glyph fitted the same way as the icons beside it. Do not assign `1.5px`, `2px`, or `2.5px` unless the project already draws icons at that weight. Do not stretch one glyph into another icon's box.

## One SVG, Recolored per State

Use one SVG drawn with `currentColor`; let CSS drive hover, selected, and disabled states. Strip hardcoded `fill` and `stroke` colors when importing icons.

```html
<svg fill="none" stroke="currentColor" stroke-width="1">…</svg>
```

```css
.icon-button { color: oklch(0.552 0.016 285.938); }
.icon-button:hover { color: oklch(0.21 0.006 285.885); }
.icon-button[aria-pressed="true"] { color: oklch(0.623 0.188 259.815); }
.icon-button:disabled { opacity: 0.4; }
```

## Outline stays the resting state

Outline is the resting state. Color and opacity carry hover, selected, and disabled. Do not swap in a filled glyph for the active state, except where the project already fills that icon.

When a control does swap glyphs, use the exact values in [animations.md](animations.md): scale `0.25` to `1`, opacity `0` to `1`, blur `4px` to `0`, 300ms, bounce `0`.

## Design at Render Size

- Test every icon at the smallest size it will render, often `16px`.
- Prefer simplified glyphs for small contexts over scaled-down detailed artwork.
- Use the icon set's native grid sizes (`16`, `20`, `24`) rather than arbitrary fractional scales.
- Use SVG rather than raster assets.

## Icons in RTL

| Flip | Don't flip |
| --- | --- |
| Back/forward arrows, navigation chevrons | Logos and brand marks |
| Text alignment, lists, indent | Checkmarks |
| Directional send glyphs | Clocks, cups, pencils |
| Speaker waves tied to reading direction | Media playback controls |

```css
[dir="rtl"] .icon-directional {
  scale: -1 1;
}
```

Analyze composite icons part by part: an overlay may keep its position even when the base glyph flips. Give every icon-only control an accessible name and mark purely decorative icons hidden from assistive technology.
