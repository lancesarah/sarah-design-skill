# Guard rails

Corrections that came back more than once. Follow them with the component spec. They do not restyle a component the gallery already defines.

## A lesson card

A lesson card title is `--text-24`. It is larger than a row title or a side title, which stay `--text-20`.

Progress is a bar on the bottom edge of the image, the full width of the card. The step count shares the title’s line and is centered on the title, on the right. Do not add a brand or product name beside it. The card title already names the lesson. The space above the title is greater than the card’s other padding. Do not pull the title up toward the image.

The title group, the requirement, and the columns sit `--space-25` apart. The title and its subtitle stay `--space-4`.

Continue is the only action. It spans the content width and sits at the bottom, inside the card padding. It keeps the button radius. It does not meet the card edge. A full-width action at the bottom of a popup is 40px tall. Every other button stays 28px. A close control in the corner is the dismiss. A second dismiss, such as Not now, does not sit beside Continue.

Forced by: make the title bigger; turn the step count into a progress bar on the image edge and move “1 of 3” to the right, aligned with the section name; make Continue span the width, because Not now and the corner close are the same dismiss. Then, Continue still has margin. It sits in the bottom the way an inset button does, not along the card edge.

## Picking a person

Picking a person is a dropdown of people who already exist. Adding a person is Settings, opened from the account gear. The name is typed there. A schedule, a to-do, and every other assignment use that menu.

Forced by: “Picking a person should ALWAYS be a drop down. Adding a person is through settings, not from this.”

## Picking a room

Picking a room is a dropdown of rooms that already exist. The number is not typed on the row, in the side panel, or anywhere else a room is chosen. An empty room is the quiet dash.

Forced by: “room will always be a drop down.”

## Scope

Change the control the user pointed at. A selected node, a screenshot crop, or "this" means that element. Leave the surrounding row, panel, and siblings as they are.

Forced by: a selected node, then "fix this," aimed at one control.

## Optical alignment

Equal padding is not alignment. If an icon, label, or divider still looks off, move it until it looks even. Check the rendered pixels, not only the computed box.

Alignment comes first. A pill, chip, or tag on a text row still puts its text on that line. The box can be taller. The glyphs line up with the text beside them. Align the content inside the chip to the title, not the outer chip. Padding and a hover fill can sit outside that line. A chip or chevron that only appears on hover does not move that content, and it is not the box you align.

A chip that opens a menu follows the department tag in [patterns.md](patterns.md). A control someone crosses tens of times a day follows [polish.md](polish.md).

An icon control beside a title is centered on the title. Do not top-align the control to the line box.

Forced by: "optically it doesnt look aligned" and "even though 2/8 is a pill, it should still be aligned. alignment is the most important thing."

## Chip and its label

The label sits in the chip. The word, the icon, and the chevron share the chip’s center. This is the correct formatting for a table chip and for the same chip in the side panel.

A table urgency does not keep the old sheet offset, `top: 2px` on `.sheet-line .urgency`. That offset was for the bare word. Inside the chip it drops the word onto the bottom edge, so the chip box and the label no longer match. The chip’s own `top` stays `0`, and the label’s `align-self` stays `center`.

Forced by: the High chip, “the chip is misaligned with the text.”

## One icon construction

A new icon follows the Internal notes construction in [polish.md](polish.md). That includes menu icons. Copy a symbol that already exists in the sprite. Icons in one menu share that construction. Do not trace one glyph from a screenshot and hand-draw the next with different caps, joins, or a different box.

Forced by: "why are the share and delete icons so different? they should follow the style guide."

## The more menu on right-click

A thing that has a more menu opens that same menu on right-click. The items, order, and actions match the more button. The menu opens at the pointer. Do not build a second menu. The open note is not that target. Right-clicking the note itself does not offer Share or Delete. The note card does.

Forced by: "right clicking the note card on the left should open the same options as the more button, share and delete."

## Two kinds of space

Item spacing and section spacing are separate. Changing one leaves the other alone.

Proximity groups things that belong together. A title and its subtitle are one group. A section title and the content under it are one block. The gap inside a group stays smaller than the gap between groups. Expanding the space between sections leaves the gap inside a block alone. On the lesson card those gaps are `--space-4` and `--space-25`. Another screen keeps the gap its own component already uses.

A divider spans the full width of its section. It lines up with the divider on the rest of the page. Do not inset it to match a new section gap.

Forced by: "increase the spacing just between sections not between icons," and "the divider line should still match with the line across the page," and "proximity groups things together and you should group like title and subtitle together," and "since the title and the content is one block, their internal spacing shouldn't change, only the spacing between sections."

## One hairline

A hairline is 1px. The edges of one box share that weight. A top rule that looks heavier than the bottom, or heavier than the sides, is two strokes stacked.

A frame drawn with padding and a background is a stroke. A border is a stroke. `--stroke` is a stroke. Two of those on the same edge add up. `--line` is `--grey`, so a grey frame and a `--line` border are the same color and read as one thicker line.

