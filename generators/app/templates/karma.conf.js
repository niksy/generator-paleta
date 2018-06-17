/* globals process:false */
/* eslint-disable no-process-env */

'use strict';

module.exports = function ( config ) {

	config.set({
		basePath: '',
		frameworks: ['mocha'],
		files: [
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.html',
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/.webpack.js'
		],
		exclude: [],
		preprocessors: {
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.html': ['html2js'],
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/.webpack.js': ['webpack', 'sourcemap']
		},
		reporters: ['mocha'<% if ( codeCoverage ) { %>, 'coverage-istanbul'<% } %>],
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
			captureConsole: true,
			mocha: {
				ui: '<%= testingInterface %>'
			}
		},
		browserConsoleLogOptions: {
			level: 'log',
			format: '%b %T: %m',
			terminal: true
		},
		webpack: {
			mode: 'none'
			devtool: 'cheap-module-inline-source-map'<% if ( transpile || codeCoverage ) { %>,
			module: {
				rules: [<% if ( transpile ) { %>
					{
						test: /\.js$/,
						exclude: /node_modules/,
						use: [{
							loader: 'babel-loader'
						}]
					}<% } %><% if ( transpile && codeCoverage ) { %>,<% } %><% if ( codeCoverage ) { %>
					{
						test: /\.js$/,
						exclude: /(node_modules|test)/,
						enforce: 'post',
						use: [{
							loader: 'istanbul-instrumenter-loader'<% if ( esModules ) { %>,
							options: {
								esModules: true
							}<% } %>
						}]
					}<% } %>
				]
			}<% } %>
		},<% if ( codeCoverage ) { %>
		coverageIstanbulReporter: {
			fixWebpackSourcePaths: true,
			reports: ['html', 'text'],
			thresholds: {
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
