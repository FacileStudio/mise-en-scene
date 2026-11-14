<svelte:options css="injected" />

<script module lang="ts">
	export interface StreamProps {
		/** The full answer; words split on spaces. */
		text: string;
		/** How many words are visible. */
		count: number;
		class?: string;
	}
</script>

<script lang="ts">
	let { text, count, class: className = '' }: StreamProps = $props();

	const words = $derived(text.split(' '));
</script>

<!--
@component
Text that streams in word by word. Every word is laid out from the start and only its opacity changes,
so the block grows in place: no reflow, no jump. Drive `count` with `act.count(words, set)`.
-->

<p class="mes-stream {className}">
	{#each words as word, i (i)}
		<span class:mes-hidden={i >= count}>{word}</span>{' '}
	{/each}
</p>

<style>
	.mes-stream span {
		transition: opacity 0.15s ease;
	}
	.mes-hidden {
		opacity: 0;
	}
</style>
