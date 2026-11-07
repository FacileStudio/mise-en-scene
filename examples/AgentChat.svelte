<script lang="ts">
	import { tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Bar, Cursor, Stage, Stream, Window, cursorAt, grow, type Act } from '../src/lib/index.js';

	type Step = 'hidden' | 'running' | 'ok' | 'failed';

	const PROMPT = 'The login test is failing. Fix it and open a PR.';
	const ANSWER = 'Fixed. The session refresh compared expiry against local time instead of UTC. All 48 tests pass.';
	const STEPS = [
		{ name: 'bash', args: 'bun test', end: 'failed' },
		{ name: 'edit_file', args: 'src/auth/session.ts', end: 'ok' },
		{ name: 'bash', args: 'bun test', end: 'ok' }
	] as const;
	const WORDS = ANSWER.split(' ').length;

	let draft = $state('');
	let sent = $state(false);
	let steps = $state<Step[]>(['hidden', 'hidden', 'hidden']);
	let approval = $state<'hidden' | 'pending' | 'pressed' | 'approved'>('hidden');
	let words = $state(0);
	let cursor = $state(cursorAt());
	let approve = $state<HTMLElement>();

	function reset() {
		draft = '';
		sent = false;
		steps = ['hidden', 'hidden', 'hidden'];
		approval = 'hidden';
		words = 0;
		cursor.visible = false;
	}

	function poster() {
		sent = true;
		steps = STEPS.map((s) => s.end);
		approval = 'approved';
		words = WORDS;
	}

	async function runSteps(act: Act) {
		for (const [i, step] of STEPS.entries()) {
			await act.wait(300);
			steps[i] = 'running';
			await act.wait(900);
			steps[i] = step.end;
		}
	}

	async function approveIt(act: Act) {
		approval = 'pending';
		await tick();
		const rest = act.point(approve, 2.4, 1.6);
		await act.move(cursor, rest, 600);
		cursor.visible = true;
		await act.wait(400);
		await act.move(cursor, act.point(approve, 0.9, 0.78));
		await act.click(cursor, () => (approval = 'pressed'));
		approval = 'approved';
		cursor.y = rest.y + 40;
	}

	async function script(act: Act) {
		await act.wait(800);
		await act.type(PROMPT, (v) => (draft = v));
		await act.wait(350);
		sent = true;
		draft = '';
		await runSteps(act);
		await approveIt(act);
		await act.wait(400);
		await act.count(WORDS, (v) => (words = v));
		await act.wait(2200);
		reset();
		await act.wait(700);
	}
</script>

