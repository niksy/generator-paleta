'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const writeJson = require('write-json-file');

describe('New project', function () {

	this.timeout(5000);

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				name: 'bella'
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file([
			'package.json',
			'.editorconfig',
			'.eslintrc',
			'.gitignore',
			'.npmrc',
			'index.js',
			'LICENSE.md',
			'README.md'
		]);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			name: 'bella',
			author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com)',
			files: [
				'index.js',
				'lib/',
				'LICENSE.md',
				'README.md'
			],
			scripts: {
				release: 'np'
			},
			devDependencies: {
				np: '^3.0.4'
			}
		});
		assert.noJsonFileContent('package.json', {
			devDependencies: {
				'eslint-plugin-react': '^7.9.1',
				'eslint-plugin-vue': '^4.5.0'
			}
		});
	});

	it('should fill .eslintrc with correct information', function () {
		assert.jsonFileContent('.eslintrc', {
			'extends': ['niksy']
		});
	});

	it('should fill README.md with project data', function () {
		assert.fileContent('README.md', '# bella');
		assert.fileContent('README.md', 'npm install bella --save');
	});

});

describe('Existing project', function () {

	let helperContext;

	before(function () {

		helperContext = helpers.run(path.join(__dirname, '../generators/app'));

		return helperContext
			.inTmpDir(function ( dir ) {
				const done = this.async();
				const tmpPkgPath = path.join(dir, 'package.json');
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
		helperContext
			.cleanTestDirectory();
	});

	it('should reuse existing package.json information', function () {
		assert.jsonFileContent('package.json', {
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

	it('should create necessary files', function () {
		assert.file([
			'test/.eslintrc',
			'test/manual',
			'test/manual/webpack.config.js'
		]);
	});

	it('should add proper data to manual test styles', function () {
		assert.fileContent('test/manual/index.css', '@import url(\'suitcss-components-test\');');
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			directories: {
				test: 'test'
			},
			scripts: {
				'test:manual': 'npm run test:generate-static-site:watch'
			},
			devDependencies: {
				'webpack': '^4.12.0',
				'del': '^2.2.0',
				'globby': '^4.1.0',
				'css-loader': '^2.1.0',
				'html-webpack-plugin': '^3.2.0',
				'mini-css-extract-plugin': '^0.5.0',
				'postcss-import': '^11.1.0',
				'postcss-loader': '^3.0.0',
				'webpack-cli': '^3.2.1',
				'webpack-dev-server': '^3.1.14'
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

	it('should create necessary files', function () {
		assert.file([
			'test/.eslintrc',
			'.travis.yml',
			'test/index.js'
		]);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				lint: 'eslint \'{index,lib/**/*,test/**/*}.js\'',
				test: 'npm run lint && mocha \'test/**/*.js\'',
				'test:watch': 'npm test -- --watch'
			},
			devDependencies: {
				'mocha': '^4.1.0',
				'eslint-plugin-mocha': '^5.1.0'
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

	it('should create necessary file', function () {
		assert.file([
			'test/fixtures/index.html',
			'test/index.js',
			'test/.webpack.js',
			'karma.conf.js'
		]);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				'test:automated': 'BABEL_ENV=test karma start',
				'test': 'npm run lint && npm run test:automated'
			},
			devDependencies: {
				'karma': '^4.0.1',
				'karma-sourcemap-loader': '^0.3.7',
				'karma-webpack': '^3.0.0',
				'karma-browserstack-launcher': '^1.0.0',
				'karma-chrome-launcher': '^2.2.0',
				'karma-html2js-preprocessor': '^1.0.0',
				'karma-fixture': '^0.2.6',
				'karma-mocha': '^1.3.0',
				'karma-mocha-reporter': '^2.2.5',
				'webpack': '^4.12.0'
			}
		});
	});

	it('should update karma.conf.js with correct information', function () {
		assert.fileContent('karma.conf.js', 'test/**/.webpack.js');
	});

	it('should add information regarding BrowserStack to README.md', function () {
		assert.fileContent('README.md', '[browserstack-img]: https://www.browserstack.com/automate/badge.svg?badge_key=<badge_key>');
	});

});

describe('Automated tests, browser module, headless browser', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				browserModule: true,
				browserTestType: 'headless'
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			devDependencies: {
				puppeteer: '^1.6.1'
			}
		});
	});

	it('should update karma.conf.js with correct information', function () {
		assert.fileContent('karma.conf.js', 'process.env.CHROME_BIN = puppeteer.executablePath();');
	});

});

describe('Integration tests', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				manualTests: true,
				browserModule: true,
				integrationTests: true
			})
			.toPromise();
	});

	it('should create necessary file', function () {
		assert.file([
			'test/manual',
			'test/manual/webpack.config.js',
			'test/integration',
			'test/integration/.eslintrc',
			'test/automated/.eslintrc',
			'wdio.conf.js'
		]);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				'test:integration': 'npm run test:generate-static-site && wdio',
				'test': 'npm run lint && npm run test:automated && npm run test:integration'
			},
			devDependencies: {
				'local-web-server': '^1.2.4',
				'wdio-browserstack-service': '^0.1.16',
				'wdio-mocha-framework': '^0.5.13',
				'wdio-spec-reporter': '^0.1.4',
				'webdriverio': '^4.12.0',
				'http-shutdown': '^1.0.3'
			}
		});
	});

	it('should update wdio.conf.js with correct information', function () {
		assert.fileContent('wdio.conf.js', 'framework: \'mocha\'');
	});

	it('should fill .babelrc with correct information', function () {
		assert.jsonFileContent('.babelrc', {
			overrides: [
				{
					test: './test/integration',
					presets: [
						['babel-preset-niksy', {
							'@babel/preset-env': {
								targets: {
									node: '4'
								}
							}
						}]
					]
				}
			]
		});
	});

});

