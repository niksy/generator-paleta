/* eslint-disable new-cap, quote-props */

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var writeJson = require('write-json-file');

describe('New project', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				name: 'foo'
			})
			.toPromise();
	});

	it('creates necessary files', function () {
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
			author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com)'
		});
	});

	it('fills README.md with project data', function () {
		assert.fileContent('README.md', '# foo');
		assert.fileContent('README.md', 'npm install foo --save');
	});

});

describe('Existing project', function () {

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
					],
					repository: {
						type: 'git',
						url: 'git+https://github.com/niksy/bar.git'
					}
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
			author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com)'
		});
	});

});

describe('Manual tests', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				manualTests: true
			})
			.toPromise();
	});

	it('creates necessary files', function () {
		assert.file([
			'test/.eslintrc',
			'test/manual',
			'gulpfile.js'
		]);
	});

	it('fills package.json with correct information', function () {
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

describe('Automated tests', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true
			})
			.toPromise();
	});

	it('creates necessary files', function () {
		assert.file([
			'test/.eslintrc',
			'.travis.yml',
			'test/index.js'
		]);
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				test: 'eslint {index,test/**/*}.js && mocha test/**/*.js'
			},
			devDependencies: {
				'mocha': '^2.5.3'
			}
		});
	});

});

describe('Automated tests, browser module', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				browserModule: true
			})
			.toPromise();
	});

	it('creates necessary files', function () {
		assert.file([
			'test/automated',
			'karma.conf.js'
		]);
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				'test:automated': 'karma start',
				'test:automated:local': 'karma start --browsers Chrome',
				test: 'npm run lint && npm run test:automated'
			},
			devDependencies: {
				'karma': '^1.1.0',
				'karma-browserify': '^5.0.5',
				'karma-browserstack-launcher': '^1.0.0',
				'karma-chrome-launcher': '^1.0.1',
				'karma-html2js-preprocessor': '^1.0.0',
				'karma-mocha': '~1.0.1',
				'karma-mocha-reporter': '^2.0.3'
			}
		});
	});

	it('should update karma.conf.js with correct information', function () {
		assert.fileContent('karma.conf.js', 'ui: \'bdd\'');
	});

});

describe('Integration tests', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				integrationTests: true
			})
			.toPromise();
	});

	it('creates necessary files', function () {
		assert.file([
			'test/manual',
			'gulpfile.js',
			'test/integration',
			'test/integration/.eslintrc',
			'wdio.conf.js'
		]);
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				'test:integration': 'gulp test:prepare && wdio',
				test: 'npm run lint && npm run test:integration'
			},
			devDependencies: {
				'mocha': '^2.5.3',
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
				'wdio-spec-reporter': '^0.0.2',
				'webdriverio': '^4.0.9',
				'http-shutdown': '^1.0.3'
			}
		});
	});

	it('should update wdio.conf.js with correct information', function () {
		assert.fileContent('wdio.conf.js', 'ui: \'bdd\'');
	});

});

describe('Browser module', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				browserModule: true
			})
			.toPromise();
	});

	it('should add information regarding browser support to README.md', function () {
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

	it('fills package.json with correct information', function () {
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

describe('Testing interface', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				testingInterface: 'tdd'
			})
			.toPromise();
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				test: 'eslint {index,test/**/*}.js && mocha test/**/*.js --ui tdd'
			}
		});
	});

});

describe('Styles', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				browserModule: true,
				styles: true
			})
			.toPromise();
	});

	it('creates necesarry files', function () {
		assert.file([
			'.stylelintrc'
		]);
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			style: 'index.css',
			scripts: {
				test: 'eslint index.js && stylelint index.css'
			},
			devDependencies: {
				stylelint: '^7.0.3',
				'stylelint-config-niksy': '^3.0.1'
			}
		});
	});

});

describe('CLI', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				cli: true
			})
			.toPromise();
	});

	it('creates necessary files', function () {
		assert.file([
			'cli.js'
		]);
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			bin: 'cli.js'
		});
	});

});

describe('Code coverage', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				codeCoverage: true
			})
			.toPromise();
	});

	it('creates necessary files', function () {
		assert.file([
			'.istanbul.yml'
		]);
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				test: 'eslint {index,test/**/*}.js && istanbul cover _mocha test/**/*.js && istanbul check-coverage'
			},
			devDependencies: {
				istanbul: '^0.4.3'
			}
		});
	});

});

describe('Code coverage service', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				codeCoverage: true,
				codeCoverageService: true
			})
			.toPromise();
	});

	it('adds coveralls entry to .travis.yml', function () {
		assert.fileContent('.travis.yml', 'npm run posttest:ci');
	});

	it('adds coveralls entry to .istanbul.yml', function () {
		assert.fileContent('.istanbul.yml', '- lcov');
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				'posttest:ci': 'cat ./coverage/lcov.info | coveralls'
			},
			devDependencies: {
				coveralls: '^2.11.11'
			}
		});
	});

});

describe('Non-GitHub repository', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				gitRepo: 'https://gitlab.com/niksy/bar'
			})
			.toPromise();
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			repository: {
				type: 'git',
				url: 'git+https://gitlab.com/niksy/bar.git'
			},
			bugs: {
				url: 'https://gitlab.com/niksy/bar/issues'
			},
			homepage: 'https://gitlab.com/niksy/bar#readme'
		});
	});

});
