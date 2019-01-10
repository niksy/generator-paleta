'use strict';

const path = require('path');
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const fancyLog = require('fancy-log');
const colors = require('ansi-colors');
const debug = require('gulp-debug');
const nunjucks = require('gulp-nunjucks-render');<% if ( bundlingTool === 'webpack' ) { %>
const webpack = require('webpack');<% } %><% if ( bundlingTool === 'rollup' ) { %>
const rollup = require('rollup');<% if ( transpile ) { %>
const babel = require('rollup-plugin-babel');<% } %><% } %>
const del = require('del');
const ws = require('local-web-server');
const opn = require('opn');
const minimist = require('minimist');
const globby = require('globby');
const postcss = require('gulp-postcss');
const atImport = require('postcss-import');

const args = minimist(process.argv.slice(2), {
	'default': {
		watch: false
	}
});
const watch = args.watch;
const port = 9000;

function handleError ( msg ) {
	fancyLog(colors.red(msg.message));
	this.emit('end');
}

function testCleanup () {
	return del([
		'./test-dist'
	]);
}

function testMarkup () {
	function bundle () {
		return gulp.src('./test/manual/**/*.html')
			.pipe(plumber(handleError))
			.pipe(nunjucks())
			.pipe(plumber.stop())
			.pipe(gulp.dest('./test-dist'))
			.pipe(debug({ title: 'Markup:' }));
	}
	if ( watch ) {
		gulp.watch(['./test/manual/**/*.html'], bundle);
	}
	return bundle();
}

function testStyle () {
	function bundle () {
		return gulp.src('./test/manual/**/*.css')
			.pipe(plumber(handleError))
			.pipe(sourcemaps.init({
				loadMaps: true
			}))
			.pipe(postcss([
				atImport()
			]))
			// Tasks
			.pipe(sourcemaps.write())
			.pipe(plumber.stop())
			.pipe(gulp.dest('./test-dist'))
			.pipe(debug({ title: 'Style:' }));
	}
	if ( watch ) {
		gulp.watch(['./test/manual/**/*.css'], bundle);
	}
	return bundle();
}

function testScript () {

	return globby(['./test/manual/**/*.js'])
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
		.then(( entries ) => {<% if ( bundlingTool === 'webpack' ) { %>

			const compiler = webpack({
				entry: entries,
				output: {
					filename: '[name].js',
					path: path.resolve(__dirname, './test-dist')
				},
				mode: 'none',
				devtool: 'cheap-module-inline-source-map'<% if ( transpile ) { %>,
				module: {
					rules: [
						{
							test: /\.js$/,
							exclude: /node_modules/,
							use: [{
								loader: 'babel-loader'
							}]
						}
					]
				}<% } %>
			});

			return new Promise(( resolve, reject ) => {

				function cb ( err, stats ) {
					if ( err ) {
						return reject(err);
					}
					fancyLog(stats.toString({
						colors: true
					}));
					return resolve();
				}

				if ( watch ) {
					compiler.watch({}, cb);
				} else {
					compiler.run(cb);
				}

			});<% } %><% if ( bundlingTool === 'rollup' ) { %>

			const inputOptions = {
				input: entries<% if ( transpile ) { %>,
				plugins: [
					babel({
						exclude: 'node_modules/**'
					})
				]<% } %>
			};

			const outputOptions = {
				entryFileNames: '[name].js'
				dir: path.resolve(__dirname, './test-dist'),
				format: 'iife',
				name: '<%= camelCasedModuleName %>'
				sourceMap: 'inline'
			};

			if ( watch ) {
				rollup.watch(Object.assign({}, inputOptions, {
					output: outputOptions
				}));
				return Promise.resolve();
			} else {
				return rollup.rollup(inputOptions)
					.then(( bundle ) => {
						return bundle.write(outputOptions);
					});
			}<% } %>

		});

}

function testAssets () {
	function bundle () {
		return gulp.src('./test/manual/assets/**/*')
			.pipe(gulp.dest('./test-dist/assets'))
			.pipe(debug({ title: 'Assets:' }));
	}
	if ( watch ) {
		gulp.watch(['./test/manual/assets/**/*'], bundle);
	}
	return bundle();
}

const testPrepare = gulp.parallel(testMarkup, testStyle, testScript, testAssets);

function testLocalManual () {
	if ( watch ) {
		ws({
			'static': {
				root: './test-dist'
			},
			serveIndex: {
				path: './test-dist'
			}
		}).listen(port);
		opn(`http://localhost:${port}`);
	}
}

module.exports['test:cleanup'] = testCleanup;
module.exports['test:markup'] = gulp.series(testCleanup, testMarkup);
module.exports['test:style'] = gulp.series(testCleanup, testStyle);
module.exports['test:script'] = gulp.series(testCleanup, testScript);
module.exports['test:assets'] = gulp.series(testCleanup, testAssets);
module.exports['test:prepare'] = gulp.series(testCleanup, testPrepare);
module.exports['test:local:manual'] = gulp.series(testCleanup, testPrepare, testLocalManual);
