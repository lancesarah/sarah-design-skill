# Components

The gallery in `index.html` is the component catalog. Reuse markup and classes from `css/gallery.css` before writing a new pattern.

When adding a component:

1. Find the closest gallery section and copy its structure.
2. Style with tokens from `css/tokens.css` only.
3. Put icons in the page's SVG sprite and reference them with `<use>`.
4. Add the new section to the gallery index if it is a shared component.

## Sidebar

The sidebar is one component. `notes.html` (`aside.side`) is the markup. `css/gallery.css` (`.side` and its children) is the styling. Every product page uses that pair.

- Do not restyle the sidebar in a page stylesheet. Width, padding, search, icons, hover, selected row, tooltips, scroll fade, scrollbar, collapse, and the account row are part of the component. The scroll fade is a small blur on the edge that still has more content. That thin scrollbar is the default scrollbar. The thumb is `--black-25`, and the track matches the surface behind it. A short horizontal strip, such as the department tabs, does not use the system bar. It uses the department-bar thumb in [patterns.md](patterns.md).
- A page may change link labels, `href`s, and which row has `aria-current="page"`. It may not change structure, spacing, or color.
- Keybind tooltips use the tool tip component: Messages is Opt M, Notifications is Opt N.
- Collapsed and expanded are the only two layouts. Both stay a fixed width.
- The selected row is a `--grey` fill. It has no white fill and no stroke, in both themes. The label and icon turn `--black`. An unselected row stays `--black-50`, including on hover. The pill is 30px tall, the same width as the search field above it, with a 6px radius and 1px between rows.
- Each nav row shows a reorder grip and a pin control on hover, and only while the sidebar is expanded. A row in Pinned uses the unpin glyph. Every other row uses the pin glyph. It is not the hidden eye. Its hover is the icon chip: an 18px box, 2px padding, and a 6px radius. Collapsed hides both. Hovering the rail does not bring them back.
- A section label stays 12px. Its weight is 500 so the text matches the nav link under it. The row stays the same height.
- The profile card at the bottom is not settled. Leave its layout alone until it is redesigned.

## Header

The page header is the gallery header. It is 60px tall: a 30px page icon, a 14px regular title, and a 14px `--black-50` count. Page actions sit on the right of that row. Search is not in the header. It is the 281px search in the filter row under the tabs.

## Comment

A comment is the gallery comment. The row is at least 49px. The photo is 21px. The name and the time are 12px, and the time is `--black-50`. The body is 14px. The photo and the text sit 10px apart. The more button is 28px and shows on hover. A reply under the comments is the gallery message composer: 38px, `--sidebar-grey`, a 30px send control, and a 16px send icon. Hover draws the same 1px ring as that composer.

## Table

The table is one component. The gallery section `#table` is the catalog. `todos.html` (`.sheet-page`) is the product. A new table copies that section. It does not invent a second row, chip, or filter.

The filter row sits on the table. Search is the gallery search: 281px, 38px tall, `--sidebar-grey`, the list’s own placeholder. Hover and focus draw a 1px `--black-25` ring. Text in the field is `--black`, and the clear control stays while there is text. The filter control beside it is the icon and the chevron only, 44px wide. The word “Filters” is not shown. Its hover fill is `--sidebar-grey`.

The filter menu lists Type, Status, Urgency, Assigned, Room, Area, Item, Detail, and Source. Each row opens a submenu to the side. Type uses the department chip. Status is the words Open, In progress, and Completed. Urgency uses the urgency chip. Assigned uses the miniature name pill. Room, Area, Item, Detail, and Source are plain labels. A check marks the chosen option. A chosen filter becomes a filter chip on the same row as the search. The chip hugs that value. It does not reserve width for every option.

Under the filter row, the columns are Status, Room, To-do, Urgency, Type, Assigned, and Opened. The frame ends at the last row and keeps its rounded corners. It scrolls only when the rows pass the space above the count. Under the frame, at the left, the count is `--text-12` `--black-50` and reads Showing N of M.

