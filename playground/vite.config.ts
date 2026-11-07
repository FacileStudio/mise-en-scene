import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	root: 'playground',
	plugins: [svelte()],
	server: { host: '127.0.0.1', port: 5184, fs: { allow: ['..'] } }
});
