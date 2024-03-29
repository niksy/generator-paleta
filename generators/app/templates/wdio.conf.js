import path from 'node:path';
import http from 'node:http';
import ws from 'local-web-server';
import shutdown from 'http-shutdown';

let server, _config;

// Pull requests not handled as in case of Karma
const local = <% if ( cloudBrowsers ) { %>typeof process.env.CI === 'undefined' || process.env.CI === 'false'<% } else { %>true<% } %>;
const port = 0;

if ( local ) {
	_config = {
		baseUrl: `http://host.docker.internal:${port}`,
		services: [[
			'docker', {
				dockerLogs: './wdioDockerLogs',
				dockerOptions: {
					image: 'selenium/standalone-chrome',
					healthCheck: 'http://localhost:4444',
					options: {
						p: ['4444:4444'],
						shmSize: '2g'
					}
				}
			}
		]],
		capabilities: [{
			browserName: 'chrome'
		}]
	};
}<% if ( cloudBrowsers ) { %> else {
	_config = {
		baseUrl: `http://localhost:${port}`,
		user: process.env.BROWSER_STACK_USERNAME,
		key: process.env.BROWSER_STACK_ACCESS_KEY,
		services: [[
			'browserstack'; {
				browserstackLocal: true
			}
		]],
		capabilities: [<% for (browser of cloudBrowsersToTest) { %><%- JSON.stringify(Object.assign({
			project: moduleName,
			build: 'Integration (WebdriverIO)',
			'browserstack.local': 'true',
			'browserstack.debug': 'true'
		}, browser.wdio)) + ',' %><% } %>]
	};
}<% } %>

export const config = Object.assign({
	specs: [
		'./test/integration/**/*.<%= extension || 'js' %>'
	],
	exclude: [],
	maxInstances: 10,
	logLevel: 'info',
	waitforTimeout: 10000,
	connectionRetryTimeout: 90000,
	connectionRetryCount: 3,
	framework: 'mocha',
	reporters: ['spec'],<% if ( transpile || typescript ) { %>
	mochaOpts: {
		require: [<% if ( transpile ) { %>'@babel/register', <% } %><% if ( !transpile && typescript && typescriptMode === 'full' ) { %>'ts-node/register', <% } %>]<% if ( typescript && typescriptMode === 'full' ) { %>,
		extension: 'ts'<% } %>
	},<% } %>
	afterTest: function ( test ) {
		/* globals browsers */
		if (test.passed) {
			return;
		}
		const filepath = path.join('.', 'errorShots', `${Date.now()}.png`);
		browser.saveScreenshot(filepath);
	},
	onPrepare: function ( currentConfig ) {

		return new Promise(( resolve, reject ) => {

			server = shutdown(http.createServer(ws({
				'static': {
					root: './test-dist'
				},
				serveIndex: {
					path: './test-dist'
				},
				log: {
					format: currentConfig.logLevel === 'verbose' ? 'tiny' : 'none'
				}
			}).callback()));

			console.log(`Starting local web server on port ${port}…`);
			server.listen(port);

			console.log('Starting WebdriverIO…');
			resolve();

		});

	},

	onComplete: function () {

		return new Promise(( resolve, reject ) => {

			console.log('Stopping local web server…');
			server.shutdown();

			console.log('Stopping WebdriverIO…');
			resolve();

		});

	}
}, _config);
