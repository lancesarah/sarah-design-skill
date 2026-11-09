# Components

The gallery in `catalog/index.html` is the component catalog. Reuse markup and classes from `catalog/gallery.css` before writing a new pattern. The table specimen also uses `catalog/todos-alt.css`.

When adding a component:

1. Find the closest gallery section and copy its structure.
2. Style with tokens from `catalog/tokens.css` only. Use the role or the alias, not a raw hue.
3. Put icons in the page's SVG sprite and reference them with `<use>`.
4. Add the new section to the gallery index if it is a shared component.

Each component below has four lines: when, when not, default, and the states already built. Loading is specified for the table. Error is undecided on every component. A page does not draw its own error. Leave it off until one treatment is added here.

Color, type, and spacing are gallery specimens. They are not components. Header, detail panel, and every control below are in this file. The filter row, the note card, the comment thread, and the task row are blocks in [patterns.md](patterns.md).

## Primary button

- When: the one action that creates or commits on that view.
- When not: a second action, a filter, a fact, or the confirming delete. A page that only views leaves that corner empty.
- Default: `.btn`.
- States: rest is `--action` with white text. Hover is `--action-hover` in both themes. One per surface. No hairline. Nothing else on that surface uses this fill. Press scales the whole control to `0.98` and does not darken the fill. Disabled does not scale and does not take a hover fill. A button is 28px, line-height 20px, padding `--space-4` 6px. An icon in the button uses that same padding. The label and the icon are centered. Side padding is equal.

## Secondary button

- When: an action beside the primary, or Cancel.
- When not: the main action, or a fact.
- Default: `.btn-secondary`.
- States: rest is `--white`, `--black` text, and `--stroke`. Hover is one step from the surface it sits on. Text and the hairline stay. On the page that step is `--sidebar-grey` in light mode and `--grey` in dark mode. On a `--sidebar-grey` panel it is `--grey`. On a dark `--grey` panel it is `--black-12`. Press uses the same scale as the primary. A button is 28px.

## Tertiary button

- When: a choice is on, and it should read as selected without a stroke or a dark fill. Required on a step is this.
- When not: the primary, a secondary action, or a choice that is off. Off stays secondary.
- Default: `.btn-tertiary`.
- States: rest is a `--grey` fill, `--black` text, and no hairline. Hover is `--black-12`. The text stays `--black`. An open menu keeps that hover fill. Press uses the same scale as the primary. A button is 28px.

Forced by: “instead of the inverted button can you make it like a tertiary button that's just a grey fill?”

## Danger button

- When: a delete control. The button on the page, the confirming control on the delete card, and an icon that removes a row. The icon is `--destructive` with or without a label.
- When not: the primary. A menu’s last item stays red text, not this button.
- Default: `.btn-danger`, the fill.
- States: fill is `--destructive` with white text. Hover is `color-mix(in srgb, var(--destructive) 88%, black)`. Light is `.btn-danger-light`: `--destructive` text and icon on `color-mix(in srgb, var(--destructive) 5%, transparent)`, no hairline. Hover deepens that fill to 12%. The text stays red. Press scales. There is no line variant. The word and the icon stay `--destructive` at rest, on hover, and on a hovered row. They do not turn grey or black. A trash icon with no label is still this control. The press opens Delete confirmation. It does not remove the thing.

Forced by: the step trash icons were grey. Then, “destructive items should always be RED.” Then, “on any destructive action, you need the popup.”

## Filter chip

- When: a chosen filter, on the filter row.
- When not: the Filters trigger. That trigger keeps one width. The chip hugs the value it is showing.
- Default: `.chip-filter`.
- States: rest is `--filter-chip-bg` and `--action` text. Hover keeps that fill.

## Checkbox

- When: a row is included or left out, such as a shift or a cash line.
- When not: a setting that is on or off for the whole view. That is the switch. A choice among labeled options is a menu.
- Default: `.check`, unchecked. The label is the row name, `--text-14`, `--black`.
- States: the box is 14px with a 4px radius. Unchecked is `--white` and `--stroke`. Hover fills the box one step, `--sidebar-grey` in light mode and `--grey` in dark mode. Checked is `--action` with a white check and no stroke. Checked hover is `--action-hover`. Press scales the whole row to `0.98`. Disabled does not scale and does not take the hover fill.

## Switch

