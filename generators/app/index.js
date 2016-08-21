var generators = require('yeoman-generator');
var gh = require('parse-github-url');
var isGithubUrl = require('is-github-url');
var deepAssign = require('deep-assign');
var compact = require('lodash.compact');
var uniq = require('lodash.uniq');
var sortPkg = require('sort-pkg');
var dashCase = require('lodash.kebabcase');
var isScopedPackage = require('is-scoped-package');

/**
 * @param  {String} pkgName
 *
 * @return {String}
 */
function preparePkgName ( pkgName ) {
	var scopedPkgName;
	if ( isScopedPackage(pkgName) ) {
		scopedPkgName = pkgName.split('/');
		return [scopedPkgName[0], dashCase(scopedPkgName[1])].join('/');
	}
	return dashCase(pkgName);
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
	},

	prompting: function () {

		var done = this.async();
		var pkg = this.pkg;
		var author = this.author;

		this.prompt([
			{
				type: 'input',
				name: 'name',
				message: 'What is the name of the project?',
				'default': function () {
					var pkgName;
					if ( pkg.name ) {
						pkgName = pkg.name;
					} else if ( this.appname ) {
						pkgName = this.appname;
					}
					return preparePkgName(pkgName);
				}.bind(this)
			},
			{
				type: 'input',
				name: 'description',
				message: 'What is the description of the project?',
				'default': function () {
					if ( pkg.description ) {
						return pkg.description;
					}
					return '';
				}
			},
			{
				type: 'input',
				name: 'keywords',
				message: 'What are the keywords for this project?',
				'default': function () {
					if ( pkg.keywords ) {
						return pkg.keywords.join(', ');
					}
					return '';
				}
			},
			{
				type: 'input',
				name: 'gitRepo',
				message: 'What is the Git repository of the project?',
				'default': function ( answers ) {
					if ( pkg.repository ) {
						if ( isGithubUrl(pkg.repository.url) ) {
							return gh(pkg.repository.url).repository;
						}
						return pkg.repository.url;
					}
					return `${author.username}/${answers.name}`;
				}
			},
			{
				type: 'confirm',
				name: 'onlyNodeLts',
				message: 'Run only on Node LTS (>=4)?',
				'default': true
			},
			{
				type: 'confirm',
				name: 'cli',
				message: 'Does this project has CLI interface?',
				'default': false
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
				when: function ( answers ) {
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
				'default': false
			},
			{
				type: 'confirm',
				name: 'integrationTests',
				message: 'Do you have integration (UI/E2E/Selenium) tests?',
				'default': false,
				when: function ( answers ) {
					return answers.automatedTests;
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
				when: function ( answers ) {
					return answers.automatedTests;
				}
			},
			{
				type: 'confirm',
				name: 'codeCoverage',
				message: 'Do you need code coverage?',
				'default': false,
				when: function ( answers ) {
					return answers.automatedTests;
				}
			},
			{
				type: 'confirm',
				name: 'codeCoverageService',
				message: 'Do you want to send code coverage report to Coveralls?',
				'default': false,
				when: function ( answers ) {
					return answers.codeCoverage;
				}
			}
		], function ( answers ) {

			var browserModuleType = answers.browserModuleType || [];

			this.answers = Object.assign({}, answers, {
				jqueryModule: browserModuleType.indexOf('jqueryModule') !== -1,
				sassModule: browserModuleType.indexOf('sassModule') !== -1,
				cssModule: browserModuleType.indexOf('cssModule') !== -1,
				styles: browserModuleType.indexOf('styles') !== -1
			});

			if ( this.answers.cssModule || this.answers.sassModule ) {
				this.answers.styles = true;
			}

			done();

		}.bind(this));

	},

	writing: function () {

		var answers = this.answers;
		var pkg = this.pkg;
		var author = this.author;

		var keywords = uniq(compact(answers.keywords.split(',')
			.map(function ( keyword ) {
				return keyword.trim();
			})
			.filter(function ( keyword ) {
				return keyword !== '';
			})));

		var tpl = {
			moduleName: preparePkgName(answers.name),
			cleanModuleName: preparePkgName(answers.name).replace(/^@.+?\//, ''),
			moduleDescription: answers.description,
			browserModule: answers.browserModule,
			styles: answers.styles,
			jqueryModule: answers.jqueryModule,
			sassModule: answers.sassModule,
			cssModule: answers.cssModule,
			onlyNodeLts: answers.onlyNodeLts,
			cli: answers.cli,
			manualTests: answers.manualTests,
			automatedTests: answers.automatedTests,
			integrationTests: answers.integrationTests,
			testingInterface: answers.testingInterface,
			codeCoverage: answers.codeCoverage,
			codeCoverageService: answers.codeCoverageService,
			gitRepo: gh(answers.gitRepo),
			keywords: keywords,
			version: pkg.version,
			humanName: author.humanName,
			username: author.username,
			website: author.website,
			email: author.email
		};

		var cp = function ( from, to ) {
			this.fs.copyTpl(this.templatePath(from), this.destinationPath(to), tpl);
		}.bind(this);
		var rm = function ( to ) {
			this.fs.delete(this.destinationPath(to));
		}.bind(this);
		var newPkg, mergedPkg;

		cp('README.md', 'README.md');
		cp('LICENSE.md', 'LICENSE.md');
		cp('editorconfig', '.editorconfig');
		cp('eslintrc', '.eslintrc');
		cp('gitignore', '.gitignore');
		cp('index.js', 'index.js');

		if ( answers.cli ) {
			cp('cli.js', 'cli.js');
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
					cp('test/automated/fixtures', 'test/automated/fixtures');
					cp('test/automated/index.js', 'test/automated/index.js');
					cp('karma.conf.js', 'karma.conf.js');
				} else {
					cp('test/index.js', 'test/index.js');
				}
			} else {
				cp('test/index.js', 'test/index.js');
			}
			if ( answers.codeCoverage ) {
				cp('istanbul.yml', '.istanbul.yml');
			}
		} else {
			rm('.travis.yml');
			rm('test/index.js');
			rm('test/automated');
			rm('karma.conf.js');
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