describe('Integration tests, ES Modules', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				manualTests: true,
				browserModule: true,
				integrationTests: true,
				esModules: true
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				'test:integration': 'npm run test:generate-static-site && npx -n=--require -n=esm wdio'
			}
		});
	});

});

describe('All tests, browser module', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				manualTests: true,
				integrationTests: true,
				browserModule: true
			})
			.toPromise();
	});

	it('should create necessary file', function () {
		assert.file([
			'test/automated/.eslintrc',
			'test/automated/fixtures/index.html',
			'test/automated/index.js',
			'test/automated/.webpack.js',
			'test/manual',
			'test/integration'
		]);
	});

	it('should update karma.conf.js with correct information', function () {
		assert.fileContent('karma.conf.js', 'test/automated/**/.webpack.js');
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

	it('should create necessary files', function () {
		assert.file(['.browserslistrc']);
	});

	it('should add information regarding browser support to README.md', function () {
		assert.fileContent('README.md', '## Browser support');
	});

	it('should fill .eslintrc with correct information', function () {
		assert.jsonFileContent('.eslintrc', {
			'extends': [
				'niksy',
				'niksy/browser'
			],
			'overrides': [
				{
					files: ['karma.conf.js'],
					env: {
						node: true
					}
				}
			]
		});
	});

	it('should fill .browserslistrc with correct information', function () {
		assert.fileContent('.browserslistrc', 'last 2 versions\nie >= 9');
	});

});

