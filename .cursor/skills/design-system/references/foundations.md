# Foundations

Values live in `css/tokens.css` on `:root`. Use the variable, not the raw value.

## Color

| Role | Token |
|------|--------|
| Page and text | `--black`, `--white` |
| Chrome | `--sidebar-grey`, `--grey`, `--black-50`, `--black-25`, `--black-12` |
| Action (primary button, send, filter chip, switch track, in-progress) | `--action`, `--action-hover` |
| Destructive | `--destructive` |
| Department tag | `--tag-text`, `--tag-bg` |
| Urgency | `--urgency-urgent`, `--urgency-high`, `--urgency-low` and each `*-bg` |
| Complete | `--status-complete` |
| Filter chip fill | `--filter-chip-bg` |
| Switch knob | `--switch-knob` |

Standard urgency reuses `--sidebar-grey` and `--black-50`. Urgent also covers unread counts. High also covers the open status.

## Hover on a neutral surface

Hover and selected fills step one darker than the surface they sit on. Never use the same token as the background behind the control.

`--white` → `--sidebar-grey` → `--grey` → `--black-12` → `--black-25`

A tab on white hovers with `--sidebar-grey`. The same tab on a `--sidebar-grey` bar hovers with `--grey`. A selected note on the white page uses `--sidebar-grey`. The same note on a `--sidebar-grey` surface would use `--grey`. Hover and selected share that fill. A selected note stays `--sidebar-grey` while the pointer is on it. If that next step is still invisible against the surface, keep moving down the list. Do not invent a new grey.

A resting fill uses that same step. On white, the fill is `--sidebar-grey`. On `--sidebar-grey`, the fill is `--grey`. The comment field is the reference: it sits on the white page, so its fill is `--sidebar-grey`.

`--destructive` is the one red for confirmation. Do not introduce a second red.

## Dark mode

`html[data-theme="dark"]` in `css/tokens.css` recolors the same tokens. Type, sizes, spacing, and radii do not change.

A surface that is darker than the page in light mode is lighter than the page in dark mode. The page stays the darkest surface.

| Role | Token | Dark |
|------|--------|------|
| Page | `--white` | `#1A1A1A` |
| Sidebar, department bar, and other chrome darker than the page in light mode | `--sidebar-grey` | `#212121` |
| Selected row and hover on that chrome | `--grey` | `#292929` |
| Names | `--black` | `#EEEEEE` |
| Subtext | `--black-50` | `#B5B5B5` |
| Quiet grey | `--black-25` | halfway from `--black-50` toward `--sidebar-grey` |
| Quiet fill | `--black-12` | `#292929` |
| Card and panel stroke | `--line`, `--stroke` | white at 5% |

`--line` is `--grey` in light mode, so light borders stay the same. Accent colors stay. Type, sizes, spacing, and radii do not change.

Hover lightens. A card or table row steps from `--white` (`#1A1A1A`) to `--grey` (`#292929`). It does not fall back onto a darker surface.

The primary button stays `--action`, with white text. Its hover is `--action-hover`, the darker blue, in both themes.

The secondary button stays a neutral surface: `--white` fill, `--black` text, and a `--stroke` hairline. Its hover is `--grey`, lighter than the card. It is not a white button.

The search stroke, including the shortcut key border, uses `--line`.

`--black-25` is the quieter grey. Light mode keeps `#bfbfbf`. In dark mode it is halfway from `--black-50` toward `--sidebar-grey`, and it is not a copy of `--black-50`. Use it for unselected tab counts, focus rings, scrollbars, and tooltip emphasis. Search strokes stay on `--line`.

The scrollbar is the thin sidebar scrollbar. `scrollbar-width` is `thin`, and the thumb is `--black-25`. The track matches the surface behind it.

Sidebar icon buttons stay unfilled. The switch under Settings uses `--action` and `--switch-knob` in both themes.

## Type

- `--font`: Switzer, weights 400 and 500.
- Sizes: `--text-10`, `--text-12`, `--text-14`, `--text-16`.
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

- `--shadow-menu`: menus and popovers.
- `--stroke`: 1px `--grey` ring.
- `--outline-image`: 1px pure black at 10% opacity, inset on photographs. In dark mode it is the hairline, white at 5%.
- `--icon-stroke`: `calc(1 / 0.95)`. Icons with class `i` are scaled to 0.95, and this keeps the painted stroke at `1`. New icons use the outlined Material glyph, fitted to Internal notes, including menu icons. See [polish.md](polish.md).
- `--hit` / `--hit-touch`: 40px and 44px hit areas. The visible control stays its gallery size.
