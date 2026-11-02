# Patterns

## Gallery page

`index.html` is a specimen page, not product UI. New shared components get a labeled section and a link in the page index. The title row keeps the theme switch. It themes the whole catalog, and the same switch in the sidebar specimen stays in step with it.

## Notes

`notes.html` is the product surface. It consumes tokens and gallery components. Screen-only layout, density, and note-list behavior stay in `css/notes.css` and `js/notes.js`. Top is the only notes layout. The department tag and the department-bar thumb are part of that page.

## Blocks

A new screen is the job sentence plus these blocks. Use a block for the part of the page it already is. The measurements below are the ones the pages already use.

### Header

- States: the title row, which is always there. The department bar, when the page filters by department. The action corner, either the one primary button or empty.

Every product page uses the gallery header in the center column. `notes.html` is the reference. It is 60px tall: a 30px page icon, a 14px regular title, and a 14px `--text-muted` count. Page actions sit on the right of that row. A 1px `--line` closes the row. A primary button, with an icon, is the main action when the page creates or commits something. One main action. A page that only views something leaves that corner empty. Do not invent a button so the header matches notes. The title row does not hold search.

Department bar, when the page filters by department. A full-width `--sidebar-grey` strip directly under that line. The selected tab uses `--grey`. Its name is `--black` and its count is `--black-50`. An unselected name is `--black-50`. Its count is `--black-25`. The tabs are the tabs component.

### Filter row

- States: search at rest, search hover and focus, the filter control at rest and on hover, chips on the row, chips on the next line, and the menu open. With no chosen filter, there are no chips.

The to-do table and notes do not use the same row.

On a to-do table the row is the search component, then a 44px trigger, then the chips. The trigger is the icon and the chevron only. The word “Filters” is not shown. Its hover fill is `--sidebar-grey`. The chips sit in the remaining column, vertically centered with the search. When the row is too narrow, the chips wrap to the next line and that line starts at the left edge.

On notes, top view is the layout. The header search is hidden. The filter tools are the search, then Filters, Print, and New. The Filters trigger shows the word and is 121px wide. When chips exist they take the next line, full width, starting at the left edge. They sit under those buttons. They do not sit above them.

The to-do filter menu lists Type, Status, Urgency, Assigned, Room, Area, Item, Detail, and Source. Each row opens a submenu to the side. Type uses the department chip. Status is the words Open, In progress, and Completed. Urgency uses the urgency chip. Assigned uses the miniature name pill. Room, Area, Item, Detail, and Source are plain labels. A check marks the chosen option. A chosen filter becomes a filter chip. The chip hugs that value. It does not reserve width for every option. The notes menu is the time range already on that page: 7d, 24h, and 30d.

The Filters trigger keeps one width, closed and open: the longest option, including its icon and padding. Size that label with every option stacked in the same grid cell, and let the menu fill that width. Do not give the menu a fixed width that is independent of the options, and do not let the closed label shrink to the selected value. The label text stays next to its leading icon. The extra width sits after that label, before the chevron. Do not spread the icon, the label, and the chevron across the control.

A filter chip is not that trigger. The chip hugs the value it is showing. A longer value widens the chip, and the chips beside it move with it. The field name is medium weight. Do not reserve the chip for every option it might show. The menu still grows to its longest option.

### Note card

- States: rest, selected, and the photo hover. Rest is the page, not a card inside a card. Selected uses `--sidebar-grey`. Hovering the photo shows the author’s name. Empty is the new card in Creating a new item.

Each card is a 39px circular photo, then one line for the time and the department tag, then the title, then the preview. The title and the preview stay one line and end in an ellipsis. The open title is the exception: it wraps. The tooltip is centered above the photo.

### Comment thread

- States: comments present, no comments, hover, and scrolling. With no comments, the heading and the composer sit one `--space-16` apart. Hover shows the view count and the more menu.

