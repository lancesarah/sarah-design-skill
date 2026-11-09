# Guard rails

Corrections that came back more than once. Follow them with the component spec. They do not restyle a component the gallery already defines.

## Do not restyle

Do not restyle anything the gallery already draws. Use the component's class, size, fill, padding, radius, icon, and states. A new screen may place that component. It may not change how the component is drawn.

If a corresponding component already exists, copy it. Search is Search. The filter row is the filter row. A button is that button. Do not draw a second version beside the one the product already uses, and do not override it in a page stylesheet. A screenshot, a narrow column, or a closer match to a picture is not a reason.

A change to the component itself is written in that component's section and applied everywhere. It is not a one-off restyle for one screen.

Forced by: "Why did you restyle them? Make a rule in the design system that you are not allowed to restyle ANYTHING. ESPECIALLY IF there's already a corresponding component already in the design system."

## A lesson card

See Lesson card in [components.md](components.md).

## Picking a person

See Person in [components.md](components.md).

## Assigned column

See Table in [components.md](components.md).

## Picking a room

See Room in [components.md](components.md).

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

See Urgency in [components.md](components.md).

## One icon construction

A new icon follows the Internal notes construction in [polish.md](polish.md). That includes menu icons. Copy a symbol that already exists in the sprite. Icons in one menu share that construction. Do not trace one glyph from a screenshot and hand-draw the next with different caps, joins, or a different box.

Forced by: "why are the share and delete icons so different? they should follow the style guide."

## The more menu on right-click

See Menu in [components.md](components.md).

## Two kinds of space

Item spacing and section spacing are separate. Changing one leaves the other alone.

Proximity groups things that belong together. A title and its subtitle are one group. A label and the field, card, or component it names are one group, and that gap is `--space-4`. A section title and the content under it are one block. The gap inside a group stays smaller than the gap between groups. Expanding the space between sections leaves the gap inside a block alone. On the lesson card those gaps are `--space-4` and `--space-25`. Another screen keeps the gap its own component already uses. A title and the content it names stay at least 40px apart. Do not close that gap under 40px.

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

See Sidebar in [components.md](components.md). Window resize stays in [patterns.md](patterns.md).

## Header buttons

See Header in [components.md](components.md).

## Dropdown width

See Menu in [components.md](components.md).

## Inputs and menus

See Field, Text well, Search, Lance composer, Message composer, Menu, Table, and Tooltip in [components.md](components.md).

## Horizontal lines

A horizontal line is 1px `--line`. It follows the title, and it follows the summary or description. Those two carry the record, so each one ends with a line before anything else.

A line also sits where the layout changes. A property list is a different layout from the prose above it. A conversation is a different layout from a paragraph. The same layout does not get a line between its sections.

The line spans the panel. It does not shrink away when the panel scrolls.

Forced by: the call detail, “every time the layout shifts it should have one, and after the title and the summary/description, the most important two elements.”

## A title above a table

See Table in [components.md](components.md).

## A dense record is sectioned

A panel with several blocks of one record uses type first. The title stays on the panel. A section label stays 12px and `--black-50`. Prose and a property list stay on the panel. The label is the section.

A fill is for the one block that is a different kind of thing, such as a conversation. One step from the panel: `--sidebar-grey` in light mode, `--grey` in dark mode. Padding is `--space-16`. Radius is `--radius-control`. No border on the fill. A control inside that fill takes the next step, so it does not disappear. In light mode that step is `--white`. In dark mode it is `--black-12`.

Do not put every section in the same fill. A stack of matching grey cards — the recording, the summary, the key moment, the transcript, and the properties — is one run of boxes. That is not hierarchy.

A short record, a list, and a toolbar stay on the page.

Forced by: the call detail. First, “use color and sectioning so with a lot of info it’s not all just text.” Then, “be more tasteful with the cards, not put EVERYTHING in boxes.”

## One thing is the page

A card is for several similar items on one screen. Each card is one of that set, and the shell is what separates one item from the next. Locations, notes, and any other repeated kind of thing are that case.

A screen with one action or one thing does not need a card. The content sits on the page. Keep the pieces the screen still needs. Leave the outer card behind. It has nothing else to separate.

Forced by: a single screen was built inside the card used for a set of similar items. Then, “there will only be one thing on the page so there is no need for the outer cards,” and that rule is any one action or thing, not one kind of record.

## Dark mode

Dark mode recolors the tokens in [foundations.md](foundations.md). It does not change type, size, spacing, or radius. Hover lightens, and a selected control does not take a second step. The dark ladder, the table frame, the photo, and the switch track are in that file.

Filter chips on notes sit under Filters, Print, and New, as the filter row block describes. They do not sit above those buttons.

Forced by: "in dark mode, the hover should lighten the selection" and "it's wrong in the table," "the primary button is wrong," "the secondary button is also wrong in dark mode," "the stroke around search bar is too harsh," "the name and the count should be different colors. use the new step made from the side bar color," "the filter chips should go BELOW the buttons on the right, not above," "strokes are disappearing into the background on hover," "the stroke around the table is too light," "profile pictures should be lighter than the background," "the unassigned avatar blends in," "on hover, the background of this toggle is disappearing," "the hover in the detail view is going darker," "they are hovering with different padding and different colors," and "the hover is too light."
