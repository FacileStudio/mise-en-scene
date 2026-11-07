import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Page } from 'playwright-core';

interface Options {
	url: string;
	select: string;
	times: number[];
	width: number;
	dark: boolean;
	out: string;
}

/** Reads `<url> [--select css] [--times 1500,6000] [--width 1280] [--dark] [--out dir]`. */
function parseArgs(argv: string[]): Options {
	const flag = (name: string) => {
		const at = argv.indexOf(`--${name}`);
		return at === -1 ? undefined : argv[at + 1];
	};
	const url = argv.find((a) => /^https?:\/\//.test(a));
	if (!url) throw new Error('usage: bun scripts/film.ts <url> [--select css] [--times ms,ms] [--width px] [--dark]');
	return {
		url,
		select: flag('select') ?? '.mes-host',
		times: (flag('times') ?? '1500,4000,7000,10000,13000,16000').split(',').map(Number),
		width: Number(flag('width') ?? 1280),
		dark: argv.includes('--dark'),
		out: flag('out') ?? '.film'
	};
}

/** Chromium from MES_CHROME, else the newest Playwright download in the user's cache. */
function chromePath(): string {
	if (process.env.MES_CHROME) return process.env.MES_CHROME;
	const cache = join(homedir(), '.cache', 'ms-playwright');
	const builds = existsSync(cache) ? readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort() : [];
	const newest = builds.at(-1);
	if (!newest) throw new Error('no Chromium found: set MES_CHROME or run `bunx playwright-core install chromium`');
	return join(cache, newest, 'chrome-linux64', 'chrome');
}

/** Shoots the scene element at each time offset, counted from when it scrolled into view. */
async function shoot(page: Page, options: Options): Promise<string[]> {
	const scene = page.locator(options.select).first();
	await scene.scrollIntoViewIfNeeded();
	const start = Date.now();
	const files: string[] = [];
	for (const at of options.times) {
		await page.waitForTimeout(Math.max(0, at - (Date.now() - start)));
		const file = join(options.out, `frame-${String(at).padStart(6, '0')}.png`);
		await scene.screenshot({ path: file });
		files.push(file);
	}
	return files;
}

/** Tiles the frames into one contact sheet with ImageMagick, when it is installed. */
function contactSheet(files: string[], out: string): string | null {
	const sheet = join(out, 'sheet.png');
	const run = Bun.spawnSync(['montage', ...files, '-tile', '2x', '-geometry', '640x+4+4', sheet]);
	return run.exitCode === 0 ? sheet : null;
}

/** Films the scene and prints where the frames and the sheet went, plus any page errors. */
async function main() {
	const options = parseArgs(process.argv.slice(2));
	mkdirSync(options.out, { recursive: true });
	const browser = await chromium.launch({ executablePath: chromePath() });
	const page = await browser.newPage({
		viewport: { width: options.width, height: 900 },
		colorScheme: options.dark ? 'dark' : 'light'
	});
	page.on('pageerror', (e) => console.error(`page error: ${e.message}`));
	await page.goto(options.url, { waitUntil: 'networkidle' });
	const files = await shoot(page, options);
	await browser.close();
	const sheet = contactSheet(files, options.out);
	console.log(files.join('\n'));
	console.log(sheet ? `sheet: ${sheet}` : 'sheet: skipped (install ImageMagick for montage)');
}

await main();
