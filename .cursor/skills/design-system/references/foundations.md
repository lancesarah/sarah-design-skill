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

A tab on white hovers with `--sidebar-grey`. The same tab on a `--sidebar-grey` bar hovers with `--grey`. If that next step is still invisible, keep moving down the list. Do not invent a new grey.

`--destructive` is the one red for confirmation. Do not introduce a second red.

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
- `--outline-image`: 1px pure black at 10% opacity, inset on photographs.
- `--icon-stroke`: `1`. Stroke icons use this width in the 14 viewBox. Filled sidebar icons match the Internal notes weight instead. See [polish.md](polish.md).
- `--hit` / `--hit-touch`: 40px and 44px hit areas. The visible control stays its gallery size.
