# Patterns

## Gallery page

`index.html` is a specimen page, not product UI. New shared components get a labeled section and a link in the page index.

## Notes

`notes.html` is the product surface. It consumes tokens and gallery components. Screen-only layout, density, and note-list behavior stay in `css/notes.css` and `js/notes.js`. Top is the only notes layout. The department tag and the department-bar thumb are part of that page.

## Internal notes layout

The center is two columns under the standard header. The list is 375px. The open note takes the rest.

The list card is the page, not a card inside a card. A selected card uses `--sidebar-grey`. Each card is a 39px circular photo, then one line for the time and the department tag, then the title, then the preview. The title and the preview stay one line and end in an ellipsis. The open title is the exception: it wraps. Hovering the photo shows the author’s name in the tooltip, centered above the photo.

The open note starts 30px below the top of the read pane. The bottom inset is 64px so the note clears the floating dev switch. The title is `--text-16` and weight 500. The more button is centered on that title, and its hover fill stays whole. Under it, one meta row holds Timestamp, Department, Author, and Viewed. The row has a single bottom line and a 40px gap between fields. Timestamp, Author, and Viewed are reserved for their longest values. The department tag hugs its label, so those three stay put when the department changes.

The body grows with the text and pushes comments down. The body keeps that height when a comment is added. Comments that no longer fit under it scroll, and the body does not shrink to make room. The body scrolls only when its own text is taller than the pane above the comment heading and the composer. Both scrolls use the overflow blur. The composer stays under the comments and does not scroll away. With no comments, the heading and the composer sit one `--space-16` apart. A comment row is at least 49px, with a 21px photo. The view count, with its eye, sits on the right of that row. The comment’s more menu is the last item, flush with the row. Both show on hover.

## Department tag

The department tag uses the urgency chip’s box. Height 20px. Padding `2px 4px`. Radius 4px. Type is 13px, weight 500, line-height 16px. Each department has its own text and fill. Front desk stays `--tag-text` and `--tag-bg`. The list card and the open note use this same tag for that department. At rest the chip hugs the label. It does not keep a gap for a chevron that is hidden. On hover and when the menu is open, the chevron appears after the label, in the chip’s 4px gap, and the chip widens to fit it. It does not cover the word. That extra width does not move the items beside the chip. Leave enough space after the chip that the chevron stays clear of the next design item.

## Department bar thumb

The department tabs scroll sideways. Do not use the system horizontal scrollbar there. Hide it. Draw a thumb `--space-4` tall, with `--radius-circle` and a `--black-25` fill, `--space-2` above the bottom of the bar. The thumb’s width matches how much of the row is visible. The bar’s bottom padding is `--space-8`, so the thumb sits under the tabs and not on the labels. Vertical scroll stays the thin sidebar scrollbar.

## Window resize

The left nav is the sidebar component in [components.md](components.md). Copy it from `notes.html`. Do not redesign it per screen. The left nav and the right Lance chat are fixed-width panels.

- Keep each panel at its designed width. Do not set them to a percentage, `flex-grow`, or `min()` that tracks the viewport. Open widths are 277px and 392px. The collapsed rails are 54px and 62px.
- The center keeps 895px: the 375px list and a 520px open note, so the note stays wide enough for Timestamp, Department, Author, and Viewed on one row. Only the center changes width between the limits below.
- On resize, collapse the left nav first. It collapses when the viewport is under 1564px (277 + 895 + 392).
- Collapse the Lance chat second. It collapses when the viewport is under 1341px (54 + 895 + 392).
- Do not squeeze either panel, and do not hide it. Each one is open, or it is its rail. A manual collapse stays collapsed when the window grows. A panel below its limit starts collapsed. Clicking expand on either panel opens it anyway and keeps it open until the user collapses it or the window is wide enough.

## Standard header

Every product page uses this header in the center column. `notes.html` is the reference.

1. Title row, 60px tall. A 30px page icon, the title at 14px regular, and the count in 50% black. The page actions sit on the right. The main action is the primary button, with an icon. One main action per page. A 1px `--grey` line closes the row.
2. Department bar. A full-width `--sidebar-grey` strip directly under that line. The selected tab uses `--grey`. Its name is `--black` and its count is `--black-50`. An unselected name is `--black-50`. Its count is `--black-25`.
3. Filter row. Directly under the tabs. Search is the grey search field, 281px. The icon filter sits beside it. Filter chips share that row, vertically centered, after the filter. The field name is medium weight. When the chips run out of room, the extra chips wrap and each new line starts at the left edge.

Do not put search and the main action on the same row.

## Creating a new item

Internal notes is the reference. The main action creates the new record on the page. Do not ask for the name in a prompt. When the list has no records, that blank record is created and opened. Comments stay closed until the note has a title or a body.

