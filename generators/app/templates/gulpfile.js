'use strict';

const path = require('path');
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const gutil = require('gulp-util');
const debug = require('gulp-debug');
const nunjucks = require('gulp-nunjucks-render');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');<% if ( transpile ) { %>
const babelify = require('babelify');<% } %>
const del = require('del');
const ws = require('local-web-server');
const opn = require('opn');
const minimist = require('minimist');
const globby = require('globby');
const es = require('event-stream');

const args = minimist(process.argv.slice(2), {
	'default': {
		watch: false,
		port: 9000
	}
});
const watch = args.watch;
const port = args.port;

function handleError ( msg ) {
	gutil.log(gutil.colors.red(msg.message));
	this.emit('end');
}

gulp.task('test:cleanup', () => {
	return del([
		'./test-dist'
	]);
});

gulp.task('test:markup', ['test:cleanup'], () => {
	function bundle () {
		return gulp.src('./test/manual/suite/**/*.html')
				.pipe(plumber(handleError))
				.pipe(nunjucks())
				.pipe(plumber.stop())
				.pipe(gulp.dest('./test-dist'))
				.pipe(debug({ title: 'Markup:' }));
	}
	if ( watch ) {
		gulp.watch(['./test/manual/suite/**/*.html'], bundle);
	}
	return bundle();
});

gulp.task('test:style', ['test:cleanup'], () => {
	function bundle () {
		return gulp.src('./test/manual/suite/**/*.css')
				.pipe(plumber(handleError))
				.pipe(sourcemaps.init({
					loadMaps: true
				}))
				// Tasks
				.pipe(sourcemaps.write())
				.pipe(plumber.stop())
				.pipe(gulp.dest('./test-dist'))
				.pipe(debug({ title: 'Style:' }));
	}
	if ( watch ) {
		gulp.watch(['./test/manual/suite/**/*.css'], bundle);
	}
	return bundle();
});

gulp.task('test:script', ['test:cleanup'], ( done ) => {

	globby(['./test/manual/suite/**/*.js'])
		.then(( files ) => {

			function task ( file ) {

				const b = browserify({
					entries: [file],
					debug: true,
					cache: {},
					packageCache: {}
				});<% if ( transpile ) { %>
				b.transform(babelify);<% } %>
				if ( watch ) {
					b.plugin(watchify);
				}

				function bundle () {
					return b.bundle()
						.on('error', handleError)
						.pipe(plumber(handleError))
						.pipe(source(path.basename(file)))
						.pipe(buffer())
						.pipe(sourcemaps.init({
							loadMaps: true
						}))
						.pipe(sourcemaps.write())
						.pipe(plumber.stop())
						.pipe(gulp.dest(path.join('./test-dist', path.dirname(file).split(path.sep).pop())));
				}

				if ( watch ) {
					b.on('update', () => {
						bundle()
							.pipe(debug({ title: 'Script:' }));
					});
					b.on('log', gutil.log);
				}

				return bundle();

			}

			if ( files.length ) {
				es.merge(files.map(task))
					.pipe(debug({ title: 'Script:' }))
					.on('data', () => {})
					.on('end', done);
			} else {
				done();
			}

			return files;

		})
		.catch(( err ) => {
			done(err);
		});

});

gulp.task('test:assets', ['test:cleanup'], () => {
	function bundle () {
		return gulp.src('./test/manual/assets/**/*')
				.pipe(gulp.dest('./test-dist/assets'))
				.pipe(debug({ title: 'Assets:' }));
	}
	if ( watch ) {
		gulp.watch(['./test/manual/assets/**/*'], bundle);
	}
	return bundle();
});

gulp.task('test:prepare', ['test:cleanup', 'test:markup', 'test:style', 'test:script', 'test:assets']);

gulp.task('test:local:manual', ['test:prepare'], () => {
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
});
