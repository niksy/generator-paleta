import path from 'node:path';
import { deleteAsync } from 'del';
import { globby } from 'globby';
import minimist from 'minimist';
import staticSite from 'rollup-plugin-static-site';
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';<% if ( transpile ) { %>
import babel from '@rollup/plugin-babel';<% } %><% if ( !transpile && typescript && typescriptMode === 'full' ) { %>
import typescript from '@rollup/plugin-typescript';<% } %>
import atImport from 'postcss-import';
import postcssPresetEnv from 'postcss-preset-env';

const args = minimist(process.argv.slice(2), {
	'default': {
		watch: false
	}
});

const config = async () => {

	let server;

	if ( args.watch ) {
		const port = 0;
		server = serve({
			contentBase: 'test-dist',
			port: port,
			open: true
		});
	}

	await deleteAsync(['./test-dist']);

	const files = await globby(['./test/manual/**/*.<%= extension || 'js' %>', '!./test/manual/rollup.config.js']);

	const entries = files
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
				babelHelpers: 'bundled',
				exclude: 'node_modules/**'
			}),<% } %><% if ( !transpile && typescript && typescriptMode === 'full' ) { %>
			typescript({
				target: 'esnext'
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

};

export default config();
