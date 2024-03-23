import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import { writeJsonFile } from 'write-json-file';

const generatorPath = fileURLToPath(
	new URL('../generators/app/index.js', import.meta.url)
);

describe('New project', function () {
	this.timeout(5000);

	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				name: 'bella',
				esModules: false,
				changelog: false
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
			'.huskyrc',
			'.lintstagedrc',
			'index.js',
			'LICENSE.md',
			'README.md'
		]);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			name: 'bella',
			author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com)',
			files: ['index.js', 'lib/', 'LICENSE.md', 'README.md'],
			scripts: {
				release: 'np --no-release-draft',
				prerelease: 'npm run lint'
			},
			devDependencies: {
				np: '^7.6.0'
			}
		});
	});

	it('should fill .eslintrc with correct information', function () {
		assert.jsonFileContent('.eslintrc', {
			extends: ['eslint-config-nitpick']
		});
	});

	it('should fill README.md with project data', function () {
		assert.fileContent('README.md', '# bella');
		assert.fileContent('README.md', 'npm install bella --save');
	});
});

describe('Existing project', function () {
	let /** @type {import('yeoman-test').RunContext} */ helperContext;

	before(function () {
		helperContext = helpers.run(generatorPath);

		return helperContext
			.inTmpDir(async function (directory) {
				const temporaryPackagePath = path.join(
					directory,
					'package.json'
				);
				try {
					await writeJsonFile(temporaryPackagePath, {
						name: 'minnie',
						description: 'minnie description',
						main: 'index.js',
						version: '1.0.0',
						dependencies: {
							e: 3, // eslint-disable-line unicorn/prevent-abbreviations
							a: 1,
							g: 4,
							c: 2
						},
						keywords: ['a', 'c', 'b'],
						repository: {
							type: 'git',
							url: 'git+https://github.com/niksy/minnie.git'
						}
					});
				} catch {
					// Handled
				}
			})
			.withOptions({ force: true })
			.toPromise();
	});

	after(function () {
		helperContext.cleanTestDirectory();
	});

	it('should reuse existing package.json information', function () {
		assert.jsonFileContent('package.json', {
			name: 'minnie',
			description: 'minnie description'
			/*
			 * TODO: this fails for some reason
			 * author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com)'
			 */
		});
	});
});

describe('Manual tests', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
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
		assert.fileContent(
			'test/manual/index.css',
			"@import url('suitcss-components-test');"
		);
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
				webpack: '^5.2.0',
				del: '^6.0.0',
				globby: '^11.0.1',
				'css-loader': '^5.0.0',
				'html-webpack-plugin': '^4.5.0',
				'mini-css-extract-plugin': '^1.2.0',
				'postcss': '^8.3.11',
				'postcss-import': '^14.0.2',
				'postcss-preset-env': '^7.0.0',
				'postcss-loader': '^6.2.0',
				'webpack-cli': '^4.1.0',
				'webpack-dev-server': '^3.11.0'
			}
		});
	});
});

describe('Automated tests', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				ciService: 'travis',
				codeCoverage: false,
				esModules: false
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['test/.eslintrc', '.travis.yml', 'test/index.js']);
	});

	it('should fill .gitignore with correct information', function () {
		assert.fileContent('.gitignore', '!test/fixtures/node_modules/');
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				lint: "eslint '{index,lib/**/*,test/**/*}.js'",
				test: "mocha 'test/**/*.js'",
				'test:watch': 'npm test -- --watch'
			},
			devDependencies: {
				mocha: '^9.1.3'
			}
		});
	});
});

describe('Automated tests, different CI service', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				ciService: 'github'
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['.github/workflows/ci.yml']);
	});
});

describe('Automated tests, browser module', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				browserModule: true,
				usesHtmlFixtures: true
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
				test: 'npm run test:automated'
			},
			devDependencies: {
				karma: '^5.2.3',
				'karma-sourcemap-loader': '^0.3.7',
				'karma-webpack': '^5.0.0',
				'karma-browserstack-launcher': '^1.6.0',
				'karma-chrome-launcher': '^3.1.0',
				'karma-html2js-preprocessor': '^1.1.0',
				'karma-fixture': '^0.2.6',
				'karma-mocha': '^2.0.1',
				'karma-mocha-reporter': '^2.2.5',
				webpack: '^5.2.0'
			}
		});
	});

	it('should update karma.conf.js with correct information', function () {
		assert.fileContent('karma.conf.js', 'test/**/.webpack.js');
	});

	it('should add information regarding BrowserStack to README.md', function () {
		assert.fileContent(
			'README.md',
			'[browserstack-img]: https://img.shields.io/badge/browser'
		);
	});
});

