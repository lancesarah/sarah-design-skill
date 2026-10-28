# Quality checklist

Run this before finishing UI work.

- [ ] Colors, type sizes, spacing, and radii are tokens from `css/tokens.css`.
- [ ] No second red, and no new hex that duplicates an existing token.
- [ ] Padding matches the component in the gallery. A shared rule, such as a chip that contains an icon, must not override that component's padding.
- [ ] Switzer for UI. Libre Baskerville only where the gallery already uses it.
- [ ] Icons come from the sprite and inherit color through `currentColor`. Sidebar icons are Material Symbols fitted to the Internal notes icon: same line weight, rounded corners, and size, each glyph keeping its own shape. Stroke icons use width `1`.
- [ ] Hover and selected fills are darker than the surface they sit on. Same token as the background is a miss; step from `--white` to `--sidebar-grey` to `--grey` to `--black-12` to `--black-25`. In dark mode those steps lighten: a card or table row goes to `--grey`, not back to the page.
- [ ] In dark mode the primary button stays `--action` with white text, and its hover lightens that blue. The secondary button is a `--white` surface with `--black` text and a `--stroke` hairline, and its hover is `--grey`. Search strokes use `--line`. `--black-25` is halfway from `--black-50` toward `--sidebar-grey`, and it is the quieter grey for tab counts, focus rings, scrollbars, and tooltip emphasis.
- [ ] Primary action uses `--action`. Destructive uses `--destructive` only on the confirm control.
- [ ] Text meets the contrast already accepted for `--destructive` (4.11:1 on white) and does not go lighter than existing secondary text (`--black-50`).
- [ ] The page header matches the standard header: title and count, search above the filter switcher. Filters, Print, and the primary action sit in the right corner below the tabs and above the filter chips. An unselected department count uses `--black-25`.
- [ ] Each filter dropdown is as wide as its longest option, so changing the selection does not shift nearby controls.
- [ ] The left nav and the right Lance chat stay a constant width, or are fully hidden. Neither width tracks the window.
- [ ] The changed page still works at the viewport the gallery and notes pages already support.
- [ ] New motion, wrapping, tabular numbers, hit areas, and icons follow `references/polish.md`. Existing gallery sizes, radii, and press colors are unchanged. Sidebar icons match the Internal notes icon and are not stretched. Stroke icons stay at width `1`.
- [ ] The edit stayed on the control the user pointed at. Neighbors are unchanged.
- [ ] Alignment still looks even on screen. Item spacing and section spacing were not swapped. Dividers still run the full width and line up across the page.
- [ ] A smaller label kept its old outer size. One-line titles, search, and tooltips stay one line through any motion.
- [ ] Clicking a tooltip control hides the tip and clears the hover fill until the pointer leaves.
- [ ] Sidebar collapse stays a thin icon rail. Icons stay left through the animation. No horizontal scrollbar flashes. The account control is the settings gear.
- [ ] Search text stays `--black` while it has a value, and the clear control stays. Add stays grey. The mic is `--action` only while on. Send is `--action` when the field has text. A closed menu shows the selected icon. A table hover paints the whole row.
