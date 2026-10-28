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
| Motion, wrapping, hit area, new icons      | [references/polish.md](references/polish.md)                       |
| A follow-up fix, a selected node, spacing, collapse, or an input state | [references/guard-rails.md](references/guard-rails.md) |
| Before calling UI work done                | [references/quality-checklist.md](references/quality-checklist.md) |


Source of truth for values is `css/tokens.css`. The live gallery is `index.html` with `css/gallery.css`. Notes UI is `notes.html`, `css/notes.css`, and `js/notes.js`.

## Rules

- Use the CSS variables in `css/tokens.css`. Do not invent hex values, font sizes, or spacing steps.
- Hover and selected fills use the next darker neutral than the surface they sit on: `--white`, then `--sidebar-grey`, then `--grey`, then `--black-12`, then `--black-25`. If the component's hover token matches the background behind it, step down. In dark mode the same steps lighten: a card or table row goes from `--white` to `--grey`, and it does not fall back to the page. See [references/foundations.md](references/foundations.md).
- Dark mode recolors tokens only. Type, sizes, spacing, and radii stay. The primary button stays `--action` with white text, and its hover lightens that blue. The secondary button stays a neutral surface (`--white` fill, `--black` text, `--stroke`), and its hover lightens to `--grey`. Search strokes use `--line`. `--black-25` is the quieter grey: halfway from `--black-50` toward `--sidebar-grey`, not a copy of `--black-50`. See [references/foundations.md](references/foundations.md).
- Match an existing component in the gallery before creating a new one. When a shared rule and a component rule both set padding, the component wins. Check the rendered box against the component, not only the class that seemed to apply.
- Switzer is the UI face. Libre Baskerville is for editorial moments only.
- Icons are inline SVG symbols in the page (`i-plus`, `i-search`, and the rest in `index.html`). Stroke uses `currentColor` and width `1` (`--icon-stroke`). Every sidebar icon follows the internal notes icon. They share its line weight, rounded corners, and size, and each one keeps its own shape. Pull those glyphs from Material Symbols and fit them as in [references/polish.md](references/polish.md).
- The sidebar is one component, documented in [references/components.md](references/components.md). Pages use the `notes.html` sidebar markup and the `.side` rules in `css/gallery.css`. Do not restyle it per page.
- The left nav and the right Lance chat keep a fixed width. They do not grow or shrink when the window changes size. If they cannot fit, hide the whole panel. Only the center content changes width.
- Product pages use the standard header in [references/patterns.md](references/patterns.md). Title and count on the left, search on the right of that row, and the filter switcher directly underneath. Filters, Print, and the main action sit in the right corner below the tabs and above the filter chips. The main action is the primary button, with an icon. An unselected department count uses `--black-25`, quieter than the `--black-50` name.
- A filter dropdown is as wide as its longest option, closed and open. Changing the selection does not move the controls beside it.
- New motion, text wrapping, updating numbers, hit areas, and icons follow [references/polish.md](references/polish.md). Those rules do not restyle a component the gallery already defines.
- Clicking a control that shows a tooltip hides the tip. The control also drops its hover fill until the pointer leaves. See [references/guard-rails.md](references/guard-rails.md).
- A follow-up fix changes the control the user pointed at. Spacing, collapse, alignment, and input states follow [references/guard-rails.md](references/guard-rails.md).
- After a UI change, walk the checklist in `references/quality-checklist.md`.