Comments that no longer fit scroll, and the body does not shrink to make room. The comment scroll and the body scroll use the overflow blur. The composer stays under the comments and does not scroll away. A comment row is the comment component. The view count, with its eye, sits on the right of that row. The comment’s more menu is the last item, flush with the row. Both show on hover. Delete is Removing an item.

### Task row

- States: rest, hover, open, and the empty cells below. Completing is Completing an item.
- Rest is white. In dark mode that rest is the page, `--bg-surface`. Vertical padding is `--space-8`.
- Hover paints the row `--sidebar-grey`. In dark mode the row hover is `--grey`, one step lighter than the page. The “Add a note” placeholder appears only then. A note that is already written stays visible. Focus clears the placeholder.
- The open row is the selection: a 1px `--action` box and a `--filter-chip-bg` fill. Hover stays that blue. Another row can be grey at the same time. The detail under the open row stays `--sidebar-grey`.
- Status is the gallery status symbol. Its hover is a pill, `--grey` when the row is already hovered. In dark mode that pill is `--black-12`, one step past the hovered row. `--grey-up` is too light for that pill.
- Room is 16px and 500, the same size in the detail panel. It is a dropdown of rooms that already exist. An empty room is a quiet dash. It does not say Room. The number is not typed. Choosing a room updates the table and the side panel together. The room number shares the title’s baseline.
- To-do is the location chip, a middot, and the item chip, side by side in place of one title. They have a hover fill and no chevron. The location stays whole. The item truncates. Empty says Location and Item, and the middot is quiet. The table and the detail panel use one box: height 20px, padding `2px 4px`, radius 4px, and the same hover fill. Light mode uses `--grey`. Dark mode uses `--black-12`. The detail chip does not take a lighter step than the table chip.
- Urgency and type hug the value. Hover shows the down chevron in the chip’s gap and does not move the next column. The column is already as wide as its longest option, including Urgent’s icon and Food & Beverage. Standard stays `--sidebar-grey`. The type fill stays the department color on hover and while the menu is open. Stroke mode is the exception: the row shows through a clear chip, so the table chip rests on the page fill with a `--black-12` ring. Its hover is `--grey` in light mode and `--black-12` in dark mode. The dark pressed ring is `--black-25`.
- Assigned is the initials in a 35px avatar. Hover shows the chevron beside that circle, outside the pill, and the full name in a tooltip. Only the circle’s fill changes. The ring stays the same 1px. It does not gain a second stroke. The chevron does not sit in that pill, and the next column stays put. The row hover does not change the photo. Unassigned is the dashed empty avatar and says “Unassigned”. It opens the people menu. The name is not typed on the row. In dark mode a named photo is `--grey`, lighter than the page. Hovering that circle uses a `--black-12` fill. The ring stays 1px. An empty photo stays clear, with a 1px dashed `--black-50` stroke. The dark photo clip that insets a portrait does not apply to that dash.
- Opened is already as wide as “May 30”.
- Right-click opens the row menu: Schedule for future, then Delete. Delete uses the danger item.

Clicking a row opens its detail. Clicking that open row again closes it. A button or a field in the row keeps its own click. The row uses the hand, including the room, the location, the item, and the note. A field uses the text cursor only while it is focused.

### Detail panel

- States: closed, open, entering, and leaving. Entering is `--motion-panel` (400ms) on `--ease-drawer`. Leaving is `--motion-panel-out` (320ms). Reduced motion skips the slide. Empty title is Location and Item.

The to-do detail panel is 392px and sits over the right of the table. The table keeps its width. It does not shrink to sit beside the panel. It opens and closes from the task row.