describe('Automated tests, browser module, headless browser', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				browserModule: true,
				browserTestType: 'headless'
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			devDependencies: {
				puppeteer: '^5.4.0'
			}
		});
	});

	it('should update karma.conf.js with correct information', function () {
		assert.fileContent(
			'karma.conf.js',
			'process.env.CHROME_BIN = puppeteer.executablePath();'
		);
	});
});

describe('Integration tests', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
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
				test: 'npm run test:automated && npm run test:integration'
			},
			devDependencies: {
				'local-web-server': '^4.2.1',
				'@wdio/browserstack-service': '^6.6.7',
				'@wdio/mocha-framework': '^6.6.8',
				'@wdio/spec-reporter': '^6.6.8',
				webdriverio: '^6.6.8',
				'http-shutdown': '^1.0.3'
			}
		});
	});

	it('should update wdio.conf.js with correct information', function () {
		assert.fileContent('wdio.conf.js', "framework: 'mocha'");
	});

	it('should fill .babelrc with correct information', function () {
		assert.jsonFileContent('.babelrc', {
			overrides: [
				{
					test: './test/integration',
					presets: [
						[
							'@babel/preset-env',
							{
								modules: false,
								targets: {
									node: '12.22'
								}
							}
						]
					]
				}
			]
		});
	});
});

describe('Integration tests, ES Modules', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				manualTests: true,
				browserModule: true,
				integrationTests: true,
				esModules: true,
				usesHtmlFixtures: true
			})
			.toPromise();
	});

	it('should fill .gitignore with correct information', function () {
		assert.fileContent(
			'.gitignore',
			'!test/automated/fixtures/node_modules/'
		);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				'test:integration': 'npm run test:generate-static-site && wdio'
			}
		});
	});
});

describe('All tests, browser module', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				manualTests: true,
				integrationTests: true,
				browserModule: true,
				usesHtmlFixtures: true
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

	it('should update .eslintrc with correct information', function () {
		assert.fileContent('test/automated/.eslintrc', '"ignorePatterns"');
	});
});

describe('Browser module', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				browserModule: true,
				esModules: false
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
			extends: ['eslint-config-nitpick', 'eslint-config-nitpick/browser'],
			overrides: [
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
		assert.fileContent(
			'.browserslistrc',
			'last 3 major versions\nsince 2019\nedge >= 15\nnot ie > 0'
		);
	});
});

describe('Browser module, browser version', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				browserModule: true,
				browserVersion: 'ie >= 11'
			})
			.toPromise();
	});

	it('should add information regarding browser support to README.md', function () {
		assert.fileContent(
			'README.md',
			'Tested in Internet Explorer 11 and should work in all modern browsers ([support based on Browserslist configuration](https://browserslist.dev/?q=aWUgPj0gMTE%3D)).'
		);
	});

	it('should fill .browserslistrc with correct information', function () {
		assert.fileContent('.browserslistrc', 'ie >= 11');
	});
});

describe('Styles', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: false,
				browserModule: true,
				browserModuleType: ['styles'],
				esModules: false
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['.stylelintrc']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			files: ['dist/'],
			style: 'dist/index.css',
			scripts: {
				lint: "eslint '{index,lib/**/*}.js' && stylelint 'index.css'"
			},
			devDependencies: {
				stylelint: '^14.1.0',
				'stylelint-config-nitpick': '^9.0.0'
			}
		});
	});
});

describe('CLI', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				name: '@sammy/ellie',
				cli: true,
				esModules: false
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
				lint: "eslint '{index,lib/**/*,cli,test/**/*}.js'",
				test: "nyc mocha 'test/**/*.js' && nyc check-coverage",
				'test:watch': 'nodemon --exec npm test'
			},
			keywords: ['cli', 'cli-app']
		});
	});
});