- The new card is inserted at the top of the list, and the cards under it move down. Until the user types, the card reads "Title" and then "New note", both in `--black-50`.
- The photo is a grey placeholder until the title or the note has text. The picture then fades in.
- The open record uses the same layout as an existing one.
- The title shows "Title" in `--black-50` until the user types. A new note opens with that field focused.
- The body shows "New note" in `--black-50`. That placeholder disappears when the field is clicked, and it comes back if the field is left empty.
- Timestamp, author, and viewed are filled from what the product already knows. The department starts as Front desk. The four fields keep one equal gap. Timestamp, author, and viewed stay wide enough for their longest value. The department tag uses the padding in the Department tag section, so it hugs the label.
- The department chip shows its down chevron and hugs its label. The chevron is inline with that label, so it moves with the chip. Author and Viewed are the next fields, so they stay put when the label changes. The chevron turns when the menu is open. Clicking it opens every department. Choosing one files the record there, and the list card follows.
- The viewed count is a chip with an eye, because the number has no word beside it. Hovering it shows a down chevron. Clicking it opens who viewed the note and who did not. Each person uses the gallery person row: a mini avatar and a name. The chip count is those people. A new note starts with no one in Viewed, and that empty group is left out, heading included.

## Opening a to-do

The to-do detail panel is 392px and sits over the right of the table. The table keeps its width. It does not shrink to sit beside the panel. Clicking a to-do opens the panel. Clicking that open row again closes it. The side title is the location and item chips, empty or filled, so those values can be edited there as well as in the fields below. An empty to-do shows Location and Item, not the word “To-do”. A middot sits between the location and the item. On the table row those two are chips with a hover fill and no chevron. The panel slides in from the right on `--ease-drawer` over 400ms and leaves in 320ms. Reduced motion skips the slide. Hover paints one line `--sidebar-grey`. The open to-do is the selection. Its line keeps a 1px `--action` box and a `--filter-chip-bg` fill, including while the pointer is on it. Blue wins over the grey hover. Another row can be grey under the pointer at the same time. The detail under the open row stays `--sidebar-grey`. In the side panel, the assignee uses the same padding as the other chips: `2px 4px`, a 20px height, a 4px radius, and weight 500. Status uses the same padding as the other chips, `2px 4px`. It stays 24px tall, with a 4px radius and weight 500. The assignee is `--text-13`. The status label is `--text-13`. Each status option is `--text-13`. The assignee keeps the miniature avatar, the name, and a `--sidebar-grey` fill. Hover and an open menu keep that fill and show the down chevron. Status keeps its icon and label and has no fill at rest. Type is the department chip for that type. Housekeeping is `--dept-housekeeping` on `--dept-housekeeping-bg`. Maintenance is `--dept-maintenance` on `--dept-maintenance-bg`. The chip keeps that fill at rest, on hover, and while its menu is open. The room box edits the room number. That number is `--text-16` and weight 500, the same size as the table room. Clicking it changes that number, and the table room shows the same value. An empty room is the quiet dash. It does not say Room. Focusing it clears the dash so the number can be typed at once. Leaving it empty puts the dash back. Location and Item are dropdowns. At rest they are the value with no fill. Hover and an open menu show a `--sidebar-grey` pill and a down chevron after the value. On the table row those same chips sit side by side in place of one title. When the row runs out of room, the location stays whole and the item truncates. The side panel stacks its sections 24px apart. The room, title, and date use `--space-16`. In dark mode the detail uses `--grey`. The Description label is `--text-12`. The note under it is `--text-14`. Activity stacks its heading and reply `--space-8` apart. The reply field is `--text-14`. The type chip keeps its department fill on hover and while its menu is open. The side panel’s more button is clear at rest. Its grey fill shows only while the pointer is on it. Its menu is Delete only, and it opens again after it closes. On the table row the room number shares the title’s baseline. "Add a note" is hidden until that row is hovered, and the field is only as wide as its text. A note that already has text stays visible. The table frame ends at the last row. Its corners stay rounded. It does not stretch to fill the page. When the rows pass the space above the count, the frame stops there and the rows scroll inside it. Under the frame, at the left, the gallery count reads Showing N of M in `--text-12` and `--black-50`. N is the rows in view. M is the rows in that list.

## Completing an item

Completing an item on the list you are working shows the completed status on that item first. The status icon and its label update immediately. The item then stays put for 700ms, long enough to see that it completed, and then leaves that list. The count updates when it leaves, not when the status changes. The removal closes the gap the same way a delete does. Do not snap it out, and do not leave the gap.

An item that is already on the Completed list stays there when its status is completed. Changing the status again before the 700ms cancels the removal. `prefers-reduced-motion: reduce` keeps the completed status and the delay, and skips the close-the-gap animation.

## Removing an item