- When: a setting that is on or off, such as dark mode.
- When not: a choice among three or more. That is tabs or segments. A row that is included or left out is a checkbox.
- Default: `.theme-switch`, off.
- States: off track is `--grey`, on track is `--action`, knob is `--switch-knob`. The knob travels `--switch-dur` (160ms) on `--ease-out` and stops at the end. The track snaps. Reduced motion skips the travel and keeps the color. On a hovered secondary button the off track steps to `--grey-up`. The on track stays `--action`.

## Department tag

- When: a department or a type is named.
- When not: an urgency, a status, or a person.
- Default: the dot. Black label, an 8px circle in the department color, a clear chip, and a 1px `--black-12` ring. The same chip is used in a menu.
- States: rest hugs the label. Hover and an open menu show the chevron. Stroke mode drops the fill. Color mode keeps it.

The base is the dot: a black label, an 8px circle in the department color, a clear chip, and a 1px `--black-12` ring. Height 20px. Radius 4px. The colored fill is the other mode. Front desk’s circle stays `--tag-text`. The list card and the open note use this same tag. At rest the chip hugs the label. It does not keep a gap for a chevron that is hidden. On hover and when the menu is open, the chevron appears after the label, in the chip’s 4px gap, and the chip widens to fit it. It does not cover the word. That extra width does not move the items beside the chip.

Stroke mode keeps the dot and drops the department fill. The notes chip rests clear, with `--black` text and a 1px `--black-12` ring centered on the chip edge. Its hover fills `--sidebar-grey` in light mode and `--grey` in dark mode, because that chip sits on the page. The same chip on a to-do row rests on the page fill with the `--black-12` ring, so the hovered row does not show through. Its hover is one step past that row: `--grey` in light mode, `--black-12` in dark mode, and the dark pressed ring is `--black-25`. The label is `--text-muted` at rest and `--black` on hover and while the menu is open. Color mode keeps the department fill in both themes.

A type uses this chip every time it is named. The menu and the filter list every department: Front desk, Housekeeping, Maintenance, Food & Beverage, Sales, and Management. Front desk uses `--tag-text` on `--tag-bg`. Housekeeping uses `--dept-housekeeping` on `--dept-housekeeping-bg`. Maintenance uses `--dept-maintenance` on `--dept-maintenance-bg`. Food & Beverage uses `--dept-food` on `--dept-food-bg`. Sales uses `--dept-sales` on `--dept-sales-bg`. Management uses `--dept-management` on `--dept-management-bg`. The fill stays on hover and while the menu is open, except in a menu. In a menu the type is the dot, not the colored pill. The label is `--black`. On the table the chip hugs that label. It is not stretched to the longest department. A filled chip uses `2px 4px` padding, a 20px height, and a 4px radius. A table cell and a menu drop that fill, so the word lines up with the column. A filter chip and the side panel keep the filled box.

## Person

- When: a person is named, in a menu, a filter, a chip, the side panel, or a sentence.
- When not: the Assigned column of a table. That column is the initials avatar. Typing a new person on the record is also not this. A new person is added in Settings.
- Default: `.mini-pill` with `.avatar.mini` and the name. A name with a role is `.person`.
- States: named and unassigned. A compact name is `.mini-pill` with `.avatar.mini` and the name, in a menu, a filter, a chip, the side panel, an activity line, and a sentence. Unassigned is that avatar with no initials: clear fill, 1px dashed `--black-50`. A named person keeps the solid `--black-12` stroke. The Assigned column is not this pill. It is on Table.

Picking a person is a dropdown of people who already exist. Adding a person is Settings, opened from the account gear. The name is typed there.

Forced by: “Picking a person should ALWAYS be a drop down. Adding a person is through settings, not from this.”

## Urgency

- When: an urgency is named.
- When not: a department, a status, or a filter chip.
- Default: `.urgency`. Urgent includes the warning icon. High, Standard, and Low are the label only. A table cell and a menu show the colored word with no pill. A filter chip keeps the filled box.
- States: the word keeps its color. Standard’s word is `--black-50`. Do not recolor the word because the row or the menu behind it changes. In a table chip and in the side panel, the word is centered in the chip with the chevron. The chip’s own `top` stays `0`. Do not keep `top: 2px` on the word once it sits inside the chip. A filter chip and the side panel keep the filled box, the same padding and height as a filled department tag. A table cell and a menu drop that fill.