The side title is the location and item chips, empty or filled, so those values can be edited there as well as in the fields below. An empty title is the task row’s empty: Location and Item, not the word “To-do”. The title chips use the task row’s box and the same hover. In the side panel, the assignee uses the same padding as the other chips: `2px 4px`, a 20px height, a 4px radius, and weight 500. Status uses the same padding as the other chips, `2px 4px`. It stays 24px tall, with a 4px radius and weight 500. The assignee is `--text-13`. The status label is `--text-13`. Each status option is `--text-13`. The assignee keeps the miniature avatar, the name, and a `--sidebar-grey` fill. Hover and an open menu keep that fill and show the down chevron. Status keeps its icon and label and has no fill at rest. Type is the department chip for that type. The chip keeps that fill at rest, on hover, and while its menu is open. The room uses the task row’s room control. Location and Item are dropdowns. At rest they are the value with no fill. Hover and an open menu show a `--sidebar-grey` pill and a down chevron after the value. The side panel stacks its sections 24px apart. The room, title, and date use `--space-16`. In dark mode the detail uses `--grey`. The Description label is `--text-12`. The note under it is `--text-14`. Activity stacks its heading and reply `--space-8` apart. The reply field is `--text-14`. The side panel’s more button is clear at rest. Its grey fill shows only while the pointer is on it. Its menu is Delete only, and it opens again after it closes.

## Open note

The center is two columns under the header. The list is 375px. The open note takes the rest. The list is note cards.

The open note starts 30px below the top of the read pane. The bottom inset is 64px so the note clears the floating dev switch. The title is `--text-16` and weight 500. The more button is centered on that title, and its hover fill stays whole. Under it, one meta row holds Timestamp, Department, Author, and Viewed. The row has a single bottom line and a 40px gap between fields. When the four fields do not fit, later fields wrap to the next line. They are not clipped. Timestamp, Author, and Viewed are reserved for their longest values. The department tag hugs its label, so those three stay put when the department changes.

The body grows with the text and pushes the comment thread down. The body keeps that height when a comment is added. The body scrolls only when its own text is taller than the pane above the comment heading and the composer.

## Department tag

The department tag uses the urgency chip’s box. Height 20px. Padding `2px 4px`. Radius 4px. Type is 13px, weight 500, line-height 16px. Each department has its own text and fill. Front desk stays `--tag-text` and `--tag-bg`. The list card and the open note use this same tag for that department. At rest the chip hugs the label. It does not keep a gap for a chevron that is hidden. On hover and when the menu is open, the chevron appears after the label, in the chip’s 4px gap, and the chip widens to fit it. It does not cover the word. That extra width does not move the items beside the chip. Leave enough space after the chip that the chevron stays clear of the next design item.

Stroke mode keeps the dot and drops the department fill. The notes chip rests clear, with `--black` text and a 1px `--black-12` ring. Its hover fills `--sidebar-grey` in light mode and `--grey` in dark mode, because that chip sits on the page. The same chip on a to-do row rests on the page fill with the `--black-12` ring, so the hovered row does not show through. Its hover is one step past that row: `--grey` in light mode, `--black-12` in dark mode, and the dark pressed ring is `--black-25`. Color mode keeps the department fill in both themes.

## Department bar thumb

The department tabs scroll sideways. Do not use the system horizontal scrollbar there. Hide it. Draw a thumb `--space-4` tall, with `--radius-circle` and a `--black-25` fill, `--space-2` above the bottom of the bar. The thumb’s width matches how much of the row is visible. The bar’s bottom padding is `--space-8`, so the thumb sits under the tabs and not on the labels. Vertical scroll stays the thin sidebar scrollbar.

## Window resize

The left nav is the sidebar component in [components.md](components.md). Copy it from `notes.html`. Do not redesign it per screen. The left nav and the right Lance chat are fixed-width panels.

- Keep each panel at its designed width. Do not set them to a percentage, `flex-grow`, or `min()` that tracks the viewport. Open widths are 277px and 392px. The collapsed rails are 54px and 62px.
- The center keeps 895px: the 375px list and a 520px open note, so the note stays wide enough for Timestamp, Department, Author, and Viewed on one row. Only the center changes width between the limits below.
- On resize, collapse the left nav first. It collapses when the viewport is under 1564px (277 + 895 + 392).
- Collapse the Lance chat second. It collapses when the viewport is under 1341px (54 + 895 + 392).
- Do not squeeze either panel, and do not hide it. Each one is open, or it is its rail. A manual collapse stays collapsed when the window grows. A panel below its limit starts collapsed. Clicking expand on either panel opens it anyway and keeps it open until the user collapses it or the window is wide enough.

