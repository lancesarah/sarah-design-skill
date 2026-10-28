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

## Known pieces

Confirm class names in `index.html` and `css/gallery.css` before using them. Expected groups:

- Color, type, and spacing specimens
- Buttons, including primary (`--action`) and destructive (`--destructive`)
- Filter chips (`--filter-chip-bg`)
- Switch (`--action` track, `--switch-knob`)
- Tags (`--tag-text`, `--tag-bg`, `--radius-tag`)
- Urgency and status treatments
- Menus (`--shadow-menu`)
- Inputs, search, and icon buttons

Notes-specific layout stays in `css/notes.css`. Do not fold one-off note chrome into the gallery unless it is reused.
