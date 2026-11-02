# Foundations

Values live in `css/tokens.css` on `:root`. Use the variable, not the raw value. Components use the roles. The raw hues stay in that file.

## Primitives

Neutrals, the blue, the red, the department hues, and the urgency hues hold the measured values. Spacing, type, radius, and the motion curves are primitives too.

| Primitive | Value |
| --- | --- |
| Neutrals | `--white`, `--sidebar-grey`, `--grey`, `--black-12`, `--black-25`, `--black-50`, `--black` |
| Blue | `--blue` `#3593dd`, `--blue-hover` `#1f6ca9` |
| Red | `--red` `#e34144` |
| Department hues | `--tag-text`, `--tag-bg`, and each `--dept-*` with its `--dept-*-bg` |
| Urgency hues | `--urgency-urgent`, `--urgency-high`, `--urgency-low`, and each `*-bg`. Standard reuses `--sidebar-grey` and `--black-50` |

## Roles

A component uses the role. It does not use `--blue` or `--red`.

| Role | Points at | Job |
| --- | --- | --- |
| `--action`, `--action-hover` | `--blue`, `--blue-hover` | Primary button, send, filter chip, switch track, in-progress |
| `--destructive` | `--red` | The confirming delete control. The only red |
| `--text-muted` | `--black-50` | Secondary text, placeholders, meta |
| `--bg-surface` | `--white` | The page. Dark mode follows `--white` |
| `--status-complete` | `--urgency-low` | Completed. Same hue as low urgency |
| `--filter-chip-bg` | 5% of `--blue` | Filter chip fill |
| `--switch-knob` | `#f5f5f5` | Switch thumb |

Department chips and urgency chips keep using the hue names. Those names are the raw values.

`--text-muted` and `--black-50` are the same value. The hover ladder still names `--black-50`, because that step is a neutral, not the muted-text job. Muted copy uses `--text-muted`.

Standard urgency reuses `--sidebar-grey` and `--black-50`. Urgent also covers unread counts. High also covers the open status.

## Aliases

These point at values already in use. A new page, a new row, a new menu, and a new panel use the alias.

| Alias | Points at | Where it already is |
| --- | --- | --- |
| `--padding-page` | `--space-16` | The page stage inset |
| `--gap-inline` | `--space-8` | Header actions, tool rows, chip rows |
| `--radius-card` | `--radius-control` | Menus, the confirm card, fields. Note list cards stay square |
| `--elevation-menu` | `--shadow-menu` | Menus and the toast |
| `--motion-hover` | `120ms` | The shared fill change |
| `--motion-panel` | `400ms` | The detail panel entrance |
| `--motion-panel-out` | `320ms` | The detail panel exit |

Press stays 160ms. It is not `--motion-hover`.

## Hover on a neutral surface

Hover and selected fills step one darker than the surface they sit on. Never use the same token as the background behind the control.

`--white` → `--sidebar-grey` → `--grey` → `--black-12` → `--black-25`

A tab on white hovers with `--sidebar-grey`. The same tab on a `--sidebar-grey` bar hovers with `--grey`. A selected note on the white page uses `--sidebar-grey`. The same note on a `--sidebar-grey` surface would use `--grey`. Hover and selected share that fill. A selected note stays `--sidebar-grey` while the pointer is on it. If that next step is still invisible against the surface, keep moving down the list. Do not invent a new grey.

A resting fill uses that same step. On white, the fill is `--sidebar-grey`. On `--sidebar-grey`, the fill is `--grey`. The comment field is the reference: it sits on the white page, so its fill is `--sidebar-grey`. An urgency chip does not take that step. Standard stays `--sidebar-grey` on a white note, on a selected note, and in the menu. Do not recolor it because the note is selected or the menu row is hovered.

`--destructive` is the one red for confirmation. Do not introduce a second red.

## Buttons

A button changes its fill by one step. The label, the icon, and the hairline stay. Press is the scale in [polish.md](polish.md). It does not darken the fill. A disabled control does not scale and does not take a hover fill.

| Button | Rest | Hover | What stays |
| --- | --- | --- | --- |
| Primary (`.btn`) | `--action`, white text | `--action-hover` in both themes | White text. No hairline. |
| Secondary (`.btn-secondary`) | `--white`, `--black` text, `--stroke` | One step from the surface it sits on | Text and hairline. On the page that step is `--sidebar-grey` in light mode and `--grey` in dark mode. On a `--sidebar-grey` panel it is `--grey`. On a dark `--grey` panel it is `--black-12`. |
| Danger fill (`.btn-danger`, `.btn-delete`) | `--destructive`, white text | `color-mix(in srgb, var(--destructive) 88%, black)` | White text. This is the only red. |
| Danger line (`.btn-delete-line`) | White fill, `--destructive` text, `--stroke` | The neutral step, `--sidebar-grey` or `--grey` | The red text. |
| Icon button that is not primary | Clear | The one step from its surface | The icon color. Sidebar icon buttons stay unfilled at rest. |
| Filter chip (`.chip-filter`) | `--filter-chip-bg`, `--action` text | The same fill | The chip does not wash on hover. |

