# Polish

Product pages read these values from `css/tokens.css`. Notes is the reference. The gallery keeps the measured sizes in `css/gallery.css`.

Express every change with those tokens and the classes in `css/gallery.css`. This project is plain CSS. Do not add Tailwind, a motion library, or a second shadow recipe.

## Motion

Interactive state uses a CSS transition on the properties that change. The shared control transition is `background-color`, `color`, and `box-shadow` at 120ms. A chevron that rotates uses `transform` only.

Keyframes are for a one-shot sequence. Product pages paint in their final state. Do not stagger list rows, tabs, hovers, or keystrokes.

Press feedback is the background already defined on `.btn`, `.btn-secondary`, and `.btn-danger`. Do not add `scale` on press.

A state change keeps a static cue: color, icon, or label. If motion is added, also honor `prefers-reduced-motion: reduce` by keeping that cue and dropping the movement.

`will-change` is only for `transform`, `opacity`, or `filter`, and only after a first-frame stutter shows up. One property, not `all`.

## Type

Headings and titles of six lines or fewer use `text-wrap: var(--text-wrap-title)`. Short UI copy uses `text-wrap: var(--text-wrap-copy)`. Long text and code stay on the browser default.

A number that updates in place uses `font-variant-numeric: var(--numeric)`.

The UI face stays Switzer. Product pages set `-webkit-font-smoothing: var(--font-smoothing)` on `body`.

## Surfaces

Nested rounded surfaces that sit within 24px of padding use `outer radius = inner radius + padding`. A shell padded by `--space-16` around a `--radius-control` surface uses `--radius-shell`. The menu is already concentric: 6px shell, 2px padding, 4px items. `--radius-well`, `--radius-tag`, and `--radius-circle` stay on the components they name.

Depth stays on `--stroke` and `--shadow-menu`. Dividers stay `1px solid var(--grey)`. Inputs keep their focus ring.

Photographs use `outline: var(--outline-image)` and `outline-offset: -1px`.

Visible control sizes stay on the gallery component. Where a control is smaller than `--hit` and the layout has room, extend the hit target with a pseudo-element to `--hit`. Two targets must not overlap. On a touch layout, extend to `--hit-touch`.

## Icons

Every sidebar icon follows the internal notes icon. They share its line weight, rounded corners, and size, and each one keeps its own shape.

Pull sidebar glyphs from [Material Symbols](https://fonts.google.com/icons). Use the SVG on the 960 grid (`viewBox="0 -960 960 960"`). Keep the path. Do not redraw the silhouette, and do not stretch it into another icon's box. The sidebar toggle (`#i-sidebar`) is a wide 11×10 frame; other glyphs do not inherit that frame.

`#i-doc` (Internal notes) is the reference, including the page-title mark. Fit every sidebar icon the same way:

- Sprite symbol, `viewBox="0 0 14 14"`, drawn at 18×18.
- Longest side of the glyph box is 11, centered on (7, 7).
- `s = 11 / max(width, height)`, `tx = 7 - centerX * s`, `ty = 7 - centerY * s`.
- Wrap the path in `<g transform="translate(tx ty) scale(s)">`. Scale applies first.
- Color is `currentColor`. Do not set a hex on the path.

Weight and corners match `#i-doc`. Its bars are 60 units on the Material grid. At its scale (`0.016176`) that is about 0.97 in the 14 viewBox.

- A filled Material glyph uses `fill="currentColor"`. Drop a trailing subpath that has no area. Do not add a thick stroke.
- If the fitted bars are thinner than the notes icon, add `stroke="currentColor" stroke-linejoin="round"` with `stroke-width="7"` in source units (the messages and guest-messages bubbles). Glyphs that already match, such as the square alert, stay fill-only.
- A stroke drawing that is not a Material fill uses `fill="none"`, `stroke="currentColor"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, and `stroke-width: calc(var(--icon-stroke) * (1 / s))` so the final stroke in the 14 viewBox stays `1`.

Other icons still join the page sprite. Stroke stays `currentColor` at `var(--icon-stroke)`. Outline is the resting state except where the gallery already fills, such as the in-progress status. Color and opacity carry hover, selected, and disabled. If a control swaps glyphs, keep both in the DOM and cross-fade opacity in 150ms or less. Decorative icons are `aria-hidden`. Icon-only buttons keep an accessible name.
