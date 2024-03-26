<% if ( transpile ) { %>import babel from '@rollup/plugin-babel';<% } %><% if ( vanillaJsWidget ) { %>
import path from 'node:path';
import svelte from 'rollup-plugin-svelte';
import babelCore from '@babel/core';<% } %><% if ( typescript ) { %>
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
	})(),<% } %><% if ( !transpile && typescript && typescriptMode === 'full' ) { %>typescript(),<% } %><% if ( transpile ) { %><% if ( vanillaJsWidget ) { %>
		svelte({
			legacy: true
		}),
		{
			async transform(code, id) {
				if (!id.includes('lib/index.svelte')) {
					return;
				}
				const result = await babelCore.transformAsync(code, {
					sourceMaps: true,
					plugins: [useMountedNodePlugin()]
				});
				return {
					code: result.code,
					map: result.map
				};
			}
		},<% } %><% if ( typescript && typescriptMode === 'full' ) { %>
		resolve({
			extensions: ['.js', '.ts']
		}),<% } %>
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**'<% if ( vanillaJsWidget || (typescript && typescriptMode === 'full') ) { %>,
			extensions: ['.js'<% if (typescript && typescriptMode === 'full') { %>, '.ts'<% } %><% if (vanillaJsWidget) { %>, '.svelte'<% } %>]<% } %>
		})<% if ( vanillaJsWidget ) { %>,
		babel({
			include: 'node_modules/svelte/shared.js',
			babelHelpers: 'runtime',
			babelrc: false,
			configFile: path.resolve(__dirname, '.babelrc')
		})<% } %>
	<% } %>]
};<% if ( vanillaJsWidget ) { %>

function useMountedNodePlugin() {
	return babelCore.createConfigItem(({ types: t }) => {
		return {
			visitor: {
				Identifier(path, state) {
					if (
						path.node.name === 'createElement' &&
						path.findParent(
							(path) =>
								path.isCallExpression() &&
								path.get('arguments')[0].isStringLiteral() &&
								path.get('arguments')[0].get('value').node ===
									'input'
						) &&
						path.findParent(
							(path) =>
								path.isFunctionDeclaration() &&
								path.get('id.name').node ===
									'create_main_fragment'
						)
					) {
						path.parentPath.replaceWith(
							t.memberExpression(
								t.memberExpression(
									t.identifier('component'),
									t.identifier('options')
								),
								t.identifier('elementToHandle')
							)
						);
					}
					if (
						path.node.name === 'd' &&
						path.parentPath.isObjectMethod() &&
						path.findParent(
							(path) =>
								path.isFunctionDeclaration() &&
								path.get('id.name').node ===
									'create_main_fragment'
						)
					) {
						path.parentPath
							.get('body')
							.unshiftContainer('body', [
								t.expressionStatement(
									t.callExpression(
										t.memberExpression(
											t.memberExpression(
												t.memberExpression(
													t.identifier('component'),
													t.identifier('options')
												),
												t.identifier('target')
											),
											t.identifier('appendChild')
										),
										[t.identifier('input')]
									)
								)
							]);
					}
				}
			}
		};
	});
}<% } %>
