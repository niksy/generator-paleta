module.exports = function ( config ) {
	/* eslint-disable quote-props */

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
		reporters: ['mocha'<% if ( automatedTests && codeCoverage ) { %>, 'coverage'<% } %>],
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: false,
		browserStack: {
			startTunnel: true
		},
		client: {
			mocha: {
				ui: '<%= testingInterface %>'
			}
		},<% if ( automatedTests && codeCoverage ) { %>
		browserify: {
			debug: true,
			transform: [['browserify-istanbul', { defaultIgnore: true }]]
		},
		coverageReporter: {
			reporters: [
				{
					type: 'html'
				},
				{
					type: 'text-summary'
				}
			]
		},<% } %>
		customLaunchers: {
			'BS-Chrome': {
				base: 'BrowserStack',
				browser: 'Chrome',
				os: 'Windows',
				'os_version': '7',
				project: '<%= moduleName %>',
				build: '<%= moduleName %> - automated',
				name: 'Chrome'
			},
			'BS-Firefox': {
				base: 'BrowserStack',
				browser: 'Firefox',
				os: 'Windows',
				'os_version': '7',
				project: '<%= moduleName %>',
				build: '<%= moduleName %> - automated',
				name: 'Firefox'
			},
			'BS-IE8': {
				base: 'BrowserStack',
				browser: 'IE',
				'browser_version': '8',
				os: 'Windows',
				'os_version': 'XP',
				project: '<%= moduleName %>',
				build: '<%= moduleName %> - automated',
				name: 'IE8'
			}
		},
		browsers: ['BS-Chrome', 'BS-Firefox', 'BS-IE8'],
		singleRun: true,
		concurrency: Infinity
	});

};
