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

## Pages

A page puts `notes-page` and `sds` on its root. `PageHeader` then draws the page stack from `css/page.css`: a 60px title row with the mark, the title, the count, and the actions on the right, then the tab band under it. Without `notes-page`, `PageHeader` falls back to the gallery specimen (a grey sticky band with a serif title), which is not a built page.

```tsx
<div className="notes-page sds">
  <PageHeader mark="grid" title="Boards" count="12" actions={actions} />
  <div className="page-filters"><Tabs label="Boards" items={items} value={value} onValueChange={setValue} /></div>
</div>
```

The card frame around a page (its margin, corner radius, and outline) is not in the package. An app with its own shell keeps its own frame.

## Screen layout

`styles.css` covers components and the page stack. The layout inside each screen (Boards, To-Dos, Calls, Complaints, Knowledge, Cash, Home, Notifications, the editor dialog) is in `screens.css`. Import it after `styles.css` on any page built from a catalog screen:

```css
@import "@lance-live/sds/tokens.css";
@import "@lance-live/sds/styles.css";
@import "@lance-live/sds/screens.css";
```

It is built from `apps/catalog/app/(screens)/screens.css` and every `css/` file it imports, so a rule added to a screen in the catalog ships with the next build. Every selector sits under `:where(.sds)`, so it only reaches inside an `.sds` root and an app's own rule wins at equal specificity. `css/page-frame.css` (the card frame) is left out.

Until this package is published, point the app at the workspace:

```json
"@lance-live/sds": "file:../../sarah-design-skill/packages/sds"
```

Dark mode is `html[data-theme="dark"]`, the same attribute `tokens.css` already uses. `data-lance-theme` belongs to `@lance-live/ds-web` and is a later migration.

`Button` variants are `primary`, `secondary`, and `danger`. `icon` draws the 28px square. `state="hover"` paints the frozen hover specimen. Disabled controls do not scale and do not take the hover fill.

`SegmentedControl` is a tablist of at most three views. The selected segment’s fill slides: the edge facing the new option leads (220ms / 160ms on `--ease-out`). Keyboard moves and `prefers-reduced-motion: reduce` snap. Pass `readOnly` for a frozen specimen.
