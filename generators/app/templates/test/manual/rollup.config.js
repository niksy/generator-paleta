'use strict';

const path = require('path');
const del = require('del');
const globby = require('globby');
const minimist = require('minimist');
const staticSite = require('rollup-plugin-static-site');
const postcss = require('rollup-plugin-postcss');
const serve = require('rollup-plugin-serve');<% if ( transpile ) { %>
const babel = require('rollup-plugin-babel');<% } %>
const atImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');

const args = minimist(process.argv.slice(2), {
	'default': {
		watch: false
	}
});

let server;

if ( args.watch ) {
	server = serve({
		contentBase: 'test-dist',
		port: 9000,
		open: true
	});
}

const config = () => {

	return del(['./test-dist'])
		.then(() => globby(['./test/manual/**/*.js', '!./test/manual/rollup.config.js']))
		.then(( files ) => {
			return files
				.map(( file ) => {
					const extname = path.extname(file);
					const key = path.basename(file, extname);
					const obj = {};
					obj[`${file.replace('./test/manual/', '').replace(path.basename(file), '')}${key}`] = file;
					return obj;
				})
				.reduce(( prev, next ) => {
					return Object.assign(prev, next);
				}, {});
		})
		.then(( entries ) => {

			return Object.keys(entries).map(( key ) => ({
				input: entries[key],
				output: {
					file: `test-dist/${key}.js`,
					format: 'iife',
					name: '<%= camelCasedModuleName %>',
					sourcemap: 'inline'
				},
				plugins: [<% if ( transpile ) { %>
					babel({
						exclude: 'node_modules/**'
					}),<% } %>
					postcss({
						extract: true,
						sourceMap: 'inline',
						plugins: [
							atImport(),
							postcssPresetEnv()
						],
						bundle: `${key}.css`
					}),
					staticSite({
						dir: 'test-dist',
						title: key,
						filename: `${key}.html`,
						css: `test-dist/${key}.css`,
						template: {
							path: `./test/manual/${key}.html`
						}
					}),
					args.watch && server
				]
			}));

		});

};

module.exports = config();
