/* eslint-disable new-cap, quote-props */

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var writeJson = require('write-json-file');
var readJson = require('load-json-file');

describe('new project', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				name: 'foo'
			})
			.toPromise();
	});

	it('creates files', function () {
		assert.file([
			'package.json',
			'.editorconfig',
			'.eslintrc',
			'.gitignore',
			'index.js',
			'LICENSE.md',
			'README.md'
		]);
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			name: 'foo',
			author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com/)'
		});
	});

	it('fills the README with project data', function () {
		assert.fileContent('README.md', '# foo');
		assert.fileContent('README.md', 'npm install foo --save');
	});

	it('uses correct property order for package.json properties', function () {

		return Promise.all([
			readJson('package.json'),
			readJson(path.join(__dirname, 'fixtures/new-project-package.json'))
		])
			.then(function ( files ) {
				var content = files.map(function ( file ) {
					return JSON.stringify(file);
				});
				return assert.textEqual(content[0], content[1]);
			});

	});

});

describe('existing project', function () {

	var tmpPkgPath = '';

	before(function () {

		return helpers.run(path.join(__dirname, '../generators/app'))
			.inTmpDir(function ( dir ) {
				var done = this.async();
				tmpPkgPath = path.join(dir, 'package.json');
				writeJson(tmpPkgPath, {
					name: 'bar',
					description: 'bar description',
					main: 'index.js',
					version: '1.0.0',
					dependencies: {
						e: 3,
						a: 1,
						g: 4,
						c: 2
					},
					keywords: [
						'a',
						'c',
						'b'
					]
				})
					.then(done)
					.catch(function ( err ) {
						done(err);
					});
			})
			.withOptions({ force: true })
			.toPromise();

	});

	after(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.cleanTestDirectory();
	});

	it('reuses existing package.json information', function () {
		assert.JSONFileContent('package.json', {
			name: 'bar',
			description: 'bar description',
			author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com/)'
		});
	});

	it('uses correct property order for package.json properties', function () {

		return Promise.all([
			readJson(tmpPkgPath),
			readJson(path.join(__dirname, 'fixtures/existing-project-package.json'))
		])
			.then(function ( files ) {
				var content = files.map(function ( file ) {
					return JSON.stringify(file);
				});
				return assert.textEqual(content[0], content[1]);
			});

	});

});

describe('package.json "keywords" property', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				keywords: '1,1,2,3,1,1,5,5,5,6'
			})
			.toPromise();
	});

	it('unique values sorted alphabetically', function () {
		assert.JSONFileContent('package.json', {
			keywords: ['1', '2', '3', '5', '6']
		});
	});

});

describe('manual tests', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				manualTests: true
			})
			.toPromise();
	});

	it('creates files', function () {
		assert.file([
			'test/.eslintrc',
			'test/manual',
			'gulpfile.js'
		]);
	});

	it('package.json', function () {
		assert.JSONFileContent('package.json', {
			directories: {
				test: 'test'
			},
			scripts: {
				'test:manual:local': 'gulp test:local:manual --watch'
			},
			devDependencies: {
				'browserify': '^13.0.1',
				'del': '^2.2.0',
				'event-stream': '^3.3.2',
				'globby': '^4.1.0',
				'gulp': '^3.9.1',
				'gulp-debug': '^2.1.2',
				'gulp-nunjucks-render': '^2.0.0',
				'gulp-plumber': '^1.1.0',
				'gulp-sourcemaps': '^1.6.0',
				'gulp-util': '^3.0.7',
				'minimist': '^1.2.0',
				'vinyl-buffer': '^1.0.0',
				'vinyl-source-stream': '^1.1.0',
				'local-web-server': '^1.2.4',
				'watchify': '^3.7.0',
				'opn': '^4.0.2'
			}
		});
	});

});

describe('automated tests', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true
			})
			.toPromise();
	});

	it('creates files', function () {
		assert.file([
			'test/.eslintrc',
			'.travis.yml',
			'test/index.js'
		]);
	});

	it('package.json', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				test: 'eslint {index,test/**/*}.js && mocha test/**/*.js'
			},
			devDependencies: {
				'mocha': '^2.4.5'
			}
		});
	});

});

describe('automated tests, browser module', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				browserModule: true
			})
			.toPromise();
	});

	it('creates files', function () {
		assert.file([
			'test/automated',
			'karma.conf.js'
		]);
	});

	it('package.json', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				'test:automated': 'karma start',
				'test:automated:local': 'karma start --browsers Chrome',
				test: 'npm run lint && npm run test:automated'
			},
			devDependencies: {
				'karma': '^0.13.22',
				'karma-browserify': '^5.0.5',
				'karma-browserstack-launcher': '^1.0.0',
				'karma-chrome-launcher': '^1.0.1',
				'karma-html2js-preprocessor': '^1.0.0',
				'karma-mocha': '^1.0.1',
				'karma-mocha-reporter': '^2.0.3'
			}
		});
	});

	it('karma.conf.js', function () {
		assert.fileContent('karma.conf.js', 'ui: \'bdd\'');
	});

});

describe('integration tests', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				integrationTests: true
			})
			.toPromise();
	});

	it('creates files', function () {
		assert.file([
			'test/manual',
			'gulpfile.js',
			'test/integration',
			'wdio.conf.js'
		]);
	});

	it('package.json', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				'test:integration': 'gulp test:prepare && wdio',
				test: 'npm run lint && npm run test:integration'
			},
			devDependencies: {
				'mocha': '^2.4.5',
				'browserify': '^13.0.1',
				'del': '^2.2.0',
				'event-stream': '^3.3.2',
				'globby': '^4.1.0',
				'gulp': '^3.9.1',
				'gulp-debug': '^2.1.2',
				'gulp-nunjucks-render': '^2.0.0',
				'gulp-plumber': '^1.1.0',
				'gulp-sourcemaps': '^1.6.0',
				'gulp-util': '^3.0.7',
				'minimist': '^1.2.0',
				'vinyl-buffer': '^1.0.0',
				'vinyl-source-stream': '^1.1.0',
				'local-web-server': '^1.2.4',
				'watchify': '^3.7.0',
				'browserstacktunnel-wrapper': '^1.4.2',
				'wdio-mocha-framework': '^0.2.13',
				'wdio-spec-reporter': 'kevinlambert/wdio-spec-reporter#release',
				'webdriverio': '^4.0.9',
				'http-shutdown': '^1.0.3'
			}
		});
	});

	it('wdio.conf.js', function () {
		assert.fileContent('wdio.conf.js', 'ui: \'bdd\'');
	});

});

describe('browser module', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				browserModule: true
			})
			.toPromise();
	});

	it('README.md contains information regarding browser support', function () {
		assert.fileContent('README.md', '## Browser support');
	});

});

describe('jQuery module', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				browserModule: true,
				jqueryModule: true
			})
			.toPromise();
	});

	it('package.json', function () {
		assert.JSONFileContent('package.json', {
			dependencies: {
				jquery: '^1.12.4'
			},
			keywords: [
				'ecosystem:jquery',
				'jquery-plugin'
			]
		});
	});

});

describe('testing interface', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				testingInterface: 'tdd'
			})
			.toPromise();
	});

	it('package.json', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				test: 'eslint {index,test/**/*}.js && mocha test/**/*.js --ui tdd'
			}
		});
	});

});
