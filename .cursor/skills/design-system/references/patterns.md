# Patterns

## Gallery page

`catalog/index.html` is a specimen page, not product UI. New shared components get a labeled section and a link in the page index. The title row keeps the theme switch. It themes the whole catalog, and the same switch in the sidebar specimen stays in step with it.

## Notes

`catalog/notes.html` is the product surface. It consumes tokens and gallery components. Screen-only layout, density, and note-list behavior are not in this catalog. Top is the only notes layout. The department tag and the department-bar thumb are part of that page.

## Blocks

A new screen is the job sentence plus these blocks. Use a block for the part of the page it already is. The measurements below are the ones the pages already use.

### Header

- States: the title row, which is always there. The department bar, when the page filters by department. The action corner: the one primary button or empty on a main page, and back navigation on a subpage.

Every product page uses the gallery header in the center column. `catalog/notes.html` is the reference. It is 60px tall: a 30px page icon, a 14px regular title, and a 14px `--text-muted` count. The title is `--black`. A parent in that title, the word you click to go back, is the same `--black`. It does not drop to `--black-50` or `--text-muted`. The count stays `--text-muted`. Page actions sit on the right of that row. A button in that row always has an icon beside its label. A text-only header button is wrong. An icon-only tool already meets this. A 1px `--line` closes the row. On a main page, a primary button, with an icon, is the main action when the page creates or commits something. One main action. A page that only views something leaves that corner empty. A subpage follows Subpage below. Do not invent a button so the header matches notes. The title row does not hold search.

A subpage title is one line, 14px, line-height 20px, aligned to the baseline. It is the parent, then `/`, then the current page. A step between them is the same kind of parent: black text you click to go back one level. The slash is `--black-25`, with `--space-4` on each side. The parent and any middle step are text, not a padded chip. Hover may wash them, and that wash does not move the words. The current page is `--black` and ellipsizes. The count stays in its own slot, after the title. Cash and preventive maintenance use this same title. Do not give one page a wider gap, a darker slash, or a different line.

Department bar, when the page filters by department. A full-width `--sidebar-grey` strip directly under that line. The selected tab uses `--grey`. Its name is `--black` and its count is `--black-50`. An unselected name is `--black-50`. Its count is `--black-25`. The tabs are the tabs component.

A list page is Page layout in [components.md](components.md). Preventive maintenance, Readings, and Knowledge base use that stack and do not restyle it.

### Subpage

A full subpage keeps its content within 820px and uses the top-right only for back navigation. A primary action belongs in the page content.

- The content width does not exceed 820px.
- The top-right of a subpage does not hold a primary action.
- The only control in that corner is back navigation.
- A primary button may be used, and it sits inside the page content.
- A primary action in the top-right is reserved for main pages.

### Filter row

- States: search at rest, search hover and focus, the filter control at rest and on hover, chips on the row, chips on the next line, and the menu open. With no chosen filter, there are no chips.

The to-do table and notes do not use the same row.

On a sheet the row is one module. Search is 281px. The filter trigger sits on the search, 44px, icon and chevron only. The word “Filters” is not shown. Its hover fill is `--sidebar-grey`. Chips use the flexible column between the filter and anything that follows. A trailing control, such as the time range on calls, shares that line. It drops to the next line only when the row is narrower than 500px. The filter does not move to the far edge, and the search does not grow to fill the row. A page does not restyle this row.

On notes, top view is the layout. The header search is hidden. The filter tools are the search, then Filters, Print, and New. The Filters trigger shows the word and is 121px wide. When chips exist they take the next line, full width, starting at the left edge. They sit under those buttons. They do not sit above them.

The to-do filter menu lists Type, Status, Urgency, Assigned, Room, Area, Item, Detail, and Source. Each row opens a submenu to the side. Type uses the department chip. Status is the words Open, In progress, and Completed. Urgency is the colored word, with the warning icon on Urgent, and no pill. Assigned uses the miniature name pill. Room, Area, Item, Detail, and Source are plain labels. A check marks every option that applies. Choosing one leaves the others checked, and the menu stays open. Each chosen filter becomes its own chip. The chip hugs that value. It does not reserve width for every option. The notes menu is the time range already on that page: 7d, 24h, and 30d. Those options stay checked together, the same as every other filter.

The Filters trigger keeps one width, closed and open: the longest option, including its icon and padding. Size that label with every option stacked in the same grid cell. Do not let the closed label shrink to the selected value. The label text stays next to its leading icon. The extra width sits after that label, before the chevron. Do not spread the icon, the label, and the chevron across the control. The menu that opens from it follows Menu width in [components.md](components.md).