describe('Code coverage', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				codeCoverage: true,
				esModules: false
			})
			.toPromise();
	});

	it('should create necessary file', function () {
		assert.file(['.nycrc']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				lint: "eslint '{index,lib/**/*,test/**/*}.js'",
				test: "nyc mocha 'test/**/*.js' && nyc check-coverage",
				'test:watch': 'nodemon --exec npm test'
			},
			devDependencies: {
				nyc: '^15.1.0',
				nodemon: '^2.0.6'
			}
		});
	});
});

describe('Code coverage, browser module', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				codeCoverage: true,
				browserModule: true
			})
			.toPromise();
	});

	it('should create necessary file', function () {
		assert.file(['.nycrc']);
	});

	it('should fill .nycrc with correct information', function () {
		assert.jsonFileContent('.nycrc', {
			statements: 80,
			lines: 0
		});
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			devDependencies: {
				'@jsdevtools/coverage-istanbul-loader': '^3.0.5',
				'karma-coverage': '^2.0.3'
			}
		});
	});
});

describe('Code coverage service', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				ciService: 'travis',
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
		return helpers
			.run(generatorPath)
			.withAnswers({
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
	let /** @type {import('yeoman-test').RunContext} */ helperContext;

	before(function () {
		helperContext = helpers.run(generatorPath);

		return helperContext
			.inTmpDir(async function (directory) {
				const temporaryPackagePath = path.join(
					directory,
					'package.json'
				);
				try {
					await writeJsonFile(temporaryPackagePath, {
						repository: {
							type: 'git',
							url: 'git+https://gitlab.com/niksy/chester.git'
						}
					});
				} catch {
					// Handled
				}
			})
			.withOptions({ force: true })
			.toPromise();
	});

	after(function () {
		helperContext.cleanTestDirectory();
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
		return helpers
			.run(generatorPath)
			.withAnswers({
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
		return helpers
			.run(generatorPath)
			.withAnswers({
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
		return helpers
			.run(generatorPath)
			.withAnswers({
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
				lint: "eslint 'test/**/*.js' && stylelint '{_index,test/**/*}.scss'",
				test: "mocha 'test/**/*.js'",
				'test:watch': 'npm test -- --watch'
			},
			devDependencies: {
				'sass-true': '^2.1.3'
			}
		});
	});

	it('should fill .stylelintrc with correct information', function () {
		assert.jsonFileContent('.stylelintrc', {
			extends: [
				'stylelint-config-nitpick',
				'stylelint-config-nitpick/scss'
			]
		});
	});

	it('should create necessary files', function () {
		assert.file(['_index.scss', 'test/index.scss']);
	});
});

describe('CSS module', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				browserModule: true,
				browserModuleType: ['cssModule']
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			exports: {
				'.': {
					'style': './index.css'
				}
			},
			main: 'index.css',
			style: 'index.css'
		});
	});
});

describe('Cloud browsers', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				browserModule: true,
				cloudBrowsers: false
			})
			.toPromise();
	});

	it('should adjust Karma configuration', function () {
		assert.fileContent(
			'karma.conf.js',
			"browsers: [(!local ? 'Chrome-CI' : 'Chrome')]"
		);
	});
});

describe('Transpile', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: false,
				transpile: true,
				sourceMaps: false,
				esModules: false,
				changelog: false
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
			files: ['dist/', 'LICENSE.md', 'README.md'],
			scripts: {
				build: "babel '{index,lib/**/*}.js' --out-dir dist/",
				prerelease: 'npm run lint && npm run build',
				prepublishOnly: 'npm run build'
			},
			devDependencies: {
				'@babel/cli': '^7.2.3',
				'@babel/preset-env': '^7.12.1'
			}
		});
	});

	it('should fill .babelrc with correct information', function () {
		assert.jsonFileContent('.babelrc', {
			presets: [
				[
					'@babel/preset-env',
					{
						modules: false,
						targets: {
							node: '12.22'
						}
					}
				]
			]
		});
	});
});

