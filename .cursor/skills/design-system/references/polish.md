# Polish

Product pages read these values from `css/tokens.css`. Notes is the reference. The gallery keeps the measured sizes in `css/gallery.css`.

Express every change with those tokens and the classes in `css/gallery.css`. This project is plain CSS. Do not add Tailwind, a motion library, or a second shadow recipe.

## Motion

Interactive state uses a CSS transition on the properties that change. The shared control transition is `background-color`, `color`, and `box-shadow` at 120ms. A chevron that rotates uses `transform` only.

Keyframes are for a one-shot sequence. Product pages paint in their final state. Do not stagger list rows, tabs, hovers, or keystrokes.

Press feedback is the background already defined on `.btn`, `.btn-secondary`, and `.btn-danger`. Do not add `scale` on press.

A state change keeps a static cue: color, icon, or label. If motion is added, also honor `prefers-reduced-motion: reduce` by keeping that cue and dropping the movement.

Changing a value does not move a section that follows it. Something set inline with the control, such as an icon on that label, can move with it. Internal notes is the reference: the department chip hugs its label and the chevron stays with that label. Author and Viewed are the next fields, so they stay put when the chip changes from Sales to Maintenance.

Removing an item from a list moves the items below it up to close the space. Delete requires that motion. Do not leave the gap, and do not snap the list shut.

`will-change` is only for `transform`, `opacity`, or `filter`, and only after a first-frame stutter shows up. One property, not `all`.

## Overflow

Any region that overflows shows a small blur on the edge that still has more content. The blur is `blur(4px)` and 16px deep, the same size as `--space-16`. It uses the surface color behind it, feathered so the content softens instead of cutting off. The blur is absent on an edge you have reached, and absent when nothing overflows. The note, its comments, the note list, the department tabs, and the sidebar are the reference.

## Type

Headings and titles of six lines or fewer use `text-wrap: var(--text-wrap-title)`. Short UI copy uses `text-wrap: var(--text-wrap-copy)`. Long text and code stay on the browser default.

A number that updates in place uses `font-variant-numeric: var(--numeric)`.

The UI face stays Switzer. Product pages set `-webkit-font-smoothing: var(--font-smoothing)` on `body`.

## Fewer containers

Fewer boxes mean more room. The page is the surface. Do not wrap a screen, a list, or a toolbar in another card when that page is already the background. A box belongs to a control that needs one, such as a field, a menu, a button, or a chip that is itself the control. Do not add a shell around a group that can sit on the page.

Color pulls the key item forward and lets the rest recede. A selected or starred row uses an accent the system already has. The same kind of row, when it is not selected, stays `--black-50` with no fill. Do not give both a box and expect the border to say which one matters.

Use that treatment the same way every time. A starred row, a selected tab, and a quiet row do not each invent a new container.

## Roomier padding

A tight screen is hard to scan. Give the page room. The padding around a title, and the space between that title, the tabs under it, and the content below, use the larger space steps: `--space-20` and `--space-25`. Do not pull those groups against each other.

That space is what makes the hierarchy. A title, a tab row, and a list stay separate groups. Do not close the gap to fit more on the screen.

Space inside a control stays the component's own spacing. Do not loosen an icon-to-label gap to invent room, and do not tighten a section gap down to that item gap.

## Surfaces

Nested rounded surfaces that sit within 24px of padding use `outer radius = inner radius + padding`. A shell padded by `--space-16` around a `--radius-control` surface uses `--radius-shell`. The menu is already concentric: 6px shell, 2px padding, 4px items. `--radius-well`, `--radius-tag`, and `--radius-circle` stay on the components they name.

Depth stays on `--stroke` and `--shadow-menu`. Dividers stay `1px solid var(--grey)`. Inputs keep their focus ring.

Photographs use `outline: var(--outline-image)` and `outline-offset: -1px`. In dark mode that outline is the hairline. A light ring baked into the photo is clipped off (`clip-path: inset(1px round 50%)`) so the circle sits on the surface.

Visible control sizes stay on the gallery component. Where a control is smaller than `--hit` and the layout has room, extend the hit target with a pseudo-element to `--hit`. Two targets must not overlap. On a touch layout, extend to `--hit-touch`.

## Icons

Every new icon follows the internal notes icon. Sidebar, menu, and button glyphs share its line weight, rounded corners, and size, and each one keeps its own shape. The fit is not limited to the sidebar.

Pull the glyph from [Material Symbols](https://fonts.google.com/icons). Use the outlined glyph, the stroke look, not the filled one. Use the SVG on the 960 grid (`viewBox="0 -960 960 960"`). Keep the path. Do not redraw the silhouette, and do not stretch it into another icon's box. The sidebar toggle (`#i-sidebar`) is a wide 11×10 frame; other glyphs do not inherit that frame.

`#i-doc` (Internal notes) is the reference, including the page-title mark and any icon added to a menu. Fit every new icon the same way:

- Sprite symbol, `viewBox="0 0 14 14"`, drawn at 18×18.
- Longest side of the glyph box is 11, centered on (7, 7).
- `s = 11 / max(width, height)`, `tx = 7 - centerX * s`, `ty = 7 - centerY * s`.
- Wrap the path in `<g transform="translate(tx ty) scale(s)">`. Scale applies first.
- Color is `currentColor`. Do not set a hex on the path.

Weight and corners match `#i-doc`. The outlined path is a ring, so it stays `fill="currentColor"`. Drop a trailing subpath that has no area. Do not switch it to the filled glyph, and do not add a second stroke on top of the ring.

Icons added together use that one construction. Copy a symbol that already exists in the page sprite. Do not trace one glyph from a screenshot and hand-draw the next with its own caps, joins, or box. Share and Delete in one menu are both this outlined fit.

A stroke the gallery already draws (`#i-plus`, `#i-check`, `#i-chevron`, `#i-close`, the search mark) stays that stroke: `fill="none"`, `stroke="currentColor"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, and `stroke-width: var(--icon-stroke)`. Copy it. Do not add a new action icon to that stroke list.

Outline is the resting state except where the gallery already fills, such as the in-progress status. Color and opacity carry hover, selected, and disabled. If a control swaps glyphs, keep both in the DOM and cross-fade opacity in 150ms or less. Decorative icons are `aria-hidden`. Icon-only buttons keep an accessible name.

An icon that shares a row with a title is centered on that title. Center the icon on the text, not on the top of the line box. A taller hit target stays centered on the title and does not drop or lift the glyph.

A pill, chip, or tag on a text row follows the same rule. Its text lines up with the neighboring text. The box can be taller. Do not leave the glyphs high or low because the control is a pill. Align the content inside the chip to the title, not the outer chip. A chip that only appears on hover still puts that content on the title.

A number with no word beside it needs an icon that says what it counts. The view count uses an eye, and the number stays the count. The eye stays visible, and it is drawn at 18×18 like every other icon. Do not shrink it to the type size. The chevron on that chip still appears only on hover.
