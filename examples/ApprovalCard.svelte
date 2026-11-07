<script lang="ts">
	import { fade } from 'svelte/transition';
	import { grow } from '../src/lib/index.js';

	export type ApprovalState = 'hidden' | 'pending' | 'pressed' | 'approved';

	let {
		phase,
		title,
		approve = $bindable()
	}: { phase: ApprovalState; title: string; approve?: HTMLElement } = $props();
</script>

<!--
@component
An approval that waits for the cursor, then settles into one quiet line. The pending card and the
settled line swap with `grow`, so the thread keeps its height moving instead of jumping.
-->

{#if phase === 'pending' || phase === 'pressed'}
	<div class="ap" in:grow out:grow={{ duration: 350 }}>
		<b>{title}</b>
		<span class="ap-buttons">
			<span bind:this={approve} class="ap-approve" class:ap-pressed={phase === 'pressed'}>Approve</span>
			<span class="ap-muted">Deny</span>
		</span>
	</div>
{:else if phase === 'approved'}
	<p class="ap-settled ap-muted" in:grow out:fade={{ duration: 200, delay: 60 }}>{title} · <em>Approved</em></p>
{/if}

<style>
	.ap {
		display: grid;
		gap: 12px;
		padding-top: 16px;
	}
	.ap b {
		font-weight: 500;
	}
	.ap-buttons {
		display: flex;
		gap: 8px;
	}
	.ap-buttons span {
		padding: 8px 16px;
		border-radius: 999px;
		transition: scale 0.1s ease;
	}
	.ap-approve {
		background: var(--color-fc-accent, #111);
		color: var(--color-fc-accent-fg, #fff);
	}
	.ap-pressed {
		scale: 0.95;
	}
	.ap-muted {
		color: var(--color-fc-fg-muted, #666);
	}
	.ap-settled {
		margin: 0;
		padding-top: 12px;
		font-size: 13px;
	}
	.ap-settled em {
		font-style: normal;
		color: var(--color-fc-success, #2a8f4f);
	}
</style>
