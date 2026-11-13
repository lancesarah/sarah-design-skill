# Sarah's design system

The design system behind Lance's hotel operations product, kept in one place:

- **A design-system skill** that teaches an AI agent how this product looks and behaves, and why.
- **A React component library**, `@lance-live/sds`, built from the same CSS.
- **A gallery and screens app**, which shows every component and real product screens built with them.

Live link: [sarah-design-skill.vercel.app](https://sarah-design-skill.vercel.app). The gallery is at `/`, and the screens are linked from the sidebar, starting at `/home`.

## What's in the repo

| Path | What it is |
| --- | --- |
| `.cursor/skills/design-system/` | The skill: the rules, the reasoning, and a copy of the CSS. See its [README](.cursor/skills/design-system/README.md). |
| `.cursor/rules/design-system.mdc` | A Cursor rule that points every UI change at the skill and the design check. |
| `css/` | **The source of truth for styling.** Tokens (`tokens.css`), component styles (`gallery.css`), and one stylesheet per screen. |
| `packages/sds/` | The component library, imported as `@lance-live/sds`. It turns the styles in `css/` into React components you can drop into a page, like `<Button>` or `<DataTable>`, so screens don't hand-write class names. |
| `apps/catalog/` | The Next.js app: the gallery, the product screens, and the review comments. This is what's deployed. |
| `scripts/` | Build and check scripts, covered under Commands below. |
| `.agents/skills/` | Two outside skills this project leans on for polish: Emil Kowalski's design engineering and Make interfaces feel better. |
