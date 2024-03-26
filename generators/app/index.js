import Generator from 'yeoman-generator';
import gh from 'parse-github-url';
import isGithubUrl from 'is-github-url';
import { sortPackageJson, sortOrder } from 'sort-package-json';
import lodash from 'lodash';
import isScopedPackage from 'is-scoped';
import browserslist from 'browserslist';
import { pathExists } from 'path-exists';

const {
	kebabCase: dashCase,
	camelCase,
	uniq,
	compact,
	min,
	fromPairs: fromEntries
} = lodash;

// https://www.browserstack.com/automate/capabilities
const browserIdMapping = {
	chrome: {
		shortName: 'Chrome',
		longName: 'Chrome',
		versionKey: 'browser_version',
		serviceProps: {
			os: 'Windows',
			'os_version': '7'
		}
	},
	firefox: {
		shortName: 'Firefox',
		longName: 'Firefox',
		versionKey: 'browser_version',
		serviceProps: {
			os: 'Windows',
			'os_version': '7'
		}
	},
	edge: {
		shortName: 'Edge',
		longName: 'Edge',
		versionKey: 'browser_version',
		serviceProps: {
			os: 'Windows',
			'os_version': '10'
		}
	},
	'ios_saf': {
		shortName: 'iPhone',
		longName: 'iOS Safari',
		versionKey: 'os_version',
		serviceProps: {
			device: 'iPhone 8',
			'real_mobile': true
		}
	}
};

/**
 * @param {string} packageName
 * @param {object} options
 *
 * @returns {string}
 */
