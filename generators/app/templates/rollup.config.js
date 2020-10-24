'use strict';<% if ( transpile ) { %>

const { default: babel } = require('@rollup/plugin-babel');<% } %><% if ( vanillaJsWidget ) { %>
const path = require('path');
const svelte = require('rollup-plugin-svelte');
const babelCore = require('@babel/core');<% } %>

module.exports = {
	input: '<% if ( complexTranspile ) { %>src/<% } %>index.js',
	output: [
		{
			file: '<% if ( useDistDirectory ) { %>dist/<% } %>index.cjs.js',
			format: 'cjs'<% if ( sourceMaps ) { %>,
			sourcemap: true<% } %>
		},
		{
			file: '<% if ( useDistDirectory ) { %>dist/<% } %>index.esm.js',
			format: 'esm'<% if ( sourceMaps ) { %>,
			sourcemap: true<% } %>
		}
	]<% if ( transpile ) { %>,
	plugins: [<% if ( vanillaJsWidget ) { %>
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
			exclude: 'node_modules/**'<% if ( vanillaJsWidget ) { %>,
			extensions: ['.js', '.svelte']<% } %>
		})<% if ( vanillaJsWidget ) { %>,
		babel({
			include: 'node_modules/svelte/shared.js',
			babelHelpers: 'runtime',
			babelrc: false,
			configFile: path.resolve(__dirname, '.babelrc')
		})<% } %>
	]<% } %>
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
