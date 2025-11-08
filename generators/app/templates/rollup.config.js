<% if ( transpile ) { %>import babel from '@rollup/plugin-babel';<% } %><% if ( typescript ) { %>
import { execa } from 'execa';
import cpy from 'cpy';<% if ( !transpile && typescriptMode === 'full' ) { %>
import typescript from '@rollup/plugin-typescript';<% } %><% if ( transpile && typescriptMode === 'full' ) { %>
import resolve from '@rollup/plugin-node-resolve';<% } %><% } %>
import path from 'node:path';
import { promises as fs } from 'node:fs';

export default {
	input: 'index.<%= extension || 'js' %>',
	output: [<% if ( bundleCjs ) { %>
		{
			file: 'cjs/index.js',
			format: 'cjs',
			exports: 'auto'<% if ( sourceMaps ) { %>,
			sourcemap: true<% } %>,
		},<% } %>
		{
			file: 'dist/index.js',
			format: 'esm'<% if ( sourceMaps ) { %>,
			sourcemap: true<% } %>
		}
	],
	plugins: [<% if ( typescript ) { %>(() => {
			return {
				name: 'types',
				async writeBundle(output) {
					let pkgDir;<% if ( bundleCjs ) { %>
					if (output.file.includes('cjs/')) {
						pkgDir = 'cjs';
					} else <% } %>if (output.file.includes('dist/')) {
						pkgDir = 'dist';
					}
					if (typeof pkgDir !== 'undefined') {
						const { stdout } = await execa(
							'tsc',
							['-p', './tsconfig.build.json', '--declarationDir', pkgDir],
							{
								preferLocal: true
							}
						);
						try {
							await cpy('types', `${pkgDir}/types`);
						} catch (error) {}
						console.log(stdout);
					}
				}
			};
		})(),<% } %><% if ( bundleCjs ) { %>(() => {
		return {
			name: 'package-type',
			async writeBundle (output) {
				if ( output.file.includes('cjs/') ) {
					const pkg = path.join('cjs', 'package.json');
					try {
						await fs.unlink(pkg);
					} catch (error) {}
					await fs.writeFile(pkg, JSON.stringify({ type: 'commonjs' }), 'utf8');
				}
			}
		}
	})(),<% } %><% if ( !transpile && typescript && typescriptMode === 'full' ) { %>typescript(),<% } %><% if ( transpile ) { %><% if ( typescript && typescriptMode === 'full' ) { %>
		resolve({
			extensions: ['.js', '.ts']
		}),<% } %>
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**'<% if ( typescript && typescriptMode === 'full' ) { %>,
			extensions: ['.js'<% if (typescript && typescriptMode === 'full') { %>, '.ts'<% } %>]<% } %>
		})
	<% } %>]
};