describe('Transpile, browser module', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
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
				'babel-loader': '^8.1.0',
				webpack: '^5.2.0'
			}
		});
	});

	it('should fill .babelrc with correct information', function () {
		assert.jsonFileContent('.babelrc', {
			presets: [['@babel/preset-env', { modules: false }]]
		});
	});
});

describe('Transpile, with automated tests and code coverage', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				codeCoverage: true,
				transpile: true,
				esModules: false
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
				lint: "eslint '{index,lib/**/*,test/**/*}.js'",
				test: "BABEL_ENV=test nyc mocha --require @babel/register 'test/**/*.js' && nyc check-coverage",
				'test:watch': 'nodemon --exec npm test'
			},
			devDependencies: {
				'@babel/register': '^7.0.0',
				'babel-plugin-istanbul': '^6.0.0',
				'nodemon': '^2.0.6'
			}
		});
	});
});

describe('Transpile, browser module, with automated tests and code coverage', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				codeCoverage: true,
				browserModule: true,
				transpile: true,
				browserVersion: 'ie >= 11'
			})
			.toPromise();
	});

	it('should fill .babelrc with correct information', function () {
		assert.jsonFileContent('.babelrc', {
			plugins: [
				'@babel/plugin-transform-member-expression-literals',
				'@babel/plugin-transform-property-literals',
				'@babel/plugin-transform-object-assign'
			]
		});
	});

	it('should add proper data to karma.conf.js', function () {
		assert.fileContent('karma.conf.js', 'babel-loader');
		assert.fileContent(
			'karma.conf.js',
			'@jsdevtools/coverage-istanbul-loader'
		);
	});
});

describe('Transpile, complex', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				transpile: true,
				complexTranspile: true,
				sourceMaps: false,
				esModules: false
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
			files: ['index.js'],
			scripts: {
				build: 'babel src --out-dir ./'
			}
		});
	});
});

describe('Transpile, complex, source maps', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				transpile: true,
				complexTranspile: true,
				sourceMaps: true,
				esModules: false
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['src/index.js']);
	});

	it('should add proper data to .gitignore', function () {
		assert.fileContent('.gitignore', 'index.js');
		assert.fileContent('.gitignore', 'index.js.map');
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			main: 'index.js',
			files: ['index.{js,js.map}']
		});
	});
});

describe('ES Modules', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				esModules: true
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['index.js', 'rollup.config.js']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			main: 'cjs/index.js',
			module: 'esm/index.js',
			exports: {
				'.': {
					'import': './esm/index.js',
					'require': './cjs/index.js'
				},
				'./package.json': './package.json'
			},
			sideEffects: false,
			files: ['cjs/', 'esm/'],
			scripts: {
				build: 'rollup --config rollup.config.js',
				prerelease:
					'npm run lint && npm run build && npm run module-check',
				prepublishOnly: 'npm run build'
			},
			devDependencies: {
				rollup: '^2.32.1'
			}
		});
	});

	it('should add proper data to .gitignore', function () {
		assert.fileContent('.gitignore', 'cjs/');
		assert.fileContent('.gitignore', 'esm/');
	});
});

describe('ES Modules, transpile', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
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
			files: ['cjs/', 'esm/'],
			devDependencies: {
				'@rollup/plugin-babel': '^5.2.1'
			}
		});
	});
});

describe('ES Modules, transpile, complex', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				esModules: true,
				transpile: true,
				complexTranspile: true
			})
			.toPromise();
	});

	it('should add proper data to .gitignore', function () {
		assert.fileContent('.gitignore', 'cjs/');
		assert.fileContent('.gitignore', 'esm/');
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			files: ['cjs/', 'esm/']
		});
	});
});

describe('ES Modules, automated tests', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
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
				lint: "eslint '{index,lib/**/*,test/**/*}.js'",
				test: "mocha --require esm 'test/**/*.js'",
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
		return helpers
			.run(generatorPath)
			.withAnswers({
				esModules: true,
				automatedTests: true,
				codeCoverage: true,
				transpile: true,
				nodeEngineVersion: 12.22
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				lint: "eslint '{index,lib/**/*,test/**/*}.js'",
				test: "BABEL_ENV=test nyc mocha --require @babel/register --require esm 'test/**/*.js' && nyc check-coverage",
				'test:watch': 'nodemon --exec npm test'
			},
			devDependencies: {
				esm: '^3.0.51',
				nodemon: '^2.0.6'
			}
		});
	});

	it('should fill .babelrc with correct information', function () {
		assert.jsonFileContent('.babelrc', {
			presets: [
				[
					'@babel/preset-env',
					{
						modules: false,
						targets: {
							node: '12.22'
						}
					}
				]
			]
		});
	});
});

