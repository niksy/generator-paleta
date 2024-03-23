import path from 'node:path';<% if ( codeCoverage ) { %>
import fs from 'node:fs';<% } %><% if ( bundlingTool === 'webpack' ) { %>
import stdLibBrowser from 'node-stdlib-browser';<% } %><% if ( bundlingTool === 'rollup' ) { %>
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodeBuiltins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';<% if ( transpile ) { %>
import babel from '@rollup/plugin-babel';<% } %><% if ( codeCoverage ) { %>
import istanbul from 'rollup-plugin-istanbul';<% } %>
import rollupConfig from './rollup.config.js';<% } %><% if ( browserTestType === 'headless' ) { %>
import puppeteer from 'puppeteer';

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
		customLaunchers: {<% if ( cloudBrowsers ) { %><% for (browser of cloudBrowsersToTest) { %>
			'BS-<%= browser.shortName %>': <%- JSON.stringify(Object.assign({
				base: 'BrowserStack',
				project: moduleName,
				build: 'Automated (Karma)',
			}, browser.karma)) + ',' %><% } %><% } else { %>
			'Chrome-CI': {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}<% } %>
		},
		browsers: <% if ( cloudBrowsers ) { %>[<%- cloudBrowsersToTest.map((browser) => `'BS-${browser.shortName}'`).join(', ') %>]<% } else { %><% if ( browserTestType !== 'headless' ) { %>[(!local ? 'Chrome-CI' : 'Chrome')]<% } else { %>['ChromeHeadless']<% } %><% } %>
	};
}

export default function ( baseConfig ) {

	baseConfig.set(Object.assign({
		basePath: '',
		frameworks: ['mocha'<% if ( usesHtmlFixtures ) { %>, 'fixture'<% } %>],
		files: [<% if ( usesHtmlFixtures ) { %>
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.html',<% } %><% if ( bundlingTool === 'webpack' ) { %>
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/.webpack.js'<% } %><% if ( bundlingTool === 'rollup' ) { %>
			{ pattern: 'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %><% if ( vanillaJsWidget ) { %>index<% } else { %>**/*<% } %>.<%= extension || 'js' %>', watched: false }<% } %>
		],
		exclude: [],
		preprocessors: {<% if ( usesHtmlFixtures ) { %>
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.html': ['html2js'],<% } %><% if ( bundlingTool === 'webpack' ) { %>
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/.webpack.js': ['webpack', 'sourcemap']<% } %><% if ( bundlingTool === 'rollup' ) { %>
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %><% if ( vanillaJsWidget ) { %>index<% } else { %>**/*<% } %>.<%= extension || 'js' %>': ['rollup', 'sourcemap']<% } %>
		},
		reporters: ['mocha'<% if ( codeCoverage ) { %>, 'coverage'<% } %>],
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
			resolve: {<% if ( transpile && typescript && typescriptMode === 'full' ) { %>
				extensions: ['...', '.ts'],<% } %>
				fallback: {
					assert: stdLibBrowser.assert
				}
			}<% if ( transpile || codeCoverage ) { %>,
			module: {
				rules: [<% if ( transpile ) { %>
					{
						test: /\.<%= extension || 'js' %>$/,
						exclude: /node_modules/,
						use: [{
							loader: 'babel-loader'
						}]
					}<% } %><% if ( transpile && codeCoverage ) { %>,<% } %><% if ( codeCoverage ) { %>
					{
						test: /\.<%= extension || 'js' %>$/,
						exclude: /(node_modules|test)/,
						enforce: 'post',
						use: [{
							loader: '@jsdevtools/coverage-istanbul-loader',
							options: {
								esModules: true
							}
						}]
					}<% } %>
				]
			}<% } %>
		}<% } %><% if ( bundlingTool === 'rollup' ) { %>
		rollupPreprocessor: {
			plugins: [<% if ( codeCoverage ) { %>
				istanbul({
					exclude: ['test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.<%= extension || 'js' %>', 'node_modules/**/*']
				}),<% } %>
				nodeBuiltins()<% if ( transpile ) { %>,
				babel({
					exclude: 'node_modules/**',
					babelHelpers: 'runtime'<% if ( typescript && typescriptMode === 'full' ) { %>,
					extensions: ['.js', '.ts']<% } %>
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
				...rollupConfig.plugins<% if ( transpile || typescript ) { %>.filter(({ name }) => ![<% if ( transpile ) { %>'babel'<% } %>, 'package-type'<% if ( typescript ) { %>, 'types'<% } %>].includes(name))<% } %><% if ( vanillaJsWidget || (transpile && typescript && typescriptMode === 'full') ) { %>,
				babel({
					exclude: 'node_modules/**',
					babelHelpers: 'runtime',
					extensions: ['.js'<% if (typescript && typescriptMode === 'full') { %>, '.ts'<% } %><% if (vanillaJsWidget) { %>, '.svelte'<% } %>]
				})<% if ( vanillaJsWidget ) { %>,
				babel({
					include: 'node_modules/svelte/shared.js',
					babelHelpers: 'runtime',
					babelrc: false,
					configFile: path.resolve(__dirname, '.babelrc')
				})<% } %><% } %>
			],
			output: {
				format: 'iife',
				name: '<%= camelCasedModuleName %>',
				sourcemap: baseConfig.autoWatch ? false : 'inline', // Source map support has weird behavior in watch mode
				intro: 'window.TYPED_ARRAY_SUPPORT = false;' // IE9
			}
		}<% } %>,<% if ( codeCoverage ) { %>
		coverageReporter: {
			dir: path.join(__dirname, 'coverage'),
			reporters: [{type: 'html'}, {type: 'text'}],
			check: {
				global: JSON.parse(fs.readFileSync(path.join(__dirname, '.nycrc'), 'utf8'))
			}
		},<% } %>
		singleRun: true,
		concurrency: Infinity
	}, config));

};