function preparePackageName(packageName, options = {}) {
	let preparedPackageName;
	if (isScopedPackage(packageName)) {
		const scopedPackageName = packageName.split('/');
		preparedPackageName = [
			scopedPackageName[0],
			dashCase(scopedPackageName[1])
		].join('/');
	} else {
		preparedPackageName = dashCase(packageName);
	}
	if (options.clean) {
		return preparedPackageName.replace(/^@.+?\//, '');
	}
	return preparedPackageName;
}

function isSassModule(answers) {
	const browserModuleType = answers.browserModuleType || [];
	return browserModuleType.includes('sassModule');
}

function isVanillaJsWidgetModule(answers) {
	const browserModuleType = answers.browserModuleType || [];
	return browserModuleType.includes('vanillaJsWidget');
}

function commaSeparatedValuesToArray(string) {
	if (typeof string === 'undefined') {
		return [];
	}
	return uniq(
		compact(
			string
				.split(',')
				.map((item) => item.trim())
				.filter((item) => item !== '')
		)
	);
}

function cloudBrowsersToTestConfiguration(browserIds, browserVersion) {
	if (!Array.isArray(browserIds)) {
		return [];
	}
	const config = browserIds.map((browserId) => {
		const mappedBrowser = browserIdMapping[browserId];
		return {
			shortName: mappedBrowser.shortName,
			longName: mappedBrowser.longName,
			version: browserVersion[browserId],
			karma: {
				browser: mappedBrowser.shortName,
				[mappedBrowser.versionKey]: String(browserVersion[browserId]),
				name: mappedBrowser.shortName,
				...mappedBrowser.serviceProps
			},
			wdio: {
				browser: mappedBrowser.shortName,
				[mappedBrowser.versionKey]: String(browserVersion[browserId]),
				name: mappedBrowser.shortName,
				browserName: mappedBrowser.shortName,
				...mappedBrowser.serviceProps
			}
		};
	});
	return config;
}

function getMinimumSupportedBrowserVersions(browserVersion) {
	let browserSupport = browserslist(browserVersion)
		.map((string) => string.split(' '))
		.reduce((map, [browser, version]) => {
			if (!Array.isArray(map[browser])) {
				map[browser] = [];
			}
			map[browser].push(Number(version));
			return map;
		}, {});
	browserSupport = Object.entries(browserSupport).map(
		([browser, versions]) => {
			return [browser, min(versions)];
		}
	);
	browserSupport = fromEntries(browserSupport);
	return browserSupport;
}

export default class extends Generator {
	async initializing() {
		this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
		const hasGitRespository = await pathExists(
			this.destinationPath('.git')
		);

		this.author = {
			humanName: 'Ivan Nikolić',
			username: 'niksy',
			website: 'http://ivannikolic.com',
			email: 'niksy5@gmail.com'
		};
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
				default: (answers) =>
					preparePackageName(answers.name, { clean: true }),
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
						name: 'Vanilla JS widget (UI component)',
						value: 'vanillaJsWidget'
					},
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
				when: (answers) =>
					answers.browserModule && answers.automatedTests
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
				when: (answers) =>
					answers.automatedTests && answers.browserModule
			},
			{
				type: 'confirm',
				name: 'cloudBrowsers',
				message:
					'Do you need cloud browser service (Browserstack) for tests?',
				default: true,
				when: (answers) =>
					answers.automatedTests && answers.browserModule
			},
			{
				type: 'confirm',
				name: 'integrationTests',
				message: 'Do you have integration (Selenium) tests?',
				default: false,
				when: (answers) =>
					answers.automatedTests &&
					answers.manualTests &&
					answers.browserModule
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
				message:
					'Do you want to send code coverage report to Coveralls?',
				default: false,
				when: (answers) => answers.codeCoverage
			},
			{
				type: 'confirm',
				name: 'transpile',
				message: 'Do you need code transpiling via Babel?',
				default: (answers) => {
					if (isVanillaJsWidgetModule(answers)) {
						return true;
					}
					return answers.browserModule;
				}
			},
			{
				type: 'confirm',
				name: 'sourceMaps',
				message: 'Do you want to generate source maps?',
				default: (answers) => answers.transpile,
				when: (answers) => answers.transpile
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
				type: 'list',
				name: 'bundlingTool',
				message: 'What bundling tool do you want to use?',
				default: (answers) => {
					if (answers.browserModuleType.includes('vanillaJsWidget')) {
						return 'rollup';
					}
					return 'webpack';
				},
				choices: [
					{
						name: 'Webpack',
						value: 'webpack'
					},
					{
						name: 'Rollup',
						value: 'rollup'
					}
				],
				when: (answers) =>
					(answers.automatedTests || answers.manualTests) &&
					answers.browserModule &&
					!answers.sassModule
			},
			{
				type: 'input',
				name: 'nodeEngineVersion',
				message: 'Which Node engine version this project supports?',
				default: 18
			},
			{
				type: 'input',
				name: 'browserVersion',
				message: 'Which browser versions this project supports?',
				default: (answers) => {
					return `last 3 major versions, since 2019, edge >= 15, not ie > 0`;
				},
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
					const defaultValues = Object.keys(browserSupport).filter(
						(browserId) =>
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
							['chrome', 'firefox', 'edge', 'ios_saf'].includes(
								browserId
							)
						)
						.map((browserId) => [
							browserIdMapping[browserId].longName,
							browserId
						])
						.map(([name, value]) => ({ name, value }));
					return choices;
				},
				when: (answers) => answers.cloudBrowsers
			},
			{
				type: 'confirm',
				name: 'typescript',
				message: 'Do you want to use TypeScript?',
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
			}
		];
	}

	async prompting() {
		const answers = await this.prompt(this.questions);

		const browserModuleType = answers.browserModuleType || [];

		this.answers = {
			...answers,
			vanillaJsWidget: browserModuleType.includes('vanillaJsWidget'),
			sassModule: browserModuleType.includes('sassModule'),
			cssModule: browserModuleType.includes('cssModule'),
			styles: browserModuleType.includes('styles')
		};

		if (this.answers.cssModule || this.answers.sassModule) {
			this.answers.styles = true;
		}

		if (!this.answers.bundlingTool) {
			this.answers.bundlingTool = 'webpack';
		}

		this.answers.keywords = commaSeparatedValuesToArray(
			this.answers.keywords
		);
		this.answers.browserVersion = commaSeparatedValuesToArray(
			this.answers.browserVersion
		);
		this.answers.cloudBrowsersToTest = cloudBrowsersToTestConfiguration(
			this.answers.cloudBrowsersToTest,
			getMinimumSupportedBrowserVersions(this.answers.browserVersion)
		);

		return this.answers;
	}

	writing() {
		const { answers, pkg, author } = this;
		const { keywords, browserVersion } = answers;
		const browserSupport =
			getMinimumSupportedBrowserVersions(browserVersion);
		const extension =
			answers.typescript && answers.typescriptMode === 'full'
				? 'ts'
				: null;

		const tpl = {
			moduleName: preparePackageName(answers.name),
			cleanModuleName: preparePackageName(answers.name, { clean: true }),
			camelCasedModuleName: camelCase(
				preparePackageName(answers.name, { clean: true })
			),
			moduleDescription: answers.description,
			browserModule: answers.browserModule,
			styles: answers.styles,
			vanillaJsWidget: answers.vanillaJsWidget,
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
			nodeEngineVersion: parseFloat(answers.nodeEngineVersion),
			browserVersion: browserVersion,
			browserslistDevQuery: encodeURIComponent(
				Buffer.from(browserVersion.join(', ')).toString('base64')
			),
			browserTestType: answers.browserTestType,
			changelog: answers.changelog,
			githubRelease: answers.githubRelease,
			bundlingTool: answers.bundlingTool,
			sourceMaps: answers.sourceMaps,
			prettier: answers.prettier,
			browserSupport: browserSupport,
			ciService: answers.ciService,
			bundleCjs: answers.bundleCjs,
			cloudBrowsersToTest: answers.cloudBrowsersToTest,
			typescript: answers.typescript,
			typescriptMode: answers.typescriptMode,
			extension: extension,
			usesHtmlFixtures: answers.usesHtmlFixtures
		};

		this.tpl = tpl;

		this.copyResource = (from, to) => {
			this.fs.copyTpl(
				this.templatePath(from),
				this.destinationPath(to),
				this.tpl
			);
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
		cp('eslintrc', '.eslintrc');
		cp('gitignore', '.gitignore');
		cp('npmrc', '.npmrc');
		cp('husky', '.husky');
		cp('lintstagedrc', '.lintstagedrc');

		// Remove old references
		rm('.istanbul.yml');
		rm('.jshintrc');
		rm('.bowerrc');
		rm('.rollup.js');
		rm('package-lock.json');
		rm('npm-shrinkwrap.json');

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
			cp('stylelintrc', '.stylelintrc');
		}

		if (answers.automatedTests) {
			cp('test/eslintrc', `test/${automatedTestsDirectory}.eslintrc`);
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
						cp(
							'test/automated/fixtures',
							`test/${automatedTestsDirectory}fixtures`
						);
					} else {
						rm(`test/${automatedTestsDirectory}fixtures`);
					}
					cp(
						`test/automated/index.${extension || 'js'}`,
						`test/${automatedTestsDirectory}index.${
							extension || 'js'
						}`
					);
					if (answers.bundlingTool === 'webpack') {
						cp(
							'test/automated/webpack.js',
							`test/${automatedTestsDirectory}.webpack.js`
						);
					}
					cp('karma.conf.js', 'karma.conf.js');
				} else {
					cp('test/index.js', `test/index.${extension || 'js'}`);
					cp('test/index.scss', 'test/index.scss');
				}
			} else {
				cp('test/index.js', `test/index.${extension || 'js'}`);
			}
			if (answers.codeCoverage && !answers.sassModule) {
				cp('nycrc', '.nycrc');
			}
		} else {
			rm('.travis.yml');
			rm('.github');
			rm('test/index.js');
			rm('test/index.ts');
			rm('test/automated');
			rm('karma.conf.js');
			rm('.nycrc');
			rm('.istanbul.yml');
		}

		if (answers.manualTests || answers.integrationTests) {
			cp('test/manual/index.html', 'test/manual/index.html');
			cp('test/manual/index.css', 'test/manual/index.css');
			cp(
				'test/manual/index.js',
				`test/manual/index.${extension || 'js'}`
			);
			if (answers.bundlingTool === 'webpack') {
				cp(
					'test/manual/webpack.config.js',
					'test/manual/webpack.config.js'
				);
			}
			if (answers.bundlingTool === 'rollup') {
				cp(
					'test/manual/rollup.config.js',
					'test/manual/rollup.config.js'
				);
			}
		} else {
			rm('test/manual');
			rm('test/manual/webpack.config.js');
			rm('test/manual/rollup.config.js');
		}

		if (answers.integrationTests) {
			cp(
				'test/integration/index.js',
				`test/integration/index.${extension || 'js'}`
			);
			cp('test/integration/eslintrc', 'test/integration/.eslintrc');
			cp('wdio.conf.js', 'wdio.conf.js');
		} else {
			rm('test/integration');
			rm('wdio.conf.js');
		}

		if (answers.transpile) {
			cp('babelrc', '.babelrc');
		} else {
			rm('.babelrc');
		}

		if (
			answers.transpile &&
			(answers.bundleCjs ||
				(answers.browserModule && !answers.sassModule))
		) {
			cp('rollup.config.js', 'rollup.config.js');
		} else {
			rm('rollup.config.js');
		}

		if (answers.changelog) {
			cp('CHANGELOG.md', 'CHANGELOG.md');
		} else {
			rm('CHANGELOG.md');
		}

		if (answers.prettier) {
			cp('prettierrc', '.prettierrc');
		} else {
			rm('.prettierrc');
		}

		if (answers.typescript) {
			cp('tsconfig.json', 'tsconfig.json');
			cp('tsconfig.build.json', 'tsconfig.build.json');
		} else {
			rm('tsconfig.json');
			rm('tsconfig.build.json');
		}

		if (answers.cli) {
			keywords.push('cli', 'cli-app');
		}

		// Write package.json, handling property order
		cp('_package.json', '_package.json');
		const newPackage = this.fs.readJSON(
			this.destinationPath('_package.json')
		);
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

		mergedPackage = sortPackageJson(mergedPackage, {
			sortOrder: [
				...sortOrder.filter(
					(field) =>
						![
							'homepage',
							'bugs',
							'repository',
							'keywords'
						].includes(field)
				),
				'keywords',
				'repository',
				'bugs',
				'homepage'
			]
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
			'eslint-plugin-vue'
		);

		if (!('ie' in browserSupport)) {
			developmentDependenciesToOmit.push(
				'@babel/plugin-transform-member-expression-literals',
				'@babel/plugin-transform-property-literals',
				'@babel/plugin-transform-object-assign'
			);
		}

		if (!answers.usesHtmlFixtures) {
			developmentDependenciesToOmit.push(
				'karma-fixture',
				'@types/karma-fixture'
			);
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

		this.packageJson.writeContent(mergedPackage);
	}

	async end() {
		const options = { stdio: 'pipe' };
		try {
			if (this.answers.initializeGitRepository) {
				await this.spawnCommand('git', ['init'], options);
			}
			await this.spawnCommand('git', ['add', '.'], options);
			try {
				await this.spawnCommand(
					'npx',
					['lint-staged', '--no-stash'],
					options
				);
			} catch (error) {
				// Handled
			}
			await this.spawnCommand('git', ['reset', 'HEAD'], options);
		} catch (error) {
			// Handled
		}
	}
}
