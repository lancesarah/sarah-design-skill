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
- States: rest is `--action` with white text. Hover is `--action-hover` in both themes. One per surface. Rest is the `--action` fill under `--depth-sheen`, with `--depth-edge` and `--depth-drop` as the shadow. `--depth-rim` is a 1px inner highlight drawn on `::after`. That is the depth. A flat blue fill is wrong. Disabled drops the depth. Nothing else on that surface uses this fill. Press scales the whole control to `0.98` and does not darken the fill. Disabled is the same button at 60% opacity. It does not scale and does not take a hover fill. A button is 28px, line-height 20px, padding `--space-4` 6px. An icon in the button uses that same padding. The label and the icon are centered. Side padding is equal.

Forced by: "the primary button doesn't have the correct styling, it doesn't have the depth."

## Secondary button

- When: an action beside the primary, or Cancel. A section's own action on the page, such as Edit beside a section title, with its icon.
- When not: the main action, or a fact.
- Default: `.btn-secondary`.
- States: rest is `--white`, `--black` text, and `--stroke`. Hover is one step from the surface it sits on. Text and the hairline stay. On the page that step is `--sidebar-grey` in light mode and `--grey` in dark mode. On a `--sidebar-grey` panel it is `--grey`. On a dark `--grey` panel it is `--black-12`. Press uses the same scale as the primary. A button is 28px.

Secondary button, Filter, and the trigger: rest is `--stroke` plus `--depth-drop`.

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
- States: fill is `--destructive` with white text. Hover is `color-mix(in srgb, var(--destructive) 88%, black)`. Light is `.btn-danger-light`: `--destructive` text and icon on `color-mix(in srgb, var(--destructive) 5%, transparent)`, no hairline. Hover deepens that fill to 12%. The text stays red. Press scales. There is no line variant. The word and the icon stay `--destructive` at rest, on hover, and on a hovered row. They do not turn grey or black. The grey icon switch does not recolor them. A trash icon with no label is still this control. The press opens Delete confirmation. It does not remove the thing.

The filled danger button takes the same sheen, edge and drop as the primary. The light danger button does not.

Forced by: the step trash icons were grey. Then, “destructive items should always be RED.” Then, “on any destructive action, you need the popup.”

## Chip

- When: a compact action or value inline with other content, a label with or without an icon.
- When not: a department, an urgency, a status, or a person. Each has its own component. A chosen filter is the filter chip.
- Default: `Chip`.
- States: rest, hover, and pressed. A chip hugs its label and does not reserve width for every option it might show. A longer value widens the chip, and the chips beside it move with it. A chip outside a menu is 13 / 400. Inside a menu it is `--text-14`.

## Filter chip

- When: a chosen filter, on the filter row.
- When not: the Filters trigger. That trigger keeps one width. The chip hugs the value it is showing.
- Default: `Chip` with `filter={{ name, value }}`, and `onClick` removes that filter. Do not write the `.chip-filter` markup by hand.
- States: rest is `--filter-chip-bg` and `--action` text. Hover keeps that fill.

## Checkbox

- When: a row is included or left out, such as a shift or a cash line.
- When not: a setting that is on or off for the whole view. That is the switch. A choice among labeled options is a menu.
- Default: `.check`, unchecked. The label is the row name, `--text-14`, `--black`.
- States: the box is 14px with a 4px radius. Unchecked is `--white` and `--stroke`. Hover fills the box one step, `--sidebar-grey` in light mode and `--grey` in dark mode. Checked is `--action` with a white check and no stroke. Checked hover is `--action-hover`. Press scales the whole row to `0.98`. Disabled does not scale and does not take the hover fill.

Large is the same box at 18px, with a 5px radius and a 12px check. It is for a row picked from a list of people, where the box sits alone at the end of the row. That is the checkbox's `size="lg"`. A picked row in that list is tinted `--filter-chip-bg`, and hover does not add a second step.

## Switch

- When: a setting that is on or off, such as dark mode.
- When not: a choice among three or more. That is tabs or segments. A row that is included or left out is a checkbox.
- Default: `.theme-switch`, off.
- States: off track is `--grey`, on track is `--action`, knob is `--switch-knob`. The knob travels `--switch-dur` (160ms) on `--ease-out` and stops at the end. The track snaps. Reduced motion skips the travel and keeps the color. On a hovered secondary button the off track steps to `--grey-up`. The on track stays `--action`.

## Department tag

- When: a department or a type is named.
- When not: an urgency, a status, or a person.
- Default: the dot. Black label, an 8px circle in the department color, a clear chip, and a 1px `--black-12` ring. A menu option is the plain tag (`plain`): the dot and the label, with no ring.
- States: rest hugs the label. The fill rests clear and the `--black-12` ring stays. Hover and an open menu show the chevron and fill `--sidebar-grey`, and `--grey` in dark mode. The ring stays. The same chip is used in a note, a table, a menu, a filter, and the side panel. Color mode keeps the department fill.

The base is the dot: a black label, an 8px circle in the department color, a clear chip, and a 1px `--black-12` ring. Height 20px. Radius 4px. The colored fill is the other mode. Front desk’s circle stays `--tag-text`. The list card and the open note use this same tag. At rest the chip hugs the label. It does not keep a gap for a chevron that is hidden. On hover and when the menu is open, the chevron appears after the label, in the chip’s 4px gap, and the chip widens to fit it. It does not cover the word. That extra width does not move the items beside the chip.

The department tag is one chip. It rests clear, with `--black` text and a 1px `--black-12` ring. Hover and an open menu fill `--sidebar-grey` in light mode and `--grey` in dark mode. The ring stays. That drawing is the same in a note, a table, a filter, and the side panel. A menu option, and a value inside an editor field, is the plain tag with no ring. Color mode keeps the department fill in both themes.

A type uses this chip every time it is named. The menu and the filter list every department: Front desk, Housekeeping, Maintenance, Food & Beverage, Sales, and Management. Front desk uses `--tag-text` on `--tag-bg`. Housekeeping uses `--dept-housekeeping` on `--dept-housekeeping-bg`. Maintenance uses `--dept-maintenance` on `--dept-maintenance-bg`. Food & Beverage uses `--dept-food` on `--dept-food-bg`. Sales uses `--dept-sales` on `--dept-sales-bg`. Management uses `--dept-management` on `--dept-management-bg`. The fill stays on hover and while the menu is open in color mode, except in a menu. In a menu the type is the dot, not the colored pill. The label is `--black`. On the table the chip hugs that label. It is not stretched to the longest department. A filled chip uses `2px 4px` padding, a 20px height, and a 4px radius. A table cell and a menu drop that fill, so the word lines up with the column. A filter chip keeps the filled box. Every department keeps the `--black-12` ring. The fill rests clear. Hover and an open menu fill `--sidebar-grey`, and `--grey` in dark mode. The ring stays.

