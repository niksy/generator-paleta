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
			'.husky',
			'.lintstagedrc',
			'index.js',
			'LICENSE.md',
			'README.md'
		]);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			type: 'module',
			name: 'bella',
			main: 'index.js',
			exports: {
				'.': {
					'import': './index.js'
				},
				'./package.json': './package.json'
			},
			author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com)',
			files: ['index.js', 'lib/', 'LICENSE.md', 'README.md'],
			scripts: {
				release: 'np --no-release-draft',
				prerelease: 'npm run lint'
			},
			devDependencies: {
				np: '^10.0.2'
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
				del: '^7.1.0',
				globby: '^14.0.1',
				'css-loader': '^6.10.0',
				'html-webpack-plugin': '^5.6.0',
				'mini-css-extract-plugin': '^2.8.1',
				'postcss': '^8.3.11',
				'postcss-import': '^16.1.0',
				'postcss-preset-env': '^9.5.2',
				'postcss-loader': '^8.1.1',
				'webpack-cli': '^5.1.4',
				'webpack-dev-server': '^5.0.4'
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
				codeCoverage: false
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
				mocha: '^10.3.0'
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
				karma: '^6.4.3',
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
				puppeteer: '^22.6.1'
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
				'local-web-server': '^5.3.1',
				'@wdio/browserstack-service': '^8.35.1',
				'@wdio/mocha-framework': '^8.35.0',
				'@wdio/spec-reporter': '^8.32.4',
				webdriverio: '^8.35.1',
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
									node: '18'
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
				browserVersion: 'edge >= 100'
			})
			.toPromise();
	});

	it('should add information regarding browser support to README.md', function () {
		assert.fileContent(
			'README.md',
			'Tested in Edge 100 and should work in all modern browsers ([support based on Browserslist configuration](https://browserslist.dev/?q=ZWRnZSA%2BPSAxMDA%3D)).'
		);
	});

	it('should fill .browserslistrc with correct information', function () {
		assert.fileContent('.browserslistrc', 'edge >= 100');
	});
});

describe('Styles', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
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
			files: ['dist/'],
			style: 'dist/index.css',
			scripts: {
				lint: "eslint '{index,lib/**/*}.js' && stylelint 'index.css'"
			},
			devDependencies: {
				stylelint: '^16.3.1',
				'stylelint-config-nitpick': '^11.0.2'
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
				lint: "eslint '{index,lib/**/*,cli,test/**/*}.js'",
				test: "NODE_OPTIONS='--experimental-loader=@istanbuljs/esm-loader-hook --no-warnings' nyc mocha 'test/**/*.js' && nyc check-coverage",
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
				lint: "eslint '{index,lib/**/*,test/**/*}.js'",
				test: "NODE_OPTIONS='--experimental-loader=@istanbuljs/esm-loader-hook --no-warnings' nyc mocha 'test/**/*.js' && nyc check-coverage",
				'test:watch': 'nodemon --exec npm test'
			},
			devDependencies: {
				nyc: '^15.1.0',
				nodemon: '^3.1.0'
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
				coveralls: '^3.1.1'
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

// Fails on GitHub CI for some reason
describe.skip('Non-GitHub repository, existing project', function () {
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
				'sass-true': '^8.0.0'
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
				'@babel/cli': '^7.2.3'
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
							node: '18'
						}
					}
				]
			]
		});
	});
});

describe('Transpile, source maps', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: false,
				transpile: true,
				sourceMaps: true,
				changelog: false
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['.babelrc']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			main: 'dist/index.js',
			exports: {
				'.': {
					'import': './dist/index.js'
				},
				'./package.json': './package.json'
			},
			files: ['dist/'],
			scripts: {
				build: "babel '{index,lib/**/*}.js' --out-dir dist/ --source-maps true",
				prerelease: 'npm run lint && npm run build',
				prepublishOnly: 'npm run build'
			},
			devDependencies: {
				'@babel/cli': '^7.2.3'
			}
		});
	});

	it('should add proper data to .gitignore', function () {
		assert.fileContent('.gitignore', 'dist/');
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
			main: 'dist/index.js',
			module: 'dist/index.js',
			sideEffects: false,
			devDependencies: {
				'@babel/core': '^7.2.2',
				'babel-loader': '^9.1.3',
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
				nodeEngineVersion: 18
			})
			.toPromise();
	});

	it('should fill .babelrc with correct information', function () {
		assert.jsonFileContent('.babelrc', {
			presets: [
				[
					'@babel/preset-env',
					{
						modules: false,
						targets: {
							node: '18'
						}
					}
				]
			],
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
				test: "NODE_OPTIONS='--experimental-loader=@istanbuljs/esm-loader-hook --no-warnings' BABEL_ENV=test nyc mocha --require @babel/register 'test/**/*.js' && nyc check-coverage",
				'test:watch': 'nodemon --exec npm test'
			},
			devDependencies: {
				'@babel/register': '^7.0.0',
				'babel-plugin-istanbul': '^6.0.0',
				'nodemon': '^3.1.0'
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
				browserVersion: 'edge >= 100'
			})
			.toPromise();
	});

	it('should add proper data to karma.conf.js', function () {
		assert.fileContent('karma.conf.js', 'babel-loader');
		assert.fileContent(
			'karma.conf.js',
			'@jsdevtools/coverage-istanbul-loader'
		);
	});
});

