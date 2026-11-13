<script lang="ts">
	import { Caret, Stage, Terminal, Tile, type Act } from '../src/lib/index.js';

	type Line = { kind: 'cmd' | 'ok' | 'out'; text: string };

	const SCRIPT: Line[] = [
		{ kind: 'cmd', text: 'bun test' },
		{ kind: 'ok', text: '✓ 48 pass  1.21s' },
		{ kind: 'cmd', text: 'git push' },
		{ kind: 'out', text: '→ origin fix/session-refresh' }
	];

	let lines = $state<Line[]>([]);

	function reset() {
		lines = [];
	}

	function poster() {
		lines = [...SCRIPT];
	}

	async function typeLine(act: Act, text: string, interval: number) {
		lines.push({ kind: 'cmd', text: '' });
		const at = lines.length - 1;
		await act.type(text, (v) => (lines[at].text = v), interval);
	}

	async function script(act: Act) {
		await act.wait(600);
		for (const line of SCRIPT) {
			if (line.kind === 'cmd') {
				await typeLine(act, line.text, 70);
				await act.wait(450);
			} else {
				lines.push(line);
				await act.wait(900);
			}
		}
		await act.wait(1800);
		await typeLine(act, 'clear', 80);
		await act.wait(350);
		reset();
	}
</script>

<Tile class="tt" title="Its own computer" body="A persistent VM per user, to run, edit and build safely.">
	<Stage width={320} height={240} {script} {reset} {poster}>
		{#snippet children()}
			<Terminal style="top:24px;left:24px;right:-40px;bottom:-24px">
				<div class="tt-head"><span class="tt-dot"></span>sandbox <span class="tt-dim">up 14d</span></div>
				{#each lines as line, i (i)}
					<div class="tt-line">
						{#if line.kind === 'cmd'}
							<span class="tt-dim">~/app $</span>
							{line.text}{#if i === lines.length - 1}<Caret />{/if}
						{:else}
							<span class:tt-ok={line.kind === 'ok'} class:tt-dim={line.kind === 'out'}>{line.text}</span>
						{/if}
					</div>
				{/each}
				{#if lines.at(-1)?.kind !== 'cmd'}
					<div class="tt-line"><span class="tt-dim">~/app $</span> <Caret /></div>
				{/if}
			</Terminal>
		{/snippet}
	</Stage>
</Tile>

<style>
	:global(.tt) {
		max-width: 320px;
	}
	.tt-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
	}
	.tt-dot {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background: var(--color-fc-success);
	}
	.tt-line {
		white-space: nowrap;
	}
	.tt-dim {
		color: rgb(255 255 255 / 0.5);
	}
	.tt-ok {
		color: color-mix(in oklch, var(--color-fc-success), white 35%);
	}
</style>