## Person

- When: a person is named, in a menu, a filter, a chip, the side panel, or a sentence.
- When not: the Assigned column of a table. That column is the initials avatar. Typing a new person on the record is also not this. A new person is added in Settings.
- Default: `.mini-pill` with `.avatar.mini` and the name. A name with a role is `.person`.
- States: named and unassigned. A compact name is `.mini-pill` with `.avatar.mini` and the name, in a menu, a filter, a chip, the side panel, an activity line, and a sentence. Unassigned is that avatar with no initials: clear at rest, 1px dashed `--black-50`. On a control, hover and an open menu fill the pill with `--sidebar-grey`. In dark mode that fill is `--grey`. The dashed avatar stays. A named person keeps the solid `--black-12` stroke and the `--sidebar-grey` fill. The Assigned column is not this pill. It is on Table.

A profile picture, initials or a photo, shows the person's name in a tooltip on hover, centered above the picture, only when the picture stands alone. That is the avatar's `name`. When the name is already written beside the picture, the tooltip is not there. A photo is the avatar's `photo`. It fills the same circle, and the photo edge stands in for the border and the fill. The named pill and a name with a role do not repeat the name in a tooltip.

Picking a person is a dropdown of people who already exist. Adding a person is Settings, opened from the account gear. The name is typed there.

Forced by: “Picking a person should ALWAYS be a drop down. Adding a person is through settings, not from this.”

## Avatar

- When: the picture of a person, their photo or their initials in a ringed circle. The Assigned column of a table is the initials in a 35×35 avatar.
- When not: a person named in a menu, a filter, a chip, or the side panel. That is the miniature name pill in Person. A decorative icon or a page mark.
- Default: `Avatar`.
- States: named, photo, unknown, and unassigned. A named avatar keeps a solid 1px `--black-12` ring and the `--sidebar-grey` fill. A person whose initials are unknown, such as a guest known only by a phone number, is that same ringed circle with the `user` icon in `--black-50`, 16px (18px on the large avatar). The mini avatar has no unknown state. A photo fills the same circle with the `--outline-image` inset, which stands in for the ring and the fill. Unassigned is clear, with a 1px dashed `--black-50` stroke. A picture that stands alone shows the name in a tooltip on hover, centered above it. When the name is written beside it, there is no tooltip. Row hover does not change the photo in light mode. In dark mode a named photo is `--grey`, then `--grey-up` when its row or chip is hovered.

## Urgency

- When: an urgency is named.
- When not: a department, a status, or a filter chip.
- Default: `.urgency`. Urgent includes the warning icon. High, Standard, and Low are the label only. A table cell and a menu show the colored word with no pill. A filter chip keeps the filled box.
- States: the word keeps its color. Standard’s word is `--black-50`. Do not recolor the word because the row or the menu behind it changes. The urgent mark stays `--urgency-urgent`. The grey icon switch does not recolor it. In a table chip and in the side panel, the word is centered in the chip with the chevron. The chip’s own `top` stays `0`. Do not keep `top: 2px` on the word once it sits inside the chip. A filter chip and the side panel keep the filled box, the same padding and height as a filled department tag. A table cell and a menu drop that fill.

Forced by: the High chip, “the chip is misaligned with the text.”

## Status

- When: a record is Open, In progress, or Completed.
- When not: an urgency, even where a hue is shared. Completed uses `--status-complete`. In progress uses `--action`. Open uses the high-urgency hue.
- Default: the gallery status symbol and its label.
- States: rest is the symbol and the word. On a hovered row the hover is a pill, `--grey` in light mode and `--black-12` in dark mode. The label matches the record.

In a table, a status never sits alone. The description sits next to it on the same line: what happened, or why it is in that state, such as Transferred, then to the front desk. The description is 12px `--text-muted`, `--space-8` after the status, and it truncates with an ellipsis before the status does. The status keeps its symbol, word, and color.

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

Every one-line input box is 32px. A labeled field and a line field share that height, that padding, and that radius. A quantity, a date, a unit, a minimum, and a maximum are this box. A description or a notes field is the text well. The pill editor's own description is not. It is the name block in Pill editor. A typed fact in a detail panel is this box inside the fact row. Search stays the search field.

## Line field

- When: one line is typed and the label is the placeholder. A new step, a unit, a minimum, a maximum, a category name.
- When not: a labeled value. That is Field. A list search. A paragraph under a title. That is the text well.
- Default: `.line`.
- States: rest is `--white`, `--text-14`, height 32px, padding `0 var(--space-10)`, radius `--radius-control`, and `--stroke`. The placeholder is `--text-muted`. Hover darkens the stroke to `--black-12`. Focus uses `--black-25` and keeps that grey placeholder until there is text. The fill does not change.

A line field is the same 32px box as Field. The placeholder is the label. It stays one line, and it stays the same height as the field beside it.

## Text well

- When: a section title sits over a description or notes. The knowledge answer is the specimen: the label "Answer", then the filled field.
- When not: a one-line input. That is Field or Line field. A search field. The body of a note on the notes page, and a note that is only read. A typed fact in a detail panel is the line field inside the fact row. A person, a room, a department, and an urgency stay dropdowns.
- Default: a `.sheet-label`, then `.text-well`. An optional line under the field, such as the answer help, is `--text-12` and `--text-muted`.
- States: rest is `--sidebar-grey`, `--black` text, `--text-14`, line-height 20px, padding `--space-10`, radius `--radius-control`, height 96px. The label is the sheet label, `--text-12` and weight 500 in `--black-50`, `--space-4` above the field. Hover is a 1px `--black-12` ring. Focus is a 1px `--black-25` ring. The fill does not change. There is no pencil. Dark mode uses `--grey`. A well that sits on a surface that is already that fill takes the next step: `--white` in light, `--black-12` in dark.