A control inside a hovered row takes the next step, not the row’s step. A status pill on a hovered row is `--grey` in light mode and `--black-12` in dark mode. An off switch on a hovered secondary button steps to `--grey-up` only so the track does not match the button. `--grey-up` is not a text-chip hover.

## What changes, and what stays

Hover changes the control under the pointer. It does not restyle a fact, and it does not move the neighbors.

These change:

- A neutral fill takes one step. Selected uses that same fill, so the pointer does not add a second step.
- A primary fill goes to `--action-hover`. A filled danger button goes to the 88% mix. A field darkens its stroke by one step and does not fill.
- A menu chip shows its chevron and widens into the gap that is already there. The more button, the sidebar grip, and the pin show. “Add a note” appears on a hovered row. A tooltip appears.
- A dropdown trigger keeps that hover while its menu is open. The fill, the chevron, and the other hover changes stay. Moving into the menu does not return the trigger to rest. A fact that does not change on hover still does not change. A department fill stays. Standard still stays put on the open blue row.
- A press scales the whole control. The fill stays at the hover step.

These stay:

- An urgency chip keeps its color. Standard stays `--sidebar-grey` on a note, a selected note, and in a menu. On a hovered table row that fill matches the row, so Standard steps once: `--grey` in light mode, `--black-12` in dark mode. It stays put on the open blue row. A department or type chip keeps its department fill on hover and while the menu is open. A filter chip keeps `--filter-chip-bg`.
- Button text. An unselected nav label stays `--black-50` while the row fills. A selected segment does not pick up the unselected hover.
- The open to-do. Its line stays `--filter-chip-bg` with a 1px `--action` box. Blue wins over the grey row hover.
- A photo on row hover in light mode. In dark mode a named photo is `--grey`, then `--grey-up` when the row or the chip is hovered, so it stays lighter than the surface. An empty avatar stays clear, with the dashed `--black-50` stroke.
- The send arrow when the field is empty, including on hover. The add control stays grey. The microphone is `--action` only while it is on.
- The items beside a chip. The chip may widen. The next field does not move.

## Layering

A tooltip uses the popover top layer, so it paints above the page, the table, the sidebar, the filter row, and the detail panel. Do not invent a z-index to do that job. A click does not hide the tip.

Everything else uses this stack. A new overlay takes the row it belongs to. It does not get a fresh number.

| Layer | z-index | What |
| --- | --- | --- |
| Open row, scroll fade | 1–3 | The fade does not catch the pointer. The open row stays under menus. |
| Menu on its control | 2–6 | Filter menu, submenu, note menu, comment menu. A calendar sits in that menu. |
| Dev switch | 20 | Under panels and menus. |
| Drag ghost | 30 | The row being reordered. |
| Filter row | 50 | Its menu stays over the sheet. |
| Detail panel | 60 | Over the table. The table does not shrink. |
| Menu that must clear the panel | 80 | The row menu and the field menu. |
| Confirmation | dialog | Above the page, including a tooltip. |

## Dark mode

`html[data-theme="dark"]` in `css/tokens.css` recolors the same tokens. Type, sizes, spacing, and radii do not change.

The nav and the chat stay darker than the page. The page is the lighter surface.

| Role | Token | Dark |
|------|--------|------|
| Page | `--white` | `#212121` |
| Sidebar, chat, department bar, and other chrome | `--sidebar-grey` | `#1A1A1A` |
| Selected row and hover on that chrome | `--grey` | `#292929` |
| One step lighter than `--grey` | `--grey-up` | halfway from `--grey` to `--black-25` |
| Names | `--black` | `#EEEEEE` |
| Subtext | `--black-50`, and `--text-muted` follows it | `#B5B5B5` |
| Quiet grey | `--black-25` | halfway from `--black-50` toward `--sidebar-grey` |
| Quiet fill and hover outline | `--black-12` | `#3a3a3a` |
| Card and panel stroke | `--line`, `--stroke` | `#313131` |