describe('jQuery module', function () { // eslint-disable-line mocha/valid-suite-description

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				browserModule: true,
				browserModuleType: ['jqueryModule']
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
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

	it('should create necessary files', function () {
		assert.file(['.stylelintrc']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			style: 'index.css',
			scripts: {
				lint: 'eslint \'{index,lib/**/*}.js\' && stylelint \'index.css\'',
				test: 'npm run lint'
			},
			devDependencies: {
				'stylelint': '^9.2.1',
				'stylelint-config-niksy': '^5.1.1'
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

	it('should create necessary file', function () {
		assert.file(['cli.js']);
	});

	it('should add global install instruction to README.md', function () {
		assert.fileContent('README.md', 'npm install -g @sammy/ellie');
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			bin: {
				ellie: 'cli.js'
			},
			scripts: {
				lint: 'eslint \'{index,lib/**/*,cli,test/**/*}.js\'',
				test: 'npm run lint && nyc mocha \'test/**/*.js\' $([[ $WATCH_TEST ]] && echo --watch) && nyc check-coverage',
				'test:watch': 'WATCH_TEST=1 npm test'
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

	it('should create necessary file', function () {
		assert.file(['.nycrc']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				lint: 'eslint \'{index,lib/**/*,test/**/*}.js\'',
				test: 'npm run lint && nyc mocha \'test/**/*.js\' $([[ $WATCH_TEST ]] && echo --watch) && nyc check-coverage',
				'test:watch': 'WATCH_TEST=1 npm test'
			},
			devDependencies: {
				nyc: '^12.0.2'
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

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			devDependencies: {
				'istanbul-instrumenter-loader': '^3.0.1',
				'karma-coverage-istanbul-reporter': '^2.0.1'
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

	it('should add coverage entry to .travis.yml', function () {
		assert.fileContent('.travis.yml', 'npm run posttest:ci');
	});

	it('should add coverage entry to .nycrc', function () {
		assert.fileContent('.nycrc', '"lcov"');
	});

	it('should add coverage entry to README.md', function () {
		assert.fileContent('README.md', '[coverage]');
		assert.fileContent('README.md', '[coverage-img]');
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
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

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
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

	let helperContext;

	before(function () {

		helperContext = helpers.run(path.join(__dirname, '../generators/app'));

		return helperContext
			.inTmpDir(function ( dir ) {
				const done = this.async();
				const tmpPkgPath = path.join(dir, 'package.json');
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
		helperContext
			.cleanTestDirectory();
	});

	it('should reuse existing package.json information', function () {
		assert.jsonFileContent('package.json', {
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

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
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

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
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

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			main: '_index.scss',
			style: '_index.scss',
			scripts: {
				lint: 'eslint \'test/**/*.js\' && stylelint \'{_index,test/**/*}.scss\'',
				test: 'npm run lint && mocha \'test/**/*.js\'',
				'test:watch': 'npm test -- --watch'
			},
			devDependencies: {
				'sass-true': '^2.1.3'
			}
		});
	});

	it('should fill .stylelintrc with correct information', function () {
		assert.jsonFileContent('.stylelintrc', {
			'extends': [
				'stylelint-config-niksy',
				'stylelint-config-niksy/scss'
			]
		});
	});

	it('should create necessary files', function () {
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

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
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

	it('should adjust Karma configuration', function () {
		assert.fileContent('karma.conf.js', 'browsers: [(!local ? \'Chrome-CI\' : \'Chrome\')]');
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

	it('should create necessary files', function () {
		assert.file(['.babelrc']);
	});

	it('should add dist folder to .gitignore', function () {
		assert.fileContent('.gitignore', 'dist/');
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			main: 'dist/index.js',
			files: [
				'dist/index.js',
				'dist/',
				'LICENSE.md',
				'README.md'
			],
			scripts: {
				build: 'babel \'{index,lib/**/*}.js\' --out-dir dist/',
				prepublishOnly: 'npm run build'
			},
			devDependencies: {
				'@babel/cli': '^7.2.3',
				'babel-preset-niksy': '^4.1.0'
			}
		});
	});

	it('should fill .babelrc with correct information', function () {
		assert.jsonFileContent('.babelrc', {
			presets: [
				['babel-preset-niksy', {
					'@babel/preset-env': {
						targets: {
							node: '4'
						}
					}
				}]
			]
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

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			devDependencies: {
				'@babel/core': '^7.2.2',
				'babel-loader': '^8.0.4',
				'webpack': '^4.12.0'
			}
		});
	});

	it('should fill .babelrc with correct information', function () {
		assert.jsonFileContent('.babelrc', {
			presets: [
				'babel-preset-niksy'
			]
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

	it('should fill .babelrc with correct information', function () {
		assert.jsonFileContent('.babelrc', {
			env: {
				test: {
					plugins: ['babel-plugin-istanbul']
				}
			}
		});
	});

	it('should fill .nycrc with correct information', function () {
		assert.jsonFileContent('.nycrc', {
			sourceMap: false,
			instrument: false
		});
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				lint: 'eslint \'{index,lib/**/*,test/**/*}.js\'',
				test: 'npm run lint && BABEL_ENV=test nyc mocha --require @babel/register \'test/**/*.js\' $([[ $WATCH_TEST ]] && echo --watch) && nyc check-coverage',
				'test:watch': 'WATCH_TEST=1 npm test'
			},
			devDependencies: {
				'@babel/register': '^7.0.0',
				'babel-plugin-istanbul': '^5.1.0'
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

	it('should fill .babelrc with correct information', function () {
		assert.jsonFileContent('.babelrc', {
			plugins: [
				'@babel/plugin-transform-object-assign'
			]
		});
	});

	it('should add proper data to karma.conf.js', function () {
		assert.fileContent('karma.conf.js', 'babel-loader');
		assert.fileContent('karma.conf.js', 'istanbul-instrumenter-loader');
	});

});

describe('Transpile, complex', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				transpile: true,
				complexTranspile: true
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['src/index.js']);
	});

	it('should add proper data to .gitignore', function () {
		assert.fileContent('.gitignore', 'index.js');
		assert.fileContent('.gitignore', 'lib/*');
		assert.fileContent('.gitignore', '!src/*');
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			main: 'index.js',
			scripts: {
				build: 'babel src --out-dir ./'
			}
		});
	});

});

describe('ES Modules', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				esModules: true
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file([
			'index.js',
			'rollup.config.js'
		]);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			main: 'index.cjs.js',
			module: 'index.esm.js',
			sideEffects: false,
			files: [
				'index.cjs.js',
				'index.esm.js'
			],
			scripts: {
				build: 'rollup --config rollup.config.js'
			},
			devDependencies: {
				rollup: '^1.0.0'
			}
		});
	});

	it('should add proper data to .gitignore', function () {
		assert.fileContent('.gitignore', 'index.cjs.js');
		assert.fileContent('.gitignore', 'index.esm.js');
	});

});

describe('ES Modules, transpile', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				esModules: true,
				transpile: true,
				complexTranspile: false
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['.babelrc']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			files: [
				'index.cjs.js',
				'index.esm.js'
			],
			devDependencies: {
				'rollup-plugin-babel': '^4.2.0'
			}
		});
	});

});

describe('ES Modules, transpile, complex', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				esModules: true,
				transpile: true,
				complexTranspile: true
			})
			.toPromise();
	});

	it('should add proper data to .gitignore', function () {
		assert.fileContent('.gitignore', 'index.cjs.js');
		assert.fileContent('.gitignore', 'index.esm.js');
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			files: [
				'index.cjs.js',
				'index.esm.js'
			]
		});
	});

});

