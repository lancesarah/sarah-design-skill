# Quality checklist

Run this before finishing UI work.

- [ ] Colors, type sizes, spacing, and radii are tokens from `css/tokens.css`.
- [ ] No second red, and no new hex that duplicates an existing token.
- [ ] Padding matches the component in the gallery. A shared rule, such as a chip that contains an icon, must not override that component's padding.
- [ ] Switzer for UI. Libre Baskerville only where the gallery already uses it.
- [ ] Icons come from the sprite and inherit color through `currentColor`. Sidebar icons are Material Symbols fitted to the Internal notes icon: same line weight, rounded corners, and size, each glyph keeping its own shape. Stroke icons use width `1`.
- [ ] Hover and selected fills are darker than the surface they sit on. Same token as the background is a miss; step from `--white` to `--sidebar-grey` to `--grey` to `--black-12` to `--black-25`.
- [ ] Primary action uses `--action`. Destructive uses `--destructive` only on the confirm control.
- [ ] Text meets the contrast already accepted for `--destructive` (4.11:1 on white) and does not go lighter than existing secondary text (`--black-50`).
- [ ] The page header matches the standard header: title and count, search above the filter switcher, blue primary action on the right.
- [ ] Each filter dropdown is as wide as its longest option, so changing the selection does not shift nearby controls.
- [ ] The left nav and the right Lance chat stay a constant width, or are fully hidden. Neither width tracks the window.
- [ ] The changed page still works at the viewport the gallery and notes pages already support.
- [ ] New motion, wrapping, tabular numbers, hit areas, and icons follow `references/polish.md`. Existing gallery sizes, radii, and press colors are unchanged. Sidebar icons match the Internal notes icon and are not stretched. Stroke icons stay at width `1`.
