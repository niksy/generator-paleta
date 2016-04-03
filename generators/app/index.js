var generators = require('yeoman-generator');
var gh = require('parse-github-url');
var readPkg = require('read-pkg');

module.exports = generators.Base.extend({

	prompting: function () {

		var done = this.async();
		var pkg;

		try {
			pkg = readPkg.sync(this.destinationPath('package.json'));
		} catch ( e ) {
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
				name: 'manualTests',
				message: 'Do you have manual tests?',
				'default': false
			},
			{
				type: 'confirm',
				name: 'automatedTests',
				message: 'Do you have automated tests?',
				'default': false
			}
		], function ( answers ) {

			var tpl = {
				moduleName: answers.name,
				moduleDescription: answers.description,
				manualTests: answers.manualTests,
				automatedTests: answers.automatedTests,
				githubRepo: answers.githubRepo
			};

			var cp = function ( from, to ) {
				this.fs.copyTpl(this.templatePath(from), this.destinationPath(to), tpl);
			}.bind(this);
			var rm = function ( to ) {
				this.fs.delete(this.destinationPath(to));
			}.bind(this);

			cp('README.md', 'README.md');
			cp('LICENSE.md', 'LICENSE.md');
			cp('editorconfig', '.editorconfig');
			cp('eslintrc', '.eslintrc');
			cp('gitignore', '.gitignore');
			cp('_package.json', 'package.json');
			cp('index.js', 'index.js');

			if ( answers.manualTests || answers.automatedTests ) {
				cp('test', 'test');
			}
			if ( !answers.manualTests && !answers.automatedTests ) {
				rm('test');
			}

			if ( answers.automatedTests ) {
				cp('travis.yml', '.travis.yml');
			} else {
				rm('.travis.yml');
			}

			done();

		}.bind(this));

	},

	install: function () {
		this.npmInstall();
	}

});
