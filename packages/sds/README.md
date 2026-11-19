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

Build a page with `PageLayout`. It is the only thing a page needs from the package:

```tsx
import { PageLayout, PageTitle } from "@lance-live/sds/page";
import { Tabs } from "@lance-live/sds";

<PageLayout icon="grid" title="Boards" count={12} actions={actions} tabs={<Tabs label="Boards" items={items} value={value} onValueChange={setValue} />}>
  {body}
</PageLayout>
```

`PageLayout` puts `notes-page sds` on the root and imports `tokens.css`, `styles.css`, and `screens.css` in that order, so there is no class or stylesheet to remember. A subpage passes `title={<PageTitle parent="Boards" current={name} onBack={back} />}`. Pass `as="main"` when the page is the document's main region; the default `div` suits an app shell that already has one.

`PageHeader` on its own still works inside a root that has `notes-page sds` and those stylesheets. Without `notes-page` it falls back to the gallery specimen (a grey sticky band with a serif title), which is not a built page.

The card frame around a page (its margin, corner radius, and outline) is not in the package. An app with its own shell keeps its own frame.

## Screen layout

`styles.css` covers components and the page stack. The layout inside each screen (Boards, To-Dos, Calls, Complaints, Knowledge, Cash, Home, Notifications, the editor dialog) is in `screens.css`. `PageLayout` loads it; import it yourself only for a screen built without `PageLayout`, after `styles.css`.

It is built from `apps/catalog/app/(screens)/screens.css` and every `css/` file it imports, so a rule added to a screen in the catalog ships with the next build. Every selector sits under `:where(.sds)`, so it only reaches inside an `.sds` root and an app's own rule wins at equal specificity. `css/page-frame.css` (the card frame) is left out.

Until this package is published, point the app at the workspace:

```json
"@lance-live/sds": "file:../../sarah-design-skill/packages/sds"
```

Dark mode is `html[data-theme="dark"]`, the same attribute `tokens.css` already uses. `data-lance-theme` belongs to `@lance-live/ds-web` and is a later migration.

`Button` variants are `primary`, `secondary`, and `danger`. `icon` draws the 28px square. `state="hover"` paints the frozen hover specimen. Disabled controls do not scale and do not take the hover fill.

`SegmentedControl` is a tablist of at most three views. The selected segment’s fill slides: the edge facing the new option leads (220ms / 160ms on `--ease-out`). Keyboard moves and `prefers-reduced-motion: reduce` snap. Pass `readOnly` for a frozen specimen.

## Settings hierarchy and spacing

`SectionHeader variant="described"` introduces a whole settings area with a 16px medium title and supporting copy. Standard `SectionHeader level={3}` labels a subsection with a 14px muted title. Headings stay outside cards.

Use `SettingsSections spacing="areas"` for 40px between whole areas. Nest `SettingsSections` inside an area for 25px between subsections or standalone cards. Both stay in one column. The area heading supplies 20px top padding, 8px bottom padding, and 16px external space after its complete padded box; a subsection header supplies 8px before its card. Consumers should not add local gaps or margins over these rules. Use `SettingsRow layout="inline"` for compact selectors aligned to the right at their intrinsic width (days off, ranges, dropdowns). Use `layout="stacked"` when larger controls belong below their label. Inline is the default, and wraps on narrow screens.

Use the `SettingsCard actions` slot for footer buttons. It owns its divider and 16px vertical / 25px horizontal padding. A stacked row already owns its 16px copy-to-control gap: nested grids must not add a second top margin. Attendance, time off, and standalone actions belong in the 25px subsection stack.

Spacing ownership is enforced in component CSS: `SettingsSections` clears direct-child external margins and trailing content margins, `SettingsRow layout="stacked"` clears outer margins on its control content, and `SettingsCard actions` clears action margins. Page styles only arrange domain-specific controls; they do not redefine the shared gaps or compensate for them.
