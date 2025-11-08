import {defineConfig} from 'vite';
import path from 'node:path';

export default defineConfig({
	root: path.resolve(import.meta.dirname),
	build: {
		emptyOutDir: true,
		outDir: path.resolve(process.cwd(), 'test-dist'),
		rolldownOptions: {
			transform: {
				target: [<%- rolldownBrowserTargets.map((target) => `'${target}'`).join(', ') %>]
			}
		}
	},
	css: {
		lightningcss: {
			targets: <%- JSON.stringify(lightningCssBrowserTargets) %>
		}
	}
});
