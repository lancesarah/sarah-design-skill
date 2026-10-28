# Guard rails

Corrections that came back more than once. Follow them with the component spec. They do not restyle a component the gallery already defines.

## Scope

Change the control the user pointed at. A selected node, a screenshot crop, or "this" means that element. Leave the surrounding row, panel, and siblings as they are.

Forced by: a selected node, then "fix this," aimed at one control.

## Optical alignment

Equal padding is not alignment. If an icon, label, or divider still looks off, move it until it looks even. Check the rendered pixels, not only the computed box.

Forced by: "optically it doesnt look aligned."

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

Icons stay on the left for the whole animation. The panel moves. The glyphs do not jump to the center.

Opening and closing do not flash a horizontal scrollbar.

The collapsed selection box is a 32px square on the icon. Hover uses that same square. The square does not slide or resize. The glyph stays put inside it. Keep that box when you adjust spacing.

The account control is the settings gear. Do not put a three-dot menu there.

Forced by: "it should still have a thin bar," "icons start on the left and then the side bar moves right," "the horizontal scroll bar flashes," and "this should be the settings icon."

## Inputs and menus

Hover on a text field, search field, or composer darkens the outer stroke by one step. It does not fill the field.

Search text stays `--black` while the field has a value. The clear control stays visible for that whole time.

The composer add control stays grey. Its hover is a darker grey. It does not turn blue.

The microphone turns `--action` only while it is on. Hover darkens the grey.

The send control turns `--action` when the field has text, not only on hover.

A closed menu shows the selected option's icon.

Hovering a table cell highlights the whole row.

A tooltip fits on one line. A tip on a tag is centered on that tag, stacked with it, and the shadow is on the tip.

Clicking a control that shows a tooltip hides the tip immediately. The control also leaves its hover fill. Both stay off while the pointer is still over it. Hover and the tip return only after the pointer leaves and comes back.

Forced by: the search and Lance state notes, "the entire row should highlight," "the tooltip should fit in one line" and sit centered on the tag, and "after clicking on a button with a tool tip, the tooltip should hide" and "the button should not be in its hover state after getting clicked."

## Dark mode

Dark mode recolors the tokens in `css/tokens.css`. It does not change type, size, spacing, or radius.

Hover lightens. A card or table row steps to `--grey`. It does not use the page color.

The primary button stays `--action`, with white text. Its hover lightens that blue.

The secondary button is a `--white` surface with `--black` text and a `--stroke` hairline. Its hover is `--grey`. It is not a white fill with dark text.

The search stroke, including the shortcut key, uses `--line`.

`--black-25` is the quieter grey. In dark mode it sits halfway from `--black-50` toward `--sidebar-grey`. Unselected tab counts, focus rings, scrollbars, and tooltip emphasis use it. An unselected department name stays `--black-50`. Filter chips sit below the Filters, Print, and New row in both themes.

Forced by: "in dark mode, the hover should lighten the selection" and "it's wrong in the table," "the primary button is wrong," "the secondary button is also wrong in dark mode," "the stroke around search bar is too harsh," "the name and the count should be different colors. use the new step made from the side bar color," and "the filter chips should go BELOW the buttons on the right, not above."
