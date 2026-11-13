<script lang="ts">
	import AgentChat from '../../examples/AgentChat.svelte';
	import TerminalTile from '../../examples/TerminalTile.svelte';

	const scenes = { 'agent-chat': AgentChat, 'terminal-tile': TerminalTile } as const;
	type Name = keyof typeof scenes;

	const only = new URLSearchParams(location.search).get('scene') as Name | null;
	const shown = $derived(only && only in scenes ? [only] : (Object.keys(scenes) as Name[]));
</script>

<main>
	{#each shown as name (name)}
		{@const Scene = scenes[name]}
		<section id={name}>
			<h2>{name}</h2>
			<Scene />
		</section>
	{/each}
</main>

<style>
	main {
		display: grid;
		gap: 64px;
		max-width: 960px;
		margin: 0 auto;
		padding: 48px 16px;
	}
	h2 {
		margin: 0 0 16px;
		font-size: 14px;
		font-weight: 500;
		opacity: 0.6;
	}
</style>