Every editable description and notes field is this box. A complaint description, a to-do description, a template description, a knowledge answer, cash count notes, reading notes, and a fix note share the 96px height, the padding, the radius, and the type. One line of text keeps the box at 96px. A longer note starts from that same box. The width is the column it sits in. The corner can still be dragged taller. A note that is only read sits on the page, in the page’s type, with no well.

## Icon button

- When: a tool in a header or a panel bar with no room for a label: show or hide a panel, expand, pin, history, new chat. Every panel toggle is this button, in every header.
- When not: the primary action. That button has a label. An action on the page itself, such as New beside a table. That is the secondary icon-only button, with its stroke.
- Default: `IconButton`. A 30px square, a `--black-50` glyph at 18px, and no fill or stroke at rest. It always has an `aria-label`.
- States: rest is clear. Hover fills `--grey`, one step from the surface; in the Lance panel that step is `--sidebar-grey`. Press scales the whole control. The glyph stays `--black-50` on hover. It never turns `--black`, and it never takes a stroke. Sidebar icon buttons stay unfilled at rest.

## Text button

- When: a quiet action that should not compete with the page: a label, an icon, and no fill until hover. A tool in a row, or a control in a widget's grey head.
- When not: the main action on a view. That is the primary button. A button in the header with no icon. A section's action on the page, such as Edit beside a section title. That is the secondary button.
- Default: `TextIcon`. Label, small, and delete.
- States: rest is clear. Hover fills one step from the surface it sits on. The label, the icon, and the gap do not move on hover. Press scales the whole control to `0.98`. The delete variant stays `--destructive` at rest and on hover, and opens Delete confirmation first.

## Lance composer

- When: the field is the Lance chat.
- When not: a reply under comments. That is the message composer.
- Default: the Lance composer.
- States: add, the mode control, the microphone, and an empty send arrow hover with `--grey`. The send arrow stays grey when the field is empty, including on hover. It turns `--action`, with white text, only when the field has text, and fades both ways over `--motion-hover` on `--ease-out`. The microphone stays `--action` only while it is on.

## Lance panel

- When: the assistant sits beside the page, so the person can keep working on it.
- When not: a reply on a record. That is the message composer. A record opening beside the table. That is the detail panel.
- Default: `LancePanel`.
- States: open. The panel uses the Lance composer as it is. It is not restyled for the panel. The chat stays darker than the page, the same as the nav. The send arrow stays grey until there is text.

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
- When not: a filter, or a toggle between two or three modes. That is segments.
- Default: `.tab` on the page.
- States: on white, selected and hover use `--sidebar-grey`. On a `--sidebar-grey` bar, that step is `--grey`. A selected name is `--black` and its count is `--black-50`. An unselected name is `--black-50` and its count is `--black-25`.

## Segments

- When: switching between two or three modes that are different, such as a filter or a toggle between views of the same content. Three at most.
- When not: the main switch for a page or its primary categories. That is tabs. Not the department bar, or more than three modes.
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
- When not: a subpage, or a popup. Edit template is the editor popup, and Edit to-do is the pill editor.
- Default: the gallery detail panel.
- States: closed, open, entering, and leaving. Editable, or view-only with Edit.

The panel is 392px and sits over the right of the table. The table keeps its width. It does not shrink to sit beside the panel. Entering is `--motion-panel` (400ms) on `--ease-drawer`. Leaving is `--motion-panel-out` (320ms). Reduced motion skips the slide. A page does not restyle the width, the header, or the slide.

Every page uses the same header. The back button sits on the left and closes the panel. The right-hand group holds any page action, then Edit on a view-only panel, then the more button. Edit is a secondary button with the edit icon, set with `onEdit`. The more button is clear at rest. Its grey fill shows only while the pointer is on it. Its menu is Delete only, and it opens again after it closes. A right-click on the panel opens that same menu. The body is the page’s fields. A description or notes field is the text well, 96px. A typed fact is the line field inside the fact row: one line, 32px, placeholder Empty. Phone, email, loyalty, and where an item is stored use it.

Editable text in the panel shows a pencil on hover. The pencil is the edit icon, 14px, in `--black-50`. It sits after the text on the first line. The text does not move when it appears. Clicking the field removes the pencil. The table does not show this pencil. A text well does not show it either. The field is already a box.

The body stacks its sections 24px apart. The scroll padding is `--space-16` on top and `--space-25` on the sides and the bottom. A rule between sections is 1px `--line` and runs the full width of the panel, through that side padding. A section label is `--text-12`, weight 500, and `--black-50`. A fact row is a 70px label and the value, `--space-16` apart, at least 20px tall, in `--text-14`. In dark mode the detail uses `--grey`.

A view-only panel reads its facts and keeps Activity live. Edit opens the editor popup for that record. Nothing else in the body edits. The room is the static square. A typed fact, such as the description, location, or item, is plain `--text-14` text (`.todo-side-value`). An empty one is a quiet dash. The description sits 4px under the title with no label, in `--text-muted` (`.todo-side-heading`). The panel body starts 40px below the header actions. An empty one reads No description in `--black-25`. Type, status, and urgency are their chips with `editable={false}`. The assignee is the person pill, or Unassigned. None of them show a chevron or a pencil.

On a to-do, the panel opens and closes from the task row. It is view-only: Schedule for future, then Edit. The side title is the typed title, or the location and item as text, joined by a middle dot. An empty one is New to-do. The table's To-do cell shows a typed title as text, and without one it shows the Location and Item chips. A new to-do opens the editor popup with the name selected. The rules below are for a panel that edits in place, such as a complaint. The side title is the location and item chips, empty or filled. An empty title is Location and Item, not the word “To-do”. The title chips use the task row’s box and the same hover. In the side panel, guest mood, type, assigned, status, and urgency share one type: `--font`, `--text-14`, weight 400, and a 16px line-height. The control is 20px tall, with padding `2px 4px` and a 4px radius. The status icon is 16px so the word stays on that line. Table chips stay 13px. A menu option stays `--text-14`. The assignee keeps the miniature avatar, the name, and a `--sidebar-grey` fill. Hover and an open menu keep that fill and show the down chevron. Unassigned is clear at rest. Hover and an open menu use that same `--sidebar-grey` fill, and `--grey` in dark mode. Status keeps its icon and label and has no fill at rest. Type is the department chip. It rests clear with the `--black-12` ring. Hover and an open menu fill `--sidebar-grey`, and `--grey` in dark mode. The ring stays. The room uses the task row’s room control. Location and Item are dropdowns. At rest they are the value with no fill. Hover and an open menu show a `--sidebar-grey` pill and a down chevron after the value. The room, title, and date use `--space-16`. The Description label is `--text-12`. The note under it is `--text-14`. Activity reads heading, thread, then reply, as in Activity. The reply field is `--text-14`. Guest mood, phone, email, and a page’s other facts use this same panel. They do not get a second header or a second width.

