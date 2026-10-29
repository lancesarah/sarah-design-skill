# Patterns

## Gallery page

`index.html` is a specimen page, not product UI. New shared components get a labeled section and a link in the page index.

## Notes

`notes.html` is the product surface. It consumes tokens and gallery components. Screen-only layout, density, and note-list behavior stay in `css/notes.css` and `js/notes.js`.

## Window resize

The left nav is the sidebar component in [components.md](components.md). Copy it from `notes.html`. Do not redesign it per screen. The left nav and the right Lance chat are fixed-width panels.

- Keep each panel at its designed width. Do not set them to a percentage, `flex-grow`, or `min()` that tracks the viewport. Open widths are 277px and 392px. The collapsed rails are 54px and 62px.
- The center keeps 590px, the notes table minimum (220 + 140 + 90 + 140). Only the center changes width between the limits below.
- On resize, collapse the left nav first. It collapses when the viewport is under 1259px (277 + 590 + 392).
- Collapse the Lance chat second. It collapses when the viewport is under 1036px (54 + 590 + 392).
- Do not squeeze either panel, and do not hide it. Each one is open, or it is its rail. A manual collapse stays collapsed when the window grows. A panel below its limit starts collapsed. Clicking expand on either panel opens it anyway and keeps it open until the user collapses it or the window is wide enough.

## Standard header

Every product page uses this header in the center column. `notes.html` is the reference.

1. Title row, 60px tall. A 30px page icon, the title at 14px regular, and the count in 50% black. Search is the grey search field, 281px, on the right. A 1px `--grey` line closes the row.
2. Department bar. A full-width `--sidebar-grey` strip directly under that line. The selected tab uses `--grey`. Its name is `--black` and its count is `--black-50`. An unselected name is `--black-50`. Its count is `--black-25`.
3. Action row. Directly under the tabs. Filters, secondary actions such as Print, and the main action sit in the right corner. The main action is the primary button, with an icon. One main action per page.
4. Filter chips. On that same row, vertically centered with the buttons, starting at the left edge. The field name is medium weight. When the chips run out of room beside the buttons, the extra chips wrap and each new line starts at the left edge. When the row is too narrow for the buttons and two chips, the chips move to the next line, still at the left edge. A single chip does not sit beside the buttons.

Do not put search, the switcher, and the main action on a single crowded row. Do not move the primary action off the right corner below the tabs.

## Creating a new item

Internal notes is the reference. The main action creates the new record on the page. Do not ask for the name in a prompt. When the list has no records, that blank record is created and opened. Comments stay closed until the note has a title or a body.

- The new card is inserted at the top of the list, and the cards under it move down. Until the user types, the card reads "Title" and then "New note", both in `--black-50`.
- The photo is a grey placeholder until the title or the note has text. The picture then fades in.
- The open record uses the same layout as an existing one.
- The title shows "Title" in `--black-50` until the user types. A new note opens with that field focused.
- The body shows "New note" in `--black-50`. That placeholder disappears when the field is clicked, and it comes back if the field is left empty.
- Timestamp, author, and viewed are filled from what the product already knows. The department starts as Front desk. The four fields keep one equal gap. Timestamp, author, and viewed stay wide enough for their longest value. The department tag hugs its label.
- The department chip shows its down chevron and hugs its label. The chevron is inline with that label, so it moves with the chip. Author and Viewed are the next fields, so they stay put when the label changes. The chevron turns when the menu is open. Clicking it opens every department. Choosing one files the record there, and the list card follows.
- The viewed count is a chip with an eye, because the number has no word beside it. Hovering it shows a down chevron. Clicking it opens who viewed the note and who did not. Each person uses the gallery person row: a mini avatar and a name. The chip count is those people. A new note starts with no one in Viewed, and that empty group is left out, heading included.

## Removing an item

Deleting an item from a list moves the items below it up to close the space. Delete requires that motion. Do not leave the gap, and do not snap the list shut. A comment uses the same delete: its more menu, and a right-click on the comment, offer Delete. The gallery confirmation opens first. Cancel leaves the comment. The comments under it move up.

## Filter dropdowns

The closed control and the open menu share one width: the longest option, including its icon and padding. Size the label with every option stacked in the same grid cell, and let the menu fill that width. Do not give the menu a fixed width that is independent of the options, and do not let the closed label shrink to the selected value.

## Building a screen

1. Read `foundations.md` for the tokens you will touch.
2. Pull component markup from the gallery.
3. Compose the screen in the product stylesheet, not by forking token values.
4. Keep one primary action per view, using `--action`. Pressing Delete opens the gallery confirmation first. Destructive confirmation uses `--destructive` and only on the confirming control.
5. Urgency and status use the urgency and status tokens. Do not recolor them per screen.

## Empty, loading, and error

Use existing type sizes and `--black-50` for secondary copy. Do not add a new muted color.