Deleting an item from a list moves the items below it up to close the space. Delete requires that motion. Do not leave the gap, and do not snap the list shut. A comment uses the same delete: its more menu, and a right-click on the comment, offer Delete. The gallery confirmation opens first. Cancel leaves the comment. The comments under it move up.

## Naming a person or an urgency

A person’s name uses the gallery person treatment every time it appears. A compact name is the miniature tag: `.mini-pill` with `.avatar.mini` and the name. Use that in a menu option, a filter, a chip, a table cell, an activity line, and any sentence that names someone. A name with a role, or a longer identity, is `.person` with the avatar and the name. The menu row, the check, and the surrounding sentence stay. The name itself is the component. An unassigned person is that same avatar with no initials. The fill is clear and the stroke is 1px dashed `--black-50`. A named person keeps the solid `--black-12` stroke.

An urgency level uses the gallery chip every time it is named. Urgent, High, Standard, and Low are `.urgency`, including inside a menu, a filter, a chip, and a table cell. Urgent includes the warning icon. High, Standard, and Low are that same chip with the label only. Keep the chip’s padding, height, and radius. Use the urgency tokens. Standard stays `--sidebar-grey` everywhere it is named, including on a selected note and in the menu. Do not recolor it because the note or the menu row behind it changes.

A type uses the department chip every time it is named. The menu and the filter list every department: Front desk, Housekeeping, Maintenance, Food & Beverage, Sales, and Management. Front desk uses `--tag-text` on `--tag-bg`. Housekeeping uses `--dept-housekeeping` on `--dept-housekeeping-bg`. Maintenance uses `--dept-maintenance` on `--dept-maintenance-bg`. Food & Beverage uses `--dept-food` on `--dept-food-bg`. Sales uses `--dept-sales` on `--dept-sales-bg`. Management uses `--dept-management` on `--dept-management-bg`. The fill stays on hover and while the menu is open. On the table the chip hugs that label. It is not stretched to the longest department.

A table column that shows one of a fixed set of options is already as wide as its longest option, including that option’s icon and padding. This holds for every table. The control still hugs the value it is showing. Choosing another option does not move that column or the columns beside it. Stack every option in the same grid cell and hide the ones that are not selected.

Urgency, type, status, and the name chip share one font size. All are 13px, weight 500, line-height 16px. Urgency and type also share `2px 4px` padding, a 20px height, and a 4px radius. A table cell, a menu, a filter, and the side panel use that same box. The department tag uses it too.

Hover changes the control under the pointer. It does not move the items around it. Use the padding and the gap that are already there. A control someone crosses often snaps, especially a table. The row fill and the chevron change in the same frame.

A chip that opens a menu shows a down chevron on hover, beside the label and inside the chip. Urgency, type, the assignee, and the department tag use it. The chip hugs its label. It does not keep a gap for a chevron that is hidden. On hover and when the menu is open, the chevron is the next item after the label, in the chip’s gap, and the chip widens to fit it. It does not cover the word. That extra width does not move the items beside the chip. Leave enough space after the chip that the chevron stays clear of the next design item. The open menu turns the chevron. Urgent still includes the warning icon. High, Standard, and Low stay that chip with the label only. The department tag uses this same box and the color for that department. Front desk stays gold. The name chip is the gallery miniature pill, and it hugs the name the same way. On a to-do row the chip shows the initials. An unassigned row shows the empty avatar with the dashed stroke. Hover shows that person’s full name in the tooltip, centered on the chip. Unassigned says “Unassigned”. The people menu paints in front of the table, including while the pointer is still on the chip.

## Filter dropdowns

The Filters trigger keeps one width, closed and open: the longest option, including its icon and padding. Size that label with every option stacked in the same grid cell, and let the menu fill that width. Do not give the menu a fixed width that is independent of the options, and do not let the closed label shrink to the selected value. The label text stays next to its leading icon. The extra width sits after that label, before the chevron. Do not spread the icon, the label, and the chevron across the control.

A filter chip is not that trigger. The chip hugs the value it is showing. A longer value widens the chip, and the chips beside it move with it. Do not reserve the chip for every option it might show. The menu still grows to its longest option.

## Building a screen

1. Read `foundations.md` for the tokens you will touch.
2. Pull component markup from the gallery.
3. Compose the screen in the product stylesheet, not by forking token values.
4. Keep one primary action per view, using `--action`. Pressing Delete opens the gallery confirmation first. Destructive confirmation uses `--destructive` and only on the confirming control.
5. A person’s name is the gallery person treatment. A compact name is `.mini-pill` with `.avatar.mini`. A name with a role is `.person`. An urgency level is the gallery chip, `.urgency`, wherever it is named. Urgent includes the warning icon. High, Standard, and Low are that same chip with the label only. Status uses the gallery status treatment. Both use their tokens. Keep each component’s padding, height, and radius.

## Empty, loading, and error

Use existing type sizes and `--black-50` for secondary copy. Do not add a new muted color.