describe('Node engine version', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				ciService: 'travis',
				nodeEngineVersion: 12
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			engines: {
				node: '>=12'
			}
		});
	});

	it('should properly fill .travis.yml engine infromation', function () {
		assert.fileContent('.travis.yml', "- '12'");
	});
});

describe('Changelog', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				changelog: true,
				esModules: false
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			files: ['index.js', 'lib/', 'CHANGELOG.md'],
			devDependencies: {
				'version-changelog': '^3.1.1',
				'changelog-verify': '^1.1.2'
			}
		});
	});

	it('should create necessary files', function () {
		assert.file(['CHANGELOG.md']);
	});
});

describe('Changelog, GitHub Release', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				changelog: true,
				githubRelease: true
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			scripts: {
				postpublish:
					'GITHUB_TOKEN=$GITHUB_RELEASE_TOKEN github-release-from-changelog'
			},
			devDependencies: {
				'github-release-from-changelog': '^2.1.1'
			}
		});
	});
});

describe('Bundling tool, Rollup, automated tests', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
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
				rollup: '^2.32.1',
				'@rollup/plugin-babel': '^5.2.1',
				'@rollup/plugin-node-resolve': '^9.0.0',
				'@rollup/plugin-commonjs': '^15.1.0',
				'rollup-plugin-node-builtins': '^2.1.2',
				'rollup-plugin-node-globals': '^1.4.0',
				'rollup-plugin-istanbul': '^3.0.0',
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
		return helpers
			.run(generatorPath)
			.withAnswers({
				manualTests: true,
				browserModule: true,
				esModules: true,
				bundlingTool: 'rollup'
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['test/manual/rollup.config.js']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			devDependencies: {
				rollup: '^2.32.1',
				'postcss': '^8.3.11',
				'rollup-plugin-postcss': '^4.0.1',
				'rollup-plugin-serve': '^1.0.3',
				'rollup-plugin-static-site': '0.1.0'
			}
		});
	});
});

describe('Sourcemaps', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				esModules: true,
				sourceMaps: true
			})
			.toPromise();
	});

	it('should fill .gitignore with correct information', function () {
		assert.fileContent('.gitignore', 'cjs/');
		assert.fileContent('.gitignore', 'esm/');
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			files: ['cjs/', 'esm/']
		});
	});
});

describe('Prettier', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				prettier: true
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['.prettierrc']);
	});
});

describe('Vanilla JS widget', function () {
	this.timeout(4000);

	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				browserModule: true,
				browserModuleType: ['vanillaJsWidget']
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			devDependencies: {
				'rollup-plugin-svelte': '^6.1.0',
				'svelte': '^2.16.1'
			}
		});
	});
});

describe('TypeScript, with comments', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				esModules: true,
				typescript: true,
				typescriptMode: 'comments',
				automatedTests: true
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['tsconfig.json']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			types: 'esm/index.d.ts',
			scripts: {
				'lint:types': 'tsc'
			},
			devDependencies: {
				'typescript': '^4.3.5',
				'@types/node': '^16.3.0',
				'@types/mocha': '^9.0.0'
			}
		});
	});
});

describe('TypeScript, full', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				esModules: true,
				typescript: true,
				typescriptMode: 'full',
				automatedTests: true
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['tsconfig.json']);
	});

	it('should fill rollup.config.js with correct information', function () {
		assert.fileContent('rollup.config.js', "input: 'index.ts'");
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			types: 'esm/index.d.ts',
			scripts: {
				'lint:types': 'tsc'
			},
			devDependencies: {
				'typescript': '^4.3.5',
				'@types/node': '^16.3.0',
				'@types/mocha': '^9.0.0'
			}
		});
	});
});
