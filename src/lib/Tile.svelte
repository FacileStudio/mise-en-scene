<script module lang="ts">
	import type { Snippet } from 'svelte';

	export interface TileProps {
		/** The tile's heading, one short phrase. */
		title: string;
		/** One line of copy under the title. */
		body: string;
		/** Sits at the right of the title: a status dot, a link to the product. */
		badge?: Snippet;
		/** The heading level, so the tile fits the page outline. */
		level?: 2 | 3 | 4;
		class?: string;
		/** The demo, usually a `Stage`. */
		children: Snippet;
	}
</script>

<script lang="ts">
	let { title, body, badge, level = 3, class: className = '', children }: TileProps = $props();
</script>

<!--
@component
A bento tile: the demo on top, then a title and one line of copy. The tile is one fill step off the
page, with no border and no shadow. The demo stays decorative; the title and copy are what assistive
tech reads.
-->

<article class="mes-tile {className}">
	<div class="mes-tile-demo">{@render children()}</div>
	<div class="mes-tile-copy">
		<div class="mes-tile-head">
			<svelte:element this={`h${level}`} class="mes-tile-title">{title}</svelte:element>
			{#if badge}{@render badge()}{/if}
		</div>
		<p class="mes-tile-body">{body}</p>
	</div>
</article>

<style>
	.mes-tile {
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
		border-radius: var(--radius-fc-lg);
		background: var(--color-fc-component);
		font-family: var(--font-sans);
	}
	.mes-tile-copy {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.5rem 1.5rem 1.5rem;
	}
	.mes-tile-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.mes-tile-title {
		margin: 0;
		font-family: var(--font-fc-title);
		font-size: var(--text-fc-lg);
		line-height: var(--text-fc-lg--line-height);
		font-weight: 600;
		color: var(--color-fc-fg);
	}
	.mes-tile-body {
		margin: 0;
		font-size: var(--text-fc-sm);
		line-height: var(--text-fc-sm--line-height);
		color: var(--color-fc-fg-muted);
	}
</style>
