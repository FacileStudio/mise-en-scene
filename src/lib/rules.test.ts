import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..', '..');
const DIRS = ['src/lib', 'examples'];
const GLYPH = 'Cursor.svelte';

const RULES: [string, RegExp][] = [
	['a border', /^\s*border(?!-radius)(-[a-z-]+)?\s*:|\b(border|divide)-(?!radius\b)[a-z0-9]/m],
	['a stock Tailwind palette color', /\b[a-z]+-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/],
	['a hardcoded font family', /font-family:(?!\s*var\(--font-(sans|fc-title|fc-mono|fc-body)\)\s*;)/],
	['a hex color', /#[0-9a-fA-F]{3,8}\b/]
];

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
			const broken = RULES.filter(([what, rule]) => !(what === 'a hex color' && file.endsWith(GLYPH)) && rule.test(text));
			expect(broken.map(([what]) => what)).toEqual([]);
		});
	}
});
