'use strict';

const generators = require('yeoman-generator');
const gh = require('parse-github-url');
const isGithubUrl = require('is-github-url');
const deepAssign = require('deep-assign');
const compact = require('lodash.compact');
const uniq = require('lodash.uniq');
const sortPkg = require('sort-pkg');
const dashCase = require('lodash.kebabcase');
const isScopedPackage = require('is-scoped-package');

/**
 * @param  {String} pkgName
 * @param  {Object} opts
 *
 * @return {String}
 */
function preparePkgName ( pkgName, opts ) {
	let preparedPkgName;
	opts = opts || {};
	if ( isScopedPackage(pkgName) ) {
		const scopedPkgName = pkgName.split('/');
		preparedPkgName = [scopedPkgName[0], dashCase(scopedPkgName[1])].join('/');
	} else {
		preparedPkgName = dashCase(pkgName);
	}
	if ( opts.clean ) {
		return preparedPkgName.replace(/^@.+?\//, '');
	}
	return preparedPkgName;
}

module.exports = generators.Base.extend({

	initializing: function () {
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
				'default': () => {
					return preparePkgName(this.pkg.name || this.appname);
				}
			},
			{
				type: 'input',
				name: 'description',
				message: 'What is the description of the project?',
				'default': () => {
					return this.pkg.description || '';
				}
			},
			{
				type: 'input',
				name: 'keywords',
				message: 'What are the keywords for this project?',
				'default': () => {
					if ( this.pkg.keywords ) {
						return this.pkg.keywords.join(', ');
					}
					return '';
				}
			},
			{
				type: 'input',
				name: 'gitRepo',
				message: 'What is the Git repository of the project?',
				'default': ( answers ) => {
					if ( this.pkg.repository ) {
						if ( isGithubUrl(this.pkg.repository.url) ) {
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
				'default': false
			},
			{
				type: 'input',
				name: 'cliCommandName',
				message: 'What is the name of CLI command?',
				'default': ( answers ) => {
					return preparePkgName(answers.name, { clean: true });
				},
				when: ( answers ) => {
					return answers.cli;
				}
			},
			{
				type: 'confirm',
				name: 'browserModule',
				message: 'Is this project meant to be used in browser?',
				'default': false
			},
			{
				type: 'checkbox',
				name: 'browserModuleType',
				message: 'What type of browser module is this project?',
				'default': [],
				choices: [{
					name: 'jQuery module',
					value: 'jqueryModule'
				}, {
					name: 'Sass module',
					value: 'sassModule'
				}, {
					name: 'CSS module',
					value: 'cssModule'
				}, {
					name: 'With styles',
					value: 'styles'
				}],
				when: ( answers ) => {
					return answers.browserModule;
				}
			},
			{
				type: 'confirm',
				name: 'manualTests',
				message: 'Do you have manual tests?',
				'default': false
			},
			{
				type: 'confirm',
				name: 'automatedTests',
				message: 'Do you have automated tests?',
				'default': true
			},
			{
				type: 'confirm',
				name: 'cloudBrowsers',
				message: 'Do you need cloud browser service (Browserstack) for tests?',
				'default': true,
				when: ( answers ) => {
					return answers.automatedTests && answers.browserModule;
				}
			},
			{
				type: 'confirm',
				name: 'integrationTests',
				message: 'Do you have integration (Selenium) tests?',
				'default': false,
				when: ( answers ) => {
					return answers.automatedTests && answers.browserModule;
				}
			},
			{
				type: 'list',
				name: 'testingInterface',
				message: 'What testing interface do you use?',
				'default': 'bdd',
				choices: [{
					name: 'BDD',
					value: 'bdd'
				}, {
					name: 'TDD',
					value: 'tdd'
				}],
				when: ( answers ) => {
					return answers.automatedTests;
				}
			},
			{
				type: 'confirm',
				name: 'codeCoverage',
				message: 'Do you need code coverage?',
				'default': true,
				when: ( answers ) => {
					return answers.automatedTests;
				}
			},
			{
				type: 'list',
				name: 'codeCoverageTool',
				message: 'What code coverage tool do you want to use?',
				'default': 'nyc',
				choices: [{
					name: 'nyc',
					value: 'nyc'
				}, {
					name: 'Istanbul',
					value: 'istanbul'
				}],
				when: ( answers ) => {
					return answers.automatedTests && answers.codeCoverage && !answers.browserModule;
				}
			},
			{
				type: 'confirm',
				name: 'codeCoverageService',
				message: 'Do you want to send code coverage report to Coveralls?',
				'default': false,
				when: ( answers ) => {
					return answers.codeCoverage;
				}
			},
			{
				type: 'confirm',
				name: 'transpile',
				message: 'Do you need code transpiling via Babel?',
				'default': ( answers ) => {
					if ( answers.browserModule ) {
						return true;
					}
					return false;
				}
			},
			{
				type: 'confirm',
				name: 'filesProperty',
				message: 'Do you want to use "files" property instead of ".npmignore"?',
				'default': false
			}
		];
	},

	prompting: function () {

		return this.prompt(this.questions)
			.then(( answers ) => {

				const browserModuleType = answers.browserModuleType || [];

				this.answers = Object.assign({}, answers, {
					jqueryModule: browserModuleType.indexOf('jqueryModule') !== -1,
					sassModule: browserModuleType.indexOf('sassModule') !== -1,
					cssModule: browserModuleType.indexOf('cssModule') !== -1,
					styles: browserModuleType.indexOf('styles') !== -1
				});

				if ( this.answers.cssModule || this.answers.sassModule ) {
					this.answers.styles = true;
				}

				return this.answers;

			});

	},

	writing: function () {

		const answers = this.answers;
		const pkg = this.pkg;
		const author = this.author;

		const keywords = uniq(compact(answers.keywords.split(',')
			.map(( keyword ) => {
				return keyword.trim();
			})
			.filter(( keyword ) => {
				return keyword !== '';
			})));

		const tpl = {
			moduleName: preparePkgName(answers.name),
			cleanModuleName: preparePkgName(answers.name, { clean: true }),
			moduleDescription: answers.description,
			browserModule: answers.browserModule,
			styles: answers.styles,
			jqueryModule: answers.jqueryModule,
			sassModule: answers.sassModule,
			cssModule: answers.cssModule,
			cli: answers.cli,
			cliCommandName: answers.cliCommandName,
			manualTests: answers.manualTests,
			automatedTests: answers.automatedTests,
			integrationTests: answers.integrationTests,
			testingInterface: answers.testingInterface,
			codeCoverage: answers.codeCoverage,
			codeCoverageTool: answers.codeCoverageTool,
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
			filesProperty: answers.filesProperty
		};
		this.tpl = tpl;

		this.copyResource = ( from, to ) => {
			this.fs.copyTpl(this.templatePath(from), this.destinationPath(to), tpl);
		};
		this.removeResource = ( to ) => {
			this.fs.delete(this.destinationPath(to));
		};

		const cp = ( from, to ) => {
			this.copyResource(from, to);
		};
		const rm = ( to ) => {
			this.removeResource(to);
		};
		let newPkg, mergedPkg;

		cp('README.md', 'README.md');
		cp('LICENSE.md', 'LICENSE.md');
		cp('editorconfig', '.editorconfig');
		cp('eslintrc', '.eslintrc');
		cp('gitignore', '.gitignore');

		if ( answers.sassModule ) {
			cp('_index.scss', '_index.scss');
		} else if ( answers.cli ) {
			cp('cli.js', 'cli.js');
		} else {
			cp('index.js', 'index.js');
		}

		if ( answers.browserModule && answers.styles ) {
			cp('stylelintrc', '.stylelintrc');
		}

		if ( answers.manualTests || answers.automatedTests ) {
			cp('test/eslintrc', 'test/.eslintrc');
		}
		if ( !answers.manualTests && !answers.automatedTests ) {
			rm('test');
		}

		if ( answers.automatedTests ) {
			cp('travis.yml', '.travis.yml');
			if ( answers.browserModule ) {
				if ( !answers.sassModule ) {
					const automatedTestsFolder = (answers.manualTests || answers.integrationTests) ? 'automated/' : '';
					cp('test/automated/fixtures', `test/${automatedTestsFolder}fixtures`);
					cp('test/automated/index.js', `test/${automatedTestsFolder}index.js`);
					cp('karma.conf.js', 'karma.conf.js');
				} else {
					cp('test/index.js', 'test/index.js');
					cp('test/index.scss', 'test/index.scss');
				}
			} else {
				cp('test/index.js', 'test/index.js');
			}
			if ( answers.codeCoverage && !answers.browserModule ) {
				if ( answers.codeCoverageTool === 'nyc' ) {
					cp('nycrc', '.nycrc');
				} else {
					cp('istanbul.yml', '.istanbul.yml');
				}
			}
		} else {
			rm('.travis.yml');
			rm('test/index.js');
			rm('test/automated');
			rm('karma.conf.js');
			rm('.nycrc');
			rm('.istanbul.yml');
		}

		if ( answers.manualTests || answers.integrationTests ) {
			cp('test/manual', 'test/manual');
			cp('gulpfile.js', 'gulpfile.js');
		} else {
			rm('test/manual');
			rm('gulpile.js');
		}

		if ( answers.integrationTests ) {
			cp('test/integration/index.js', 'test/integration/index.js');
			cp('test/integration/eslintrc', 'test/integration/.eslintrc');
			cp('wdio.conf.js', 'wdio.conf.js');
		} else {
			rm('test/integration');
			rm('wdio.conf.js');
		}

		if ( answers.transpile ) {
			cp('babelrc', '.babelrc');
			if ( !answers.filesProperty ) {
				cp('npmignore', '.npmignore');
			}
		} else {
			rm('.babelrc');
			if ( !answers.filesProperty ) {
				rm('.npmignore');
			}
		}

		if ( answers.jqueryModule ) {
			keywords.push('jquery-plugin', 'ecosystem:jquery');
		}
		if ( answers.cli ) {
			keywords.push('cli', 'cli-app');
		}

		// Write package.json, handling property order
		cp('_package.json', '_package.json');
		newPkg = this.fs.readJSON(this.destinationPath('_package.json'));
		rm('_package.json');

		mergedPkg = deepAssign({}, pkg, newPkg);

		// deep-assign overwrites arrays so we have to prepare
		// new array before writing new JSON file
		if ( Array.isArray(keywords) && keywords.length ) {
			mergedPkg.keywords = keywords;
		}

		mergedPkg = sortPkg(mergedPkg);

		this.fs.writeJSON(this.destinationPath('package.json'), mergedPkg);

	},

	install: function () {
		this.npmInstall();
	}

});
