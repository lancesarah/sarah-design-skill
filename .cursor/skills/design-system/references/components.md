# Components

The gallery in `index.html` is the component catalog. Reuse markup and classes from `css/gallery.css` before writing a new pattern.

When adding a component:

1. Find the closest gallery section and copy its structure.
2. Style with tokens from `css/tokens.css` only.
3. Put icons in the page's SVG sprite and reference them with `<use>`.
4. Add the new section to the gallery index if it is a shared component.

## Sidebar

The sidebar is one component. `notes.html` (`aside.side`) is the markup. `css/gallery.css` (`.side` and its children) is the styling. Every product page uses that pair.

- Do not restyle the sidebar in a page stylesheet. Width, padding, search, icons, hover, selected row, tooltips, scroll fade, scrollbar, collapse, and the account row are part of the component.
- A page may change link labels, `href`s, and which row has `aria-current="page"`. It may not change structure, spacing, or color.
- Keybind tooltips use the tool tip component: Messages is Opt M, Notifications is Opt N.
- Collapsed and expanded are the only two layouts. Both stay a fixed width.
- The selected row is a `--grey` fill. It has no white fill and no stroke, in both themes. The label and icon turn `--black`. An unselected row stays `--black-50`, including on hover. The pill is 30px tall, the same width as the search field above it, with a 6px radius and 0.5px between rows.
- Each nav row shows a reorder grip and a pin control on hover, and only while the sidebar is expanded. A row in Pinned uses the unpin glyph. Every other row uses the pin glyph. It is not the hidden eye. Its hover is the icon chip: an 18px box, 2px padding, and a 6px radius. Collapsed hides both. Hovering the rail does not bring them back.
- A section label stays 12px. Its weight is 500 so the text matches the nav link under it. The row stays the same height.
- The profile card at the bottom is not settled. Leave its layout alone until it is redesigned.

## Known pieces

Confirm class names in `index.html` and `css/gallery.css` before using them. Expected groups:

- Color, type, and spacing specimens
- Buttons, including primary (`--action`) and destructive (`--destructive`)
- Filter chips (`--filter-chip-bg`)
- Switch (`--action` track, `--switch-knob`)
- Tags (`--tag-text`, `--tag-bg`, `--radius-tag`)
- Urgency and status treatments
- Menus (`--shadow-menu`). The Lance mode menu is this dropdown. Option names are `--black`, descriptions stay `--black-50`, and the check stays centered on the row.
- Inputs, search, and icon buttons
- The Lance composer and the message composer. Add, the mode control, the microphone, and an empty send arrow hover with `--grey`, the same fill as a left nav row. The send arrow stays grey when the field is empty, including on hover. It turns `--action`, with white text, only when the field has text. The microphone stays `--action` only while it is on.

Notes-specific layout stays in `css/notes.css`. Do not fold one-off note chrome into the gallery unless it is reused.
