import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..', '..');
const DIRS = ['src/lib', 'examples'];

const RULES: [string, RegExp][] = [
	['a border', /^\s*border(?!-radius)(-[a-z-]+)?\s*:|\b(border|divide)-(?!radius\b)[a-z0-9]/m],
	['a stock Tailwind palette color', /\b[a-z]+-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/],
	['a hardcoded font family', /font-family:(?!\s*var\(--font-fc-(body|title|mono)\)\s*;)/],
	['a hex color', /#[0-9a-fA-F]{3,8}\b/]
];

const MUSE = readFileSync(join(ROOT, 'node_modules/@facile/muse/src/lib/styles/tokens.css'), 'utf8');

function sources(): string[] {
	return DIRS.flatMap((dir) =>
		readdirSync(join(ROOT, dir))
			.filter((name) => name.endsWith('.svelte'))
			.map((name) => join(dir, name))
	);
}

describe('owner UI rules', () => {
	for (const file of sources()) {
		it(`${file} draws no border, palette color, hex color or hardcoded font`, () => {
			const text = readFileSync(join(ROOT, file), 'utf8');
			const broken = RULES.filter(([, rule]) => rule.test(text));
			expect(broken.map(([what]) => what)).toEqual([]);
		});
	}
});

describe('muse tokens', () => {
	for (const file of sources()) {
		it(`${file} reads only tokens that muse defines`, () => {
			const used = [...readFileSync(join(ROOT, file), 'utf8').matchAll(/var\((--(?:color|font|radius|text)-[\w-]+)/g)];
			const missing = used.map(([, name]) => name).filter((name) => !MUSE.includes(`${name}:`));
			expect(missing).toEqual([]);
		});
	}
});
