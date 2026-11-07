<script lang="ts">
	import { Caret, Stage, Terminal, type Act } from '../src/lib/index.js';

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

<div class="tt">
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
	<div class="tt-copy">
		<span class="tt-title">Its own computer</span>
		<span class="tt-body">A persistent VM per user, to run, edit and build safely.</span>
	</div>
</div>

<style>
	.tt {
		overflow: hidden;
		max-width: 320px;
		border-radius: 12px;
		background: var(--color-fc-component, oklch(0.975 0 0));
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
		background: oklch(0.72 0.17 150);
	}
	.tt-line {
		white-space: nowrap;
	}
	.tt-dim {
		color: rgb(255 255 255 / 0.5);
	}
	.tt-ok {
		color: oklch(0.8 0.15 150);
	}
	.tt-copy {
		display: grid;
		gap: 6px;
		padding: 8px 24px 24px;
	}
	.tt-title {
		font-weight: 600;
		font-size: 18px;
		color: var(--color-fc-fg, #111);
	}
	.tt-body {
		font-size: 14px;
		color: var(--color-fc-fg-muted, #666);
	}
</style>
