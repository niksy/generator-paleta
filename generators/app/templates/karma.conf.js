import path from 'node:path';
import { defineEnv } from 'unenv';<% if ( codeCoverage ) { %>
// @ts-expect-error
import istanbul from 'rollup-plugin-istanbul';
import nycConfig from './nyc.config.js';<% } %>
import rolldownConfig from './rolldown.config.js';<% if ( browserTestType === 'headless' ) { %>
import puppeteer from 'puppeteer';

process.env['CHROME_BIN'] = puppeteer.executablePath();<% } %>

/** @type {import('karma-rolldown-preprocessor')} */
/** @type {import('karma').ConfigOptions} */
let config;

const isCI = typeof process.env['CI'] !== 'undefined' && process.env['CI'] !== 'false';
const isPR = <% if ( ciService === 'travis' ) { %>typeof process.env['TRAVIS_PULL_REQUEST'] !== 'undefined' && process.env['TRAVIS_PULL_REQUEST'] !== 'false'<% } else { %>typeof process.env['GITHUB_HEAD_REF'] !== 'undefined' && process.env['GITHUB_HEAD_REF'] !== ''<% } %>;
const local = !isCI || (isCI && isPR);

const port = 0;

const { env } = defineEnv({
	nodeCompat: true
});

if ( local ) {
	config = {
		browsers: <% if ( browserTestType !== 'headless' ) { %>['Chrome']<% } else { %>['ChromeHeadless']<% } %>,
	};
} else {
	config = {<% if ( cloudBrowsers ) { %>
		hostname: 'bs-local.com',
		browserStack: {
			username: process.env['BROWSER_STACK_USERNAME'],
			accessKey: process.env['BROWSER_STACK_ACCESS_KEY'],
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

/**
 * @param  {import('karma').Config} baseConfig
 */
export default function (baseConfig) {

	baseConfig.set(Object.assign({
		basePath: '',
		frameworks: ['mocha'<% if ( usesHtmlFixtures ) { %>, 'fixture'<% } %>],
		files: [<% if ( usesHtmlFixtures ) { %>
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.html',<% } %>
			{ pattern: 'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.<%= extension || 'js' %>', watched: false }
		],
		exclude: [],
		preprocessors: {<% if ( usesHtmlFixtures ) { %>
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.html': ['html2js'],<% } %>
			'test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.<%= extension || 'js' %>': ['rolldown', 'sourcemap']
		},
		reporters: [<% if ( codeCoverage ) { %>'coverage', <% } %>'mocha'],
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
		},
		rolldownPreprocessor: {
			// @ts-expect-error
			transform: {
				inject: env.inject,
				target: rolldownConfig[0]?.transform?.target ?? []
			},
			resolve: {
				alias: {
					...(rolldownConfig[0]?.resolve?.alias),
					...env.alias,
				}
			},
			plugins: [<% if ( codeCoverage ) { %>
				istanbul({
					exclude: ['test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>**/*.<%= extension || 'js' %>', 'node_modules/**/*']
				}),<% } %>
				...(Array.isArray(rolldownConfig[0]?.plugins)
					? rolldownConfig[0]?.plugins.filter((plugin) => {
							return !(
								/** @type {import('rolldown').Plugin[]}*/ (
									plugin
								)?.[0]?.name?.includes('rolldown-plugin-dts')
							);
						})
					: [])
			],
			output: {
				format: 'iife',
				name: '<%= camelCasedModuleName %>',
				sourcemap: 'inline'
			}
		},<% if ( codeCoverage ) { %>
		coverageReporter: {
			dir: path.join(import.meta.dirname, 'coverage'),
			reporters: [{type: 'html'}, {type: 'text'}],
			check: {
				global: nycConfig
			}
		},<% } %>
		singleRun: true,
		concurrency: Infinity
	}, config));

};
