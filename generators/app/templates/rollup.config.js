'use strict';<% if ( transpile ) { %>

const { default: babel } = require('@rollup/plugin-babel');<% } %><% if ( vanillaJsWidget ) { %>
const path = require('path');
const svelte = require('rollup-plugin-svelte');
const babelCore = require('@babel/core');<% } %>
const path = require('path');
const { promises: fs } = require('fs');

module.exports = {
	input: '<% if ( complexTranspile ) { %>src/<% } %>index.js',
	output: [
		{
			file: 'cjs/index.js',
			format: 'cjs',
			exports: 'auto'<% if ( sourceMaps ) { %>,
			sourcemap: true<% } %>,
		},
		{
			file: 'esm/index.js',
			format: 'esm'<% if ( sourceMaps ) { %>,
			sourcemap: true<% } %>
		}
	],
	plugins: [(() => {
		return {
			name: 'package-type',
			async writeBundle (output) {
				let prefix;
				let type;
				if ( output.file.includes('cjs/') ) {
					prefix = 'cjs';
					type = 'commonjs';
				} else if ( output.file.includes('esm/') ) {
					prefix = 'esm';
					type = 'module';
				}
				if ( typeof prefix !== 'undefined' ) {
					const pkg = path.join(prefix, 'package.json');
					try {
						await fs.unlink(pkg);
					} catch (error) {}
					await fs.writeFile(pkg, JSON.stringify({ type }), 'utf8');
				}
			}
		}
	})(),<% if ( transpile ) { %><% if ( vanillaJsWidget ) { %>
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
		},<% } %>
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**'<% if ( vanillaJsWidget ) { %>,
			extensions: ['.js', '.svelte']<% } %>
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
