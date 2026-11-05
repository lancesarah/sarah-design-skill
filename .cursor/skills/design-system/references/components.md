# Components

The gallery in `catalog/index.html` is the component catalog. Reuse markup and classes from `catalog/gallery.css` before writing a new pattern. The table specimen also uses `catalog/todos-alt.css`.

When adding a component:

1. Find the closest gallery section and copy its structure.
2. Style with tokens from `catalog/tokens.css` only. Use the role or the alias, not a raw hue.
3. Put icons in the page's SVG sprite and reference them with `<use>`.
4. Add the new section to the gallery index if it is a shared component.

Each component below has four lines: when, when not, default, and the states already built. Loading and error are undecided on every one of them. Leave those two off until they are built.

Color, type, and spacing are gallery specimens. They are not components. The header, the filter row, the note card, the comment thread, the task row, and the detail panel are blocks in [patterns.md](patterns.md).

## Primary button

- When: the one action that creates or commits on that view.
- When not: a second action, a filter, a fact, or the confirming delete. A page that only views leaves that corner empty.
- Default: `.btn`.
- States: rest is `--action` with white text. Hover is `--action-hover` in both themes. Press scales the whole control to `0.98` and does not darken the fill. Disabled does not scale and does not take a hover fill.

## Secondary button

- When: an action beside the primary, or Cancel.
- When not: the main action, or a fact.
- Default: `.btn-secondary`.
- States: rest is `--white`, `--black` text, and `--stroke`. Hover is one step from the surface it sits on. Text and the hairline stay. Press uses the same scale as the primary. The fills are in [foundations.md](foundations.md).

## Danger button

- When: the confirming control on the delete card, or the danger item in a menu.
- When not: any other red. The control that only opens the confirmation is not danger yet.
- Default: `.btn-danger` on the card.
- States: filled rest is `--destructive` with white text. Hover is `color-mix(in srgb, var(--destructive) 88%, black)`. The line variant keeps the red text and takes the neutral hover step. Press scales. This is the only red.

## Filter chip

- When: a chosen filter, on the filter row.
- When not: the Filters trigger. That trigger keeps one width. The chip hugs the value it is showing.
- Default: `.chip-filter`.
- States: rest is `--filter-chip-bg` and `--action` text. Hover keeps that fill.

## Switch

- When: a setting that is on or off, such as dark mode.
- When not: a choice among three or more. That is tabs or segments.
- Default: `.theme-switch`, off.
- States: off track is `--grey`, on track is `--action`, knob is `--switch-knob`. The knob travels `--switch-dur` (160ms) on `--ease-out` and stops at the end. The track snaps. Reduced motion skips the travel and keeps the color. On a hovered secondary button the off track steps to `--grey-up`. The on track stays `--action`.

## Department tag

- When: a department or a type is named.
- When not: an urgency, a status, or a person.
- Default: the dot. Black label, an 8px circle in the department color, a clear chip, and a 1px `--black-12` ring. The same chip is used in a menu.
- States: rest, hover, open menu, and stroke mode are measured in the Department tag section of [patterns.md](patterns.md). The department fill stays, except in a menu, where the circle carries the color.

## Person

- When: a person is named, in a menu, a filter, a chip, a cell, or a sentence.
- When not: typing a new person on the record. A new person is added in Settings.
- Default: `.mini-pill` with `.avatar.mini`. A name with a role is `.person`.
- States: named, unassigned, and the dark-mode photo are measured in Naming a person in [patterns.md](patterns.md). Unassigned is the dashed avatar and says “Unassigned”.

## Urgency

- When: an urgency is named.
- When not: a department, a status, or a filter chip.
- Default: `.urgency`. Urgent includes the warning icon. High, Standard, and Low are the label only. A table cell and a menu show the colored word with no pill. A filter chip keeps the filled box.
- States: the word keeps its color. Standard’s word is `--black-50`. In a table chip and in the side panel, the word is centered in the chip with the chevron. `top` stays `0`. The filled chip, where it remains, is in Naming a person or an urgency in [patterns.md](patterns.md).

## Status

- When: a record is Open, In progress, or Completed.
- When not: an urgency, even where a hue is shared. Completed uses `--status-complete`. In progress uses `--action`. Open uses the high-urgency hue.
- Default: the gallery status symbol and its label.
- States: rest is the symbol and the word. On a hovered row the hover is a pill, `--grey` in light mode and `--black-12` in dark mode. The label matches the record.

## Menu