The sheet title bar is the case. The sheet frame is 1px of `--grey` from padding. That frame is the top edge. The title bar does not add a top border. A 1px `--line` border on that same edge paints the top at 2px while the bottom stays 1px.

Forced by: the sheet title bar, "why does the top stroke look thicker than the others?"

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

The reorder grip and the pin are part of the sidebar component in [components.md](components.md). Collapse hides both. Hovering the rail does not bring them back.

Sidebar hover does not animate. The grey fill appears at once.

The account control is the settings gear. Do not put a three-dot menu there.

On resize, follow Window resize in [patterns.md](patterns.md). Do not stack the nav on the page. A click to expand either panel overrides its width limit and stays open.

Forced by: "it should still have a thin bar," "make them center," "the horizontal scroll bar flashes," and "this should be the settings icon."

## Dropdown width

A menu of labels hugs its longest label, then leaves 16px to the edge. Less than that feels cramped. A fixed width leaves dead space after a short label. Short labels use `--menu-min` (132px). Past `--menu-max` (240px) the label truncates, and the icon stays. The check sits at the end of the row. It does not add a second gap. Every option label in the menu is `--text-14`, the same size as the category row. The check and the chevron share the trigger's inset, 6px from the row edge, and the chevron is `--black-50`. Delete is last, in red, with a full-width hairline above it. The calendar keeps its own width.

Forced by: hug the longest label, then 16px to the edge. A minimum for short labels. A maximum, then truncate.

## Inputs and menus

Hover on a text field, search field, or composer darkens the outer stroke by one step. It does not fill the field.

Search text stays `--black` while the field has a value. The clear control stays visible for that whole time.

The composer add control stays grey. Its hover is `--grey`, the same fill as a left nav row. It does not turn blue.

The microphone turns `--action` only while it is on. Otherwise its hover is `--grey`, the same fill as a left nav row. The mode control uses that same hover.

The send arrow stays grey when the field is empty, including on hover. It turns `--action` only when the field has text.

A closed menu shows the selected option's icon.

Hovering a table cell highlights the whole row.

A tooltip fits on one line. A tip on a tag is centered on that tag, stacked with it, and the shadow is on the tip.

A tooltip is always in front. It paints above the page, the table, and the sidebar. A table, a header, or a sidebar does not cover a tip. A click does not hide a tooltip. The tip stays while the pointer is on the control. Timing, the snap between tips, and a keyboard action follow [polish.md](polish.md).

Forced by: the search and Lance state notes, "the entire row should highlight," "the tooltip should fit in one line" and sit centered on the tag, "tooltips are always in front," and "a click should not hide the tip."

## Horizontal lines

A horizontal line is 1px `--line`. It follows the title, and it follows the summary or description. Those two carry the record, so each one ends with a line before anything else.

A line also sits where the layout changes. A property list is a different layout from the prose above it. A conversation is a different layout from a paragraph. The same layout does not get a line between its sections.

The line spans the panel. It does not shrink away when the panel scrolls.

Forced by: the call detail, “every time the layout shifts it should have one, and after the title and the summary/description, the most important two elements.”

## A dense record is sectioned

A panel with several blocks of one record uses type first. The title stays on the panel. A section label stays 12px and `--black-50`. Prose and a property list stay on the panel. The label is the section.

A fill is for the one block that is a different kind of thing, such as a conversation. One step from the panel: `--sidebar-grey` in light mode, `--grey` in dark mode. Padding is `--space-16`. Radius is `--radius-control`. No border on the fill. A control inside that fill takes the next step, so it does not disappear. In light mode that step is `--white`. In dark mode it is `--black-12`.

Do not put every section in the same fill. A stack of matching grey cards — the recording, the summary, the key moment, the transcript, and the properties — is one run of boxes. That is not hierarchy.

A short record, a list, and a toolbar stay on the page.

Forced by: the call detail. First, “use color and sectioning so with a lot of info it’s not all just text.” Then, “be more tasteful with the cards, not put EVERYTHING in boxes.”

## Dark mode

Dark mode recolors the tokens in [foundations.md](foundations.md). It does not change type, size, spacing, or radius. Hover lightens, and a selected control does not take a second step. The dark ladder, the table frame, the photo, and the switch track are in that file.

Filter chips on notes sit under Filters, Print, and New, as the filter row block describes. They do not sit above those buttons.

Forced by: "in dark mode, the hover should lighten the selection" and "it's wrong in the table," "the primary button is wrong," "the secondary button is also wrong in dark mode," "the stroke around search bar is too harsh," "the name and the count should be different colors. use the new step made from the side bar color," "the filter chips should go BELOW the buttons on the right, not above," "strokes are disappearing into the background on hover," "the stroke around the table is too light," "profile pictures should be lighter than the background," "the unassigned avatar blends in," "on hover, the background of this toggle is disappearing," "the hover in the detail view is going darker," "they are hovering with different padding and different colors," and "the hover is too light."