## Creating a new item

Internal notes is the reference. The main action creates the new record on the page. Do not ask for the name in a prompt. When the list has no records, that blank record is created and opened. Comments stay closed until the note has a title or a body.

- The new card is inserted at the top of the list, and the cards under it move down. Until the user types, the card reads "Title" and then "New note", both in `--text-muted`.
- The photo is a grey placeholder until the title or the note has text. The picture then fades in.
- The open record uses the same layout as an existing one.
- The title shows "Title" in `--text-muted` until the user types. A new note opens with that field focused.
- The body shows "New note" in `--text-muted`. That placeholder disappears when the field is clicked, and it comes back if the field is left empty.
- Timestamp, author, and viewed are filled from what the product already knows. The department starts as Front desk. The four fields keep one equal gap. Timestamp, author, and viewed stay wide enough for their longest value. The department tag uses the padding in the Department tag section, so it hugs the label.
- The department chip shows its down chevron and hugs its label. The chevron is inline with that label, so it moves with the chip. Author and Viewed are the next fields, so they stay put when the label changes. The chevron turns when the menu is open. Clicking it opens every department. Choosing one files the record there, and the list card follows.
- The viewed count is a chip with an eye, because the number has no word beside it. Hovering it shows a down chevron. Clicking it opens who viewed the note and who did not. Each person uses the gallery person row: a mini avatar and a name. The chip count is those people. A new note starts with no one in Viewed, and that empty group is left out, heading included.

## Completing an item

Completing an item on the list you are working shows the completed status on that item first. The status icon and its label update immediately. The item then stays put for 700ms, long enough to see that it completed, and then leaves that list. The count updates when it leaves, not when the status changes. The removal closes the gap the same way a delete does. Do not snap it out, and do not leave the gap.

An item that is already on the Completed list stays there when its status is completed. Changing the status again before the 700ms cancels the removal. `prefers-reduced-motion: reduce` keeps the completed status and the delay, and skips the close-the-gap animation.

## Removing an item

Deleting an item from a list moves the items below it up to close the space. Delete requires that motion. Do not leave the gap, and do not snap the list shut. A comment uses the same delete: its more menu, and a right-click on the comment, offer Delete. The gallery confirmation opens first. Cancel leaves the comment. The comments under it move up.

## Naming a person or an urgency

A person’s name uses the gallery person treatment every time it appears. A compact name is the miniature tag: `.mini-pill` with `.avatar.mini` and the name. Use that in a menu option, a filter, a chip, a table cell, an activity line, and any sentence that names someone. A name with a role, or a longer identity, is `.person` with the avatar and the name. The menu row, the check, and the surrounding sentence stay. The name itself is the component. An unassigned person is that same avatar with no initials. The fill is clear and the stroke is 1px dashed `--black-50`. A named person keeps the solid `--black-12` stroke. In dark mode a named photo on the to-do table is `--grey` at rest and `--grey-up` on a hovered row or when the chip is hovered, so the photo stays lighter than the surface behind it. The empty avatar stays clear with the dashed `--black-50` stroke. Dark mode clips a portrait by 1px. That clip stays off the empty avatar, or the dash disappears.

Picking a person is a dropdown every time. The menu lists people who already exist. The closed control shows that person, or Unassigned. A new person is added in Settings, from the account gear. Settings is where the name is typed. Saving that person puts them in every person menu. A schedule, a to-do, a filter, and a note pick from that menu.

Picking a room is a dropdown every time. The menu lists rooms that already exist. The closed control shows that room number, or the quiet dash when it is empty. The number is not typed on a to-do, a complaint, a filter, or a side panel.

An urgency level uses the gallery chip every time it is named. Urgent, High, Standard, and Low are `.urgency`, including inside a menu, a filter, a chip, and a table cell. Urgent includes the warning icon. High, Standard, and Low are that same chip with the label only. Keep the chip’s padding, height, and radius. Use the urgency tokens. Standard stays `--sidebar-grey` everywhere it is named, including on a selected note and in the menu. Do not recolor it because the note or the menu row behind it changes.

