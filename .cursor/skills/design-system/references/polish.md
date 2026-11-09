# Polish

Product pages read these values from `catalog/tokens.css`. `catalog/notes.html` is the reference. The gallery keeps the measured sizes in `catalog/gallery.css`.

Express every change in the styling system the project already uses. This product is plain CSS: `catalog/tokens.css`, `catalog/gallery.css`, and `catalog/todos-alt.css` for the table. Do not add Tailwind, a motion library, or a second shadow recipe to this product. A project that already has Tailwind or a motion library keeps that system and takes its values from the catalog.

## Motion

Interactive state uses a CSS transition on the properties that change. The shared control transition is `background-color`, `color`, and `box-shadow` at `--motion-hover` (120ms). A chevron that rotates uses `transform` only.

Keyframes are for a one-shot sequence. Product pages paint in their final state. When several elements enter together, stagger them by 30–80ms. Do not block interaction while that stagger plays.

A press scales the whole control to `0.98`, label and icon included. `0.95`–`0.98` still reads as a press. It eases back with `scale` over 100–160ms on `--ease-out`. This gallery uses `0.98` and 160ms. Hover keeps its fill. Press does not darken that fill. `prefers-reduced-motion: reduce` skips the scale. Any pressable does this, including icon buttons, menu items, chips, and tabs.

A switch thumb uses one travel. Duration is `--switch-dur` (160ms) on `--switch-ease`, which is `--ease-out`. The knob stops on `--switch-travel`. It does not pass the end. The track color changes in `--switch-track-dur` (0ms), so it snaps while the knob moves. The first paint does not play the travel. `prefers-reduced-motion: reduce` sets the animation to none and leaves the knob on the on or off color.

A state change keeps a static cue: color, icon, or label. If motion is added, also honor `prefers-reduced-motion: reduce` by keeping that cue and dropping the movement.

Hover changes the control under the pointer. It does not move the items around it. A label, an icon, or a chevron that appears on hover uses the padding and the gap that are already there. Do not grow the control into the next column, the next row, or the next field. A menu chip follows the department tag in [patterns.md](patterns.md): it hugs the label, then widens for the chevron, and the items beside it stay put.

A control someone crosses tens of times a day gets no hover animation, or a drastically reduced one. A table row is that case. Do not ease a row wash while someone scans the table. If a hover motion cannot be removed, keep it very subtle.

A tooltip is always in front. It paints above the page, the table, and the sidebar. The first tooltip can wait and fade in. Once a tooltip is open, hovering another tooltip opens it in the same frame, with no delay and no animation. Leaving the tooltips starts that wait over. A keyboard action snaps. A shortcut, a move between controls, Enter, Space, and Escape do not fade, travel, or wait. These actions are repeated all day, and an animation makes them feel slow and disconnected from the key. A tooltip opened from the keyboard appears in the same frame.

Changing a value does not move a section that follows it. Something set inline with the control, such as the department tag in [patterns.md](patterns.md), can move with the label. The fields beside it stay put.

Removing an item from a list closes the gap. The product rule, including the 700ms hold on complete, is in [patterns.md](patterns.md). The exit is about 20% faster than the entrance.

`will-change` is only for `transform`, `opacity`, or `filter`, and only after a first-frame stutter shows up. One property, not `all`. A shaky transform gets `will-change: transform`. It does not get `will-change: all`.

## When the motion is new

Answer these before adding motion the gallery does not already define. A settled motion stays as written above. The press scale, the switch, a table hover, a keyboard action, and the close-the-gap removal do not get a new curve or a new duration.

Should it animate? Something used 100 or more times a day does not. A keyboard shortcut, Enter, Space, and Escape snap. Something used tens of times a day, including a table row and list navigation, loses its animation or keeps only a drastically reduced one. An occasional modal, drawer, or toast can move. A rare first-time moment can take longer.

What is it for? Spatial consistency, a state change, an explanation, press feedback, or covering a jump. Motion that is only decoration on a frequent control comes out.

Which curve:

| Situation | Curve |
| --- | --- |
| Entering or leaving | `--ease-out`, `cubic-bezier(0.23, 1, 0.32, 1)` |
| Moving or morphing while it stays on screen | `--ease-in-out`, `cubic-bezier(0.77, 0, 0.175, 1)` |
| A drawer | `--ease-drawer`, `cubic-bezier(0.32, 0.72, 0, 1)` |
| A hover color | `ease` |
| Constant motion, such as a marquee or a progress bar | `linear` |
| Anything else | `--ease-out` |

Do not use `ease-in` on UI. It starts slow, so the control feels late. Do not use the built-in `ease-out` or `ease-in-out`. They are too weak. Use the curves above.

A drag, a gesture, something that should feel alive, or a decorative follow of the pointer uses a spring. Duration is `0.5s`. Bounce stays between `0.1` and `0.3`. The usual example is `0.2`. Most UI uses no bounce. The switch thumb uses the short travel above. An icon that swaps for another icon is not this spring. That swap uses scale `0.25`, blur `4px`, 300ms, and bounce `0`.

How long. A larger element takes longer than a smaller one. An exit is about 20% faster than the entrance. A longer travel gets a longer duration. Everyday UI stays under 300ms. A small control, such as a select, does not sit on a 400ms animation. A modal or a drawer may run 200–500ms on `--ease-drawer`. A drawer this gallery already measured stays on that measurement when it lands inside the range. The to-do panel is `--motion-panel` (400ms) in and `--motion-panel-out` (320ms) out.

A table skeleton pulses once, then the values crossfade in. The pulse is `--sk-pulse-dur` (1000ms), ease-in-out, one iteration, from opacity 1 to `--sk-pulse-min` (0.5) and back. The crossfade is `--sk-reveal-dur` (400ms), ease-in-out, with a `--sk-reveal-blur` (2px) blur. Columns follow each other by `--sk-ripple` (32ms). This is the one skeleton. Do not add a shimmer or a loop. `prefers-reduced-motion: reduce` drops the pulse, the blur, and the delay. The measurements are in [components.md](components.md), Table.

A new table row grows from height 0 to its content over 200ms. The rows under it move down. `prefers-reduced-motion: reduce` inserts the row at full height. Creating a new item in [patterns.md](patterns.md) is the rule.

An inset card opens in place. The title stays put. The body grows and fades in over `--motion-grow` (240ms) on `--ease-out`. It closes over `--motion-grow-out` (192ms). The chevron turns over 160ms on `--ease-out`. `prefers-reduced-motion: reduce` snaps the body and the chevron. The measurements are in [components.md](components.md), Inset card.

Anything else that grows or collapses uses that same pair. A disclosure, a form that opens under a record, a chart that swaps for a shorter one. The track is `grid-template-rows` from `0fr` to `1fr`. The inner box is `min-height: 0` and `overflow: hidden`. Opacity fades with the track. The node stays mounted until the close finishes. `prefers-reduced-motion: reduce` snaps.

A region snaps when there is no from-height. Mounting or unmounting it in one render paints the full box. `height: auto` does not transition. A parent `gap` sits outside the box, so that space pops in one frame. Put the space inside the clip. Opacity alone, while the height changes in the same frame, still snaps. `display: none` and the `hidden` attribute remove it before the transition can run. Reduced motion snaps on purpose. A keyboard shortcut that this page says must snap still snaps.

| What moves | Duration |
| --- | --- |
| A button press | 100–160ms on `--ease-out`. This gallery uses 160ms. The whole control scales to `0.98`, including the label and the icon. `0.95`–`0.98` is the range. |
| A micro-interaction, including the shared control fade | 100–150ms. The shared fade is `--motion-hover` (120ms). |
| A tooltip or a small popover | 125–200ms. A tooltip that is already open skips this and snaps. |
| A dropdown or a select | 150–250ms |
| A modal or a drawer | 200–500ms |

Something that appears does not start at `scale(0)`. Start at `scale(0.95)` with opacity `0`. `scale(0.9)` or higher is acceptable. Nothing shows up from a point.