Forced by: the High chip, “the chip is misaligned with the text.”

## Status

- When: a record is Open, In progress, or Completed.
- When not: an urgency, even where a hue is shared. Completed uses `--status-complete`. In progress uses `--action`. Open uses the high-urgency hue.
- Default: the gallery status symbol and its label.
- States: rest is the symbol and the word. On a hovered row the hover is a pill, `--grey` in light mode and `--black-12` in dark mode. The label matches the record.

## Menu

- When: a list of options that already exist, or a more menu.
- When not: creating a record. That happens on the page.
- Default: the gallery menu, with `--elevation-menu`.
- Width: hug the longest label, then leave 16px (`--space-16`) to the edge. The menu's 2px padding counts toward that 16px, so the row's trailing padding is 14px. The row is the icon and the label. A check sits at the end of that row and does not add a second gap. Less than 16px feels cramped. A fixed width leaves dead space after a short label. Short labels use `--menu-min` (132px). Past `--menu-max` (240px) the label truncates with an ellipsis, and the icon stays. When the menu opens from a form field that is wider than that menu, the menu takes the field's width. It does not stay narrower than the box it opened from, and `--menu-max` does not pull it back under the field. The calendar is not this menu.
- Trailing icon: the check, the submenu chevron, and the trigger chevron share one inset, 6px from the row edge. The row's 14px padding stays for the label. The icon draws 8px into that padding (`margin-right: -8px`) so it lands on the trigger's 6px. The chevron is `--black-50`.
- Delete: Delete is the last item, in `--destructive`. A hairline runs the full width of the opening above it, through the menu's 2px padding. Search separators stay inset.
- Type: every option label is `--text-14`, the same size as the category row (Type, Status, Urgency, Assigned). A department chip, an urgency, a status, a name, and a plain label all use that size inside the menu. The 13px chip size stays outside the menu. A description under an option stays `--text-12`.
- States: option names are `--black`, descriptions stay `--text-muted`, and the check stays centered on the row. The trigger keeps its hover fill while the menu is open. A closed menu shows the selected option's icon. A thing that has a more menu opens that same menu on right-click. The items match the more button. The menu opens at the pointer. The open note is not that target. The note card is. Icons in one menu share the Internal notes construction in [polish.md](polish.md).

Forced by: hug the longest label, then 16px to the edge. Then, “if the actual form box of the drop down is wider than the options, please allow the drop down to take the width of the form.” Then, “right clicking the note card on the left should open the same options as the more button, share and delete.”

## Delete confirmation

- When: any destructive action was pressed. A labeled Delete button and a trash icon with no label are the same press. A menu’s Delete item is the same press.
- When not: before that press. The press opens this card. It does not remove the record, the row, the step, the category, or the area.
- Default: `.confirm`.
- States: the title is “Delete this ______?” and the line under it says the named thing will be permanently removed for the whole team. Cancel closes the card. The confirming control is `.btn-danger`.

Forced by: “on any destructive action, you need the popup. Whether it's a trash can icon or a full delete button, it needs the popup.”

## Search

- When: a list is searched.
- When not: the page header. Search is not in the header.
- Default: the gallery search.
- States: 281px wide, 38px tall, `--sidebar-grey`, the list’s own placeholder. Hover and focus draw a 1px ring: `--black-25` in light mode, `--line` in dark mode. Text in the field is `--black`. The clear control stays while there is text. On a sheet the filter trigger sits on this field. The field does not grow to fill the row.

## Field

- When: a short value is typed, one line, with its label above it.
- When not: a person, a room, a department, or an urgency. Those are dropdowns of records that already exist. A title over a larger block of text is the text well. A line with no label of its own is the line field.
- Default: `.field`.
- States: the input is `--white`, `--text-14`, height 32px, padding `0 var(--space-10)`, radius `--radius-control`, and `--stroke`. Hover darkens the stroke to `--black-12`. Focus uses `--black-25` and does not fill.

Every one-line input box is 32px. A labeled field and a line field share that height, that padding, and that radius. A quantity, a date, a unit, a minimum, and a maximum are this box. A description or a notes field is the text well. Phone, email, and loyalty on a complaint stay the fact row. Search stays the search field.

## Line field