- When: a list of options that already exist, or a more menu.
- When not: creating a record. That happens on the page.
- Default: the gallery menu, with `--elevation-menu`.
- Width: hug the longest label, then leave 16px (`--space-16`) to the edge. The menu's 2px padding counts toward that 16px, so the row's trailing padding is 14px. The row is the icon and the label. A check sits at the end of that row and does not add a second gap. Less than 16px feels cramped. A fixed width leaves dead space after a short label. Short labels use `--menu-min` (132px). Past `--menu-max` (240px) the label truncates with an ellipsis, and the icon stays. The calendar is not this menu.
- Trailing icon: the check, the submenu chevron, and the trigger chevron share one inset, 6px from the row edge. The row's 14px padding stays for the label. The icon draws 8px into that padding (`margin-right: -8px`) so it lands on the trigger's 6px. The chevron is `--black-50`.
- Delete: Delete is the last item, in `--destructive`. A hairline runs the full width of the opening above it, through the menu's 2px padding. Search separators stay inset.
- Type: every option label is `--text-14`, the same size as the category row (Type, Status, Urgency, Assigned). A department chip, an urgency, a status, a name, and a plain label all use that size inside the menu. The 13px chip size stays outside the menu. A description under an option stays `--text-12`.
- States: option names are `--black`, descriptions stay `--text-muted`, and the check stays centered on the row. The trigger keeps its hover fill while the menu is open. A more menu also opens on right-click. Icons in one menu share the Internal notes construction in [polish.md](polish.md).

## Delete confirmation

- When: Delete was pressed.
- When not: before that press. The press opens this card. It does not remove the record.
- Default: `.confirm`.
- States: the title is “Delete this ______?” and the line under it says the named thing will be permanently removed for the whole team. Cancel closes the card. The confirming control is `.btn-danger`.

## Search

- When: a list is searched.
- When not: the page header. Search is not in the header.
- Default: the gallery search.
- States: 281px wide, 38px tall, `--sidebar-grey`, the list’s own placeholder. Hover and focus draw a 1px ring: `--black-25` in light mode, `--line` in dark mode. Text in the field is `--black`. The clear control stays while there is text. On a sheet the filter trigger sits on this field. The field does not grow to fill the row.

## Field

- When: a value is typed.
- When not: a person, a room, a department, or an urgency. Those are dropdowns of records that already exist.
- Default: `.field`.
- States: hover darkens the stroke to `--black-12`. Focus uses `--black-25` and does not fill.

## Icon button

- When: an action has no room for a label, or it is a tool in a row.
- When not: the primary action. That button has a label.
- Default: clear, not primary.
- States: rest is clear. Hover is one step from the surface. Press scales the whole control. Sidebar icon buttons stay unfilled at rest.

## Lance composer

- When: the field is the Lance chat.
- When not: a reply under comments. That is the message composer.
- Default: the Lance composer.
- States: add, the mode control, the microphone, and an empty send arrow hover with `--grey`. The send arrow stays grey when the field is empty, including on hover. It turns `--action`, with white text, only when the field has text. The microphone stays `--action` only while it is on.

## Message composer

- When: a reply sits under comments.
- When not: the Lance chat field.
- Default: the gallery message composer.
- States: on `--bg-surface`, the fill is `--sidebar-grey`. The row is 38px, the send control is 30px, and the send icon is 16px. Hover draws the same 1px ring. The empty send arrow stays grey.

## Tooltip

- When: a name or a shortcut is not already written on the control.
- When not: a menu, and not as the only place a fact is written.
- Default: the gallery tip.
- States: the first tip can wait and fade. The next tip snaps. A tip opened from the keyboard appears in the same frame. A click does not hide it. It paints above the page, the table, and the sidebar.

## Toast

- When: something just happened, and the person needs a short way back to it.
- When not: a delete confirmation, or an error on a field.
- Default: `.toast`.
- States: the bar is `--black` with `--white` text, the complete icon, and `--elevation-menu`. The time is `--text-muted`. The link rests at full opacity and drops to `0.7` on hover.

## Tabs

- When: a list is split into primary categories, including the department bar.
- When not: up to three views of one list. That is segments.
- Default: `.tab` on the page.
- States: on white, selected and hover use `--sidebar-grey`. On a `--sidebar-grey` bar, that step is `--grey`. A selected name is `--black` and its count is `--black-50`. An unselected name is `--black-50` and its count is `--black-25`.

## Segments

- When: one list has up to three views. The gallery heading is 3 max.
- When not: the department bar, or more than three views.
- Default: `.segmented`, with one segment selected.
- States: selected is `--white` with `--stroke` and `--black` text, and it does not take the unselected hover. Unselected hover is `--grey` and the label stays `--black-50`.

## Lesson card

- When: a training step that opens over the product, such as Lance Academy.
- When not: a delete confirmation, a menu, or the body of a page.
- Default: the card in [patterns.md](patterns.md), Lesson card.
- States: open over the page. Continue is the only action. Close dismisses it.

