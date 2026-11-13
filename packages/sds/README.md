# @lance-live/sds

React 19 components for the gallery design system. This package replaces `@lance-live/ds-web` later. It does not modify that package.

Tokens and component CSS are copied from the gallery (`css/tokens.css`, the button and segment rules in `css/gallery.css`). Appearance stays in those stylesheets. Tailwind is not required to render a control.

## Use

```css
@layer theme, base, gallery-ui, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@lance-live/sds/tokens.css" layer(gallery-ui);
@import "@lance-live/sds/styles.css" layer(gallery-ui);
@import "tailwindcss/utilities.css" layer(utilities);
```

Keep the Tailwind entry split. A single `@import "tailwindcss"` drops the imports after it on Tailwind 4.3, and a layer statement that arrives late lets component CSS beat utilities.

```tsx
import { Button, SegmentedControl } from "@lance-live/sds";
```

Until this package is published, point the app at the workspace:

```json
"@lance-live/sds": "file:../../sarah-design-skill/packages/sds"
```

Dark mode is `html[data-theme="dark"]`, the same attribute `tokens.css` already uses. `data-lance-theme` belongs to `@lance-live/ds-web` and is a later migration.

`Button` variants are `primary`, `secondary`, and `danger`. `icon` draws the 28px square. `state="hover"` paints the frozen hover specimen. Disabled controls do not scale and do not take the hover fill.

`SegmentedControl` is a tablist of at most three views. The selected segment’s fill slides: the edge facing the new option leads (220ms / 160ms on `--ease-out`). Keyboard moves and `prefers-reduced-motion: reduce` snap. Pass `readOnly` for a frozen specimen.
