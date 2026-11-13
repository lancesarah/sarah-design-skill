# Quality checklist

Run the rows this change could break. A row that does not match sends you back to that file. The measurements live there.

## Any change

- [ ] No existing component was restyled. Search, the filter row, and every other named control keep the size, fill, and states in their own section. A screenshot is not a reason to redraw one. See [guard-rails.md](guard-rails.md).
- [ ] Colors, type sizes, spacing, radii, shadows, and durations are tokens from `catalog/tokens.css`. A component uses a role or an alias. No second red, and no new hex. See [foundations.md](foundations.md).
- [ ] Every new section has the empty state this product already uses for that kind of thing, or a note that the empty state is undecided. See [patterns.md](patterns.md).
- [ ] Status copy matches the record. Open, In progress, and Completed say what the record is now.
- [ ] Hover and selected share one step from the surface they sit on. A selected control does not take a second step under the pointer. Dark mode lightens that step. See [foundations.md](foundations.md).
- [ ] A button changes its fill only. See Primary button, Secondary button, Tertiary button, Danger button, and Filter chip in [components.md](components.md).
- [ ] The primary button has its depth: sheen, edge, rim, and drop. A secondary button has its stroke and drop.
- [ ] A notes field inside a form is the text well, and every one of those boxes is the same height. A pill editor's own description is not. See Pill editor in [components.md](components.md). A one-line input box is the field or the line field. See [components.md](components.md).
- [ ] A tooltip is the top layer. It paints above the page, the table, and the sidebar. A click does not hide it. A menu, the filter row, and the detail panel use the stack in [foundations.md](foundations.md). A new overlay does not invent a z-index.
- [ ] The edit stayed on the control the user pointed at. Neighbors are unchanged. See [guard-rails.md](guard-rails.md).
- [ ] Related things are grouped, and the gap inside a group is smaller than the gap between groups. A title and the content it names keep at least 40px. A label the content does not need is absent. See Spacing a screen in [patterns.md](patterns.md). The lesson card’s measurements apply only to a lesson card.
- [ ] Item spacing and section spacing were not swapped. A hairline stays 1px, and the edges of that box match. See [guard-rails.md](guard-rails.md).
- [ ] The page still works at the viewport the gallery and notes pages already support.

## Alignment

Check this on every change, on the rendered screen. Equal padding is not alignment. See [guard-rails.md](guard-rails.md).

- [ ] Text that shares a line shares that line. A chip, pill, or tag can be taller than the text. The glyphs inside it sit on the line, not on the outer box.
- [ ] An icon beside a title is centered on that title.
- [ ] A header label sits over its column. The header and every row share one set of columns. A label that lands on the next column is a miss.
- [ ] What lines up across the page still lines up: rows, dividers, and the edge of a group. A new arrangement does not leave one piece high, low, or shifted.

## If you drew a person, an urgency, a type, or a table

- [ ] A person, an urgency, and a type follow Person, Urgency, and Department tag in [components.md](components.md).
- [ ] Picking a person follows Person in [components.md](components.md).
- [ ] A table’s Assigned column follows Table in [components.md](components.md).
- [ ] A chip that opens a menu follows Department tag in [components.md](components.md).
- [ ] A dropdown follows Menu in [components.md](components.md).
- [ ] A new table follows Table in [components.md](components.md).
- [ ] Every hover chevron fits inside its own column. Showing it doesn't move or crowd the next column.
- [ ] A filter follows the filter row in [patterns.md](patterns.md).

## If you added motion, an icon, or a container

- [ ] A press scales the whole control. A frequent control, especially a table row, does not fade its hover. A keyboard action snaps. Something removed closes the gap. Completing an item holds, then leaves. See [polish.md](polish.md) and [patterns.md](patterns.md).
- [ ] A new icon matches the Internal notes construction. Icons in one menu share it. See [polish.md](polish.md).
- [ ] The page is the surface. A list or a toolbar is not wrapped in an extra card. A card is for several similar items. One action or one thing on a screen sits on the page. A long record does not put every section in a matching fill. See [polish.md](polish.md) and [guard-rails.md](guard-rails.md).

## If you touched chrome or a record

- [ ] The sidebar, the header, and a side panel follow Sidebar, Header, and Detail panel in [components.md](components.md). A horizontal line follows [guard-rails.md](guard-rails.md).
- [ ] A subpage follows the subpage block in [patterns.md](patterns.md).
- [ ] A measured count follows Progress bar in [components.md](components.md). A lesson follows Lesson card.
- [ ] Delete follows Delete confirmation in [components.md](components.md). A new record is created on the page, not in a prompt.
- [ ] A dropdown trigger keeps its hover fill while the menu is open. See [foundations.md](foundations.md).
- [ ] Activity reads heading, thread, composer. The composer is last.
- [ ] Pill editor pills sit on one line and wrap only for width.
- [ ] The pill editor title is 24/500 and its description is 14px muted with no label or well.