The title is `--text-24`. Progress is a `--space-2` bar on the bottom edge of the image. The step count shares the title’s line and is centered on the title, on the right. The space above the title is the card padding plus `--space-12`. The title group, the requirement, and the columns sit `--space-25` apart. A column title and the lines under it stay one block. Continue spans the content width at the bottom, stays inside the card padding, and is 40px tall. A button that does not span the bottom of a popup stays 28px. The close control is the only dismiss.

## Sidebar

- When: every product page. It is the left nav.
- When not: a second nav, or a restyle of this one per page.
- Default: expanded, with the current page selected.
- States: expanded and collapsed. Selected, unselected, hover, the grip, and the pin are measured below. The profile card is not settled.

The sidebar is one component. `catalog/notes.html` (`aside.side`) is the markup. `catalog/gallery.css` (`.side` and its children) is the styling. Every product page uses that pair.

- Do not restyle the sidebar in a page stylesheet. Width, padding, search, icons, hover, selected row, tooltips, scroll fade, scrollbar, collapse, and the account row are part of the component. The scroll fade is a small blur on the edge that still has more content. That thin scrollbar is the default scrollbar. The thumb is `--black-25`, and the track matches the surface behind it. A short horizontal strip, such as the department tabs, does not use the system bar. It uses the department-bar thumb in [patterns.md](patterns.md).
- A page may change link labels, `href`s, and which row has `aria-current="page"`. It may not change structure, spacing, or color.
- Keybind tooltips use the tool tip component: Messages is Opt M, Notifications is Opt N.
- Collapsed and expanded are the only two layouts. Both stay a fixed width.
- The selected row is a `--grey` fill. It has no white fill and no stroke, in both themes. The label and icon turn `--black`. An unselected row stays `--black-50`, including on hover. The pill is 30px tall, the same width as the search field above it, with a 6px radius and 1px between rows.
- Each nav row shows a reorder grip and a pin control on hover, and only while the sidebar is expanded. A row in Pinned uses the unpin glyph. Every other row uses the pin glyph. It is not the hidden eye. Its hover is the icon chip: an 18px box, 2px padding, and a 6px radius. Collapsed hides both. Hovering the rail does not bring them back.
- A section label stays 12px. Its weight is 500 so the text matches the nav link under it. The row stays the same height.
- The profile card at the bottom is not settled. Leave its layout alone until it is redesigned.

## Comment

- When: one remark under a record.
- When not: the Lance chat, or the whole thread. The thread is the comment thread block.
- Default: the gallery comment row.
- States: rest, and hover, which shows the more button.

A comment is the gallery comment. The row is at least 49px. The photo is 21px. The name and the time are 12px, and the time is `--text-muted`. The body is 14px. The photo and the text sit 10px apart. The more button is 28px and shows on hover. A reply under the comments is the message composer.

## Table

- When: records line up in columns, with a filter row and a task row.
- When not: a note list. That is the note card.
- Default: the gallery section `#table` in `catalog/index.html` (`.sheet-page`). Styling is in `catalog/todos-alt.css`.
- States: the frame, the column widths, and the count. A row’s states are the task row block. The filter’s states are the filter row block.

A new table copies that section. It does not invent a second row, chip, or filter.

Under the filter row, the columns are Status, Room, To-do, Urgency, Type, Assigned, and Opened. Content starts `--space-16` after each column line, and Status starts that same distance from the left edge. The column gap stays `--space-20`.

A column is at least as wide as its title with equal padding on the left and the right, and at least as wide as the value it is showing. That width is the minimum. Dragging the line at the right of a header stops there, and so do the arrow keys. The To-do column gives up the space. The note under the title fills that column. It does not shrink to the words. The location and the item still hug their labels.

One column names the record and takes the leftover width, so the row reaches the frame. On the to-do table that column is To-do. When a page has no title column, choose one from the job of the page: the column a person reads to tell one row from the next. A status, a time, a total, a person, and a department stay as wide as their values. Mark the chosen column so it grows. Use `flex` when the cell is a short name. Use `text: "primary"` when the cell is a title or a description. Double-click the line to return that column to its usual width. The width stays on this page. The columns resize with the pane. The table scrolls sideways when those minimums do not fit. A cell does not paint on top of the next column. The title, the note under it, and the column header start on the same line. The frame ends at the last row and keeps its rounded corners. It scrolls only when the rows pass the space above the count. Under the frame, at the left, the count is `--text-12` `--text-muted` and reads Showing N of M.

Screen-only note layout is not in this catalog. Do not fold one-off note chrome into the gallery unless it is reused.