- When: one line is typed and the label is the placeholder. A new step, a unit, a minimum, a maximum, a category name.
- When not: a labeled value. That is Field. A list search. A paragraph under a title. That is the text well.
- Default: `.line`.
- States: rest is `--white`, `--text-14`, height 32px, padding `0 var(--space-10)`, radius `--radius-control`, and `--stroke`. The placeholder is `--text-muted`. Hover darkens the stroke to `--black-12`. Focus uses `--black-25`. The fill does not change.

A line field is the same 32px box as Field. The placeholder is the label. It stays one line, and it stays the same height as the field beside it.

## Text well

- When: a section title sits over a description or notes. The knowledge answer is the specimen: the label "Answer", then the filled field.
- When not: a one-line input. That is Field or Line field. A search field. The body of a note on the notes page, and a note that is only read. Phone, email, and loyalty stay the fact row. A person, a room, a department, and an urgency stay dropdowns.
- Default: a `.sheet-label`, then `.text-well`. An optional line under the field, such as the answer help, is `--text-12` and `--text-muted`.
- States: rest is `--sidebar-grey`, `--black` text, `--text-14`, line-height 20px, padding `--space-10`, radius `--radius-control`, height 96px. The label is the sheet label, `--text-12` and weight 500 in `--black-50`, `--space-4` above the field. Hover is a 1px `--black-12` ring. Focus is a 1px `--black-25` ring. The fill does not change. There is no pencil. Dark mode uses `--grey`. A well that sits on a surface that is already that fill takes the next step: `--white` in light, `--black-12` in dark.

Every editable description and notes field is this box. A complaint description, a to-do description, a template description, a knowledge answer, cash count notes, reading notes, and a fix note share the 96px height, the padding, the radius, and the type. One line of text keeps the box at 96px. A longer note starts from that same box. The width is the column it sits in. The corner can still be dragged taller. A note that is only read sits on the page, in the page’s type, with no well.

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
- States: the first tip can wait and fade. The next tip snaps. A tip opened from the keyboard appears in the same frame. A click does not hide it. It paints above the page, the table, and the sidebar. A tip fits on one line. A tip on a tag is centered on that tag, and the shadow is on the tip.

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

## Header

- When: every page. The top row of the screen.
- When not: a second header inside the page content.
- Default: the gallery page header.
- States: a main page may hold one primary. A subpage's top-right is back only.

The row is 60px. The page icon is 30px. The title is 14px and `--black`, including the parent you click to go back. The count is 14 / 400 in `--text-muted`. A 1px `--line` closes the row.

A button in this row always has an icon beside the label. A text-only header button is wrong. This includes the primary, a secondary, and a utility. An icon-only tool already meets it. A button in the page content is not this rule.

Forced by: "Add a rule that buttons that live in the header should always have icons."

## Page layout

- When: a list page. Preventive maintenance, Readings, and Knowledge base are this.
- When not: a subpage. A subpage keeps the header and uses the top-right for back only. Its content stays within 820px.
- Default: the gallery page layout. Header, then tabs, then the filter row, then the page.
- States: the title row is always there. Tabs, when the list has categories. The filter row, when the list can be searched.

The header is Header. It is 60px. The icon is 30px. The icon, the title, and the count sit `--space-8` apart. The actions sit `--space-8` apart at the other end, `--space-16` from the title group. The inline inset is `--space-16`. On the product card that inset is `--space-16` plus the card’s `--space-2` padding, so the icon, the tabs, and the search share one left edge. A 1px `--line` closes the row.

Tabs sit on that line. Their padding is `--space-8` `--space-16`. The filter row is the filter row, padded `--space-12` `--space-16`. A summary under it starts `--space-25` below the row and keeps the same inline inset.

A title and the table it names start 40px apart, measured to the table header. The table’s 1px stroke does not add a pixel. A section title, such as Guestrooms on preventive maintenance, uses that same 40px. A page does not pick its own gap.

## Detail panel

- When: a record opens beside the table.
- When not: a subpage, or a popup. Edit template is the editor popup.
- Default: the gallery detail panel.
- States: closed, open, entering, and leaving.

The panel is 392px and sits over the right of the table. The table keeps its width. It does not shrink to sit beside the panel. Entering is `--motion-panel` (400ms) on `--ease-drawer`. Leaving is `--motion-panel-out` (320ms). Reduced motion skips the slide. A page does not restyle the width, the header, or the slide.