`--line` is `--grey` in light mode, so light borders stay the same. In dark mode it is `#313131`: lighter than the page (`#212121`) and still lighter than a hovered row (`--grey`, `#292929`). A divider or chip stroke painted in `--grey` or the old `--black-12` matches that hover fill and disappears. `--black-12` is the next step, `#3a3a3a`, for hover outlines and the pressed chip stroke. Accent colors stay.

Hover lightens. A card or table row whose resting fill is the page steps from `--white` (`#212121`) to `--grey` (`#292929`). It does not fall back onto the darker chrome. A selected note uses that same lighter fill, so the selected card is `--grey` in dark mode.

`--sidebar-grey` is darker than the page in dark mode. It is chrome. A hover painted in it goes darker, so it is off the dark ladder. The dark steps are `--white` → `--grey` → `--black-12` → `--grey-up`.

A control on the page takes `--grey`. A control on a hovered row, which is already `--grey`, takes `--black-12`. `--grey-up` is the step after that. Use it for a photo or a switch track that would otherwise match the surface under it. A text chip does not use `--grey-up`. That fill is too light.

A hairline uses `--line`. A chip ring uses `--black-12` at rest. A pressed stroke chip on a dark hovered row uses `--black-25`, which stays lighter than the `--black-12` fill. A divider painted in the same token as the fill behind it disappears. Menu rules use `--line`.

The table frame is the 1px padding around the sheet. Light mode keeps `--grey`. Dark mode uses `--black-12`. Row and column rules inside the frame stay `--line`.

`--bg-surface` follows `--white`. `--text-muted` follows `--black-50`. The blue and the red stay. Button fills stay on the button table above. The secondary hover is `--grey`, lighter than the card. It is not a white button.

Search hover and focus are a 1px `--black-25` ring in light mode, including the shortcut key border. In dark mode that ring and that border are `--line`.

`--black-25` is the quieter grey. Light mode keeps `#bfbfbf`. In dark mode it is halfway from `--black-50` toward `--sidebar-grey`, and it is not a copy of `--black-50`. Use it for unselected tab counts, the light search ring, scrollbars, and tooltip emphasis.

The scrollbar is the thin sidebar scrollbar. `scrollbar-width` is `thin`, and the thumb is `--black-25`. The track matches the surface behind it. The department tabs do not use that system bar. Their thumb is the one in [patterns.md](patterns.md).

Sidebar icon buttons stay unfilled. The switch under Settings uses `--action` and `--switch-knob` in both themes. Its thumb travel is `--switch-dur`, `--switch-ease`, and `--switch-travel`. The track uses `--switch-track-dur`.

## Type

- `--font`: Plus Jakarta Sans, weights 400 and 500. Plus Jakarta Sans is the UI face. Switzer stays on the dev switch so the two can be compared. Libre Baskerville is for editorial moments only, where the gallery already uses it.
- Sizes: `--text-10`, `--text-12`, `--text-13`, `--text-14`, `--text-16`. `--text-13` is the urgency chip, the department chip, the status label, and the name chip. The gallery Typography section is the set used on notes and to-dos: record title 16/500, page title, body, and button 14/400, count 14/400 in `--text-muted`, place 14/500, chip 13/500, label 12/500 in `--text-muted`, note 12/400, meta 12/400 in `--text-muted`, filter 10/500.
- `--font-smoothing`: `antialiased` on product pages.
- `--text-wrap-title`: `balance` for headings. `--text-wrap-copy`: `pretty` for short copy.
- `--numeric`: `tabular-nums` for counts and other figures that update.

## Space

`--space-2` through `--space-25`: 2, 4, 8, 10, 12, 14, 16, 20, 25.

## Radius

| Token | Use |
|-------|-----|
| `--radius-tag` | Tags |
| `--radius-well` | Wells |
| `--radius-control` | Buttons, inputs, chips |
| `--radius-circle` | Avatars, switches, pills |
| `--radius-shell` | A rounded shell whose padding is `--space-16` around a `--radius-control` inner surface |

## Elevation and stroke

- `--elevation-menu`: menus and popovers. It is the `--shadow-menu` value.
- `--stroke`: 1px `--grey` ring.
- `--outline-image`: 1px pure black at 10% opacity, inset on photographs. In dark mode it is pure white at 10% opacity, not the hairline and not a tinted grey.
- `--icon-stroke`: `calc(1 / 0.95)`. Icons with class `i` are scaled to 0.95, and this keeps the painted stroke at `1`. New icons use the outlined Material glyph, fitted to Internal notes, including menu icons. See [polish.md](polish.md).
- `--hit` / `--hit-touch`: 40px and 44px hit areas. The visible control stays its gallery size.