## Room

- When: a room number on a to-do.
- Default: the number is typed. In the detail it is the 50px square. On the row it is plain text, `--text-16`, weight 500, line-height 20px, with no padding and no chip fill.
- States: the number, or the quiet dash when it is empty. Focus underlines the row field with `inset 0 -1px 0 var(--black-25)`.

The square stays 50px and `--sidebar-grey`. The number, in the square and on the row, is `--text-16` and weight 500. Clicking it edits the number there. On the row, clicking the number types it in place. An empty room is a quiet dash. It does not say Room.

Forced by: “room will always be a drop down.” Then the number is typed: “clicking on it edits the text,” and the row is a text entry too.

## Room mark

- When: a widget row that is about a room, such as response time, problem rooms, or do not disturb. The room leads and the description sits beside it.
- When not: the To-dos and Complaints widgets. Their rows lead with the status, and the room is the title. A to-do's detail, which is the 50px square in Room. A table row, which is the room column. A person, which is Avatar.
- Default: `RoomMark` as the `lead` of a `WidgetRow`, with the description as `title` and no `subtitle`.
- States: a room number, and a place. A place, such as Lobby, has no number, so the square holds the 18px location icon in `--text-muted`, and the row's title writes the place first: “Lobby · Ice machine”.

The group chat mark from Messages at the row's size. A 40px square, a 6px radius (`--radius-control`), a 1px `--black-12` ring, and the `--sidebar-grey` fill. The number is typed in it, `--text-14` weight 500 with `--numeric`. Four digits need 14px to fit 40px, so it is one step under the 16px in Room. The square is read aloud as the number, and a place's icon is hidden, since the title already says it.

In a row it takes one step past the row hover, like an avatar: `--sidebar-grey` at rest and `--grey` when the row is hovered. Dark mode steps `--grey` to `--black-12`. A row that leads with a room mark and has no subtitle puts its title on both lines, centered on the square, at weight 400, since the number in the square is the record's name. The meta and the trail stay on the right, one over the other. A row with only a meta, such as a DND room, is still 52px, the square's height.

Forced by: “have room numbers be in squares, similar to the group chats in messaging,” “the room numbers typed in,” and “the description can sit to the right, centered.” The ring: the group chat mark keeps it, so the room mark does too.

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
- No stroke on the right edge. The `--sidebar-grey` meets the page by itself.
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

- When: Edit template and the readings source. It opens over the page. It is not a subpage.
- When not: a record that opens beside the table. That is the detail panel. A full subpage, or a delete confirmation.
- Dismiss: the corner close, the scrim, and Escape. Save is the primary, at the bottom right. Delete is the light danger button and opens the confirm first.
- The kicker says the action and the item: Create template for a new record, Edit template for one that exists. Every editor follows the same rule.
- Save names the item too: Save to-do, Save template, Save source. Never a bare Save.
- Divider: a 1px `--line` runs edge to edge under the header, with or without tabs. With tabs it is the bottom of the tab bar. Without tabs the shell draws it. The pill editor is the one exception: it has no divider. See Pill editor.