Every page uses the same header. The back button sits on the left and closes the panel. The right-hand group holds any page action, then the more button. The more button is clear at rest. Its grey fill shows only while the pointer is on it. Its menu is Delete only, and it opens again after it closes. A right-click on the panel opens that same menu. The body is the page’s fields. A description or notes field is the text well, 96px. A one-line input box is the field, 32px. Phone, email, and loyalty stay the fact row.

Editable text in the panel shows a pencil on hover. The pencil is the edit icon, 14px, in `--black-50`. It sits after the text on the first line. The text does not move when it appears. Clicking the field removes the pencil. The table does not show this pencil. A text well does not show it either. The field is already a box.

The body stacks its sections 24px apart. The scroll padding is `--space-16` on top and `--space-25` on the sides and the bottom. A rule between sections is 1px `--line` and runs the full width of the panel, through that side padding. A section label is `--text-12`, weight 500, and `--black-50`. A fact row is a 70px label and the value, `--space-16` apart, at least 20px tall, in `--text-14`. In dark mode the detail uses `--grey`.

On a to-do, the panel opens and closes from the task row. The side title is the location and item chips, empty or filled. An empty title is Location and Item, not the word “To-do”. The title chips use the task row’s box and the same hover. In the side panel, guest mood, type, assigned, status, and urgency share one type: `--font`, `--text-14`, weight 400, and a 16px line-height. The control is 20px tall, with padding `2px 4px` and a 4px radius. The status icon is 16px so the word stays on that line. Table chips stay 13px. A menu option stays `--text-14`. The assignee keeps the miniature avatar, the name, and a `--sidebar-grey` fill. Hover and an open menu keep that fill and show the down chevron. Status keeps its icon and label and has no fill at rest. Type is the department chip. The room uses the task row’s room control. Location and Item are dropdowns. At rest they are the value with no fill. Hover and an open menu show a `--sidebar-grey` pill and a down chevron after the value. The room, title, and date use `--space-16`. The Description label is `--text-12`. The note under it is `--text-14`. Activity stacks its heading and reply `--space-8` apart. The reply field is `--text-14`. Guest mood, phone, email, and a page’s other facts use this same panel. They do not get a second header or a second width.

## Room

- When: a room is chosen.
- When not: a number the person types.
- Default: a dropdown of rooms that already exist.
- States: the chosen room, or the quiet dash when it is empty.

The number is not typed on the row, in the side panel, or anywhere else a room is chosen. The number is 16px and weight 500, the same size on the row and in the detail panel. An empty room is a quiet dash. It does not say Room.

Forced by: “room will always be a drop down.”

## Lesson card

- When: a training step that opens over the product, such as Lance Academy.
- When not: a delete confirmation, a menu, or the body of a page.
- Default: the lesson card.
- States: open over the page. Continue is the only action. Close dismisses it.

The card is `--white`, `--radius-card`, and `--stroke` with `--elevation-menu`. The title is `--text-24`, weight 500, line-height 28px. A row title and a side title stay `--text-20`. The title and the line under it are `--space-4` apart. The title group, the requirement, and the columns sit `--space-25` apart. A column title and the lines under it stay one block. The space above the title is the card padding plus `--space-12`. Do not pull the title up toward the image.

An image sits at the top and meets the card edges. Progress is a `--space-2` bar on the bottom edge of that image. The filled part is `--action`. The rest is `--black-12`. A measured count uses the progress bar, not this hairline. The step fraction, such as “1 of 3”, shares the title’s line and is centered on the title, on the right. Do not add a brand or product name beside it.

Continue spans the content width and sits at the bottom, inside the card padding. It keeps the button radius. It does not meet the card edge. Because it spans the bottom of a popup, it is 40px tall. A button anywhere else stays 28px. The corner close is the only dismiss. A second dismiss, such as Not now, does not sit beside Continue.

Forced by: make the title bigger; turn the step count into a progress bar on the image edge and move “1 of 3” to the right, aligned with the section name; make Continue span the width, because Not now and the corner close are the same dismiss. Then, Continue still has margin.

## Progress bar

- When: a measured count, such as hotel knowledge health or a checklist.
- When not: a lesson card. That bar is `--space-2` tall and sits on the bottom edge of the image.
- Default: `.kb-meter` and `.kb-meter-fill` in `css/knowledge.css`. Knowledge health is the reference.
- States: empty, partial, and full. A locked or completed measure keeps the bar. Its fill is `--text-muted`.