- Rest is white.
- Hover paints the row `--sidebar-grey`. The “Add a note” placeholder appears only then. A note that is already written stays visible. Focus clears the placeholder.
- The open row is the selection: a 1px `--action` box and a `--filter-chip-bg` fill. Hover stays that blue. Another row can be grey at the same time.
- Status is the gallery status symbol. Its hover is a pill, `--grey` when the row is already hovered.
- Room is 16px and 500. An empty room is a quiet dash.
- To-do is the location chip, a middot, and the item chip. They have a hover fill and no chevron. The location stays whole. The item truncates. Empty says Location and Item, and the middot is quiet.
- Urgency and type hug the value. Hover shows the down chevron in the chip’s gap and does not move the next column. The column is already as wide as its longest option, including Urgent’s icon and Food & Beverage. Standard stays `--sidebar-grey`. The type fill stays the department color on hover and while the menu is open.
- Assigned is the initials in a 35px avatar. Hover shows the chevron and the full name in a tooltip. Unassigned is the dashed empty avatar and says “Unassigned”.
- Opened is already as wide as “May 30”.
- Right-click opens the row menu: Schedule for future, then Delete. Delete uses the danger item.

Clicking a row opens its detail. Clicking that open row again closes it. A button or a field in the row keeps its own click. The row uses the hand, including the room, the location, the item, and the note. A field uses the text cursor only while it is focused.

## Known pieces

Confirm class names in `index.html` and `css/gallery.css` before using them. Expected groups:

- Color, type, and spacing specimens
- Buttons, including primary (`--action`) and destructive (`--destructive`)
- Filter chips (`--filter-chip-bg`)
- Switch (`.theme-switch`). Off track is `--grey`, on track is `--action`, knob is `--switch-knob`. The knob is the gallery thumb: 160ms on `--ease-out`, and it stops at the end of the track. The track color snaps. Reduced motion skips the travel and keeps the color. See [polish.md](polish.md).
- Tags (`--tag-text`, `--tag-bg`). The department tag on a note uses the urgency chip’s box: 20px tall, `2px 4px` padding, 4px radius, 13px type at weight 500. Each department has its own text and fill. Front desk stays gold. The list card and the open note share it. A type uses this same chip. The menu lists every department, and each uses that department’s colors. The table, the side panel, and a menu share it. At rest the chip hugs the label and does not reserve width for a hidden chevron. On hover the chevron follows the label and the chip widens to fit it. See [patterns.md](patterns.md).
- People. A compact name is `.mini-pill` with `.avatar.mini`. The name is 13px, weight 500, the same type as the urgency chip. A name with a role is `.person` with its avatar and name. Use that treatment wherever a person is named, including a menu option. An unassigned person is that avatar with no initials. Its fill is clear and its stroke is 1px dashed `--black-50`. A named person keeps the solid `--black-12` stroke.
- Urgency chips (`.urgency`). Urgent includes the warning icon. High, Standard, and Low are that same chip with the label only. Use the chip wherever an urgency level is named, including a menu option. Urgency, type, status, and the name chip share one font size: 13px, weight 500, line-height 16px. Urgency and type use `2px 4px` padding, a 20px height, and a 4px radius. Status uses the gallery status treatment at that same 13px.
- Menus (`--shadow-menu`). The Lance mode menu is this dropdown. Option names are `--black`, descriptions stay `--black-50`, and the check stays centered on the row. Icons in one menu share the Internal notes construction in [polish.md](polish.md). A thing with a more menu opens that same menu on right-click.
- Delete confirmation (`.confirm`). Pressing Delete opens this card. It does not remove the record. The title is “Delete this ______?” and the line under it says the named thing will be permanently removed for the whole team. Cancel closes the card. The confirming Delete control is `.btn-danger` and the only place `--destructive` appears.
- Inputs, search, and icon buttons
- The Lance composer and the message composer. On white, the message composer fill is `--sidebar-grey`. Add, the mode control, the microphone, and an empty send arrow hover with `--grey`, the same fill as a left nav row. The send arrow stays grey when the field is empty, including on hover. It turns `--action`, with white text, only when the field has text. The microphone stays `--action` only while it is on.

Notes-specific layout stays in `css/notes.css`. Do not fold one-off note chrome into the gallery unless it is reused.
