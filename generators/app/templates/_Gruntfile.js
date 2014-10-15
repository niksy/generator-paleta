module.exports = function ( grunt ) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		meta: {
			banner: '/*! <%%= pkg.name %> <%%= pkg.version %> - <%%= pkg.description %> | Author: <%%= pkg.author %>, <%%= grunt.template.today("yyyy") %> | License: <%%= pkg.license %> */\n'
		},

		concat: {
			dist: {
				options: {
					stripBanners: true,
					banner: '<%%= meta.banner %>'
				},
				files: {
					'dist/<%= ns.name %><%= camelName %>.js': ['src/<%= ns.name %><%= camelName %>.js']
				}
			}
		},

		uglify: {
			dist: {
				options: {
					banner: '<%%= meta.banner %>'
				},
				files: {
					'dist/<%= ns.name %><%= camelName %>.min.js': ['src/<%= ns.name %><%= camelName %>.js']
				}
			}
		},<% if ( props.hasCss ) { %>

		cssmin: {
			dist: {
				options: {
					banner: '<%%= meta.banner %>'
				},
				files: {
					'dist/<%= ns.name %><%= camelName %>.min.css': ['src/<%= ns.name %><%= camelName %>.css']
				}
			}
		},<% } %>

		bump: {
			options: {
				files: ['package.json', 'bower.json'],
				updateConfigs: ['pkg'],
				commit: true,
				commitMessage: 'Release %VERSION%',
				commitFiles: ['-a'],
				createTag: true,
				tagName: '%VERSION%',
				tagMessage: '',
				push: false
			}
		},

		jscs: {
			main: {
				options: {
					config: '.jscsrc'
				},
				files: {
					src: [
						'src/**/*.js'
					]
				}
			}
		},

		jshint: {
			main: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: [
					'src/**/*.js'
				]
			}
		},<% if ( props.hasCss ) { %>

		csslint: {
			main: {
				options: {
					csslintrc: '.csslintrc'
				},
				src: [
					'src/**/*.css'
				]
			}
		}<% } %>

	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('stylecheck', ['jshint:main', 'jscs:main'<% if ( props.hasCss ) { %>, 'csslint:main'<% } %>]);
	grunt.registerTask('default', ['stylecheck', 'concat', 'uglify'<% if ( props.hasCss ) { %>, 'cssmin'<% } %>]);
	grunt.registerTask('releasePatch', ['bump-only:patch', 'default', 'bump-commit']);
	grunt.registerTask('releaseMinor', ['bump-only:minor', 'default', 'bump-commit']);
	grunt.registerTask('releaseMajor', ['bump-only:major', 'default', 'bump-commit']);

};
