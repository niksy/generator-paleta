import Generator from 'yeoman-generator';
import gh from 'parse-github-url';
import isGithubUrl from 'is-github-url';
import { sortPackageJson, sortOrder } from 'sort-package-json';
import { camelCase } from 'lodash';
import isScopedPackage from 'is-scoped';
import { pathExists } from 'path-exists';
import {
	commaSeparatedValuesToArray,
	cloudBrowsersToTestConfiguration,
	createBrowserTargets,
	createTsConfigTargets,
	browserIdMapping,
	preparePackageName,
	isSassModule,
	getMinimumSupportedBrowserVersions,
	getNodeEngineVersion
} from './util.js';

export default class extends Generator {
	async initializing() {
		this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
		const hasGitRespository = await pathExists(this.destinationPath('.git'));
		const browserslistConfig = this.fs
			.read(this.destinationPath('.browserslistrc'), {
				defaults: 'last 3 major versions, since 2019, edge >= 15, not ie > 0'
			})
			.trim()
			.split('\n')
			.join(', ');

		this.author = {
			humanName: 'Ivan Nikolić',
			username: 'niksy',
			website: 'http://ivannikolic.com',
			email: 'niksy5@gmail.com'
		};
		/** @type {import('yeoman-generator').PromptQuestions} */
		this.questions = [
			{
				type: 'input',
				name: 'name',
				message: 'What is the name of the project?',
				default: () => preparePackageName(this.pkg.name || this.appname)
			},
			{
				type: 'input',
				name: 'description',
				message: 'What is the description of the project?',
				default: () => this.pkg.description || ''
			},
			{
				type: 'input',
				name: 'keywords',
				message: 'What are the keywords for this project?',
				default: () => {
					if (this.pkg.keywords) {
						return this.pkg.keywords.join(', ');
					}
					return '';
				}
			},
			{
				type: 'input',
				name: 'gitRepo',
				message: 'What is the Git repository of the project?',
				default: (answers) => {
					if (this.pkg.repository) {
						if (isGithubUrl(this.pkg.repository.url)) {
							return gh(this.pkg.repository.url).repository;
						}
						return this.pkg.repository.url;
					}
					return `${this.author.username}/${answers.name}`;
				}
			},
			{
				type: 'confirm',
				name: 'cli',
				message: 'Does this project has CLI interface?',
				default: false
			},
			{
				type: 'input',
				name: 'cliCommandName',
				message: 'What is the name of CLI command?',
				default: (answers) => preparePackageName(answers.name, { clean: true }),
				when: (answers) => answers.cli
			},
			{
				type: 'confirm',
				name: 'browserModule',
				message: 'Is this project meant to be used in browser?',
				default: false
			},
			{
				type: 'checkbox',
				name: 'browserModuleType',
				message: 'What type of browser module is this project?',
				default: [],
				choices: [
					{
						name: 'Sass module',
						value: 'sassModule'
					},
					{
						name: 'CSS module',
						value: 'cssModule'
					},
					{
						name: 'With styles',
						value: 'styles'
					}
				],
				when: (answers) => answers.browserModule
			},
			{
				type: 'confirm',
				name: 'manualTests',
				message: 'Do you have manual tests?',
				default: false
			},
			{
				type: 'confirm',
				name: 'automatedTests',
				message: 'Do you have automated tests?',
				default: true
			},
			{
				type: 'confirm',
				name: 'usesHtmlFixtures',
				message: 'Do you need HTML fixtures for automated tests?',
				default: false,
				when: (answers) => answers.browserModule && answers.automatedTests
			},
			{
				type: 'list',
				name: 'ciService',
				message: 'What CI service do you want to test on?',
				default: 'github',
				choices: [
					{
						name: 'GitHub',
						value: 'github'
					},
					{
						name: 'Travis',
						value: 'travis'
					}
				],
				when: (answers) => answers.automatedTests
			},
			{
				type: 'list',
				name: 'browserTestType',
				message: 'What kind of browser testing do you want?',
				default: 'real',
				choices: [
					{
						name: 'Real browser',
						value: 'real'
					},
					{
						name: 'Headless browser',
						value: 'headless'
					}
				],
				when: (answers) => answers.automatedTests && answers.browserModule
			},
			{
				type: 'confirm',
				name: 'cloudBrowsers',
				message: 'Do you need cloud browser service (Browserstack) for tests?',
				default: true,
				when: (answers) => answers.automatedTests && answers.browserModule
			},
			{
				type: 'confirm',
				name: 'integrationTests',
				message: 'Do you have integration (Selenium) tests?',
				default: false,
				when: (answers) =>
					answers.automatedTests && answers.manualTests && answers.browserModule
			},
			{
				type: 'confirm',
				name: 'codeCoverage',
				message: 'Do you need code coverage?',
				default: true,
				when: (answers) => answers.automatedTests
			},
			{
				type: 'confirm',
				name: 'codeCoverageService',
				message: 'Do you want to send code coverage report to Coveralls?',
				default: false,
				when: (answers) => answers.codeCoverage
			},
			{
				type: 'confirm',
				name: 'typescript',
				message: 'Do you want to check code with TypeScript?',
				default: false
			},
			{
				type: 'list',
				name: 'typescriptMode',
				message: 'What TypeScript mode do you want to use?',
				default: 'comments',
				choices: [
					{
						name: 'With comments',
						value: 'comments'
					},
					{
						name: 'Full support',
						value: 'full'
					}
				],
				when: (answers) => answers.typescript
			},
			{
				type: 'confirm',
				name: 'transpile',
				message: 'Do you need code transpiling?',
				when: (answers) => !answers.typescript && !answers.browserModule,
				default: (answers) => {
					return answers.browserModule || answers.typescript;
				}
			},
			{
				type: 'confirm',
				name: 'bundleCjs',
				message:
					'Do you want to create CommonJS bundle (browser-only packages are safe to be built as ESM only)?',
				default: false,
				when: (answers) => {
					return !isSassModule(answers) && answers.transpile;
				}
			},
			{
				type: 'input',
				name: 'nodeEngineVersion',
				message: 'Which Node engine version this project supports?',
				default: () => {
					return this.pkg.engines?.node ?? '>=18';
				}
			},
			{
				type: 'input',
				name: 'browserVersion',
				message: 'Which browser versions this project supports?',
				default: () => browserslistConfig,
				when: (answers) => answers.browserModule
			},
			{
				type: 'checkbox',
				name: 'cloudBrowsersToTest',
				message: 'In what browsers do you want to test?',
				default: (answers) => {
					const browserSupport = getMinimumSupportedBrowserVersions(
						answers.browserVersion
					);
					const defaultValues = Object.keys(browserSupport).filter((browserId) =>
						['chrome', 'firefox', 'edge'].includes(browserId)
					);
					return defaultValues;
				},
				choices: (answers) => {
					const browserSupport = getMinimumSupportedBrowserVersions(
						answers.browserVersion
					);
					const choices = Object.keys(browserSupport)
						.filter((browserId) =>
							['chrome', 'firefox', 'edge', 'ios_saf'].includes(browserId)
						)
						.map((browserId) => [browserIdMapping[browserId].longName, browserId])
						.map(([name, value]) => ({ name, value }));
					return choices;
				},
				when: (answers) => answers.cloudBrowsers
			},
			{
				type: 'confirm',
				name: 'changelog',
				message: 'Do you want to keep a changelog?',
				default: true
			},
			{
				type: 'confirm',
				name: 'githubRelease',
				message: 'Do you want to create GitHub Release?',
				default: true,
				when: (answers) => answers.changelog
			},
			{
				type: 'confirm',
				name: 'prettier',
				message: 'Do you want to use Prettier?',
				default: true
			},
			{
				type: 'confirm',
				name: 'initializeGitRepository',
				message: 'Do you want to initialize Git repository?',
				default: false,
				when: () => !hasGitRespository
			},
			{
				type: 'confirm',
				name: 'bumpMinorAndPatchDependencies',
				message: 'Do you want to bump minor and patch versions of dependencies?',
				default: false
			}
		];
	}

