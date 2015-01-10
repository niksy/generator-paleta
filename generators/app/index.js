var yeoman = require('yeoman-generator');
var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');

var config = {
	files: ['package.json','bower.json'],
	data: {}
};

var Paleta = yeoman.generators.Base.extend({

	readConfig: function () {

		var cb = this.async();

		async.each(config.files, function ( file, callback ) {
			fs.readFile(path.join(process.cwd(), file), { encoding: 'utf8' }, function ( err, data ) {
				if ( err ) {
					callback();
					return;
				}
				_.extend( config.data, require(path.join(process.cwd(), file)) );
				callback();
			});
		}, function () {
			cb();
		});

	},

	askFor: function () {

		var cb = this.async();
		var prompts = [
			{
				type: 'input',
				name: 'name',
				message: 'Project name?',
				default: config.data.name
			},
			{
				type: 'input',
				name: 'description',
				message: 'Project description?',
				default: config.data.description
			}
		];

		this.prompt(prompts, function ( props ) {

			this.props = props;
			this.slugName = this._.slugify(props.name);

			cb();

		}.bind(this));

		this.currentYear = (new Date()).getFullYear();

	},

	app: function () {

		this.mkdir('lib');
		this.mkdir('dist');
		this.mkdir('test');
		this.copy('lib/_app.js', 'lib/index.js');

	},

	projectFiles: function () {

		this.template('_package.json', 'package.json');
		this.template('_bower.json', 'bower.json');
		this.template('_README.md', 'README.md');
		this.template('_LICENSE.md', 'LICENSE.md');

		this.copy('jshintrc', '.jshintrc');
		this.copy('jscsrc', '.jscsrc');
		this.copy('gitignore', '.gitignore');
		this.template('_Gruntfile.js', 'Gruntfile.js');

	}

});

module.exports = Paleta;