The track is 42px tall and the full width of its group. It is a stripe of `--black-12`, `--space-2` wide, repeating every `--space-4`. The fill is that same stripe in `--action`, and its width is the share that is done. The count sits with the bar, on the line above it. It does not sit inside the stripe. Do not draw a second bar, a solid fill, or a different height.

## Sidebar

- When: every product page. It is the left nav.
- When not: a second nav, or a restyle of this one per page.
- Default: expanded, with the current page selected.
- States: expanded and collapsed. Selected, unselected, hover, the grip, and the pin are measured below. The profile card is not settled.

The sidebar is one component. `catalog/notes.html` (`aside.side`) is the markup. `catalog/gallery.css` (`.side` and its children) is the styling. Every product page uses that pair.

- Do not restyle the sidebar in a page stylesheet. Width, padding, search, icons, hover, selected row, tooltips, scroll fade, scrollbar, collapse, and the account row are part of the component. The scroll fade is a small blur on the edge that still has more content. That thin scrollbar is the default scrollbar. The thumb is `--black-25`, and the track matches the surface behind it. A short horizontal strip, such as the department tabs, does not use the system bar. It uses the department-bar thumb in [patterns.md](patterns.md).
- A page may change link labels, `href`s, and which row has `aria-current="page"`. It may not change structure, spacing, or color.
- Keybind tooltips use the tool tip component: Messages is Opt M, Notifications is Opt N.
- Collapsed and expanded are the only two layouts. Open is 277px. The collapsed rail is 54px. Both stay a fixed width. Collapsed hides the labels and keeps the rail. The 18px icon stays centered and is not clipped. The collapsed selection is a 32px square on the icon. Hover uses that same square. It does not slide or resize. A collapsed section label takes no space. Opening and closing do not flash a horizontal scrollbar. Hover does not animate.
- The account control is the settings gear. Do not put a three-dot menu there.

Forced by: "it should still have a thin bar," "make them center," "the horizontal scroll bar flashes," and "this should be the settings icon."
- The selected row is a `--grey` fill. It has no white fill and no stroke, in both themes. The label and icon turn `--black`. An unselected row stays `--black-50`, including on hover. The pill is 30px tall, the same width as the search field above it, with a 6px radius and 1px between rows.
- Each nav row shows a reorder grip and a pin on hover, and only while the sidebar is expanded. The pin is the Pin component below. Collapsed hides both. Hovering the rail does not bring them back. Pinning opens the Pinned group. The item stays in its home group.
- A section label stays 12px. Its weight is 500 so the text matches the nav link under it. The row stays the same height.
- The profile card at the bottom is not settled. Leave its layout alone until it is redesigned.

## Pin

- When: a person pins a nav row or a section so that item stays at the top.
- When not: a map marker, a decorative icon, or the hidden eye.
- Default: the outline pin. Pressed: the filled pin.
- States: rest, hover, pinned, and unpinned. On the sidebar it also hides when the rail is collapsed.

The control is the icon chip: an 18px box, 2px padding, and a 6px radius. At rest the icon is `--black-50`. Hover fills `--black-12` and the icon turns `--black`. The label is Pin. When it is pinned, `aria-pressed` is true, the icon is the filled pin, and the label is Unpin.

Pinning moves that item to the front of the pinned set. A newer pin sits ahead of an older one. Unpinning takes it off that front. A copy that still lives in its home list stays where it was.

On the sidebar the grip and the pin show on row hover, and only while the sidebar is expanded. On a section heading the pin sits at the end of the heading and shows when that stage is hovered or focused.

## Section card

- When: fields that belong together on one record, such as a template's description, or one step category.
- When not: the record title. An action for the whole record, such as Delete. A screen with one thing.

A card holds one group. The record title stays on the page. Delete stays out of the cards. A control that stays visible while the sections change sits in a part of the page that also stays put. It does not sit under content whose height changes. The title row is one stable place. It is not the only one.

The card is `--white`, `--radius-card`, and `--stroke`. No drop shadow. Padding is `--space-16`.

Forced by: Delete sat inside the type and frequency card. Then, “the cards group things together and since delete refers to the entire template, it should sit outside of the card.” Then, “as I switch between the three pages, it jumps around.” Then, “not just like always on the title on the right, just like should be in a section that also stays consistent.”

## Editor popup

