# mise-en-scene

Faux product UI for Svelte 5: a kit to build landing-page demos that look like the real app, and an agent skill that teaches how to stage them. It is a Svelte port of [Stageshow](https://benji.org/stageshow) by Benji Taylor, with the Facile suite's rules on top.

A scene is a small Svelte component: a `Stage` at a fixed design size, the product's screen inside it, and an async script that moves it through three to five beats. The stage scales to its host and plays only while on screen. It shows a poster frame to visitors who prefer reduced motion.

## Install

The package is consumed from source, like muse:

```bash
bun add "github:FacileStudio/mise-en-scene#v0.1.1"
```

Install the agent skill for Claude Code and Codex:

```bash
curl -fsSL https://raw.githubusercontent.com/FacileStudio/mise-en-scene/main/install.sh | bash
```

## A scene

```svelte
<script lang="ts">
	import { Stage, Window, Terminal, Caret, type Act } from '@facile/mise-en-scene';

	let typed = $state('');

	async function script(act: Act) {
		await act.wait(600);
		await act.type('bun test', (v) => (typed = v), 70);
		await act.wait(2000);
		typed = '';
	}
</script>

<Stage width={320} height={240} {script} reset={() => (typed = '')} poster={() => (typed = 'bun test')}>
	{#snippet children()}
		<Terminal style="top:24px;left:24px;right:24px;bottom:24px">~/app $ {typed}<Caret /></Terminal>
	{/snippet}
</Stage>
```

`examples/AgentChat.svelte` is a full hero: a prompt typed and sent, tool calls, an approval clicked by the cursor and a streamed answer. `examples/TerminalTile.svelte` is a bento tile.

## Parts

| Part | What it does |
|---|---|
| `Stage` | Design size, scale-to-fit, `compact` design, loop while on screen, `reset`, `poster` |
| `Act` | `wait`, `type`, `count`, `point`, `move`, `click`; aborts when the stage leaves the screen |
| `Window` | Desktop app frame with title bar, optional sidebar and trailing slot, dark-mode surfaces |
| `Cursor` | The arrow, travelling on the travel curve |
| `Bar` | Placeholder text that reads on any surface |
| `Stream` | An answer streaming word by word without reflow |
| `Roll` | A word that changes by rolling |
| `Terminal`, `Caret` | A dark terminal panel and its block cursor |
| `grow` | Height and opacity together, for anything that joins a list |

Colors read muse tokens (`--color-fc-*`) with neutral fallbacks, so the kit works with or without muse.

## Develop

```bash
mise run dev       # playground on http://127.0.0.1:5184, ?scene=agent-chat to play one
mise run check     # svelte-check over the kit, examples and playground
mise run test      # the script runner checks
mise run verify    # check + test + filet
bun scripts/film.ts "http://127.0.0.1:5184/?scene=agent-chat" --width 390 --dark
```

`scripts/film.ts` films a scene into frames and a contact sheet, which is how the skill rehearses a demo. It uses `playwright-core` with the newest Chromium in `~/.cache/ms-playwright`, or `MES_CHROME`, and ImageMagick's `montage` for the sheet.

## License

MIT. See `LICENSE` and `NOTICE.md` for what comes from Stageshow.
