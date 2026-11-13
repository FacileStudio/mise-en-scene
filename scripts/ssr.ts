import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { Component } from 'svelte';
import type { render as Render } from 'svelte/server';
import { createServer } from 'vite';

const SCENES = ['/examples/AgentChat.svelte', '/examples/TerminalTile.svelte'];

/** Renders every example on the server, where `window` and `document` do not exist, and checks the stage markup. */
async function main(): Promise<void> {
	const vite = await createServer({
		configFile: false,
		logLevel: 'error',
		appType: 'custom',
		server: { middlewareMode: true, hmr: false, ws: false },
		plugins: [svelte()]
	});
	try {
		const { render } = (await vite.ssrLoadModule('svelte/server')) as { render: typeof Render };
		for (const path of SCENES) {
			const { default: Scene } = (await vite.ssrLoadModule(path)) as { default: Component };
			const { body } = render(Scene);
			for (const needle of ['aria-hidden="true"', 'inert', 'cqw']) {
				if (!body.includes(needle)) throw new Error(`${path}: server render has no ${needle}`);
			}
			console.log(`ok ${path} renders on the server`);
		}
	} finally {
		await vite.close();
	}
}

await main();
