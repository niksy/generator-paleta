import {defineConfig} from 'vite';
import path from 'node:path';

export default defineConfig({
	root: path.resolve(import.meta.dirname),
	build: {
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
