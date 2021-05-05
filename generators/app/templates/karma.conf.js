'use strict';

const path = require('path');<% if ( codeCoverage ) { %>
const fs = require('fs');<% } %><% if ( bundlingTool === 'webpack' ) { %>
const { assert: assertModulePath } = require('node-libs-browser');<% } %><% if ( bundlingTool === 'rollup' ) { %>
const { default: resolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const nodeBuiltins = require('rollup-plugin-node-builtins');
const globals = require('rollup-plugin-node-globals');<% if ( transpile ) { %>
const { default: babel } = require('@rollup/plugin-babel');<% } %><% if ( codeCoverage ) { %>
const istanbul = require('rollup-plugin-istanbul');<% } %>
const rollupConfig = require('./rollup.config');<% } %><% if ( browserTestType === 'headless' ) { %>
const puppeteer = require('puppeteer');

process.env.CHROME_BIN = puppeteer.executablePath();<% } %>

let config;

const isCI = typeof process.env.CI !== 'undefined' && process.env.CI !== 'false';
const isPR = <% if ( ciService === 'travis' ) { %>typeof process.env.TRAVIS_PULL_REQUEST !== 'undefined' && process.env.TRAVIS_PULL_REQUEST !== 'false'<% } else { %>typeof process.env.GITHUB_HEAD_REF !== 'undefined' && process.env.GITHUB_HEAD_REF !== ''<% } %>;
const local = !isCI || (isCI && isPR);

const port = 0;

if ( local ) {
	config = {
		browsers: <% if ( browserTestType !== 'headless' ) { %>['Chrome']<% } else { %>['ChromeHeadless']<% } %>,
	};
} else {
	config = {<% if ( cloudBrowsers ) { %>
		hostname: 'bs-local.com',
		browserStack: {
			username: process.env.BROWSER_STACK_USERNAME,
			accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
			startTunnel: true,
			project: '<%= moduleName %>',
			name: 'Automated (Karma)',
			build: 'Automated (Karma)'
		},<% } %>
		customLaunchers: {<% if ( cloudBrowsers ) { %>
			'BS-Chrome': {
				base: 'BrowserStack',
				browser: 'Chrome',
				'browser_version': '<%= browserSupport.chrome %>',
				os: 'Windows',
				'os_version': '7',
				project: '<%= moduleName %>',
				build: 'Automated (Karma)',
				name: 'Chrome'
			},
			'BS-Firefox': {
				base: 'BrowserStack',
				browser: 'Firefox',
				'browser_version': '<%= browserSupport.firefox %>',
				os: 'Windows',
				'os_version': '7',
				project: '<%= moduleName %>',
				build: 'Automated (Karma)',
				name: 'Firefox'
			}<% if ( browserSupport.ie ) { %>,
			'BS-IE<%= browserSupport.ie %>': {
				base: 'BrowserStack',
				browser: 'IE',
				'browser_version': '<%= browserSupport.ie %>',
				os: 'Windows',
				'os_version': '7',
				project: '<%= moduleName %>',
				build: 'Automated (Karma)',
				name: 'IE<%= browserSupport.ie %>'
			}<% } %><% if ( browserSupport.edge ) { %>,
			'BS-Edge<%= browserSupport.edge %>': {
				base: 'BrowserStack',
				browser: 'Edge',
				'browser_version': '<%= browserSupport.edge %>',
				os: 'Windows',
				'os_version': '10',
				project: '<%= moduleName %>',
				build: 'Automated (Karma)',
				name: 'Edge<%= browserSupport.edge %>'
			}<% } %>,<% } else { %>
			'Chrome-CI': {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}<% } %>
		},
		browsers: <% if ( cloudBrowsers ) { %>['BS-Chrome', 'BS-Firefox'<% if ( browserSupport.ie ) { %>, 'BS-IE<%= browserSupport.ie %>'<% } %><% if ( browserSupport.edge ) { %>, 'BS-Edge<%= browserSupport.edge %>'<% } %>]<% } else { %><% if ( browserTestType !== 'headless' ) { %>[(!local ? 'Chrome-CI' : 'Chrome')]<% } else { %>['ChromeHeadless']<% } %><% } %>
	};
}

module.exports = function ( baseConfig ) {

	baseConfig.set(Object.assign({
		basePath: '',
		frameworks: ['mocha', 'fixture'],
		files: [
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.html',<% if ( bundlingTool === 'webpack' ) { %>
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/.webpack.js'<% } %><% if ( bundlingTool === 'rollup' ) { %>
			{ pattern: 'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %><% if ( vanillaJsWidget ) { %>index<% } else { %>**/*<% } %>.js', watched: false }<% } %>
		],
		exclude: [],
		preprocessors: {
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.html': ['html2js'],<% if ( bundlingTool === 'webpack' ) { %>
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/.webpack.js': ['webpack', 'sourcemap']<% } %><% if ( bundlingTool === 'rollup' ) { %>
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %><% if ( vanillaJsWidget ) { %>index<% } else { %>**/*<% } %>.js': ['rollup', 'sourcemap']<% } %>
		},
		reporters: ['mocha'<% if ( codeCoverage ) { %>, 'coverage-istanbul'<% } %>],
		port: port,
		colors: true,
		logLevel: baseConfig.LOG_INFO,
		autoWatch: false,
		client: {
			captureConsole: true
		},
		browserConsoleLogOptions: {
			level: 'log',
			format: '%b %T: %m',
			terminal: true
		},<% if ( bundlingTool === 'webpack' ) { %>
		webpack: {
			mode: 'none',
			devtool: 'inline-source-map',
			resolve: {
				fallback: {
					assert: assertModulePath
				}
			}<% if ( transpile || codeCoverage ) { %>,
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
		}<% } %><% if ( bundlingTool === 'rollup' ) { %>
		rollupPreprocessor: {
			plugins: [
				nodeBuiltins()<% if ( transpile ) { %>,
				babel({
					exclude: 'node_modules/**',
					babelHelpers: 'runtime'
				})<% } %>,
				resolve({
					preferBuiltins: true
				}),
				commonjs(),
				babel({
					include: 'node_modules/{has-flag,supports-color}/**',
					babelHelpers: 'runtime',
					babelrc: false,
					configFile: path.resolve(__dirname, '.babelrc')
				}),
				globals(),
				...rollupConfig.plugins<% if ( transpile ) { %>.filter(({ name }) => !['babel'].includes(name))<% } %><% if ( vanillaJsWidget ) { %>,
				babel({
					exclude: 'node_modules/**',
					extensions: ['.js', '.svelte'],
					babelHelpers: 'runtime'
				}),
				babel({
					include: 'node_modules/svelte/shared.js',
					babelHelpers: 'runtime',
					babelrc: false,
					configFile: path.resolve(__dirname, '.babelrc')
				})<% } %><% if ( codeCoverage ) { %>,
				istanbul({
					exclude: ['test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.js', 'node_modules/**/*']
				})<% } %>
			],
			output: {
				format: 'iife',
				name: '<%= camelCasedModuleName %>',
				sourcemap: baseConfig.autoWatch ? false : 'inline', // Source map support has weird behavior in watch mode
				intro: 'window.TYPED_ARRAY_SUPPORT = false;' // IE9
			}
		}<% } %>,<% if ( codeCoverage ) { %>
		coverageIstanbulReporter: {
			dir: path.join(__dirname, 'coverage/%browser%'),
			fixWebpackSourcePaths: true,
			reports: ['html', 'text'],
			thresholds: {
				global: JSON.parse(fs.readFileSync(path.join(__dirname, '.nycrc'), 'utf8'))
			}
		},<% } %>
		singleRun: true,
		concurrency: Infinity
	}, config));

};