- When: Edit template. It opens over the check. It is not a subpage.
- Dismiss: the corner close, the scrim, and Escape. Save is the primary, at the bottom right. Delete is the light danger button and opens the confirm first.

Width is `652px`, or the screen when that is narrower. Height starts at `554px`, the Details tab. Areas uses that same height. The box grows when the content is taller than `554px`. It stops at the viewport, inside `--space-25` of the scrim.

## Inset card

- When: several similar items share a page, and each one expands in place with the title staying put. The card is how one item is told apart from the next.
- When not: the screen has one action or one thing. That thing sits on the page. The shell and the white inset exist to separate a set. They are not a frame for a single screen. The detail panel slides over the table. A menu is not this card.
- Default: open, in the gallery section `#inset-card`.
- States: open and closed. The title row is the same in both.

The shell is `--sidebar-grey`, with 6px of padding, a 1px `--grey` border, and a 10px radius. The head is at least 56px, padded `11px 22px`, and pulled up 6px so it sits in that shell padding. The title is `--text-16` with a 21px line-height. Page actions sit in the tools, and the chevron stays last. Each tool button is 28px with `--radius-control`. Hover fills `--grey`.

The chevron points down while the card is open. Closed, it turns −90 degrees over 160ms on `--ease-out`. The body is a white inset with a 1px `--grey` border and `--radius-control`. Its padding is `30px 30px 40px`, and the contents stack with a 40px gap. Below 720px that padding is `--space-16` and the gap is `--space-25`. The page supplies the body. The card does not restyle for one page’s fields.

Adding another item of that same kind is the Add row.

Opening grows the body and fades it in over `--motion-grow` (240ms) on `--ease-out`. Closing runs `--motion-grow-out` (192ms), about 20% faster. The title does not move. `prefers-reduced-motion: reduce` snaps the body and the chevron.

## Add row

- When: a page holds several records of one kind, and the person adds another of that kind on the page. Cash locations use it for New location. A PM template uses it for Add category. Readings uses it for Add source.
- When not: the page header. A header action is a button with an icon. A submit beside a field stays a secondary button. Add on a new step, and Add measurement, are that button. One record on a page does not get this row.
- Default: `.cash-new-location`, with `.cash-new-stroke` for the dash. The gallery specimen is `#add-row`.
- States: rest and hover.

The row is the width of the list it adds to. On a subpage that width is 820px. It is `--sidebar-grey`, 56px tall, with a 10px radius. The label is `--text-muted` at 14px, and a 14px plus sits `--space-4` before it. The edge is a 1px dashed `--black-12` stroke, drawn as its own shape so the dash follows the radius. Hover is `--grey`. In dark mode that hover is `--black-12`. It sits above or below the records. It is not a secondary button.

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
- States: the frame, the column widths, and the count when a control can hide a row. Hovering a cell highlights the whole row. A row’s states are the task row block. The filter’s states are the filter row block.

A new table copies that section. It does not invent a second row, chip, or filter.

The list variant is the checklist. It is this table. It keeps the rows and the columns, and it leaves off the column header, the column rules, the row wash, and the Showing count. The group header stays on the list.

The Showing count sits under the frame only when a search, a filter, a tab, or another control can hide a row. Pass `total` as the full set before those controls. The line reads Showing N of M. When every row is always on screen, omit `total` and leave the count off. A table of measurements on a source has no such control, so it has no count.

Forced by: “No don't show the showing X of X in this table since there is no toggles or filters to apply that would hide anything. Make that a rule.”

Forced by: “Just make it so that this custom list is a variant of DataTable.”

The Assigned column is that table column on every table. The cell is the initials in a 35×35 avatar. Hover shows the chevron beside that circle, outside the pill, and the full name in a tooltip. Only the circle’s fill changes. The ring stays 1px. It does not gain a second stroke. The chevron does not sit in that pill, and the next column stays put. Click opens the people menu. The row hover does not change the photo. Unassigned is the dashed empty avatar, and the tooltip says “Unassigned”. In dark mode a named photo is `--grey`, lighter than the page. Hovering that circle uses a `--black-12` fill. The ring stays 1px. An empty photo stays clear, with a 1px dashed `--black-50` stroke. The dark photo clip that insets a portrait does not apply to that dash. The named pill stays in the side panel, a menu, a filter, and an activity line. It does not go in the column.