describe('Transpile, bundle CommonJS', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				transpile: true,
				bundleCjs: true
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			main: 'cjs/index.js',
			exports: {
				'.': {
					'import': './dist/index.js',
					'require': './cjs/index.js'
				},
				'./package.json': './package.json'
			},
			files: ['cjs/', 'dist/'],
			scripts: {
				prerelease:
					'npm run lint && npm run build && npm run module-check'
			}
		});
	});

	it('should add proper data to .gitignore', function () {
		assert.fileContent('.gitignore', 'cjs/');
		assert.fileContent('.gitignore', 'dist/');
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
				changelog: true
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
				bundlingTool: 'rollup'
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			devDependencies: {
				rollup: '^4.13.0',
				'@rollup/plugin-babel': '^6.0.4',
				'@rollup/plugin-node-resolve': '^15.2.3',
				'@rollup/plugin-commonjs': '^25.0.7',
				'@rollup/plugin-alias': '^5.1.0',
				'@rollup/plugin-json': '^6.1.0',
				'@rollup/plugin-inject': '^5.0.5',
				'rollup-plugin-istanbul': '^5.0.0',
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
				rollup: '^4.13.0',
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
				transpile: true,
				sourceMaps: true
			})
			.toPromise();
	});

	it('should fill .gitignore with correct information', function () {
		assert.fileContent('.gitignore', 'dist/');
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			files: ['dist/']
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
				'rollup-plugin-svelte': '^7.2.0',
				'svelte': '^4.2.12'
			}
		});
	});
});

describe('TypeScript, with comments', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				typescript: true,
				typescriptMode: 'comments'
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['tsconfig.json', 'tsconfig.build.json']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			exports: {
				'.': {
					types: './types/index.d.ts'
				}
			},
			scripts: {
				'lint:types': 'tsc'
			},
			devDependencies: {
				'typescript': '^5.4.3',
				'@types/node': '^20.11.30',
				'@types/mocha': '^10.0.6'
			}
		});
	});
});

describe('TypeScript, full', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				typescript: true,
				typescriptMode: 'full'
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['tsconfig.json', 'tsconfig.build.json']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			exports: {
				'.': {
					types: './types/index.d.ts'
				}
			},
			scripts: {
				'lint:types': 'tsc'
			},
			devDependencies: {
				'typescript': '^5.4.3',
				'@types/node': '^20.11.30',
				'@types/mocha': '^10.0.6'
			}
		});
	});
});

describe('TypeScript, transpile, with comments', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				transpile: true,
				typescript: true,
				typescriptMode: 'comments'
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['tsconfig.json']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			exports: {
				'.': {
					types: './dist/index.d.ts'
				}
			},
			scripts: {
				'lint:types': 'tsc'
			},
			devDependencies: {
				'typescript': '^5.4.3',
				'@types/node': '^20.11.30',
				'@types/mocha': '^10.0.6'
			}
		});
	});
});

describe('TypeScript, transpile, full', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				transpile: true,
				typescript: true,
				typescriptMode: 'full'
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		assert.file(['tsconfig.json']);
	});

	it('should fill package.json with correct information', function () {
		assert.jsonFileContent('package.json', {
			exports: {
				'.': {
					types: './dist/index.d.ts'
				}
			},
			scripts: {
				'lint:types': 'tsc'
			},
			devDependencies: {
				'typescript': '^5.4.3',
				'@types/node': '^20.11.30',
				'@types/mocha': '^10.0.6'
			}
		});
	});
});
