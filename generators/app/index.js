var yeoman = require('yeoman-generator');

var Paleta = yeoman.generators.Base.extend({

	askFor: function () {

		var cb = this.async();
		var prompts = [
			{
				type: 'input',
				name: 'name',
				message: 'Name of the project?'
			},
			{
				type: 'input',
				name: 'description',
				message: 'And what would you use to describe this project?'
			},
			{
				type: 'list',
				name: 'projectType',
				message: 'What kind of project are you building?',
				choices: [
					'Simple web module',
					'jQuery'
				],
				filter: function ( val ) {
					return this._.camelize(val.toLowerCase());
				}.bind(this),
				default: 'Simple web module'
			},
			{
				when: function ( response ) {
					return response.projectType === 'simpleWebModule';
				},
				type: 'confirm',
				name: 'jquery',
				message: 'Should I include jQuery as dependancy?',
				default: true
			},
			{
				type: 'input',
				name: 'ns',
				message: 'What is the project namespace?',
				default: 'kist'
			}
		];

		this.prompt(prompts, function ( props ) {

			this.props = props;
			if ( this.props.projectType === 'jquery' ) {
				this.props.jquery = true;
			}

			this.slugName  = this._.slugify(props.name);
			this.camelName = this._.camelize(this.slugName);

			cb();

		}.bind(this));

		this.currentYear = (new Date()).getFullYear();

	},

	app: function () {

		this.mkdir('src');
		this.mkdir('dist');
		this.mkdir('test');
		this.copy('src/_app.js', 'src/' + this.props.ns + '-' + this.slugName + '.js');
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
