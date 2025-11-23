/** @typedef {import('@wdio/types').Options.Testrunner & import('@wdio/types').Capabilities.WithRequestedTestrunnerCapabilities} WdioConfig */

import path from 'node:path';
import * as vite from 'vite';
import { browser } from '@wdio/globals';
import mochaConfig from './.mocharc.cjs';

let server
/** @type {WdioConfig} */
let browserConfig;

// Pull requests not handled as in case of Karma
const local = <% if ( cloudBrowsers ) { %>typeof process.env['CI'] === 'undefined' || process.env['CI'] === 'false'<% } else { %>true<% } %>;
const port = 9002;

if ( local ) {
	browserConfig = {
		baseUrl: `http://localhost:${port}`,
		services: ['docker'],
		dockerLogs: './wdio-docker-logs',
		dockerOptions: {
			image: 'selenium/standalone-chromium',
			healthCheck: 'http://localhost:4444',
			options: {
				p: ['4444:4444'],
				shmSize: '2g'
			}
		},
		capabilities: [{
			browserName: 'chrome'
		}]
	};
}<% if ( cloudBrowsers ) { %> else {
	browserConfig = {
		baseUrl: `http://localhost:${port}`,
		user: process.env.BROWSER_STACK_USERNAME,
		key: process.env.BROWSER_STACK_ACCESS_KEY,
		services: [[
			'browserstack', {
				browserstackLocal: true
			}
		]],
		capabilities: [<% for (browser of cloudBrowsersToTest) { %><%- JSON.stringify(Object.assign(browser.wdio, {
			'bstack:options': Object.assign({
				networkLogs: false,
				projectName: moduleName,
				buildName: 'Integration (WebdriverIO)',
			}, browser.wdio['bstack:options'])
		})) + ',' %><% } %>]
	};
}<% } %>

/** @type {WdioConfig} */
export const config = {
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
	injectGlobals: false,
	afterTest: async function ( test ) {
		if (!test.error) {
			return;
		}
		const filepath = path.join(import.meta.dirname, `wdio-error-shots/${Date.now()}.png`);
		await browser.saveScreenshot(filepath);
	},
	onPrepare: function ( currentConfig ) {
		return (async() => {
			const configFile = path.resolve(import.meta.dirname, 'test/manual/vite.config.js');
			if (process.env.WATCH_MODE === 'true') {
				server = await vite.createServer({
					configFile: configFile,
					server: {
						port: port
					}
				});
				server.listen();
			} else {
				await vite.build({
					configFile: configFile,
				});
				server = await vite.preview({
					configFile: configFile,
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
	},
	...browserConfig
};