A type uses the department chip every time it is named. The menu and the filter list every department: Front desk, Housekeeping, Maintenance, Food & Beverage, Sales, and Management. Front desk uses `--tag-text` on `--tag-bg`. Housekeeping uses `--dept-housekeeping` on `--dept-housekeeping-bg`. Maintenance uses `--dept-maintenance` on `--dept-maintenance-bg`. Food & Beverage uses `--dept-food` on `--dept-food-bg`. Sales uses `--dept-sales` on `--dept-sales-bg`. Management uses `--dept-management` on `--dept-management-bg`. The fill stays on hover and while the menu is open. On the table the chip hugs that label. It is not stretched to the longest department.

A column that shows one of a fixed set of options is already as wide as its longest option, including that option’s icon and padding. This holds for every aligned grid, including a table and a week schedule. The header and every row share one set of tracks. Do not let each row measure its own columns. That is how a header label lands on the column beside it. The control still hugs the value it is showing. Choosing another option does not move that column or the columns beside it. Stack every option in the same grid cell and hide the ones that are not selected.

Urgency, type, status, and the name chip share one font size. All are 13px, weight 500, line-height 16px. Urgency and type also share `2px 4px` padding, a 20px height, and a 4px radius. A table cell, a menu, a filter, and the side panel use that same box. The department tag uses it too.

A chip that opens a menu uses the department tag above: the chevron shows on hover, the chip hugs the label, and the items beside it stay put. Urgent still includes the warning icon. High, Standard, and Low stay that chip with the label only. The name chip is the gallery miniature pill, and it hugs the name the same way. On a to-do row the chip shows the initials. An unassigned row shows the empty avatar with the dashed stroke. Hover shows that person’s full name in the tooltip, centered on the chip. Unassigned says “Unassigned”. The people menu paints in front of the table, including while the pointer is still on the chip. Hover motion follows [polish.md](polish.md).

## The job

A new screen starts from the job, not from the nearest page. Name it in one sentence before drawing: who is here, what they are trying to finish, and what they have to see to finish it. The screen is that sentence plus the blocks above. The arrangement follows that sentence. This product has many jobs, so a list, a table, and a week grid are references, not the only layouts.

Look at how notes, to-dos, and the gallery already place a person, a department, an urgency, and an action. Reuse those pieces. The way the pieces are arranged can be new when the job is new. Try the arrangement the job needs, then check it against a page that already works: same chrome, same type, same chips, same tokens. A layout that only exists because it copies notes is the miss. A layout that invents a new chip, a new header, or a new color is the other miss.

Put each fact where the job uses it. What they scan is the main surface. What they need at the moment they act sits with that action. What they need rarely can wait. A control that does not serve the job stays off the page, including the header.

The frequent action is where they are already looking. The thing the page is for does not require a second screen or a prompt. Those are for something they do rarely.

## Building a screen

1. Name the job, then read the blocks above and `foundations.md` for the roles and aliases you will touch.
2. Pull component markup from the gallery. Assemble the screen from the blocks the job needs.
3. Compose the screen in the product stylesheet, not by forking token values.
4. Keep one primary action per view, using `--action`. Pressing Delete opens the gallery confirmation first. Destructive confirmation uses `--destructive` and only on the confirming control.
5. A person, an urgency, a type, and a status use the gallery treatment in Naming a person or an urgency. Keep each component’s padding, height, and radius.

## Empty, loading, and error

An empty section uses the empty this product already has for that kind of thing. A new note reads “Title” and “New note”. An empty room is the quiet dash. An unassigned person is the dashed avatar. An empty to-do says Location and Item. A comment thread with no comments keeps the heading and the composer. Secondary copy uses `--text-muted`. If that section has no empty yet, say the empty state is undecided. Do not invent one.

Loading is undecided. Error is undecided.