The fields are the `pm-editor-*` set: a label over a 32px input, and dropdowns as `EditorPick` (`(screens)/editor-pick.tsx`), two to a row in `.pm-editor-pair`. The photo upload is one tile everywhere (`.side-photo-add`): `--sidebar-grey`, a 1px dashed `--black-25` stroke drawn by `PhotoAddFrame` (3px dashes, 2px gaps, since a CSS border can't set either), `--radius-control`, hover `--grey`, and the 18px camera in `--black-50`. A context sets only its size, with `--side-photo-size` (56px by default, 87px in an editor popup). A location, in a field or beside a name, uses the `location` pin icon, not the house. The body stacks its rows 25px apart (`--space-25`) in every editor popup. The rule under the header has 10px above and below it, and the body pads 12px top and bottom. An unset dropdown shows its placeholder, muted.

Width is `652px`, or the screen when that is narrower. Height starts at `554px`, the Details tab. Areas uses that same height. The box grows when the content is taller than `554px`. It stops at the viewport, inside `--space-25` of the scrim.

## Pill editor

- When: creating or editing one record that is a title, a description, and a few choices from lists that already exist, such as a to-do, a complaint, or a found item. Complaints, Lost & found, Cash counts, new and edited, and a new reading use it. To-dos use it, new and edited.
- When not: a record with steps, tabs, a table of values, or a long answer. Template, Readings source, and Knowledge use the editor popup's fields or the page. A record that opens beside the table is the detail panel.
- Default: `EditorDialog` with `layout="pills"`, and an `EditorPills` body.
- States: rest, a pill hovered or open, a placeholder pill, and a required pill left empty after Save.

The shell is the editor popup's. The card fits its content and does not keep the 554px height. There is no divider under the header. The body pads `--space-16` on top and twice that below, and stacks its sections 40px apart.

The record opens with its name block, `.editor-dialog-name`: the title, then the description, stacked `--space-10` apart. Neither has a label, a well, a border, or padding. They sit on the card.

- **Title** (`.editor-dialog-title`): `--text-24`, weight 500, line-height 28px, `--black`. One line.
- **Description** (`.editor-dialog-subtitle`): `--text-14`, line-height 20px, `--text-muted`. It is a textarea with `field-sizing: content` and `resize: none`, so it starts as one line and grows as you type.
- **Placeholders:** both are `--black-25`. The words change with the record (Title and Description, or the item and where it was found). The styling doesn't.
- **Required:** a required description left empty after Save turns its placeholder red, the same red as a required pill.

This is not the text well and not Record title. The 96px text well is for a notes field inside a form, not for a record's own description.

Forced by: "the editor is not using the right formatting for the title and description." Lost & found used a 16px title and a labelled grey text well.

Every choice is one `EditorPill`: 28px tall, padding `0 var(--space-10)`, `--radius-control`, `--white` with `--stroke`, `--text-14`. Hover and an open menu fill `--sidebar-grey`. Its menu is the gallery menu, with `taskMenuItem` rows. A leading icon is 14px in `--text-muted`, 6px from the value. An unset pill shows its placeholder, muted: Location, Item, Category. Every pill sits on one line, `--space-8` apart, in this order: the place, then the item or category, then the remaining choices, then status and the person. The line wraps only when the card runs out of width. It never breaks on purpose to group a pair. `EditorPillRow` is not used.

Forced by: "in the editor, bring all the drop downs to the same line."

A value inside a pill is its component, at `--text-14`, with no ring, padding, or fill of its own: the department tag is `plain`, and the urgency and person pill lose their padding and fill. Status keeps its icon and label.

A Guestroom puts the room number in a grey track behind the location pill (`RoomPill`). The track slides out when Guestroom is chosen and folds away for any other place. Where the place cannot change, the lead is `PlacePill`. The room field hugs its placeholder, Room, and grows with the number. Once Guestroom is chosen the room is required: left empty after Save, the grey track takes the red ring and a faint red tint, and Room turns red (`RoomPill` `invalid`). The red is on the track, not a second box inside it.

A typed fact that is not a choice, such as a guest's phone or email, is an `EditorField` in `EditorFields`: a 12px `--black-50` label over the 32px field, two to a row, `--space-16` apart, above the pills. A Cash count is the one place with many: its line amounts sit below the pills in three columns, coins, bills, and other. Its title is the counted total, read-only, and the line above it is the expected amount and the variance, once a location is set. Location starts on its placeholder unless there is only one. Editing a count keeps its location, as a fixed `PlacePill`, and its shift, notes, and line amounts. Its kicker is Edit count, Save count replaces Post count, and it can delete the count. Count or Amount is not a pill: it is the segmented control, at the end of the pill line.

Photos are the camera `PhotoPill`, a 28px square at the left of the footer. Added photos show above the pills as 56px thumbnails (`EditorPhotos`). A thumbnail opens the viewer. Its corner removes it.

Save names the item, and checks the required pills first. A required pill left empty turns red, and `RequiredToast` says “Please fill out all required fields.” above the card. The record is not saved. Delete is the light danger button in the header and opens the confirm first. Edits are a draft until Save.

## Inset card

- When: several similar items share a page, and each one expands in place with the title staying put. The card is how one item is told apart from the next.
- When not: the screen has one action or one thing. That thing sits on the page. The shell and the white inset exist to separate a set. They are not a frame for a single screen. The detail panel slides over the table. A menu is not this card.
- Default: open, in the gallery section `#inset-card`.
- States: open and closed. The title row is the same in both.

The shell is `--sidebar-grey`, with 6px of padding, a 1px `--line-card` border, and a 10px radius. The head is at least 56px, padded `11px 22px`, and pulled up 6px so it sits in that shell padding. The title is `--text-16` with a 21px line-height. Page actions sit in the tools, and the chevron stays last. Each tool button is 28px with `--radius-control`. Hover fills `--grey`.

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

## Activity

- When: the thread of comments and status changes on a record, newest first.
- When not: a conversation. That is Message and Message group. A single remark. That is Comment.
- Default: `ActivityFeed`.
- States: a thread that starts with a comment, and one that is only status. A comment in the thread is Comment. A person on a status line is the miniature name pill. The order is the heading, then the thread, then the reply. The message composer sits after the last comment or status line, never between the heading and the thread. The heading and the first line stack `--space-8` apart. The thread and the composer stack `--space-8` apart. An empty thread is the heading and then the composer. The reply field is `--text-14`, and it is the message composer.

Forced by: Lost & found's panel put the comment box on top of the activity.

## Message

- When: one line in a conversation.
- When not: a remark under a record. That is the comment. The field under the thread is Messaging.
- Default: `Message`. Incoming, and you.
- States: incoming and you. A single line is rounded on every corner.

The name and the time sit above the bubble, 4px clear of it. Both are 12px, weight 400, `--text-muted`. Incoming is left, with a 35px photo. Yours is right, with no photo, and the name reads You. A yours bubble stops where the other person's picture starts: its widest left edge lines up with that picture. The bubble is 32px on one line, side padding `--space-10`, radius `--radius-card`. Incoming is `--sidebar-grey`. Yours is `--action`, with white text. A reply that goes out for a team, like Lance answering a guest, is yours, and the name reads the team, like Front desk. A longer line grows. The words wrap inside the column.

## Message group

- When: the same person sends again inside two minutes.
- When not: a new person, a new day, or a ticket between the lines. Those start a new message.
- Default: `MessageGroup`.
- States: incoming and you.

The first line carries the name. The rest sit `--space-2` under it and have no second name. Every bubble stays rounded, except the last. That one squares the bottom corner on that person's side: bottom-left for someone else, bottom-right for you.

## Day

- When: the day changes in a conversation.
- When not: beside the name. The clock for that day sits on this line.
- Default: `Day`.
- States: one.

A hairline, the label, a hairline. The label is 12px `--text-muted`. It reads like Today 9:25 AM.

## Typing

- When: the other person is writing and the line has not arrived.
- When not: after the line is there.
- Default: `Typing`.
- States: one. Reduced motion holds the dots still.

Three dots in the same bubble as a message, with that person's photo.

## Resolved

- When: a conversation with Gavin is finished, or a thread is answered somewhere else, like a Sales guest thread.
- When not: a department thread, or a conversation that is still open. Those keep the reply field.
- Default: `Resolved`.
- States: resolved, and answered elsewhere.

The reply field is gone. The note is 12px `--text-muted`, centered on `--sidebar-grey`. Start a new chat is tertiary. Reopen to reply is secondary. Answered elsewhere, the note says where replies go out from, and the one action is secondary and opens the thread there, like Open in Sales.

## Ticket

- When: the ticket itself sits inside its conversation.
- When not: the list of tickets. That row opens this record.
- Default: `Ticket`.
- States: steps that have happened, and the one that has not.

White, with the stroke, where a message is a grey bubble. The title is 14px weight 500. The number and the kind are 12px `--text-muted`. Finished steps use the complete mark. A step with no time is an empty ring.

## Ticket note

- When: an open ticket needs a short reminder under the header.
- When not: the full record. That is the ticket.
- Default: `TicketNote`.
- States: open, in progress, and completed. Dismiss fades it out.

The number, the title, and the status. The close sits in the top corner. It floats over the conversation. On the gallery page it sits in the flow.

## Empty

- When: a page or a list has nothing to show.
- When not: a table. A table keeps its own one-line empty.
- Default: `Empty`.
- States: a title and a line, and the same thing with one action under them.

The mark is 24px in `--text-muted`. The title is 16px weight 500. The line is 14px weight 400 in `--text-muted`. The gap inside the group is `--space-4`. The action sits `--space-16` below the group. It is centered, and it fills the space it is given.

## Meter

- When: how far along something is, such as a score out of a total, a checklist, or rooms cleaned today.
- When not: a loader. That is the table skeleton. A count alone. That is a number.
- Default: `Meter`, with `value`, `max`, and a `label` that says the figures.
- States: a fill, and a fill with an end part.

A 42px bar of 2px ticks every 4px. The done part is `--action` over `--black-12`. An end part, such as rooms on DND, takes the right end in `--black-50`. It spans the whole bar and is clipped, so its ticks line up with the ones under it. The bar is one image to a screen reader, and `label` is what it reads.

## Share bar

- When: one whole split into a few shares, such as today's tickets by channel.
- When not: how far along something is. That is Meter. A long list of parts. That is a widget's rows.
- Default: `ShareBar`, with `shares`, each an `id`, a `label`, a `value`, and a `tone`.
- States: two to five shares, as counts or as percents with `percent`.

Its own component, not Meter. A plain bar, 8px tall with fully round ends, and no ticks. The shares fill it: each share is a solid part sized by its value, 2px apart, left to right, busiest first. When the shares are stages in order, such as leads from New to Negotiating, they keep that order instead. Tones go in that order: `action` (`--action`), `strong` (`--black`), `muted` (`--black-50`), `quiet` (`--black-25`), then `faint` (`--black-12`). A share of zero has no part. The key sits 16px under the bar, one column per share: the figure, 16px weight 500, over an 8px dot in the share's tone and the label, 12px in `--text-muted`. The bar is one image to a screen reader and reads each label and its figure.

## Widget

- When: a dashboard shows a few records from a longer list, and a way to the rest.
- When not: the list itself. That is Table. One record. That is Section card.
- Default: `Widget`, holding a `WidgetList`. `WidgetEmpty` holds an `Empty` when there is nothing to show.
- States: rows and a more link, rows only, and empty. A widget that lists rows goes empty when it has no rows: `WidgetEmpty` replaces its summary and its list, and the head stays. A widget that only shows figures, a meter, a share bar, or a chart has no empty. It shows its zeros, because zero is a reading.

One card: a 1px `--line-card` border, a 10px radius, and a `--sidebar-grey` head over a `--white` list. The head is a 16px icon in `--text-muted`, `--space-8` from the title, the same gap as a Lance suggestion. The title is 14px weight 400, the count in `--text-muted`, and one action on the right. The action is a plus that starts a new record, as a `TextIcon` or a link with the `text-icon sm` class. A leaderboard puts its top three on a podium over the rows, second, first, third, each on a `--sidebar-grey` step, and the rows go on from fourth to sixth. First place's step is `--filter-chip-bg` with its place in `--action`, a 1px `--action` stroke on the top and sides, and `--shadow-card`. The step has no bottom stroke, so it does not double the rule it stands on. First place's avatar takes `--shadow-card` too. Every podium avatar keeps the named ring, 1px `--black-12`. A widget whose rows change with a time window, such as a leaderboard, takes segments there instead, sized to their labels: Today, 7d, and 30d, or 24h, 7d, and 30d. A `Menu` trigger on the grey head hovers `--grey`, one step from the head. Segments in the head take a `--grey` track so they do not fade into it, and an unselected segment hovers `--black-12`. In dark mode the list is `--white`, the page, edged by the card's border, and the head is `--grey-low`, halfway from the page to `--grey`. Lifting the list off the page read too heavy. Everything inside the list moves with it. A row hovers `--grey`, a pill in a row rests `--grey` and is `--black-12` on a hovered row, and the room map's cells, the podium steps, and a day's hover are `--grey`, with a room's hover `--black-12`. A head trigger hovers `--black-12`, and the segment track is `--white`, the page, so it sits below the head and the `--grey` selected pill still shows. The head is 52px, the height of a row. The card takes the depth drop under its hairline.

## Widget summary

- When: a widget leads with a number, such as a count, a score out of a total, or a time, with its totals beside it and a meter or a chart under it.
- When not: a widget that only lists rows. That is Widget list.
- Default: `WidgetSummary` holding a `WidgetFigure`, then `WidgetStats`, then a `Meter` with `className="widget-summary-meter"`, which spans both columns. `alone` drops the rule when nothing sits under it. A tally is `WidgetTally`, over a chart, in the widget's 16px padding. A fact in the head beside the action is `WidgetNote`, passed as the widget's `action`.
- States: a figure with stats and a meter, a part of a whole, a tally over a chart, and a tally whose fact is a problem.

`WidgetFigure` is 24px weight 500 in `--black`, its label under it in 14px `--text-muted`, 4px apart, on one line. `of` adds " / total" in `--black-25`. In a narrow card the stats wrap and the figure does not. `WidgetStats` puts each value over its label, 16px weight 500 then 12px `--text-muted`, 2px apart and 25px between stats, and keeps label then value in the markup for a screen reader. A stat that names a part of the meter takes a `key`: `action` for the part done, `strong` for the part set aside, such as DND, `muted` and `quiet` for the lighter greys. A chart's legend uses `WidgetKey` on its own. `WidgetTally` puts the figure and its answer on one line, 8px apart, with a 14px fact on the right. `asideTone="warn"` turns the fact `--urgency-urgent`. `WidgetNote` is 12px `--text-muted` with 8px on its right.

## Add widgets

- When: Edit on the Widgets section of Home. It chooses which widgets Home shows.
- When not: a sidebar or a drop-down. Choosing from 42 widgets needs to see them, so the gallery takes the whole screen.
- Default: `AddWidgets` (`(screens)/home/widget-gallery.tsx`), with every widget listed once in `HOME_WIDGETS` (`widget-catalog.tsx`) under its department.
- States: Edit turns into Done, a secondary button with the check. Each widget shakes, `--ease-in-out`, 0.4deg either way, at its own phase and speed, 250 to 320ms, picked from its place so no two neighbors move in step, and the room map 0.1deg because it spans the row. A widget takes no clicks while it shakes. A 20px round remove mark sits 8px over its top-left corner: `--white` with `--stroke` and `--shadow-card`, hover `--sidebar-grey`, and `--grey` then `--black-12` in dark mode. Removing takes the widget off Home and the columns close the gap. It is not a delete, so it does not ask first. Reduced motion keeps the marks and drops the shake.

Edit shows Add Widgets, the primary with a plus, before Done in the section head. The head wraps, so on a narrow screen both buttons drop under the title instead of clipping. Add Widgets opens the gallery on `EditorDialog`, the same popup as a record's editor: the scrim over the whole screen, then the card at 1120px wide and 90% of the screen high. On a phone, 640px and under, the card takes the whole screen with no radius. There is no kicker line or subtitle: the title, Add widgets, sits in the top row beside the close mark. The departments are the dialog's tabs: All, then one per department, each with its count. The tab bar scrolls sideways when it outruns the card, and each label stays on one line. The search is first in the body, focused on open, and it stays on top while the gallery scrolls under it. Switching tabs keeps the search. Each department is a 14px weight 500 heading: its plain department tag, the colored circle and the name with no stroke, then its count in `--text-muted`, over a grid of tiles at least 220px wide, 12px apart, two to a row on a phone. A tile is a `--sidebar-grey` card, `--grey` in dark mode, like a board column: its title on top at 14px weight 500, 10px by 12px in, with a check in `--action` when the widget is on Home. Under the title is the live widget, laid out 480px wide, about a Home column, so it lays out as it does on Home, and shown at 55%, set 12px in from the left, at 70% opacity so the title leads, and at full opacity when the widget is on Home, with its own drop: a 1px `--black-12` contact shadow under `--shadow-menu`. The tile's right and bottom edges crop it to 160px, 120px on a phone, so only its top-left corner shows. A preview is only built once its tile comes within a screen of view, and stays built, so 42 live widgets are never mounted at once. A tile hovers `--grey`, `--black-12` in dark mode, and presses to 0.98. Every tile has a 1px `--black-12` stroke, drawn above the preview so the crop never covers it. A widget on Home turns its tile `--action-tint` and its stroke `--action`, hovered or not. Selecting fades the blue in. Deselecting drops it at once, and hover has no fade. Pressing a tile adds that widget in its place in the catalog order, or removes it when it is already there, and the gallery stays open. A search with no match shows the search empty state. The footer is Done, the primary. Done, the close mark, the scrim, and Escape all close the gallery and return focus to Add Widgets, with edit mode still on. A second Escape is Done for edit mode. What someone removes is kept in this browser, so a widget added to the catalog later still shows.

## Widget list

- When: the rows inside a `Widget`.
- When not: a list on its own on a page. That is a Table, or a note card list.
- Default: `WidgetList`, holding `WidgetRow` items and `WidgetMore` last.
- States: rows, and rows with a more link.

The list sits 2px in from the card, like a menu, with no gap between rows. A widget shows a few rows, three or four, and `WidgetMore` says how many wait behind it, such as "+ 5 more". The more link is 52px, 14px in muted ink, and sits at the bottom of the card. Its hover is `--sidebar-grey`, and its text turns `--black`.

## Widget row

- When: one record in a `WidgetList`.
- When not: a table row. That is the task row.
- Default: `WidgetRow`, with `lead`, `title`, `subtitle`, `meta`, and `trail`.
- States: a status and a person, an avatar and a muted preview, facts with a chip, and rest and hover.

A row is 52px and two lines. Padding is `6px 14px` with a 4px radius and a 10px gap, like a menu item. Its hover is `--sidebar-grey`, with no fade. The lead is at least 18px wide: a status, an avatar, or a room mark. A room mark centers the title on it, see Room mark. The title is 14px weight 500, and the subtitle is 14px weight 400 under it. When the second line previews the record, such as a note's first line, pass `subtitleTone="muted"`: it steps down to 13px in `--text-muted` so the title leads. When the second line lists facts about the record, such as the room and the head count, pass `subtitle={<WidgetFacts items={[...]} />}`: the same 13px `--text-muted`, with a `·` between facts and 4px on each side of it. An empty fact drops out, so pass `null` for one that does not apply. Do not join facts into a string by hand. The meta is 12px in `--text-muted` on the first line's right. The trail is a chip on the second line's right, such as a person. A row with no subtitle and no trail is one line, 36px tall, such as a DND room. The more link under those rows is 36px too. A row with no lead drops the lead column, so its text starts on the row's inset. A chip or an avatar in a row is `--sidebar-grey` and takes `--grey` on the row hover, one step past it, so it does not blend in. Dark mode steps `--grey` to `--black-12`. A row and the more link render `a`. Pass `as` to use the app's link.

## To-dos widget

- When: Home shows open to-dos at a glance.
- When not: the to-do list. That is the To-Dos page.
- Default: `TodosWidget`, built from `Widget`, `WidgetList`, `WidgetRow`, and `WidgetMore`.
- States: four rows and a more link, and empty.

Open to-dos, most urgent first, four at a time. A row is the status, the room or else the place, the item, the age, and who has it, or Unassigned. The plus opens the editor to create a to-do, assigned to the person signed in. Every row and the more link go to the To-Dos page.

## Table

- When: records line up in columns, with a filter row and a task row.
- When not: a note list. That is the note card.
- Default: the gallery section `#table` in `catalog/index.html` (`.sheet-page`). Styling is in `catalog/todos-alt.css`.
- States: the frame, the column widths, and the count when a control can hide a row. Hovering a cell highlights the whole row. A row’s states are the task row block. The filter’s states are the filter row block.

A new table copies that section. It does not invent a second row, chip, or filter.

Every cell in a row is an element that can draw `::before`, because the line between two columns is the right cell's `::before`. An input, textarea, select, or image never sits directly in `.sheet-line`. It sits in a cell span, as the room input does in `<span class="sheet-room-cell">`. A bare input there drops the line to its left.

A status column carries the status and its description together, as in Status. A table does not show a bare status word with the reason left to the detail panel.

A table chip is 20px tall. Padding is 2px 4px and the radius is 4px. The height does not grow with the line box. The label keeps the size that chip already uses. A location or an item is 14px. A chip in the side panel is 20px as well.

The list variant is the checklist. It is this table. It keeps the rows and the columns, and it leaves off the column header, the column rules, the row wash, and the Showing count. The group header stays on the list.

The Showing count sits under the frame only when a search, a filter, a tab, or another control can hide a row. Pass `total` as the full set before those controls. The line reads Showing N of M. When every row is always on screen, omit `total` and leave the count off. A table of measurements on a source has no such control, so it has no count.

Forced by: “No don't show the showing X of X in this table since there is no toggles or filters to apply that would hide anything. Make that a rule.”

Forced by: “Just make it so that this custom list is a variant of DataTable.”

The Assigned column is that table column on every table. The cell is the initials in a 35×35 avatar. Hover shows the chevron beside that circle, outside the pill, and the full name in a tooltip. Only the circle’s fill changes. The ring stays 1px. It does not gain a second stroke. The chevron does not sit in that pill, and the next column stays put. Click opens the people menu. The row hover does not change the photo. Unassigned is the dashed empty avatar, and the tooltip says “Unassigned”. In dark mode a named photo is `--grey`, lighter than the page. Hovering that circle uses a `--black-12` fill. The ring stays 1px. An empty photo stays clear, with a 1px dashed `--black-50` stroke. The dark photo clip that insets a portrait does not apply to that dash. The named pill stays in the side panel, a menu, a filter, and an activity line. It does not go in the column.

The column is as wide as the circle plus its hover chevron: 35px, the `--space-4` gap, and the 10px chevron, so 49px. The chevron draws inside the column, not in the column gap. Showing it does not touch the next column's content. A column header shorter than that does not set the width.

Forced by: the Staff column on Lost & found, "not leaving room for the chevron on hover and needed to be wider."

A column that shows one of a fixed set of options is already as wide as its longest option, including that option’s icon and padding. This holds for every aligned grid, including a table and a week schedule. The header and every row share one set of tracks. Do not let each row measure its own columns. The control still hugs the value it is showing. Choosing another option does not move that column or the columns beside it. Stack every option in the same grid cell and hide the ones that are not selected.

Forced by: “it should use the assigned table column like the other pages,” and “Edit the design system so it will always use that.”

When several tables share a page, each table has one title. The title is `.sheet-group`: `--text-14`, weight 500, line-height 20px, `--black`, and `--space-8` below it. A count beside that title is `--text-14`, weight 400, `--black-50`, and `--space-8` to the left. Cash locations and PM groups use this title. It is not a record title. A record title stays 16/500. Do not size this title with `--text-16`. The title above a table sits `--space-8` from the frame. When the Showing count is present, it sits `--space-8` under the frame.

Under the filter row, the columns are Status, Room, To-do, Urgency, Type, Assigned, and Opened. Content starts `--space-16` after each column line, and Status starts that same distance from the left edge. The column gap stays `--space-20`.

A column is at least as wide as its title with equal padding on the left and the right, and at least as wide as the value it is showing. That width is the minimum. The note under the title fills that column. It does not shrink to the words. The location and the item still hug their labels.

The resize handle sits on the right edge of each header. The hit area is 12px wide and centered on the column line. The drawn line is 1px. It stays clear until hover, keyboard focus, or a drag, and then it is `--black-50`. While the pointer is down, a 1px `--black-50` guide follows that edge. Dragging stops at the minimum. The arrow keys step 8px and stop at the same minimum. The column that takes the leftover width gives up space first. Double-click returns that column to its usual width. The width stays on this page.

Plain text in a row is `--text-muted`. One column is `--black`: the name, the column a person reads to tell one row from the next. A second text column is `--black` only when that name is not enough to tell the rows apart. Mark that one with `ink: "strong"`. A person stays the person component, in `--black`, and this ink step does not restyle it. A status, a chip, a switch, and an urgency keep their own color. This is text only.

One column names the record and takes the leftover width, so the row reaches the frame. On the to-do table that column is To-do. When a page has no title column, choose one from the job of the page: the column a person reads to tell one row from the next. A status, a time, a total, a person, and a department stay as wide as their values. Mark the chosen column so it grows. Use `flex` when the cell is a short name. Use `text: "primary"` when the cell is a title or a description. Double-click the line to return that column to its usual width. The width stays on this page. The columns resize with the pane. The table scrolls sideways when those minimums do not fit. A cell does not paint on top of the next column. The title, the note under it, and the column header start on the same line. The frame ends at the last row and keeps its rounded corners. It scrolls only when the rows pass the space above the count, or the bottom of the frame when there is no count. When a search, a filter, a tab, or another control can hide a row, the count sits under the frame, at the left. It is `--text-12` `--text-muted`, sits `--space-8` under the frame, and reads Showing N of M. M is the full set before those controls. When every row is always on screen, that line is left off.

When the table is created, add the column minimums up against the pane it sits in. If the sideways scroll is more than 200px, one short column, hide the least important column and measure again, until the leftover scroll is 200px or less. A sliver under 200px still scrolls. The table does not drop a column for that, and it does not squeeze a remaining column under its minimum to keep the extra one. The least important column is the one the row can lose and still be told apart. It is not the column that names the record, it is not the column the page is for, and it is not a time. A time stays. A second copy of a fact already on the row, and a note that is not the record, go first. Hide one column at a time.

Forced by: “when creating a table, if a table has to scroll pretty far, pick the least important column and hide it.”

While the rows are still loading, the same table shows the skeleton in the Loading state of that section. A table whose rows are already in hand shows them. Opening that page again does not play the skeleton. The bars are the wait, and they start when the rows arrive.

Forced by: “It should only appear when necessary, when content hasn't actually loaded. Not strictly every time.” The bars sit in the cells. The columns do not change width when the values arrive. A title with a note under it is two bars, 6px apart: the title is 12px tall and 42% of the column, and the note is 10px tall and 68%. A cell that is one line is one 12px bar, 68% of the column. A chip, a status, or a person is one bar, 64px by 20px. A short value is one 12px bar. Every bar is `--grey` with a 4px radius. The bars pulse once, opacity 1 to `--sk-pulse-min` and back, over `--sk-pulse-dur`, ease-in-out. The values then crossfade in and the bars crossfade out over `--sk-reveal-dur`, with a `--sk-reveal-blur` blur. Each column starts `--sk-ripple` after the one on its left. The row takes no hover and no press while the bars are up. `prefers-reduced-motion: reduce` skips the pulse, the blur, and the delay, and the values appear in place. Do not add a shimmer, a second grey, or a skeleton that sits outside the cell.

Screen-only note layout is not in this catalog. Do not fold one-off note chrome into the gallery unless it is reused.