A filter chip is not that trigger. The chip hugs the value it is showing. A longer value widens the chip, and the chips beside it move with it. The field name is normal weight. Do not reserve the chip for every option it might show. The open menu follows Menu width in [components.md](components.md).

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
- Room follows Room in [components.md](components.md). The room number shares the title’s baseline. Choosing a room updates the table and the side panel together.
- To-do is the location chip, a middot, and the item chip, side by side in place of one title. They have a hover fill and no chevron. The location stays whole. The item truncates. The note fills the column. It does not shrink to the words. Empty says Location and Item, and the middot is quiet. The table and the detail panel use one box: height 20px, padding `2px 4px`, radius 4px, and the same hover fill. Light mode uses `--grey`. Dark mode uses `--black-12`. The detail chip does not take a lighter step than the table chip.
- Urgency follows Urgency in [components.md](components.md). Type follows Department tag.
- Assigned follows Table in [components.md](components.md).
- Opened is already as wide as “May 30”.
- Right-click opens the row menu: Schedule for future, then Delete. Delete uses the danger item.

Clicking a row opens its detail. Clicking that open row again closes it. A button or a field in the row keeps its own click. The row uses the hand, including the room, the location, the item, and the note. A field uses the text cursor only while it is focused.

### Detail panel

See Detail panel in [components.md](components.md).

## Open note

The center is two columns under the header. The list is 375px. The open note takes the rest. The list is note cards.

The open note starts 30px below the top of the read pane. The bottom inset is 64px so the note clears the floating dev switch. The title is `--text-16` and weight 500. The more button is centered on that title, and its hover fill stays whole. Under it, one meta row holds Timestamp, Department, Author, and Viewed. The row has a single bottom line and a 40px gap between fields. When the four fields do not fit, later fields wrap to the next line. They are not clipped. Timestamp, Author, and Viewed are reserved for their longest values. The department tag hugs its label, so those three stay put when the department changes.

The body grows with the text and pushes the comment thread down. The body keeps that height when a comment is added. The body scrolls only when its own text is taller than the pane above the comment heading and the composer.

## Department tag

See Department tag in [components.md](components.md).

## Department bar thumb

The department tabs scroll sideways. Do not use the system horizontal scrollbar there. Hide it. Draw a thumb `--space-4` tall, with `--radius-circle` and a `--black-25` fill, `--space-2` above the bottom of the bar. The thumb’s width matches how much of the row is visible. The bar’s bottom padding is `--space-8`, so the thumb sits under the tabs and not on the labels. Vertical scroll stays the thin sidebar scrollbar.

## Window resize

The left nav is the sidebar component in [components.md](components.md). Copy it from `catalog/notes.html`. Do not redesign it per screen. The left nav and the right Lance chat are fixed-width panels.

- Keep each panel at its designed width. Do not set them to a percentage, `flex-grow`, or `min()` that tracks the viewport. Open widths are Sidebar and Detail panel in [components.md](components.md). The collapsed rails are the sidebar rail and the Lance rail, 62px.
- The center keeps 895px: the 375px list and a 520px open note, so the note stays wide enough for Timestamp, Department, Author, and Viewed on one row. Only the center changes width between the limits below.
- On resize, collapse the left nav first. It collapses when the viewport is under 1564px.
- Collapse the Lance chat second. It collapses when the viewport is under 1341px.
- Do not squeeze either panel, and do not hide it. Each one is open, or it is its rail. A manual collapse stays collapsed when the window grows. A panel below its limit starts collapsed. Clicking expand on either panel opens it anyway and keeps it open until the user collapses it or the window is wide enough.

## Creating a new item

Internal notes is the reference. The main action creates the new record on the page. Do not ask for the name in a prompt. When the list has no records, that blank record is created and opened. Comments stay closed until the note has a title or a body.

- The new card is inserted at the top of the list, and the cards under it move down. Until the user types, the card reads "Title" and then "New note", both in `--text-muted`.
- The photo is a grey placeholder until the title or the note has text. The picture then fades in.
- The open record uses the same layout as an existing one.
- The title shows "Title" in `--text-muted` until the user types. A new note opens with that field focused.
- The body shows "New note" in `--text-muted`. That placeholder disappears when the field is clicked, and it comes back if the field is left empty.
- Timestamp, author, and viewed are filled from what the product already knows. The department starts as Front desk. The four fields keep one equal gap. Timestamp, author, and viewed stay wide enough for their longest value. The department tag uses the padding on Department tag in [components.md](components.md), so it hugs the label.
- The department chip shows its down chevron and hugs its label. The chevron is inline with that label, so it moves with the chip. Author and Viewed are the next fields, so they stay put when the label changes. The chevron turns when the menu is open. Clicking it opens every department. Choosing one files the record there, and the list card follows.
- The viewed count is a chip with an eye, because the number has no word beside it. Hovering it shows a down chevron. Clicking it opens who viewed the note and who did not. Each person uses the gallery person row: a mini avatar and a name. The chip count is those people. A new note starts with no one in Viewed, and that empty group is left out, heading included.

