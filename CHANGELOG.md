# Changelog

## v0.2.2 (2026-11-14)

### Fixed

- `vite dev` no longer fails with "failed to load virtual css module" or a Tailwind "Invalid declaration" overlay. Every component compiles with `<svelte:options css="injected" />`, so no virtual CSS module exists to miss. Consumers need no `optimizeDeps` entry for the kit, on Vite 7 or 8, with SSR or as an SPA.

## v0.2.1 (2026-11-13)

### Fixed

- `Stage` reserves its height in CSS from its container width (`100cqw`), choosing the compact or wide design the same way the script does. Phones no longer see a one-time height jump on stages with a `compact` design, and the server render already has the right height.
- `Cursor` draws its arrow in `fc-fg` with an `fc-page` edge instead of fixed white and black, so it inverts with the theme.
- Scene text uses `--font-fc-body`, `Window` and `Tile` titles use `--font-fc-title`, and `Terminal` uses `--font-fc-mono`.
- `install.sh` has seven functions instead of fourteen, which clears the filet warning. Its output and installed files are unchanged.

### Changed

- `Terminal` uses muse's inverse tokens (`fc-inverse`, `fc-on-inverse`). Consumers need `@facile/muse` v0.22.0 or later.
- `@facile/muse` v0.22.0 is a devDependency. `rules.test.ts` fails when the kit reads a token that muse does not define, and the cursor's color exemption is gone.

## v0.2.0 (2026-11-13)

### Breaking

- The kit reads muse tokens with no fallbacks. A page without `@facile/muse/styles` (or the same `--color-fc-*`, `--font-*` tokens) renders the scene unstyled.
- `Stage` calls `reset` before every run, not only when the stage leaves the screen.
- `Stage` sizes its host with `aspect-ratio` and `max-height` instead of an inline `height`. A consumer that overrode the host height in CSS must drop that override.

### Added

- `Tile`: a bento tile with the demo on top, then a title, one line of copy, an optional `badge` and a `level` for the heading. It comes from Bulle's landing `DemoTile`.
- Typed props for every part: `TileProps`, `CursorProps`, `BarProps`, `StreamProps`, `RollProps`, `TerminalProps`.
- `./package.json` in the exports map.

### Fixed

- `Stage` pauses when the tab is hidden and resumes from the opening frame when it comes back.
- `Stage` stops when it scrolls below its `threshold`. It used to keep playing until the scene was fully off screen, because a partly visible entry still counts as intersecting.
- `Stage` follows a reduced-motion change live: it stops and shows the poster, or resumes.
- `Stage` no longer re-runs its playback when `poster` reads scene state.
- `Stage` renders on the server at the right height and without a horizontal scroll on phones. The scene stays hidden until the stage has measured its width.
- `grow` opens rows to their full height inside a scaled-down stage. It read the on-screen height, so on a phone a row grew to its scaled size and then jumped.
- `act.type`, `act.count`, `act.move` and `act.click` do nothing once the run is aborted, so a script that resumes after a `tick` cannot move the cursor after `reset`.
- `Caret` stops blinking and `Cursor` stops gliding under reduced motion.
- Fonts come from `--font-sans`, `--font-fc-title` and `--font-fc-mono`. The kit names no font family.
- `Window` in dark mode uses `fc-component` and `fc-surface` instead of its own fixed grays. Its title bar dots use `fc-field`, so they show on both surfaces.

### Changed

- `examples/TerminalTile` is built on `Tile`. The examples read tokens only and give `<code>` the mono token.
- The playground loads a token stub that mirrors muse in light and dark.
- `mise run test` and CI render every example on the server (`scripts/ssr.ts`). `src/lib/rules.test.ts` fails on a border, a hex color, a stock Tailwind palette color or a hardcoded font family.

## v0.1.1 (2026-11-07)

### Fixed

- `loop` no longer freezes the page when a script never waits: a run that finishes within one frame plays once instead of spinning the event loop.
- `Stage` without a `script` shows its `poster`, so a still scene renders its finished frame instead of its empty opening one.
- The Svelte peer floor is `^5.29.0`, the first release with `{@attach}`, which `Stage` uses. Older 5.x consumers got a compile error.
- `Window`'s title bar class is `mes-titlebar`, no longer the same name as `Bar`'s root class.
- `scripts/film.ts` rejects a `--times` entry that is not a number instead of shooting at 0ms, and says that macOS and Windows need `MES_CHROME`.
- `files` excludes the `bun:test` file from a packed tarball. A `github:` install still fetches the whole repo, test included; nothing imports it.

### Changed

- `examples/AgentChat` moves its approval card into `examples/ApprovalCard`.
- `Window`'s docs say windows stay whole inside the stage, matching the skill's Facile rules.

## v0.1.0 (2026-11-07)

### Added

- `Stage`: design size with scale-to-fit, a `compact` design for narrow hosts, a script that loops only while on screen, `reset` on leaving and a `poster` frame under reduced motion.
- `Act`: `wait`, `type`, `count`, `point` (design pixels from a rendered element), `move` and `click` for the cursor, all aborted when the stage leaves the screen.
- `Window`, `Cursor`, `Bar`, `Stream`, `Roll`, `Terminal`, `Caret`, the `grow` transition and the `TRAVEL` and `ARRIVE` curves.
- The `mise-en-scene` agent skill (Stageshow's method, Svelte kit, Facile rules) with an installer for Claude Code and Codex.
- `scripts/film.ts`: films a scene into frames and a contact sheet for rehearsal.
- Examples `AgentChat` and `TerminalTile`, played by the playground.
