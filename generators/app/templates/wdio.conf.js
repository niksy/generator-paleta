'use strict';

const path = require('path');
const http = require('http');
const ws = require('local-web-server');
const shutdown = require('http-shutdown');

let server, config;

// Pull requests not handled as in case of Karma
const local = <% if ( cloudBrowsers ) { %>typeof process.env.CI === 'undefined' || process.env.CI === 'false'<% } else { %>true<% } %>;
const port = 0;

if ( local ) {
	config = {
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
	config = {
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

module.exports.config = Object.assign({
	specs: [
		'./test/integration/**/*.js'
	],
	exclude: [],
	maxInstances: 10,
	logLevel: 'info',
	waitforTimeout: 10000,
	connectionRetryTimeout: 90000,
	connectionRetryCount: 3,
	framework: 'mocha',
	reporters: ['spec'],<% if ( transpile || esModules ) { %>
	mochaOpts: {
		require: [<% if ( transpile ) { %>'@babel/register'<% } %><% if ( transpile && esModules ) { %>, <% } %><% if ( esModules ) { %>'esm'<% } %>]
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
}, config);