A hover that flickers is animating the parent. Animate the child. That does not put a fade on a table row. A row someone scans gets no animation, or a drastically reduced one.

A popover scales from the control that opened it. Set `transform-origin` to that trigger. A modal stays centered. It is not anchored to a trigger.

Blur covers a crossfade that still looks like two objects swapping. Add `filter: blur(2px)` for the duration of the fade, and keep it under 20px. Heavy blur is expensive.

A new entrance uses a CSS transition, so it can be interrupted. `transition: all` is not used. Name the properties.

## Type

Headings and titles of six lines or fewer use `text-wrap: var(--text-wrap-title)`. Short UI copy uses `text-wrap: var(--text-wrap-copy)`. Long text and code stay on the browser default.

Body copy stops around 65 characters. Do not stretch a paragraph to the full width of the page. The open note is the reference.

A number that updates in place uses `font-variant-numeric: var(--numeric)`. A price column uses it too, so the digits line up. A phone number, a zip code, and a version do not.

Truncation in markup is the `…` character. Three periods are not an ellipsis.

An uppercase label loosens its letter-spacing. Tight capitals read as a block.

The UI face is Plus Jakarta Sans. The dev switch can put Switzer back for a comparison. The fallback is a face with a similar x-height and weight, so a missing font does not reflow the line. Product pages set `-webkit-font-smoothing: var(--font-smoothing)` on `body`. Libre Baskerville is for editorial moments only.

An underline is a link. Emphasis in the interface is weight or color. Bold is for that emphasis. Italic is for a citation or a linguistic stress, and it stays in the editorial face.

## Fewer containers

Fewer boxes mean more room. The page is the surface. Do not wrap a screen, a list, or a toolbar in another card when that page is already the background. A box belongs to a control that needs one, such as a field, a menu, a button, or a chip that is itself the control. Do not add a shell around a group that can sit on the page. A long record can give one different kind of block a fill. It does not put every section in a matching card. See [guard-rails.md](guard-rails.md).

A card is one of several similar items. Locations, notes, lessons, or any other set use a card so each item can be told apart from the next. A screen with one action or one thing does not need a card. That thing sits on the page. Keep the pieces that belong, and leave the outer card behind.

Color pulls the key item forward and lets the rest recede. A selected or starred row uses an accent the system already has. The same kind of row, when it is not selected, stays `--black-50` with no fill. Do not give both a box and expect the border to say which one matters.

Use that treatment the same way every time. A starred row, a selected tab, and a quiet row do not each invent a new container.

## Roomier padding

A tight screen is hard to scan. Give the page room. The padding around a title, and the space between that title, the tabs under it, and the content below, use the larger space steps: `--space-20` and `--space-25`. A title and the content it names keep at least 40px. Do not pull those groups against each other.

That space is what makes the hierarchy. A title, a tab row, and a list stay separate groups. Do not close the gap to fit more on the screen.

Space inside a control stays the component's own spacing. Do not loosen an icon-to-label gap to invent room, and do not tighten a section gap down to that item gap.

## Surfaces

Nested rounded surfaces that sit within 24px of padding use `outer radius = inner radius + padding`. A shell padded by `--space-16` around a `--radius-control` surface uses `--radius-shell`. The menu is already concentric: 6px shell, 2px padding, 4px items. `--radius-well`, `--radius-tag`, and `--radius-circle` stay on the components they name.

Depth stays on `--stroke` and `--shadow-menu`. Dividers stay `1px solid var(--grey)`. Inputs keep their focus ring.

Photographs use `outline: var(--outline-image)` and `outline-offset: -1px`. Light mode is pure black at 10% opacity. Dark mode is pure white at 10% opacity, not the hairline and not a tinted grey. A light ring baked into the photo is clipped off (`clip-path: inset(1px round 50%)`) so the circle sits on the surface.

Visible control sizes stay on the gallery component. Where a control is smaller than `--hit` and the layout has room, extend the hit target with a pseudo-element to `--hit`. Two targets must not overlap. On a touch layout, extend to `--hit-touch`.

## Icons

