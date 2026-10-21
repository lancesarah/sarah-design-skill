# Patterns

## Gallery page

`index.html` is a specimen page, not product UI. New shared components get a labeled section and a link in the page index.

## Notes

`notes.html` is the product surface. It consumes tokens and gallery components. Screen-only layout, density, and note-list behavior stay in `css/notes.css` and `js/notes.js`.

## Window resize

The left nav and the right Lance chat are fixed-width panels.

- Keep each panel at its designed width. Do not set them to a percentage, `flex-grow`, or `min()` that tracks the viewport.
- When the window is too narrow for a panel, hide that panel entirely. Do not squeeze it.
- The center content is the only region that changes width.

## Standard header

Every product page uses this header in the center column. `notes.html` is the reference.

1. Title row, 60px tall. A 30px page icon, the title at 14px regular, and the count in 50% black. Search is the grey search field, 281px, on the right. A 1px `--grey` line closes the row.
2. Department bar. A full-width `--sidebar-grey` strip directly under that line. The selected tab uses `--grey`. Its count is `--black-50`. Unselected counts are `--black-25`.
3. Filter row. Active filter chips on the left, with the field name in medium weight. On the right: the Filters control at its component width, Print, then the blue New button.

Do not put search, the switcher, and New on a single crowded row. Do not move the primary action off the right side of this header.

## Filter dropdowns

The closed control and the open menu share one width: the longest option, including its icon and padding. Size the label with every option stacked in the same grid cell, and let the menu fill that width. Do not give the menu a fixed width that is independent of the options, and do not let the closed label shrink to the selected value.

## Building a screen

1. Read `foundations.md` for the tokens you will touch.
2. Pull component markup from the gallery.
3. Compose the screen in the product stylesheet, not by forking token values.
4. Keep one primary action per view, using `--action`. Destructive confirmation uses `--destructive` and only on the confirming control.
5. Urgency and status use the urgency and status tokens. Do not recolor them per screen.

## Empty, loading, and error

Use existing type sizes and `--black-50` for secondary copy. Do not add a new muted color.
