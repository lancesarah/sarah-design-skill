---
name: design-system
description: "Apply this project's design system when building or changing UI: color, type, spacing, radius, components, page patterns, notes, icons, motion, and polish. Use when the user asks to design, restyle, add a screen, implement a component, polish an interface, or edit a page, and when editing HTML or CSS in this repo."
---

# Design system

Read the reference that matches the task. Do not load all of them.


| Task                                       | Read                                                               |
| ------------------------------------------ | ------------------------------------------------------------------ |
| Tokens: color, type, space, radius, shadow | [references/foundations.md](references/foundations.md)             |
| A named component                          | [references/components.md](references/components.md)               |
| A screen or flow                           | [references/patterns.md](references/patterns.md)                   |
| Motion, wrapping, hit area, new icons, containers | [references/polish.md](references/polish.md)                       |
| A follow-up fix, a selected node, spacing, collapse, or an input state | [references/guard-rails.md](references/guard-rails.md) |
| Before calling UI work done                | [references/quality-checklist.md](references/quality-checklist.md) |


Source of truth for values is `css/tokens.css`. The live gallery is `index.html` with `css/gallery.css`. Notes UI is `notes.html`, `css/notes.css`, and `js/notes.js`.

## Rules

- Use the CSS variables in `css/tokens.css`. Do not invent hex values, font sizes, or spacing steps.
- Hover and selected fills use the next darker neutral than the surface they sit on: `--white`, then `--sidebar-grey`, then `--grey`, then `--black-12`, then `--black-25`. Hover and selected share that fill. Do not step down again because the pointer is on a selected control. A resting fill uses that same step. On white, the fill is `--sidebar-grey`. The comment field is the reference. In dark mode the same steps lighten: a card or table row goes from `--white` to `--grey`, and it does not fall back to the page. See [references/foundations.md](references/foundations.md).
- Dark mode recolors tokens only. Type, sizes, spacing, and radii stay. Anything darker than the page in light mode is lighter than the page in dark mode. The page is `--white` and stays the darkest surface. The sidebar and the department bar are `--sidebar-grey`, one step lighter. See [references/foundations.md](references/foundations.md).
- The primary button stays `--action` with white text. Its hover is `--action-hover`, the darker blue, in both themes. The secondary button stays a neutral surface (`--white` fill, `--black` text, `--stroke`), and its hover lightens to `--grey`. Search strokes use `--line`. `--black-25` is the quieter grey: halfway from `--black-50` toward `--sidebar-grey`, not a copy of `--black-50`.
- The scrollbar is the thin sidebar scrollbar. The width is `thin`, the thumb is `--black-25`, and the track matches the surface behind it. See [references/foundations.md](references/foundations.md).
- Match an existing component in the gallery before creating a new one. When a shared rule and a component rule both set padding, the component wins. Check the rendered box against the component, not only the class that seemed to apply.
- Switzer is the UI face. Libre Baskerville is for editorial moments only.
- Icons are inline SVG symbols in the page (`i-plus`, `i-search`, and the rest in `index.html`). Stroke uses `currentColor`. Icons are scaled to `0.95`, and `--icon-stroke` is `1 / 0.95` so the painted stroke stays width `1`. Every new icon, including a menu icon, follows the internal notes icon. They share its line weight, rounded corners, and size, and each one keeps its own shape. Pull those glyphs from Material Symbols and fit them as in [references/polish.md](references/polish.md). Copy a symbol that already exists. Do not hand-draw a second icon in the same menu with different caps, joins, or a different box. An icon that shares a row with a title is centered on that title. Alignment comes first: a pill, chip, or tag on a text row still puts its text on that line.
- The sidebar is one component, documented in [references/components.md](references/components.md). Pages use the `notes.html` sidebar markup and the `.side` rules in `css/gallery.css`. Do not restyle it per page.
- The left nav and the right Lance chat keep a fixed width. They do not grow or shrink with the window. On resize, the left nav collapses first, under 1259px, and the Lance chat collapses second, under 1036px. Clicking expand on either panel overrides its limit until the user collapses it or the window is wide enough. Each panel is its open width or its rail. The center keeps 590px between those limits. See [references/patterns.md](references/patterns.md).
- Product pages use the standard header in [references/patterns.md](references/patterns.md). Title and count on the left, search on the right of that row, and the filter switcher directly underneath. Filters, Print, and the main action sit in the right corner below the tabs, on the same row as the filter chips. The chips are vertically centered with those buttons and start at the left. Extra chips wrap to the left edge. On a row too narrow for the buttons and two chips, the chips drop to the next line. The main action is the primary button, with an icon. An unselected department count uses `--black-25`, quieter than the `--black-50` name.
- A filter dropdown is as wide as its longest option, closed and open. Changing the selection does not move the controls beside it.
- New motion, text wrapping, updating numbers, hit areas, and icons follow [references/polish.md](references/polish.md). Those rules do not restyle a component the gallery already defines. Changing a value does not move a section that follows it. Something set inline with the control can move with it. Any overflow shows a small blur on the edge that still has more content. Fewer boxes mean more room. The page is the surface, and color pulls the key item forward. Padding around a title, and the space between that title, its tabs, and the content below, stays on the larger space steps so the screen can be scanned.
- Clicking a control that shows a tooltip hides the tip. The control also drops its hover fill until the pointer leaves. See [references/guard-rails.md](references/guard-rails.md).
- A thing that has a more menu opens that same menu on right-click, at the pointer. The items and actions match the more button. The open note is not that target. Right-clicking the note itself does not offer Share or Delete. The note card does. See [references/guard-rails.md](references/guard-rails.md).
- Pressing Delete opens the gallery delete confirmation before anything is removed. Cancel leaves the record. Only the confirming Delete control removes it. See [references/components.md](references/components.md).
- Creating a new record follows [references/patterns.md](references/patterns.md). When the list has no records, a blank one is created and opened. Internal notes is the reference: a card at the top of the list that reads "Title" and then "New note", the existing detail layout, both of those in `--black-50`, and a department chip with its down chevron visible. The tag hugs that label. The viewed count is a chip with an eye, because the number has no word beside it. Its hover shows a down chevron, and clicking it lists who viewed the note and who did not.
- Deleting a list item moves the items below it up to close the space. Delete requires that motion.
- A follow-up fix changes the control the user pointed at. Spacing, collapse, alignment, and input states follow [references/guard-rails.md](references/guard-rails.md).
- After a UI change, walk the checklist in `references/quality-checklist.md`.

