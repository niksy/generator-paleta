import path from 'node:path';
import { fileURLToPath } from 'node:url';
import helpers, { result } from 'yeoman-test';
import { writeJsonFile } from 'write-json-file';

const generatorPath = fileURLToPath(new URL('../generators/app/index.js', import.meta.url));

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
		result.assertFile([
			'package.json',
			'.editorconfig',
			'eslint.config.js',
			'.gitignore',
			'.npmrc',
			'.husky/pre-commit',
			'lint-staged.config.js',
			'tsconfig.json',
			'index.js',
			'LICENSE.md',
			'README.md'
		]);
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
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

	it('should fill eslint.config.js with correct information', function () {
		result.assertFileContent('eslint.config.js', 'eslint-config-nitpick');
	});

	it('should fill README.md with project data', function () {
		result.assertFileContent('README.md', '# bella');
		result.assertFileContent('README.md', 'npm install bella --save');
	});
});

// Fails for unknown reasons
describe.skip('Existing project', function () {
	let /** @type {import('yeoman-test').RunContext} */ helperContext;

	before(function () {
		helperContext = helpers.run(generatorPath);

		return helperContext
			.inTmpDir(async function (directory) {
				const temporaryPackagePath = path.join(directory, 'package.json');
				try {
					await writeJsonFile(temporaryPackagePath, {
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
		result.assertJsonFileContent('package.json', {
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

	it('should add proper data to manual test styles', function () {
		result.assertFileContent(
			'test/manual/index.css',
			"@import url('suitcss-components-test');"
		);
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			directories: {
				test: 'test'
			},
			scripts: {
				'test:manual': 'vite --config ./test/manual/vite.config.js'
			},
			devDependencies: {
				'vite': 'npm:rolldown-vite@^7.2.1'
			}
		});
	});

	it('should fill rolldown.config.js with correct information', function () {
		result.assertFileContent('test/manual/vite.config.js', 'defineConfig');
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
		result.assertFile(['.travis.yml', 'test/index.js']);
	});

	it('should fill .gitignore with correct information', function () {
		result.assertFileContent('.gitignore', '!test/fixtures/node_modules/');
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
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
		result.assertFile(['.github/workflows/ci.yml']);
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
		result.assertFile(['test/fixtures/index.html', 'test/index.js', 'karma.conf.js']);
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			scripts: {
				'test:automated': 'karma start',
				test: 'npm run test:automated'
			},
			devDependencies: {
				karma: '^6.4.3',
				'karma-sourcemap-loader': '^0.3.7',
				'karma-rolldown-preprocessor': '^1.0.0',
				'karma-browserstack-launcher': '^1.6.0',
				'karma-chrome-launcher': '^3.1.0',
				'karma-html2js-preprocessor': '^1.1.0',
				'karma-fixture': '^0.2.6',
				'karma-mocha': '^2.0.1',
				'karma-mocha-reporter': '^2.2.5',
				'rolldown': '^1.0.0-beta.47'
			}
		});
	});

	it('should add information regarding BrowserStack to README.md', function () {
		result.assertFileContent(
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
		result.assertJsonFileContent('package.json', {
			devDependencies: {
				puppeteer: '^22.6.1'
			}
		});
	});

	it('should update karma.conf.js with correct information', function () {
		result.assertFileContent('karma.conf.js', 'puppeteer.executablePath();');
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
		result.assertFile([
			'test/manual/vite.config.js',
			'test/integration/index.js',
			'wdio.conf.js'
		]);
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			scripts: {
				'test:integration': 'wdio',
				test: 'npm run test:automated && npm run test:integration'
			},
			devDependencies: {
				'vite': 'npm:rolldown-vite@^7.2.1',
				'@wdio/browserstack-service': '^9.20.1',
				'@wdio/mocha-framework': '^9.20.1',
				'@wdio/spec-reporter': '^9.20.0',
				webdriverio: '^9.20.1'
			}
		});
	});

	it('should update wdio.conf.js with correct information', function () {
		result.assertFileContent('wdio.conf.js', "framework: 'mocha'");
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
		result.assertFileContent('.gitignore', '!test/automated/fixtures/node_modules/');
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			scripts: {
				'test:integration': 'wdio'
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
		result.assertFile([
			'test/automated/fixtures/index.html',
			'test/automated/index.js',
			'test/manual/index.js',
			'test/integration/index.js'
		]);
	});

	it('should update eslint.config.js with correct information', function () {
		result.assertFileContent('eslint.config.js', 'ignores');
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
		result.assertFile(['.browserslistrc']);
	});

	it('should add information regarding browser support to README.md', function () {
		result.assertFileContent('README.md', '## Browser support');
	});

	it('should fill eslint.config.js with correct information', function () {
		result.assertFileContent('eslint.config.js', 'extends: [configBrowser]');
	});

	it('should fill .browserslistrc with correct information', function () {
		result.assertFileContent(
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
		result.assertFileContent(
			'README.md',
			'Tested in Edge 100 and should work in all modern browsers ([support based on Browserslist configuration](https://browserslist.dev/?q=ZWRnZSA%2BPSAxMDA%3D)).'
		);
	});

	it('should fill .browserslistrc with correct information', function () {
		result.assertFileContent('.browserslistrc', 'edge >= 100');
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
		result.assertFile(['stylelint.config.js']);
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			files: ['dist/'],
			style: 'dist/index.css',
			scripts: {
				lint: "eslint '{index,lib/**/*}.js' && stylelint 'index.css'"
			},
			devDependencies: {
				stylelint: '^16.25.0',
				'stylelint-config-nitpick': '^11.1.0'
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
		result.assertFile(['cli.js']);
	});

	it('should add global install instruction to README.md', function () {
		result.assertFileContent('README.md', 'npm install -g @sammy/ellie');
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			bin: {
				ellie: 'cli.js'
			},
			scripts: {
				lint: "eslint '{index,lib/**/*,cli,test/**/*}.{js,cjs}'",
				test: "nyc --check-coverage mocha 'test/**/*.js'",
				'test:watch': 'nodemon --ext js,cjs,json --exec npm test'
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
		result.assertFile(['nyc.config.js', '.mocharc.cjs']);
	});

	it('should fill .mocharc.cjs with correct information', function () {
		result.assertFileContent('.mocharc.cjs', 'experimental-loader=@istanbuljs/esm-loader-hook');
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			scripts: {
				lint: "eslint '{index,lib/**/*,test/**/*}.{js,cjs}'",
				test: "nyc --check-coverage mocha 'test/**/*.js'",
				'test:watch': 'nodemon --ext js,cjs,json --exec npm test'
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
		result.assertFile(['nyc.config.js']);
	});

	it('should fill nyc.config.js with correct information', function () {
		result.assertFileContent('nyc.config.js', 'statements: 80');
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			devDependencies: {
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
		result.assertFileContent('.travis.yml', 'npm run posttest:ci');
	});

	it('should add coverage entry to nyc.config.js', function () {
		result.assertFileContent('nyc.config.js', 'lcov');
	});

	it('should add coverage entry to README.md', function () {
		result.assertFileContent('README.md', '[coverage]');
		result.assertFileContent('README.md', '[coverage-img]');
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
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
		result.assertJsonFileContent('package.json', {
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
				const temporaryPackagePath = path.join(directory, 'package.json');
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
		result.assertJsonFileContent('package.json', {
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
		result.assertJsonFileContent('package.json', {
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
		result.assertJsonFileContent('package.json', {
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
		result.assertJsonFileContent('package.json', {
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

	it('should fill stylelint.config.js with correct information', function () {
		result.assertFileContent('stylelint.config.js', 'stylelint-config-nitpick/scss');
	});

	it('should create necessary files', function () {
		result.assertFile(['_index.scss', 'test/index.scss']);
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
		result.assertJsonFileContent('package.json', {
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
		result.assertFileContent('karma.conf.js', "browsers: [(!local ? 'Chrome-CI' : 'Chrome')]");
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

	it('should add dist folder to .gitignore', function () {
		result.assertFileContent('.gitignore', 'dist/');
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			main: 'dist/index.js',
			files: ['dist/', 'LICENSE.md', 'README.md'],
			scripts: {
				build: 'rolldown --config rolldown.config.js',
				prerelease: 'npm run lint && npm run build',
				prepublishOnly: 'npm run build'
			},
			devDependencies: {
				'rolldown': '^1.0.0-beta.47'
			}
		});
	});

	it('should fill rolldown.config.js with correct information', function () {
		result.assertFileContent('rolldown.config.js', 'dist');
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

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			main: 'dist/index.js',
			exports: {
				'.': {
					'import': './dist/index.js'
				},
				'./package.json': './package.json'
			},
			files: ['dist/'],
			scripts: {
				build: 'rolldown --config rolldown.config.js',
				prerelease: 'npm run lint && npm run build',
				prepublishOnly: 'npm run build'
			},
			devDependencies: {
				'rolldown': '^1.0.0-beta.47'
			}
		});
	});

	it('should add proper data to .gitignore', function () {
		result.assertFileContent('.gitignore', 'dist/');
	});

	it('should fill rolldown.config.js with correct information', function () {
		result.assertFileContent('rolldown.config.js', 'sourcemap: true');
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
		result.assertJsonFileContent('package.json', {
			main: 'dist/index.js',
			module: 'dist/index.js',
			sideEffects: false,
			devDependencies: {
				'rolldown': '^1.0.0-beta.47'
			}
		});
	});

	it('should fill rolldown.config.js with correct information', function () {
		result.assertFileContent('rolldown.config.js', 'target');
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
				nodeEngineVersion: '>=18'
			})
			.toPromise();
	});

	it('should fill nyc.config.js with correct information', function () {
		result.assertFileContent('nyc.config.js', 'instrument: false');
	});

	it('should fill .mocharc.cjs with correct information', function () {
		result.assertFileContent('.mocharc.cjs', 'experimental-loader=@istanbuljs/esm-loader-hook');
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			scripts: {
				lint: "eslint '{index,lib/**/*,test/**/*}.{js,cjs}'",
				test: "nyc --check-coverage mocha 'test/**/*.js'",
				'test:watch': 'nodemon --ext js,cjs,json --exec npm test'
			},
			devDependencies: {
				'@swc-node/register': '^1.11.1',
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
		result.assertFileContent('karma.conf.js', 'coverage');
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
		result.assertJsonFileContent('package.json', {
			main: 'dist/index.cjs',
			exports: {
				'.': {
					'import': './dist/index.js',
					'require': './dist/index.cjs'
				},
				'./package.json': './package.json'
			},
			files: ['dist/'],
			scripts: {
				prerelease: 'npm run lint && npm run build && npm run module-check'
			}
		});
	});

	it('should add proper data to .gitignore', function () {
		result.assertFileContent('.gitignore', 'dist/');
	});

	it('should fill rolldown.config.js with correct information', function () {
		result.assertFileContent('rolldown.config.js', 'cjs');
	});
});

describe('Node engine version', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				ciService: 'travis',
				nodeEngineVersion: '>=12'
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			engines: {
				node: '>=12'
			}
		});
	});

	it('should properly fill .travis.yml engine infromation', function () {
		result.assertFileContent('.travis.yml', "- '12'");
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
		result.assertJsonFileContent('package.json', {
			files: ['index.js', 'lib/', 'CHANGELOG.md'],
			devDependencies: {
				'version-changelog': '^3.1.1',
				'changelog-verify': '^1.1.2'
			}
		});
	});

	it('should create necessary files', function () {
		result.assertFile(['CHANGELOG.md']);
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
		result.assertJsonFileContent('package.json', {
			scripts: {
				postpublish: 'GITHUB_TOKEN=$GITHUB_RELEASE_TOKEN github-release-from-changelog'
			},
			devDependencies: {
				'github-release-from-changelog': '^2.1.1'
			}
		});
	});
});

describe('Bundling tool, Rolldown, automated tests', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				automatedTests: true,
				browserModule: true
			})
			.toPromise();
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			devDependencies: {
				'rolldown': '^1.0.0-beta.47',
				'rollup-plugin-istanbul': '^5.0.0',
				'karma-rolldown-preprocessor': '^1.0.0'
			}
		});
	});

	it('should update karma.conf.js with correct information', function () {
		result.assertFileContent('karma.conf.js', 'rolldownPreprocessor');
	});
});

describe('Bundling tool, Vite, manual tests', function () {
	before(function () {
		return helpers
			.run(generatorPath)
			.withAnswers({
				manualTests: true,
				browserModule: true
			})
			.toPromise();
	});

	it('should create necessary files', function () {
		result.assertFile(['test/manual/vite.config.js']);
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			devDependencies: {
				'vite': 'npm:rolldown-vite@^7.2.1'
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
		result.assertFileContent('.gitignore', 'dist/');
	});

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			files: ['dist/']
		});
	});

	it('should fill rolldown.config.js with correct information', function () {
		result.assertFileContent('rolldown.config.js', 'sourcemap: true');
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
		result.assertFile(['prettier.config.js']);
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

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			exports: {
				'.': {
					types: './dist/index.d.ts'
				}
			},
			scripts: {
				'lint:types': 'tsc'
			},
			devDependencies: {
				'typescript': '^5.9.3',
				'@types/node': '^18',
				'@types/mocha': '^10'
			}
		});
	});

	it('should fill .gitignore with correct information', function () {
		result.assertFileContent('.gitignore', 'dist/');
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

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			exports: {
				'.': {
					types: './dist/index.d.ts'
				}
			},
			scripts: {
				'lint:types': 'tsc'
			},
			devDependencies: {
				'typescript': '^5.9.3',
				'@types/node': '^18',
				'@types/mocha': '^10'
			}
		});
	});

	it('should fill rolldown.config.js with correct information', function () {
		result.assertFileContent('rolldown.config.js', 'dts({ sourcemap: true })');
	});

	it('should fill .gitignore with correct information', function () {
		result.assertFileContent('.gitignore', 'dist/');
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

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			exports: {
				'.': {
					types: './dist/index.d.ts'
				}
			},
			scripts: {
				'lint:types': 'tsc'
			},
			devDependencies: {
				'typescript': '^5.9.3',
				'@types/node': '^18',
				'@types/mocha': '^10'
			}
		});
	});

	it('should fill rolldown.config.js with correct information', function () {
		result.assertFileContent('rolldown.config.js', 'dts({ sourcemap: true })');
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

	it('should fill package.json with correct information', function () {
		result.assertJsonFileContent('package.json', {
			exports: {
				'.': {
					types: './dist/index.d.ts'
				}
			},
			scripts: {
				'lint:types': 'tsc'
			},
			devDependencies: {
				'typescript': '^5.9.3',
				'@types/node': '^18',
				'@types/mocha': '^10'
			}
		});
	});

	it('should fill rolldown.config.js with correct information', function () {
		result.assertFileContent('rolldown.config.js', 'dts({ sourcemap: true })');
	});
});