<Stage width={720} height={480} compact={{ below: 600, width: 358, height: 520 }} {script} {reset} {poster}>
	{#snippet children({ compact })}
		<Window class="ac-win" style={compact ? 'top:16px;left:16px;width:326px;height:470px' : ''}>
			<div class="ac-thread">
				<div class="ac-past">
					<span class="ac-bubble-bar"></span>
					<Bar w="86%" />
					<Bar w="62%" />
				</div>
				{#if sent}
					<div class="ac-q" in:grow out:fade={{ duration: 200, delay: 180 }}><p>{PROMPT}</p></div>
				{/if}
				{#if steps[0] !== 'hidden'}
					<ul class="ac-steps" in:grow out:fade={{ duration: 200, delay: 120 }}>
						{#each STEPS as step, i (i)}
							{#if steps[i] !== 'hidden'}
								<li in:grow={{ duration: 350 }} data-state={steps[i]}>
									<span class="ac-mark"></span><b>{step.name}</b><code>{step.args}</code>
								</li>
							{/if}
						{/each}
					</ul>
				{/if}
				{#if approval === 'pending' || approval === 'pressed'}
					<div class="ac-approval" in:grow out:grow={{ duration: 350 }}>
						<span class="ac-title">Open pull request</span>
						<span class="ac-buttons">
							<span bind:this={approve} class="ac-approve" class:ac-pressed={approval === 'pressed'}>Approve</span>
							<span class="ac-deny">Deny</span>
						</span>
					</div>
				{:else if approval === 'approved'}
					<p class="ac-settled" in:grow out:fade={{ duration: 200, delay: 60 }}>Open pull request · <em>Approved</em></p>
				{/if}
				{#if words > 0}
					<div in:grow={{ duration: 300 }} out:fade={{ duration: 200 }}>
						<Stream class="ac-answer" text={ANSWER} count={words} />
					</div>
				{/if}
			</div>
			<div class="ac-composer">
				<span class:ac-placeholder={!draft}>{draft || 'Message the agent'}</span>
				<span class="ac-send" class:ac-idle={!draft}></span>
			</div>
		</Window>
		<Cursor {cursor} />
	{/snippet}
</Stage>

<style>
	:global(.ac-win) {
		top: 24px;
		left: 48px;
		width: 624px;
		height: 432px;
	}
	.ac-thread {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: flex-end;
		min-height: 0;
		overflow: hidden;
		padding: 0 20px 12px;
		font-size: 14px;
		color: var(--color-fc-fg, #111);
		mask-image: linear-gradient(to bottom, transparent, #000 48px);
	}
	.ac-past {
		display: grid;
		gap: 8px;
		padding-bottom: 8px;
	}
	.ac-bubble-bar {
		justify-self: end;
		width: 40%;
		height: 32px;
		border-radius: 12px;
		background: var(--color-fc-surface, oklch(0.95 0 0));
	}
	.ac-q {
		display: flex;
		justify-content: flex-end;
		padding-top: 16px;
	}
	.ac-q p {
		max-width: 80%;
		margin: 0;
		padding: 8px 14px;
		border-radius: 12px;
		background: var(--color-fc-surface, oklch(0.95 0 0));
	}
	.ac-steps {
		margin: 16px 0 0;
		padding: 4px 0;
		list-style: none;
		border-radius: 12px;
		background: var(--color-fc-component, oklch(0.975 0 0));
	}
	.ac-steps li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
	}
	.ac-steps code {
		font-size: 12px;
		color: var(--color-fc-fg-muted, #666);
	}
	.ac-mark {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background: var(--color-fc-fg-muted, #999);
		transition: background 0.2s ease;
	}
	[data-state='ok'] .ac-mark {
		background: var(--color-fc-success, #2a8f4f);
	}
	[data-state='failed'] .ac-mark {
		background: var(--color-fc-danger, #c33);
	}
	.ac-approval {
		display: grid;
		gap: 12px;
		padding-top: 16px;
	}
	.ac-title {
		font-weight: 500;
	}
	.ac-buttons {
		display: flex;
		gap: 8px;
	}
	.ac-approve,
	.ac-deny {
		padding: 8px 16px;
		border-radius: 999px;
		transition: scale 0.1s ease;
	}
	.ac-approve {
		background: var(--color-fc-accent, #111);
		color: var(--color-fc-accent-fg, #fff);
	}
	.ac-pressed {
		scale: 0.95;
	}
	.ac-deny,
	.ac-settled {
		color: var(--color-fc-fg-muted, #666);
	}
	.ac-settled {
		margin: 0;
		padding-top: 12px;
		font-size: 13px;
	}
	.ac-settled em {
		font-style: normal;
		color: var(--color-fc-success, #2a8f4f);
	}
	:global(.ac-answer) {
		margin: 0;
		padding-top: 10px;
		line-height: 1.6;
	}
	.ac-composer {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0 20px 20px;
		padding: 8px 8px 8px 20px;
		border-radius: 31px;
		background: var(--color-fc-field, oklch(0.93 0 0));
		font-size: 15px;
	}
	.ac-composer > span:first-child {
		flex: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.ac-placeholder {
		color: var(--color-fc-fg-muted, #888);
	}
	.ac-send {
		width: 40px;
		height: 40px;
		border-radius: 999px;
		background: var(--color-fc-accent, #111);
		transition: opacity 0.15s ease;
	}
	.ac-idle {
		opacity: 0.4;
	}
</style>
