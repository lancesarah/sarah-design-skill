# Quality checklist

Run the rows this change could break. A row that does not match sends you back to that file. The measurements live there.

## Any change

- [ ] Colors, type sizes, spacing, radii, shadows, and durations are tokens from `catalog/tokens.css`. A component uses a role or an alias. No second red, and no new hex. See [foundations.md](foundations.md).
- [ ] Every new section has the empty state this product already uses for that kind of thing, or a note that the empty state is undecided. See [patterns.md](patterns.md).
- [ ] Status copy matches the record. Open, In progress, and Completed say what the record is now.
- [ ] Hover and selected share one step from the surface they sit on. A selected control does not take a second step under the pointer. Dark mode lightens that step. See [foundations.md](foundations.md).
- [ ] A button changes its fill only. Primary goes to `--action-hover`. Secondary takes one step. Danger uses the 88% mix. A filter chip, an urgency, and a department fill stay. See [foundations.md](foundations.md).
- [ ] A tooltip is the top layer. It paints above the page, the table, and the sidebar. A click does not hide it. A menu, the filter row, and the detail panel use the stack in [foundations.md](foundations.md). A new overlay does not invent a z-index.
- [ ] The edit stayed on the control the user pointed at. Neighbors are unchanged. See [guard-rails.md](guard-rails.md).
- [ ] Related things are grouped, and the gap inside a group is smaller than the gap between groups. A label the content does not need is absent. See Spacing a screen in [patterns.md](patterns.md). The lesson card’s measurements apply only to a lesson card.
- [ ] Item spacing and section spacing were not swapped. A hairline stays 1px, and the edges of that box match. See [guard-rails.md](guard-rails.md).
- [ ] The page still works at the viewport the gallery and notes pages already support.

## Alignment

Check this on every change, on the rendered screen. Equal padding is not alignment. See [guard-rails.md](guard-rails.md).

- [ ] Text that shares a line shares that line. A chip, pill, or tag can be taller than the text. The glyphs inside it sit on the line, not on the outer box.
- [ ] An icon beside a title is centered on that title.
- [ ] A header label sits over its column. The header and every row share one set of columns. A label that lands on the next column is a miss.
- [ ] What lines up across the page still lines up: rows, dividers, and the edge of a group. A new arrangement does not leave one piece high, low, or shifted.

## If you drew a person, an urgency, a type, or a table

- [ ] A person, an urgency, and a type are the gallery treatment, including in a menu, a filter, and a table cell. See [patterns.md](patterns.md).
- [ ] Picking a person is a dropdown of people who already exist. A new person is added in Settings. See [patterns.md](patterns.md).
- [ ] A chip that opens a menu hugs its label and shows the chevron on hover without moving the items beside it. See [patterns.md](patterns.md).
- [ ] A dropdown hugs its longest label, then leaves 16px to the edge. Short labels use `--menu-min`. Past `--menu-max` the label truncates. Every option label is `--text-14`, the same size as the category row. The check and the chevron sit 6px from the row edge. Delete is last, in red, with a full-width line above it. See [components.md](components.md).
- [ ] A new table is the gallery table, filter row included. A column of fixed options is already as wide as its longest option. The control still hugs the value it is showing. One column names the record and takes the leftover width. When the page has no title column, that column is chosen from the job of the page. See [components.md](components.md).

## If you added motion, an icon, or a container

- [ ] A press scales the whole control. A frequent control, especially a table row, does not fade its hover. A keyboard action snaps. Something removed closes the gap. Completing an item holds, then leaves. See [polish.md](polish.md) and [patterns.md](patterns.md).
- [ ] A new icon matches the Internal notes construction. Icons in one menu share it. See [polish.md](polish.md).
- [ ] The page is the surface. A list or a toolbar is not wrapped in an extra card. A card is for several similar items. One action or one thing on a screen sits on the page. A long record does not put every section in a matching fill. See [polish.md](polish.md) and [guard-rails.md](guard-rails.md).

## If you touched chrome or a record

- [ ] The sidebar, the header, and a side panel match the shared component. A horizontal line follows the title and the summary, and it marks a layout change. See [components.md](components.md), [patterns.md](patterns.md), and [guard-rails.md](guard-rails.md).
- [ ] Delete opens the gallery confirmation before anything is removed. A new record is created on the page, not in a prompt. See [components.md](components.md) and [patterns.md](patterns.md).
- [ ] A dropdown trigger keeps its hover fill while the menu is open. See [foundations.md](foundations.md).