	async prompting() {
		const answers = await this.prompt(this.questions);

		const browserModuleType = answers.browserModuleType ?? [];

		this.answers = {
			...answers,
			transpile: answers.transpile ?? (answers.browserModule || answers.typescript),
			sassModule: browserModuleType.includes('sassModule'),
			cssModule: browserModuleType.includes('cssModule'),
			styles: browserModuleType.includes('styles')
		};

		if (this.answers.cssModule || this.answers.sassModule) {
			this.answers.styles = true;
		}
		if (this.answers.transpile) {
			this.answers.sourceMaps = true;
		}

		this.answers.keywords = commaSeparatedValuesToArray(this.answers.keywords);
		this.answers.browserVersion = commaSeparatedValuesToArray(this.answers.browserVersion);
		this.answers.cloudBrowsersToTest = cloudBrowsersToTestConfiguration(
			this.answers.cloudBrowsersToTest,
			getMinimumSupportedBrowserVersions(this.answers.browserVersion)
		);

		return this.answers;
	}

	writing() {
		const { answers, pkg, author } = this;
		const { keywords, browserVersion } = answers;
		const nodeEngineVersion = getNodeEngineVersion(answers.nodeEngineVersion);
		const browserSupport = getMinimumSupportedBrowserVersions(browserVersion);
		const browserTargets = createBrowserTargets(browserVersion);
		const tsConfigTargets = createTsConfigTargets(nodeEngineVersion);
		const extension = answers.typescript && answers.typescriptMode === 'full' ? 'ts' : null;

		const extensionsToProcess = ['js'];
		if (answers.typescript && answers.typescriptMode === 'full') {
			extensionsToProcess.push('ts');
		}
		if (
			(answers.automatedTests &&
				!answers.browserModule &&
				(answers.transpile ||
					(answers.typescript && answers.typescriptMode === 'full') ||
					answers.codeCoverage)) ||
			answers.integrationTests
		) {
			extensionsToProcess.push('cjs');
		}

		const tpl = {
			moduleName: preparePackageName(answers.name),
			cleanModuleName: preparePackageName(answers.name, { clean: true }),
			camelCasedModuleName: camelCase(preparePackageName(answers.name, { clean: true })),
			moduleDescription: answers.description,
			browserModule: answers.browserModule,
			styles: answers.styles,
			sassModule: answers.sassModule,
			cssModule: answers.cssModule,
			cli: answers.cli,
			cliCommandName: answers.cliCommandName,
			manualTests: answers.manualTests,
			automatedTests: answers.automatedTests,
			integrationTests: answers.integrationTests,
			codeCoverage: answers.codeCoverage,
			codeCoverageService: answers.codeCoverageService,
			gitRepo: gh(answers.gitRepo),
			keywords: keywords,
			version: pkg.version,
			humanName: author.humanName,
			username: author.username,
			website: author.website,
			email: author.email,
			isScopedPackage: isScopedPackage(answers.name),
			cloudBrowsers: answers.cloudBrowsers,
			transpile: answers.transpile,
			nodeEngineVersion: nodeEngineVersion,
			browserVersion: browserVersion,
			browserslistDevQuery: encodeURIComponent(
				Buffer.from(browserVersion.join(', ')).toString('base64')
			),
			rolldownBrowserTargets: browserTargets.rolldown,
			lightningCssBrowserTargets: browserTargets.lightningCss,
			tsConfigTargets: tsConfigTargets,
			browserTestType: answers.browserTestType,
			changelog: answers.changelog,
			githubRelease: answers.githubRelease,
			sourceMaps: answers.sourceMaps,
			prettier: answers.prettier,
			browserSupport: browserSupport,
			ciService: answers.ciService,
			bundleCjs: answers.bundleCjs,
			cloudBrowsersToTest: answers.cloudBrowsersToTest,
			typescript: answers.typescript,
			typescriptMode: answers.typescriptMode,
			extension: extension,
			usesHtmlFixtures: answers.usesHtmlFixtures,
			extensionsToProcess: extensionsToProcess
		};

		this.tpl = tpl;

		this.copyResource = (from, to) => {
			this.fs.copyTpl(this.templatePath(from), this.destinationPath(to), this.tpl);
		};
		this.removeResource = (to) => {
			this.fs.delete(this.destinationPath(to));
		};

		const cp = (from, to) => {
			this.copyResource(from, to);
		};
		const rm = (to) => {
			this.removeResource(to);
		};
		const automatedTestsDirectory =
			answers.browserModule &&
			!answers.sassModule &&
			(answers.manualTests || answers.integrationTests)
				? 'automated/'
				: '';

		cp('README.md', 'README.md');
		cp('LICENSE.md', 'LICENSE.md');
		cp('editorconfig', '.editorconfig');
		cp('eslint.config.js', 'eslint.config.js');
		cp('gitignore', '.gitignore');
		cp('npmrc', '.npmrc');
		cp('husky', '.husky');
		cp('_lint-staged.config.js', 'lint-staged.config.js');
		cp('tsconfig.json', 'tsconfig.json');

		// Remove old references
		rm('.istanbul.yml');
		rm('.jshintrc');
		rm('.bowerrc');
		rm('.rollup.js');
		rm('package-lock.json');
		rm('npm-shrinkwrap.json');
		rm('.huskyrc');
		rm('.stylelintrc');
		rm('.prettierrc');
		rm('.eslintrc');
		rm('.lintstagedrc');
		rm(`test/${automatedTestsDirectory}.eslintrc`);
		rm('test/integration/.eslintrc');
		rm('test/manual/webpack.config.js');
		rm(`test/${automatedTestsDirectory}.webpack.js`);
		rm('.babelrc');
		rm('rollup.config.js');
		rm('test/manual/rollup.config.js');
		rm('tsconfig.build.json');
		rm('babel.config.js');
		rm('.nycrc');

		if (
			(answers.automatedTests &&
				!answers.browserModule &&
				(answers.transpile ||
					(answers.typescript && answers.typescriptMode === 'full') ||
					answers.codeCoverage)) ||
			answers.integrationTests
		) {
			cp('mocharc.cjs', '.mocharc.cjs');
		} else {
			rm('.mocharc.cjs');
		}

		if (answers.sassModule) {
			cp('_index.scss', '_index.scss');
		} else if (answers.cli) {
			cp('cli.js', `cli.${extension || 'js'}`);
		} else {
			cp('index.js', `index.${extension || 'js'}`);
		}

		if (answers.browserModule) {
			cp('browserslistrc', '.browserslistrc');
		}

		if (answers.browserModule && answers.styles) {
			cp('stylelint.config.js', 'stylelint.config.js');
		}

		if (!answers.manualTests && !answers.automatedTests) {
			rm('test');
		}

		if (answers.automatedTests) {
			if (answers.ciService === 'travis') {
				rm('.github');
				cp('travis.yml', '.travis.yml');
			} else {
				rm('.travis.yml');
				cp('github', '.github');
			}
			if (answers.browserModule) {
				if (!answers.sassModule) {
					if (answers.usesHtmlFixtures) {
						cp('test/automated/fixtures', `test/${automatedTestsDirectory}fixtures`);
					} else {
						rm(`test/${automatedTestsDirectory}fixtures`);
					}
					cp(
						`test/automated/index.${extension || 'js'}`,
						`test/${automatedTestsDirectory}index.${extension || 'js'}`
					);
					cp('karma.conf.js', 'karma.conf.js');
				} else {
					cp('test/index.js', `test/index.${extension || 'js'}`);
					cp('test/index.scss', 'test/index.scss');
				}
			} else {
				cp('test/index.js', `test/index.${extension || 'js'}`);
			}
			if (answers.codeCoverage && !answers.sassModule) {
				cp('nyc.config.js', 'nyc.config.js');
			}
		} else {
			rm('.travis.yml');
			rm('.github');
			rm('test/index.js');
			rm('test/index.ts');
			rm('test/automated');
			rm('karma.conf.js');
			rm('nyc.config.js');
			rm('.istanbul.yml');
		}

		if (answers.manualTests || answers.integrationTests) {
			cp('test/manual/index.html', 'test/manual/index.html');
			cp('test/manual/index.css', 'test/manual/index.css');
			cp('test/manual/index.js', `test/manual/index.${extension || 'js'}`);
			cp('test/manual/vite.config.js', 'test/manual/vite.config.js');
		} else {
			rm('test/manual');
			rm('test/manual/vite.config.js');
		}

		if (answers.integrationTests) {
			cp('test/integration/index.js', `test/integration/index.${extension || 'js'}`);
			cp('wdio.conf.js', 'wdio.conf.js');
		} else {
			rm('test/integration');
			rm('wdio.conf.js');
		}

		if (
			(answers.transpile && !answers.browserModule) ||
			(answers.browserModule && !answers.sassModule)
		) {
			cp('rolldown.config.js', 'rolldown.config.js');
		} else {
			rm('rolldown.config.js');
		}

		if (answers.changelog) {
			cp('CHANGELOG.md', 'CHANGELOG.md');
		} else {
			rm('CHANGELOG.md');
		}

		if (answers.prettier) {
			cp('prettier.config.js', 'prettier.config.js');
		} else {
			rm('prettier.config.js');
		}

		if (answers.cli) {
			keywords.push('cli', 'cli-app');
		}

		// Write package.json, handling property order
		cp('_package.json', '_package.json');
		const newPackage = this.fs.readJSON(this.destinationPath('_package.json'));
		rm('_package.json');

		this.packageJson.merge(newPackage);

		let mergedPackage = this.packageJson.getAll();

		/*
		 * Deep-assign overwrites arrays so we have to prepare
		 * new array before writing new JSON file
		 */
		if (Array.isArray(keywords) && keywords.length !== 0) {
			mergedPackage.keywords = keywords;
		}

		const customSort = ['keywords', 'repository', 'bugs', 'homepage'];

		mergedPackage = sortPackageJson(mergedPackage, {
			sortOrder: [...sortOrder.filter((field) => !customSort.includes(field)), ...customSort]
		});

		const developmentDependenciesToOmit = [];

		// Remove old references
		developmentDependenciesToOmit.push(
			'babel-preset-niksy',
			'rollup-plugin-babel',
			'rollup-plugin-node-resolve',
			'rollup-plugin-commonjs',
			'istanbul',
			'eslint-plugin-extend',
			'karma-coverage-istanbul-reporter',
			'stylelint-config-niksy',
			'eslint-config-niksy',
			'eslint-plugin-import',
			'eslint-plugin-jsdoc',
			'eslint-plugin-mocha',
			'eslint-plugin-node',
			'eslint-plugin-promise',
			'eslint-plugin-unicorn',
			'eslint-plugin-react',
			'eslint-plugin-vue',
			'rollup-plugin-node-builtins',
			'rollup-plugin-node-globals',
			'stylelint-config-prettier',
			'karma-webpack',
			'@jsdevtools/coverage-istanbul-loader',
			'css-loader',
			'html-webpack-plugin',
			'mini-css-extract-plugin',
			'postcss-loader',
			'webpack-cli',
			'webpack-dev-server',
			'webpack',
			'babel-loader',
			'ts-loader',
			'gulp',
			'gulp-debug',
			'gulp-nunjucks-render',
			'gulp-plumber',
			'gulp-postcss',
			'gulp-sourcemaps',
			'gulp-util',
			'@niksy/babayaga',
			'babelify',
			'browserify-babel-istanbul',
			'browserify-istanbul',
			'karma-browserify',
			'eslint-plugin-html',
			'rollup-plugin-svelte',
			'svelte',
			'@rollup/plugin-commonjs',
			'@rollup/plugin-alias',
			'@rollup/plugin-json',
			'@rollup/plugin-inject',
			'karma-rollup-preprocessor',
			'del',
			'postcss',
			'globby',
			'rollup-plugin-postcss',
			'rollup-plugin-serve',
			'rollup-plugin-static-site',
			'postcss-import',
			'postcss-preset-env',
			'minimist',
			'node-stdlib-browser',
			'local-web-server',
			'http-shutdown',
			'@babel/core',
			'@babel/cli',
			'babel-cli',
			'core-js',
			'@babel/preset-env',
			'@babel/preset-typescript',
			'@babel/plugin-transform-runtime',
			'@babel/runtime',
			'@babel/register',
			'babel-plugin-istanbul',
			'@rollup/plugin-typescript',
			'@rollup/plugin-babel',
			'@rollup/plugin-node-resolve',
			'ts-node',
			'rollup',
			'cpy',
			'execa',
			'@babel/plugin-transform-member-expression-literals',
			'@babel/plugin-transform-property-literals',
			'@babel/plugin-transform-object-assign'
		);

		if (!answers.usesHtmlFixtures) {
			developmentDependenciesToOmit.push('karma-fixture', '@types/karma-fixture');
		}

		developmentDependenciesToOmit.forEach((key) => {
			delete mergedPackage.devDependencies[key];
		});
		this.packageJson.set('devDependencies', mergedPackage.devDependencies);

		// Remove CommonJS exports if not bundling CommonJS module
		if (!answers.bundleCjs && mergedPackage.exports) {
			Object.keys(mergedPackage.exports).forEach((key) => {
				delete mergedPackage.exports[key].require;
			});
			this.packageJson.set('exports', mergedPackage.exports);
		}

		// Remove module check script if not bundling CommonJS module
		if (!answers.bundleCjs) {
			delete mergedPackage.scripts['module-check'];
			this.packageJson.set('scripts', mergedPackage.scripts);
		}

		// Remove browser bundler specific fields
		if (!answers.browserModule) {
			delete mergedPackage.module;
			delete mergedPackage.sideEffects;
		}

		// Remove old types field
		delete mergedPackage.types;

		// Remove deprecated script fields
		delete mergedPackage.scripts.prepublish;
		delete mergedPackage.scripts['test:automated:local'];
		delete mergedPackage.scripts['test:automated:local:watch'];
		delete mergedPackage.scripts['test:integration:local'];
		delete mergedPackage.scripts['test:integration:local:watch'];
		delete mergedPackage.scripts['test:manual:local'];
		delete mergedPackage.scripts['test:manual:local'];
		delete mergedPackage.scripts['test:generate-static-site'];
		delete mergedPackage.scripts['test:generate-static-site:watch'];

		this.packageJson.writeContent(mergedPackage);
	}

	async install() {
		const options = { env: { NI_DEFAULT_AGENT: 'npm' } };
		if (this.answers.bumpMinorAndPatchDependencies) {
			try {
				await this.spawn('npx', ['taze', '-w'], options);
			} catch (error) {
				// Handled
			}
		}
	}

	async end() {
		const options = { stdio: 'pipe' };
		try {
			if (this.answers.initializeGitRepository) {
				await this.spawn('git', ['init'], options);
			}
			await this.spawn('git', ['add', '.'], options);
			try {
				await this.spawn('npx', ['lint-staged', '--no-stash'], options);
			} catch (error) {
				// Handled
			}
			await this.spawn('git', ['reset', 'HEAD'], options);
		} catch (error) {
			// Handled
		}
	}
}