describe('ES Modules, automated tests', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				esModules: true,
				automatedTests: true,
				codeCoverage: false,
				nodeEngineVersion: 8
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				lint: 'eslint \'{index,lib/**/*,test/**/*}.js\'',
				test: 'npm run lint && mocha --require esm \'test/**/*.js\'',
				'test:watch': 'npm test -- --watch'
			},
			devDependencies: {
				esm: '^3.0.51'
			}
		});
	});

});

describe('ES Modules, automated tests, code coverage, transpile', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				esModules: true,
				automatedTests: true,
				codeCoverage: true,
				transpile: true,
				nodeEngineVersion: 8
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				lint: 'eslint \'{index,lib/**/*,test/**/*}.js\'',
				test: 'npm run lint && BABEL_ENV=test nyc mocha --require @babel/register --require esm \'test/**/*.js\' $([[ $WATCH_TEST ]] && echo --watch) && nyc check-coverage',
				'test:watch': 'WATCH_TEST=1 npm test'
			},
			devDependencies: {
				esm: '^3.0.51'
			}
		});
	});

	it('should fill .babelrc with correct information', function () {
		assert.jsonFileContent('.babelrc', {
			presets: [
				'babel-preset-niksy/next',
				['babel-preset-niksy', {
					'@babel/preset-env': {
						targets: {
							node: '8'
						}
					}
				}]
			]
		});
	});

});

describe('Node engine version', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				nodeEngineVersion: 8
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			engines: {
				node: '>=8'
			}
		});
	});

	it('should properly fill .travis.yml engine infromation', function () {
		assert.fileContent('.travis.yml', '- \'8\'');
	});

});

describe('Changelog', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				changelog: true
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			files: [
				'index.js',
				'lib/',
				'CHANGELOG.md'
			],
			devDependencies: {
				'version-changelog': '^3.1.1',
				'changelog-verify': '^1.1.2'
			}
		});
	});

	it('should create necessary files', function () {
		assert.file([
			'CHANGELOG.md'
		]);
	});

});

describe('Changelog, GitHub Release', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				changelog: true,
				githubRelease: true
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				postpublish: 'GITHUB_TOKEN=$GITHUB_RELEASE_TOKEN github-release-from-changelog'
			},
			devDependencies: {
				'github-release-from-changelog': '^1.3.2'
			}
		});
	});

});

describe('Bundling tool, Rollup, automated tests', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				automatedTests: true,
				browserModule: true,
				esModules: true,
				bundlingTool: 'rollup'
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			devDependencies: {
				'rollup': '^1.0.0',
				'rollup-plugin-babel': '^4.2.0',
				'rollup-plugin-node-resolve': '^4.0.0',
				'rollup-plugin-commonjs': '^9.2.0',
				'rollup-plugin-node-builtins': '^2.1.2',
				'rollup-plugin-node-globals': '^1.4.0',
				'rollup-plugin-istanbul': '^2.0.1',
				'karma-rollup-preprocessor': '^7.0.0'
			}
		});
	});

	it('should update karma.conf.js with correct information', function () {
		assert.fileContent('karma.conf.js', 'rollupPreprocessor');
	});

});

describe('Bundling tool, Rollup, manual tests', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				manualTests: true,
				browserModule: true,
				esModules: true,
				bundlingTool: 'rollup'
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file([
			'test/manual/rollup.config.js'
		]);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			devDependencies: {
				'rollup': '^1.0.0',
				'rollup-plugin-postcss': '^1.6.3',
				'rollup-plugin-serve': '^0.6.1',
				'rollup-plugin-static-site': '0.0.3'
			}
		});
	});

});

describe('Sourcemaps', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				esModules: true,
				sourceMaps: true
			})
			.toPromise();
	});

	it('should fill .gitignore with correct information', function () {
		assert.fileContent('.gitignore', 'index.cjs.js');
		assert.fileContent('.gitignore', 'index.cjs.js.map');
		assert.fileContent('.gitignore', 'index.esm.js');
		assert.fileContent('.gitignore', 'index.esm.js.map');
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			files: [
				'index.cjs.{js,js.map}',
				'index.esm.{js,js.map}'
			]
		});
	});

});

describe('Prettier', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				prettier: true
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file([
			'.prettierrc'
		]);
	});

});