Every new icon follows the internal notes icon. Sidebar, menu, and button glyphs share its line weight, rounded corners, and size, and each one keeps its own shape. The fit is not limited to the sidebar.

Pull the glyph from [Material Symbols](https://fonts.google.com/icons). Use the outlined glyph, the stroke look, not the filled one. Use the SVG on the 960 grid (`viewBox="0 -960 960 960"`). Keep the path. Do not redraw the silhouette, and do not stretch it into another icon's box. The sidebar toggle (`#i-sidebar`) is a wide 11×10 frame; other glyphs do not inherit that frame.

`#i-doc` (Internal notes) is the reference, including the page-title mark and any icon added to a menu. Fit every new icon the same way:

- Sprite symbol, `viewBox="0 0 14 14"`, drawn at 18×18.
- Longest side of the glyph box is 11, centered on (7, 7). A wide glyph, such as the link chain, stays in that same icon. Do not grow the icon so its short side matches Share and Delete. That chain becomes about twice as wide as the icons beside it.
- `s = 11 / max(width, height)`, `tx = 7 - centerX * s`, `ty = 7 - centerY * s`.
- Wrap the path in `<g transform="translate(tx ty) scale(s)">`. Scale applies first.
- Color is `currentColor`. Do not set a hex on the path.

Weight and corners match `#i-doc`. A ring stays `fill="currentColor"`. Drop a trailing subpath that has no area. Do not switch it to the filled glyph, and do not add a second stroke on top of the ring. Some outlined glyphs are a solid shape, not a ring. The outward arrow is one. Keep that path and fit it. Do not swap in a different Material icon to get a ring.

Icons added together use that one construction. Copy a symbol that already exists in the page sprite. Do not trace one glyph from a screenshot and hand-draw the next with its own caps, joins, or box. Share and Delete in one menu are both this outlined fit. The `<svg>` uses the size of the icons already in that menu. Delete in the note menu is 14×14, so Share there is 14×14. The 18×18 drawing is the default control, not a reason to upsize one glyph. A symbol used in two places is one glyph. Refitting `#i-share` also changes the Sales nav icon.

A stroke the gallery already draws (`#i-plus`, `#i-check`, `#i-chevron`, `#i-close`, the search mark) stays that stroke: `fill="none"`, `stroke="currentColor"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, and `stroke-width: var(--icon-stroke)`. Copy it. Do not add a new action icon to that stroke list.

Outline is the resting state except where the gallery already fills, such as the in-progress status. Color and opacity carry hover, selected, and disabled. Do not swap in a filled glyph for the active state. If a control swaps glyphs, keep both in the DOM. The entering icon goes from opacity `0`, scale `0.25`, and blur `4px` to opacity `1`, scale `1`, and blur `0`. The leaving icon reverses that. Duration is 300ms and bounce is `0`. With no motion library, use a CSS transition on those three properties and `cubic-bezier(0.2, 0, 0, 1)`. Do not add a library for the swap. Decorative icons are `aria-hidden`. Icon-only buttons keep an accessible name.

An icon that shares a row with a title is centered on that title. Center the icon on the text, not on the top of the line box. A taller hit target stays centered on the title and does not drop or lift the glyph.

A control that centers its contents uses equal padding on opposite sides. The leftover on each side is a whole pixel: `(height − line-height) / 2`. A 28px button with a 20px line uses `--space-4` on the top and the bottom. Do not add 2px to one side of that box. That shifts the group by 1px. Do not correct a centered glyph with a 1px `translate`, `top`, or `margin`. A circle is square. The avatar is 35×35. The large avatar is 46×46.

A pill, chip, or tag on a text row follows the same rule. Its text lines up with the neighboring text. The box can be taller. Do not leave the glyphs high or low because the control is a pill. Align the content inside the chip to the title, not the outer chip. A chip that only appears on hover still puts that content on the title.

A number with no word beside it needs an icon that says what it counts. The view count uses an eye, and the number stays the count. The eye stays visible, and it is drawn at 18×18 like every other icon. Do not shrink it to the type size. The chevron on that chip still appears only on hover.