A new table row uses the same idea on the sheet. Complaints shares it with to-dos. The row is inserted at the top. It grows from height 0 to its content over 200ms, and the rows under it move down. `prefers-reduced-motion: reduce` inserts the row at full height. The first field is focused. Do not ask for the name in a prompt.

## Completing an item

Completing an item on the list you are working shows the completed status on that item first. The status icon and its label update immediately. The item then stays put for 700ms, long enough to see that it completed, and then leaves that list. The count updates when it leaves, not when the status changes. The removal closes the gap the same way a delete does. Do not snap it out, and do not leave the gap.

An item that is already on the Completed list stays there when its status is completed. Changing the status again before the 700ms cancels the removal. `prefers-reduced-motion: reduce` keeps the completed status and the delay, and skips the close-the-gap animation.

## Removing an item

Deleting an item from a list moves the items below it up to close the space. Delete requires that motion. Do not leave the gap, and do not snap the list shut. A comment uses the same delete: its more menu, and a right-click on the comment, offer Delete. The gallery confirmation opens first. Cancel leaves the comment. The comments under it move up.

## Naming a person or an urgency

A person, a room, an urgency, a type, and a status use their components every time they are named. See Person, Room, Urgency, Department tag, Status, and Table in [components.md](components.md). Chip type is in [SKILL.md](../SKILL.md). Inside a menu, option type follows Menu.

## The job

A new screen starts from the job, not from the nearest page. Name it in one sentence before drawing: who is here, what they are trying to finish, and what they have to see to finish it. The screen is that sentence plus the blocks above. The arrangement follows that sentence. This product has many jobs, so a list, a table, and a week grid are references, not the only layouts.

Look at how notes, to-dos, and the gallery already place a person, a department, an urgency, and an action. Reuse those pieces. The way the pieces are arranged can be new when the job is new. Try the arrangement the job needs, then check it against a page that already works: same chrome, same type, same chips, same tokens. A layout that only exists because it copies notes is the miss. A layout that invents a new chip, a new header, or a new color is the other miss.

Put each fact where the job uses it. What they scan is the main surface. What they need at the moment they act sits with that action. What they need rarely can wait. A control that does not serve the job stays off the page, including the header.

The frequent action is where they are already looking. The thing the page is for does not require a second screen or a prompt. Those are for something they do rarely.

## Spacing a screen

Read this before drawing. The measurements in this section are the level of quality, not a format to repeat. A new screen does not have to use its title size, its progress bar, its columns, or its button. It does have to be this considered.

Group what belongs together, then set the space between those groups. A title and the line under it are one group. A section title and the content under it are one block. The gap inside a group stays smaller than the gap between groups. Opening the screen up changes the space between groups. It leaves the space inside a group alone.

A title and the content it names keep at least 40px. That gap does not go under 40px. A subtitle that belongs to the title stays `--space-4`.

A title has room to breathe above it. A count or a step sits with the title it belongs to, centered on that title, when the screen has one. Leave off a brand, a product name, or any other label the content does not need.

One primary action, where the person is already looking. On a card it stays inside the padding and keeps its radius. A control gets taller only when its job earns it, the way a full-width action at the bottom of a popup does. The corner close is the dismiss when a close is already there.

A phrase in the copy is not a new labeled block. A placeholder stands in for an image the screen already has. The lesson card’s measurements stay in the Lesson card section.

## Lesson card

See Lesson card in [components.md](components.md). A training lesson is that card over the page, not a second page.

## Building a screen

1. Name the job, then read the blocks above and `foundations.md` for the roles and aliases you will touch.
2. Pull component markup from the gallery. Assemble the screen from the blocks the job needs.
3. Compose the screen in the product stylesheet, not by forking token values.
4. Keep one primary action per view, using `--action`. Any destructive action opens the gallery confirmation first. A trash icon and a Delete button are the same press. That control, and the confirming control, are danger fill.
5. A person, an urgency, a type, and a status follow Person, Urgency, Department tag, and Status in [components.md](components.md).

## Empty, loading, and error

An empty section uses the empty this product already has for that kind of thing. A new note reads “Title” and “New note”. An empty room is the quiet dash. An unassigned person is the dashed avatar. An empty to-do says Location and Item. A comment thread with no comments keeps the heading and the composer. Secondary copy uses `--text-muted`. If that section has no empty yet, say the empty state is undecided. Do not invent one.

Loading a table uses the skeleton in the Table section of [components.md](components.md). The bars sit in the cells and pulse once. The values then crossfade in, one column after the next. The columns do not change width when the values arrive. The row takes no hover and no press while the bars are up. Reduced motion skips the pulse and shows the values in place. Do not invent a second loader.

Error is one treatment, and it is not built yet. A page does not invent a banner, a red row, or a second empty state for a failure. When an error is designed, it is added here and then used on every component.
