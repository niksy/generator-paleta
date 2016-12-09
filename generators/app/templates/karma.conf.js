/* globals process:false */
/* eslint-disable no-process-env */

'use strict';

module.exports = function ( config ) {

	config.set({
		basePath: '',
		frameworks: ['browserify', 'mocha'],
		files: [
			'test/automated/**/*.html',
			'test/automated/**/*.js'
		],
		exclude: [],
		preprocessors: {
			'test/automated/**/*.html': ['html2js'],
			'test/automated/**/*.js': ['browserify']
		},
		reporters: ['mocha'<% if ( codeCoverage ) { %>, 'coverage'<% } %>],
		port: 9001,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: false,<% if ( cloudBrowsers ) { %>
		browserStack: {
			startTunnel: true,
			project: '<%= moduleName %>',
			name: 'Automated (Karma)',
			build: 'Automated (Karma)'
		},<% } %>
		client: {
			mocha: {
				ui: '<%= testingInterface %>'
			}
		},
		browserify: {
			debug: true,
			transform: [
				<% if ( transpile ) { %>'babelify'<% } %><% if ( codeCoverage ) { %><% if ( transpile ) { %>,
				['browserify-babel-istanbul', { defaultIgnore: true }]<% } else { %>
				['browserify-istanbul', { defaultIgnore: true }]<% } %><% } %>
			]
		},<% if ( codeCoverage ) { %>
		coverageReporter: {
			reporters: [
				{
					type: 'html'
				},
				{
					type: 'text'
				}
			],
			check: {
				global: {
					statements: 80
				}
			}
		},<% } %>
		customLaunchers: {<% if ( cloudBrowsers ) { %>
			'BS-Chrome': {
				base: 'BrowserStack',
				browser: 'Chrome',
				os: 'Windows',
				'os_version': '7',
				project: '<%= moduleName %>',
				build: 'Automated (Karma)',
				name: 'Chrome'
			},
			'BS-Firefox': {
				base: 'BrowserStack',
				browser: 'Firefox',
				os: 'Windows',
				'os_version': '7',
				project: '<%= moduleName %>',
				build: 'Automated (Karma)',
				name: 'Firefox'
			},
			'BS-IE9': {
				base: 'BrowserStack',
				browser: 'IE',
				'browser_version': '9',
				os: 'Windows',
				'os_version': '7',
				project: '<%= moduleName %>',
				build: 'Automated (Karma)',
				name: 'IE9'
			},<% } else { %>
			'Chrome-CI': {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}<% } %>
		},
		browsers: <% if ( cloudBrowsers ) { %>['BS-Chrome', 'BS-Firefox', 'BS-IE9']<% } else { %>[(process.env.TRAVIS ? 'Chrome-CI' : 'Chrome')]<% } %>,
		singleRun: true,
		concurrency: Infinity
	});

};
