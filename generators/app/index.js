var generators = require('yeoman-generator');
var gh = require('parse-github-url');
var sortKeys = require('sort-keys');
var deepAssign = require('deep-assign');
var compact = require('lodash.compact');
var uniq = require('lodash.uniq');

function sortPkg ( pkg ) {

	var arr = [
		'name',
		'version',
		'description',
		'private',
		'main',
		'browser',
		'author',
		'contributors',
		'license',
		'files',
		'style',
		'bin',
		'directories',
		'scripts',
		'dependencies',
		'devDependencies',
		'peerDependencies',
		'engines',
		'publishConfig',
		'keywords',
		'repository',
		'bugs',
		'homepage'
	].reverse();
	var newPkg;

	newPkg = sortKeys(pkg, {
		compare: function ( a, b ) {
			return arr.indexOf(a) > arr.indexOf(b) ? -1 : 1;
		}
	});

	['dependencies', 'devDependencies', 'scripts'].forEach(function ( prop ) {
		if ( prop in newPkg ) {
			newPkg[prop] = sortKeys(newPkg[prop]);
		}
	});

	['keywords'].forEach(function ( prop ) {
		if ( prop in newPkg ) {
			newPkg[prop] = newPkg[prop].sort();
		}
	});

	return newPkg;

}

module.exports = generators.Base.extend({

	prompting: function () {

		var done = this.async();
		var pkg;

		try {
			pkg = this.fs.readJSON(this.destinationPath('package.json'));
		} catch ( e ) {
			pkg = {};
		}
		if ( typeof pkg === 'undefined' ) {
			pkg = {};
		}

		this.prompt([
			{
				type: 'input',
				name: 'name',
				message: 'What is the name of the project?',
				'default': function () {
					if ( pkg.name ) {
						return pkg.name;
					}
					if ( this.appname ) {
						return this.appname.replace(/\s/g, '-');
					}
					return '';
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
				name: 'githubRepo',
				message: 'What is the GitHub repository of the project?',
				'default': function ( answers ) {
					if ( pkg.repository ) {
						return gh(pkg.repository.url).repo;
					}
					return 'niksy/' + answers.name;
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
				name: 'browserModule',
				message: 'Is this project meant to be used in browser?',
				'default': false
			},
			{
				type: 'confirm',
				name: 'jqueryModule',
				message: 'Does this project need jQuery as dependancy?',
				'default': false,
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
				'default': false
			}
		], function ( answers ) {

			var keywords = uniq(compact(answers.keywords.split(',')
				.map(function ( keyword ) {
					return keyword.trim();
				})
				.filter(function ( keyword ) {
					return keyword !== '';
				})));

			var tpl = {
				moduleName: answers.name,
				moduleDescription: answers.description,
				browserModule: answers.browserModule,
				jqueryModule: answers.jqueryModule,
				onlyNodeLts: answers.onlyNodeLts,
				manualTests: answers.manualTests,
				automatedTests: answers.automatedTests,
				integrationTests: answers.integrationTests,
				githubRepo: answers.githubRepo,
				keywords: keywords,
				version: pkg.version
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

			if ( answers.manualTests || answers.automatedTests ) {
				cp('test/eslintrc', 'test/.eslintrc');
			}
			if ( !answers.manualTests && !answers.automatedTests ) {
				rm('test');
			}

			if ( answers.automatedTests ) {
				cp('travis.yml', '.travis.yml');
				cp('test/index.js', 'test/index.js');
				if ( answers.browserModule ) {
					cp('test/automated', 'test/automated');
					cp('karma.conf.js', 'karma.conf.js');
				}
			} else {
				rm('.travis.yml');
				rm('test/index.js');
				rm('test/automated');
				rm('karma.conf.js');
			}

			if ( answers.manualTests || answers.integrationTests ) {
				cp('test/manual', 'test/manual');
				cp('gulpfile.js', 'gulpfile.js');
			} else {
				rm('test/manual');
				rm('gulpile.js');
			}

			if ( answers.integrationTests ) {
				cp('test/integration', 'test/integration');
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

			done();

		}.bind(this));

	},

	install: function () {
		this.npmInstall();
	}

});
