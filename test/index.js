/* eslint-disable new-cap, quote-props */

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const writeJson = require('write-json-file');

describe('New project', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				name: 'bella'
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
			name: 'bella',
			author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com)'
		});
	});

	it('fills README.md with project data', function () {
		assert.fileContent('README.md', '# bella');
		assert.fileContent('README.md', 'npm install bella --save');
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
					name: 'minnie',
					description: 'minnie description',
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
						url: 'git+https://github.com/niksy/minnie.git'
					}
				})
					.then(done)
					.catch(( err ) => {
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
			name: 'minnie',
			description: 'minnie description',
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
				automatedTests: true,
				codeCoverage: false
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
				test: 'eslint \'{index,test/**/*}.js\' && mocha \'test/**/*.js\''
			},
			devDependencies: {
				'mocha': '^3.1.2'
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
				browserModule: true,
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
				test: 'npm run lint && npm run test:automated && npm run test:integration'
			},
			devDependencies: {
				'mocha': '^3.1.2',
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
				browserModuleType: ['jqueryModule']
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
				codeCoverage: false,
				testingInterface: 'tdd'
			})
			.toPromise();
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				test: 'eslint \'{index,test/**/*}.js\' && mocha \'test/**/*.js\' --ui tdd'
			}
		});
	});

});

describe('Styles', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: false,
				browserModule: true,
				browserModuleType: ['styles']
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
				test: 'eslint \'index.js\' && stylelint \'index.css\''
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
				name: '@sammy/ellie',
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
			bin: {
				ellie: 'cli.js'
			},
			keywords: [
				'cli',
				'cli-app'
			]
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
			'.nycrc'
		]);
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				test: 'eslint \'{index,test/**/*}.js\' && nyc mocha \'test/**/*.js\' && nyc check-coverage'
			},
			devDependencies: {
				nyc: '^8.4.0'
			}
		});
	});

});

describe('Code coverage, browser module', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				codeCoverage: true,
				browserModule: true
			})
			.toPromise();
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			devDependencies: {
				istanbul: '^0.4.3',
				'browserify-istanbul': '^2.0.0',
				'karma-coverage': '^1.0.0'
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

	it('adds coveralls entry to .nycrc', function () {
		assert.fileContent('.nycrc', '"lcov"');
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
				gitRepo: 'https://gitlab.com/niksy/otis'
			})
			.toPromise();
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			repository: {
				type: 'git',
				url: 'git+https://gitlab.com/niksy/otis.git'
			},
			bugs: {
				url: 'https://gitlab.com/niksy/otis/issues'
			},
			homepage: 'https://gitlab.com/niksy/otis#readme'
		});
	});

});

describe('Non-GitHub repository, existing project', function () {

	var tmpPkgPath = '';

	before(function () {

		return helpers.run(path.join(__dirname, '../generators/app'))
			.inTmpDir(function ( dir ) {
				var done = this.async();
				tmpPkgPath = path.join(dir, 'package.json');
				writeJson(tmpPkgPath, {
					repository: {
						type: 'git',
						url: 'git+https://gitlab.com/niksy/chester.git'
					}
				})
					.then(done)
					.catch(( err ) => {
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
			repository: {
				type: 'git',
				url: 'git+https://gitlab.com/niksy/chester.git'
			}
		});
	});

});

describe('Dashed-case package name', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				name: 'hankCharlie'
			})
			.toPromise();
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			name: 'hank-charlie'
		});
	});

});

describe('Scoped package', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				name: '@sadie/hankCharlie'
			})
			.toPromise();
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			name: '@sadie/hank-charlie',
			publishConfig: {
				access: 'public'
			}
		});
	});

});

describe('Sass module', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				browserModule: true,
				browserModuleType: ['sassModule']
			})
			.toPromise();
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			main: '_index.scss',
			style: '_index.scss',
			scripts: {
				test: 'eslint \'test/**/*.js\' && stylelint \'{_index,test/**/*}.scss\' && mocha \'test/**/*.js\''
			},
			devDependencies: {
				'sass-true': '^2.1.3'
			}
		});
	});

	it('fills .stylelintrc with correct information', function () {
		assert.JSONFileContent('.stylelintrc', {
			extends: [
				'stylelint-config-niksy/scss'
			]
		});
	});

	it('creates necesarry files', function () {
		assert.file([
			'_index.scss',
			'test/index.scss'
		]);
	});

});

describe('CSS module', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				browserModule: true,
				browserModuleType: ['cssModule']
			})
			.toPromise();
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			main: 'index.css',
			style: 'index.css'
		});
	});

});

describe('Cloud browsers', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				browserModule: true,
				cloudBrowsers: false
			})
			.toPromise();
	});

	it('adjusts Karma configuration', function () {
		assert.fileContent('karma.conf.js', 'browsers: [(process.env.TRAVIS ? \'Chrome-Travis\' : \'Chrome\')]');
	});

});

describe('Transpile', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: false,
				transpile: true
			})
			.toPromise();
	});

	it('creates necesarry files', function () {
		assert.file([
			'.babelrc',
			'.npmignore'
		]);
	});

	it('adds dist folder to .gitignore', function () {
		assert.fileContent('.gitignore', 'dist/');
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			main: 'dist/index.js',
			scripts: {
				build: 'babel \'{index,lib/**/*}.js\' --out-dir dist/',
				prepublish: 'npm run build'
			},
			devDependencies: {
				'babel-cli': '^6.18.0',
				'babel-preset-niksy': '^1.0.0'
			}
		});
	});

});

describe('Transpile, browser module', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: false,
				browserModule: true,
				transpile: true
			})
			.toPromise();
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			devDependencies: {
				'babelify': '^7.3.0'
			}
		});
	});

});

describe('Transpile, with automated tests and code coverage', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				codeCoverage: true,
				transpile: true
			})
			.toPromise();
	});

	it('fills .babelrc with correct information', function () {
		assert.JSONFileContent('.babelrc', {
			env: {
				test: {
					plugins: [
						'istanbul'
					]
				}
			}
		});
	});

	it('fills .nycrc with correct information', function () {
		assert.JSONFileContent('.nycrc', {
			sourceMap: false,
			instrument: false
		});
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			scripts: {
				test: 'BABEL_ENV=test eslint \'{index,test/**/*}.js\' && nyc mocha --compilers js:babel-register \'test/**/*.js\' && nyc check-coverage'
			},
			devDependencies: {
				'babel-register': '^6.18.0',
				'babel-plugin-istanbul': '^2.0.3'
			}
		});
	});

});

describe('Transpile, browser module, with automated tests and code coverage', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				codeCoverage: true,
				browserModule: true,
				transpile: true
			})
			.toPromise();
	});

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			devDependencies: {
				'browserify-babel-istanbul': '^0.4.0'
			}
		});
	});

});
