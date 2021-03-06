'use strict';

const Generator = require('yeoman-generator');
const gh = require('parse-github-url');
const isGithubUrl = require('is-github-url');
const deepAssign = require('deep-assign');
const compact = require('lodash.compact');
const uniq = require('lodash.uniq');
const sortPkg = require('sort-package-json');
const dashCase = require('lodash.kebabcase');
const camelCase = require('lodash.camelcase');
const isScopedPackage = require('is-scoped');
const browserslist = require('browserslist');
const execa = require('execa');

/**
 * @param  {string} packageName
 * @param  {object} options
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

module.exports = class extends Generator {
	initializing() {
		this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
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
				type: 'list',
				name: 'ciService',
				message: 'What CI service do you want to test on?',
				default: 'travis',
				choices: [
					{
						name: 'Travis',
						value: 'travis'
					},
					{
						name: 'GitHub',
						value: 'github'
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
					const browserModuleType = answers.browserModuleType || [];
					if (browserModuleType.includes('vanillaJsWidget')) {
						return true;
					}
					return answers.browserModule;
				}
			},
			{
				type: 'confirm',
				name: 'complexTranspile',
				message:
					'Is this complex transpiling (source files are in "src" folder)?',
				default: false,
				when: (answers) => answers.transpile
			},
			{
				type: 'confirm',
				name: 'esModules',
				message: 'Do you want to use ES Modules?',
				default: false,
				when: (answers) => {
					const browserModuleType = answers.browserModuleType || [];
					return !browserModuleType.includes('sassModule');
				}
			},
			{
				type: 'confirm',
				name: 'sourceMaps',
				message: 'Do you want to generate source maps?',
				default: false,
				when: (answers) => answers.transpile || answers.esModules
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
					!answers.sassModule &&
					answers.esModules
			},
			{
				type: 'input',
				name: 'nodeEngineVersion',
				message: 'Which Node engine version this project supports?',
				default: 10
			},
			{
				type: 'input',
				name: 'browserVersion',
				message: 'Which browser versions this project supports?',
				default: (answers) => {
					return 'last 2 versions, not ie 10, ie >= 11';
				},
				when: (answers) => answers.browserModule
			},
			{
				type: 'confirm',
				name: 'changelog',
				message: 'Do you want to keep a changelog?',
				default: false
			},
			{
				type: 'confirm',
				name: 'githubRelease',
				message: 'Do you want to create GitHub Release?',
				default: false,
				when: (answers) => answers.changelog
			},
			{
				type: 'confirm',
				name: 'prettier',
				message: 'Do you want to use Prettier?',
				default: true
			}
		];
	}

	async prompting() {
		const answers = await this.prompt(this.questions);

		const browserModuleType = answers.browserModuleType || [];

		this.answers = Object.assign({}, answers, {
			vanillaJsWidget: browserModuleType.includes('vanillaJsWidget'),
			sassModule: browserModuleType.includes('sassModule'),
			cssModule: browserModuleType.includes('cssModule'),
			styles: browserModuleType.includes('styles')
		});

		if (this.answers.cssModule || this.answers.sassModule) {
			this.answers.styles = true;
		}

		if (!this.answers.bundlingTool) {
			this.answers.bundlingTool = 'webpack';
		}

		return this.answers;
	}

	writing() {
		const { answers, pkg, author } = this;

		const [keywords, browserVersion] = [
			answers.keywords,
			answers.browserVersion
		]
			.map((string) => (typeof string === 'string' ? string : ''))
			.map((string) =>
				uniq(
					compact(
						string
							.split(',')
							.map((item) => item.trim())
							.filter((item) => item !== '')
					)
				)
			);

		const [lowestIEVersion] = browserslist(browserVersion)
			.filter((string) => string.includes('ie'))
			.map((string) => Number(string.replace(/ie (.+)/, '$1')))
			.sort((a, b) => a - b);

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
			complexTranspile: answers.complexTranspile,
			esModules: answers.esModules,
			nodeEngineVersion: parseInt(answers.nodeEngineVersion, 10),
			browserVersion: browserVersion,
			browserTestType: answers.browserTestType,
			changelog: answers.changelog,
			githubRelease: answers.githubRelease,
			bundlingTool: answers.bundlingTool,
			sourceMaps: answers.sourceMaps,
			prettier: answers.prettier,
			lowestIEVersion: lowestIEVersion,
			ciService: answers.ciService
		};

		this.tpl = Object.assign({}, tpl, {
			useDistDirectory:
				tpl.transpile && !tpl.complexTranspile && !tpl.esModules
		});

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
		cp('huskyrc', '.huskyrc');
		cp('lintstagedrc', '.lintstagedrc');

		// Remove old references
		rm('.istanbul.yml');
		rm('.jshintrc');
		rm('.bowerrc');
		rm('package-lock.json');
		rm('npm-shrinkwrap.json');

		if (answers.sassModule) {
			cp('_index.scss', '_index.scss');
		} else if (answers.cli) {
			cp('cli.js', 'cli.js');
		} else if (answers.complexTranspile) {
			cp('index.js', 'src/index.js');
		} else {
			cp('index.js', 'index.js');
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
				cp('travis.yml', '.travis.yml');
			} else {
				cp('github', '.github');
			}
			if (answers.browserModule) {
				if (!answers.sassModule) {
					cp(
						'test/automated/fixtures',
						`test/${automatedTestsDirectory}fixtures`
					);
					cp(
						'test/automated/index.js',
						`test/${automatedTestsDirectory}index.js`
					);
					if (answers.bundlingTool === 'webpack') {
						cp(
							'test/automated/webpack.js',
							`test/${automatedTestsDirectory}.webpack.js`
						);
					}
					cp('karma.conf.js', 'karma.conf.js');
				} else {
					cp('test/index.js', 'test/index.js');
					cp('test/index.scss', 'test/index.scss');
				}
			} else {
				cp('test/index.js', 'test/index.js');
			}
			if (answers.codeCoverage && !answers.sassModule) {
				cp('nycrc', '.nycrc');
			}
		} else {
			rm('.travis.yml');
			rm('.github');
			rm('test/index.js');
			rm('test/automated');
			rm('karma.conf.js');
			rm('.nycrc');
			rm('.istanbul.yml');
		}

		if (answers.manualTests || answers.integrationTests) {
			cp('test/manual/index.html', 'test/manual/index.html');
			cp('test/manual/index.css', 'test/manual/index.css');
			cp('test/manual/index.js', 'test/manual/index.js');
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
			cp('test/integration/index.js', 'test/integration/index.js');
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

		if (answers.esModules) {
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

		if (answers.cli) {
			keywords.push('cli', 'cli-app');
		}

		// Write package.json, handling property order
		cp('_package.json', '_package.json');
		const newPackage = this.fs.readJSON(
			this.destinationPath('_package.json')
		);
		rm('_package.json');

		let mergedPackage = deepAssign({}, pkg, newPackage);

		/*
		 * Deep-assign overwrites arrays so we have to prepare
		 * new array before writing new JSON file
		 */
		if (Array.isArray(keywords) && keywords.length !== 0) {
			mergedPackage.keywords = keywords;
		}

		mergedPackage = sortPkg(mergedPackage, {
			sortOrder: [
				...sortPkg.sortOrder.filter(
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

		// Remove old references
		delete mergedPackage.devDependencies['babel-preset-niksy'];
		delete mergedPackage.devDependencies['rollup-plugin-babel'];
		delete mergedPackage.devDependencies['rollup-plugin-node-resolve'];
		delete mergedPackage.devDependencies['rollup-plugin-commonjs'];
		delete mergedPackage.devDependencies.istanbul;

		this.fs.writeJSON(this.destinationPath('package.json'), mergedPackage);
	}

	install() {
		this.npmInstall();
	}

	async end() {
		try {
			await execa('git', ['add', '.']);
			try {
				await execa('npx', ['lint-staged', '--no-stash']);
			} catch (error) {
				// Handled
			}
			await execa('git', ['reset', 'HEAD']);
		} catch (error) {
			// Handled
		}
	}
};
