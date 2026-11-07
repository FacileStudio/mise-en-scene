# Changelog

## v0.1.1 (2026-11-07)

### Fixed

- `loop` no longer freezes the page when a script never waits: a run that finishes within one frame plays once instead of spinning the event loop.
- `Stage` without a `script` shows its `poster`, so a still scene renders its finished frame instead of its empty opening one.
- The Svelte peer floor is `^5.29.0`, the first release with `{@attach}`, which `Stage` uses. Older 5.x consumers got a compile error.
- `Window`'s title bar class is `mes-titlebar`, no longer the same name as `Bar`'s root class.
- `scripts/film.ts` rejects a `--times` entry that is not a number instead of shooting at 0ms, and says that macOS and Windows need `MES_CHROME`.
- The package no longer ships its `bun:test` file to consumers.

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
