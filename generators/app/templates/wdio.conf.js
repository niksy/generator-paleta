import path from 'node:path';
import * as vite from 'vite';
import mochaConfig from './.mocharc.cjs';

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
	reporters: ['spec'],<% if ( transpile || (typescript && typescriptMode === 'full') ) { %>
	mochaOpts: mochaConfig,<% } %>
	afterTest: function ( test ) {
		/* globals browsers */
		if (test.passed) {
			return;
		}
		const filepath = path.join('.', 'errorShots', `${Date.now()}.png`);
		browser.saveScreenshot(filepath);
	},
	onPrepare: function ( currentConfig ) {
		return (async() => {
			if (process.env.WATCH_MODE === 'true') {
				server = await vite.createServer({
					configFile: path.resolve(import.meta.dirname, 'test/manual/vite.config.js'),
					server: {
						port: port
					}
				});
				server.listen();
			} else {
				await vite.build({
					configFile: path.resolve(import.meta.dirname, 'test/manual/vite.config.js'),
				});
				server = await vite.preview({
					logLevel: currentConfig.logLevel === 'verbose' ? 'info' : 'silent',
					preview: {
						port: port
					}
				});
			}
		})();
	},
	onComplete: function () {
		return new Promise(( resolve, reject ) => {
			server.close();
			resolve();
		});
	}
}, _config);
