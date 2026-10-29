# Guard rails

Corrections that came back more than once. Follow them with the component spec. They do not restyle a component the gallery already defines.

## Scope

Change the control the user pointed at. A selected node, a screenshot crop, or "this" means that element. Leave the surrounding row, panel, and siblings as they are.

Forced by: a selected node, then "fix this," aimed at one control.

## Optical alignment

Equal padding is not alignment. If an icon, label, or divider still looks off, move it until it looks even. Check the rendered pixels, not only the computed box.

Alignment comes first. A pill, chip, or tag on a text row still puts its text on that line. The box can be taller. The glyphs line up with the text beside them. Align the content inside the chip to the title, not the outer chip. Padding and a hover fill can sit outside that line. A chip or chevron that only appears on hover does not move that content, and it is not the box you align.

An icon control beside a title is centered on the title. Do not top-align the control to the line box.

Forced by: "optically it doesnt look aligned" and "even though 2/8 is a pill, it should still be aligned. alignment is the most important thing."

## One icon construction

A new icon is an outlined Material Symbol fitted like Internal notes. That includes menu icons. Copy a symbol that already exists in the sprite. Icons in one menu share that construction. Do not trace one glyph from a screenshot and hand-draw the next with different caps, joins, or a different box.

Forced by: "why are the share and delete icons so different? they should follow the style guide."

## The more menu on right-click

A thing that has a more menu opens that same menu on right-click. The items, order, and actions match the more button. The menu opens at the pointer. Do not build a second menu. The open note is not that target. Right-clicking the note itself does not offer Share or Delete. The note card does.

Forced by: "right clicking the note card on the left should open the same options as the more button, share and delete."

## Two kinds of space

Item spacing and section spacing are separate. Changing one leaves the other alone.

A divider spans the full width of its section. It lines up with the divider on the rest of the page. Do not inset it to match a new section gap.

Forced by: "increase the spacing just between sections not between icons," and "the divider line should still match with the line across the page."

## Type size keeps the row

A smaller label keeps the row's previous outer size. Put the lost height back into padding.

A one-line title, search field, or tooltip stays one line. Do not let a transition shrink the box and wrap the text.

Forced by: "compensate for the smaller font size with padding so it still has the same overall," and "the text jumps to two lines momentarily."

## Sidebar collapse

Collapsed is a thin icon rail. Hide the labels. Keep the rail. The row stays wide enough for the 18px icon, so the glyph is not clipped.

Collapsed icons are centered in the rail. The panel still moves. The 18px glyph is not clipped.

Opening and closing do not flash a horizontal scrollbar.

The collapsed selection box is a 32px square on the icon. Hover uses that same square. The square does not slide or resize. The glyph stays put inside it. Keep that box when you adjust spacing.

A collapsed section label takes no space, including the gap under it. The icon above a divider and the icon below it sit the same distance from the line.

The reorder grip and the pin control belong to the expanded row. A row in Pinned uses the unpin glyph. Every other row uses the pin glyph. It is not the hidden eye. Collapse hides both. Hovering the rail does not bring them back. The hover around that icon is the icon chip: an 18px box, 2px padding, and a 6px radius.

Sidebar hover does not animate. The grey fill appears at once.

The account control is the settings gear. Do not put a three-dot menu there.

On resize, collapse the left nav before the Lance chat. The left nav collapses under 1259px. The chat collapses under 1036px. Those limits keep a 590px center. Do not stack the nav on top of the page. A click to expand either panel overrides its width limit and stays open.

Forced by: "it should still have a thin bar," "make them center," "the horizontal scroll bar flashes," and "this should be the settings icon."

## Inputs and menus

Hover on a text field, search field, or composer darkens the outer stroke by one step. It does not fill the field.

Search text stays `--black` while the field has a value. The clear control stays visible for that whole time.

The composer add control stays grey. Its hover is `--grey`, the same fill as a left nav row. It does not turn blue.

The microphone turns `--action` only while it is on. Otherwise its hover is `--grey`, the same fill as a left nav row. The mode control uses that same hover.

The send arrow stays grey when the field is empty, including on hover. It turns `--action` only when the field has text.

A closed menu shows the selected option's icon.

Hovering a table cell highlights the whole row.

A tooltip fits on one line. A tip on a tag is centered on that tag, stacked with it, and the shadow is on the tip.

Clicking a control that shows a tooltip hides the tip immediately. The control also leaves its hover fill. Both stay off while the pointer is still over it. Hover and the tip return only after the pointer leaves and comes back.

Forced by: the search and Lance state notes, "the entire row should highlight," "the tooltip should fit in one line" and sit centered on the tag, and "after clicking on a button with a tool tip, the tooltip should hide" and "the button should not be in its hover state after getting clicked."

## Dark mode

Dark mode recolors the tokens in `css/tokens.css`. It does not change type, size, spacing, or radius.

A surface that is darker than the page in light mode is lighter than the page in dark mode. The page is `--white`. The sidebar and the department bar are `--sidebar-grey`.

Hover lightens. A card or table row steps to `--grey`. It does not use a darker surface.

The primary button stays `--action`, with white text. Its hover is `--action-hover`, the darker blue, in both themes.

The secondary button is a `--white` surface with `--black` text and a `--stroke` hairline. Its hover is `--grey`. It is not a white fill with dark text.

The search stroke, including the shortcut key, uses `--line`.

`--black-25` is the quieter grey. In dark mode it sits halfway from `--black-50` toward `--sidebar-grey`. Unselected tab counts, focus rings, scrollbars, and tooltip emphasis use it. The scrollbar is the thin sidebar scrollbar: width `thin`, thumb `--black-25`, and the track matches the surface behind it. An unselected department name stays `--black-50`. Filter chips share the row with Filters, Print, and New. They are vertically centered with those buttons and start at the left edge. Extra chips wrap to that edge. When the row cannot hold the buttons and two chips, the chips move to the next line. A single chip does not sit beside the buttons.

Forced by: "in dark mode, the hover should lighten the selection" and "it's wrong in the table," "the primary button is wrong," "the secondary button is also wrong in dark mode," "the stroke around search bar is too harsh," "the name and the count should be different colors. use the new step made from the side bar color," and "the filter chips should go BELOW the buttons on the right, not above."