A column that shows one of a fixed set of options is already as wide as its longest option, including that option’s icon and padding. This holds for every aligned grid, including a table and a week schedule. The header and every row share one set of tracks. Do not let each row measure its own columns. The control still hugs the value it is showing. Choosing another option does not move that column or the columns beside it. Stack every option in the same grid cell and hide the ones that are not selected.

Forced by: “it should use the assigned table column like the other pages,” and “Edit the design system so it will always use that.”

When several tables share a page, each table has one title. The title is `.sheet-group`: `--text-14`, weight 500, line-height 20px, `--black`, and `--space-8` below it. A count beside that title is `--text-14`, weight 400, `--black-50`, and `--space-8` to the left. Cash locations and PM groups use this title. It is not a record title. A record title stays 16/500. Do not size this title with `--text-16`. The title above a table sits `--space-8` from the frame. When the Showing count is present, it sits `--space-8` under the frame.

Under the filter row, the columns are Status, Room, To-do, Urgency, Type, Assigned, and Opened. Content starts `--space-16` after each column line, and Status starts that same distance from the left edge. The column gap stays `--space-20`.

A column is at least as wide as its title with equal padding on the left and the right, and at least as wide as the value it is showing. That width is the minimum. The note under the title fills that column. It does not shrink to the words. The location and the item still hug their labels.

The resize handle sits on the right edge of each header. The hit area is 12px wide and centered on the column line. The drawn line is 1px. It stays clear until hover, keyboard focus, or a drag, and then it is `--black-50`. While the pointer is down, a 1px `--black-50` guide follows that edge. Dragging stops at the minimum. The arrow keys step 8px and stop at the same minimum. The column that takes the leftover width gives up space first. Double-click returns that column to its usual width. The width stays on this page.

Plain text in a row is `--text-muted`. One column is `--black`: the name, the column a person reads to tell one row from the next. A second text column is `--black` only when that name is not enough to tell the rows apart. Mark that one with `ink: "strong"`. A person stays the person component, in `--black`, and this ink step does not restyle it. A status, a chip, a switch, and an urgency keep their own color. This is text only.

One column names the record and takes the leftover width, so the row reaches the frame. On the to-do table that column is To-do. When a page has no title column, choose one from the job of the page: the column a person reads to tell one row from the next. A status, a time, a total, a person, and a department stay as wide as their values. Mark the chosen column so it grows. Use `flex` when the cell is a short name. Use `text: "primary"` when the cell is a title or a description. Double-click the line to return that column to its usual width. The width stays on this page. The columns resize with the pane. The table scrolls sideways when those minimums do not fit. A cell does not paint on top of the next column. The title, the note under it, and the column header start on the same line. The frame ends at the last row and keeps its rounded corners. It scrolls only when the rows pass the space above the count, or the bottom of the frame when there is no count. When a search, a filter, a tab, or another control can hide a row, the count sits under the frame, at the left. It is `--text-12` `--text-muted`, sits `--space-8` under the frame, and reads Showing N of M. M is the full set before those controls. When every row is always on screen, that line is left off.

While the rows are still loading, the same table shows the skeleton in the Loading state of that section. A table whose rows are already in hand shows them. Opening that page again does not play the skeleton. The bars are the wait, and they start when the rows arrive.

Forced by: “It should only appear when necessary, when content hasn't actually loaded. Not strictly every time.” The bars sit in the cells. The columns do not change width when the values arrive. A title with a note under it is two bars, 6px apart: the title is 12px tall and 42% of the column, and the note is 10px tall and 68%. A cell that is one line is one 12px bar, 68% of the column. A chip, a status, or a person is one bar, 64px by 20px. A short value is one 12px bar. Every bar is `--grey` with a 4px radius. The bars pulse once, opacity 1 to `--sk-pulse-min` and back, over `--sk-pulse-dur`, ease-in-out. The values then crossfade in and the bars crossfade out over `--sk-reveal-dur`, with a `--sk-reveal-blur` blur. Each column starts `--sk-ripple` after the one on its left. The row takes no hover and no press while the bars are up. `prefers-reduced-motion: reduce` skips the pulse, the blur, and the delay, and the values appear in place. Do not add a shimmer, a second grey, or a skeleton that sits outside the cell.

Screen-only note layout is not in this catalog. Do not fold one-off note chrome into the gallery unless it is reused.
