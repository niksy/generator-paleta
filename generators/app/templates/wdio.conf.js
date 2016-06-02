/* eslint-disable no-process-env, no-process-exit, quote-props */

var http = require('http');
var BrowserStackTunnel = require('browserstacktunnel-wrapper');
var ws = require('local-web-server');
var shutdown = require('http-shutdown');
var minimist = require('minimist');
var server, tunnel;

var args = minimist(process.argv.slice(2), {
	'default': {
		verbose: false,
		port: 9000
	}
});
var port = args.port;
var verbose = args.verbose;

exports.config = {
	user: process.env.BROWSER_STACK_USERNAME,
	key: process.env.BROWSER_STACK_ACCESS_KEY,
	specs: [
		'./test/integration/**/*.js'
	],
	exclude: [],
	maxInstances: 10,
	capabilities: [{
		browser: 'Chrome',
		os: 'Windows',
		'os_version': '7',
		project: '<%= moduleName %>',
		build: '<%= moduleName %> - integration',
		name: 'Chrome',
		'browserstack.local': 'true',
		'browserstack.debug': 'true'
	}, {
		browser: 'Firefox',
		os: 'Windows',
		'os_version': '7',
		project: '<%= moduleName %>',
		build: '<%= moduleName %> - integration',
		name: 'Firefox',
		'browserstack.local': 'true',
		'browserstack.debug': 'true'
	}, {
		browser: 'IE',
		'browser_version': '8',
		os: 'Windows',
		'os_version': 'XP',
		project: '<%= moduleName %>',
		build: '<%= moduleName %> - integration',
		name: 'IE8',
		'browserstack.local': 'true',
		'browserstack.debug': 'true'
	}],
	sync: false,
	logLevel: verbose ? 'verbose' : 'silent',
	coloredLogs: true,
	screenshotPath: './errorShots/',
	baseUrl: 'http://localhost:' + port,
	waitforTimeout: 10000,
	connectionRetryTimeout: 90000,
	connectionRetryCount: 3,
	framework: 'mocha',
	reporters: ['spec'],
	mochaOpts: {
		ui: '<%= testingInterface %>'
	},
	onPrepare: function () {

		return new Promise(function ( resolve, reject ) {

			server = shutdown(http.createServer(ws({
				'static': {
					root: './test-dist'
				},
				serveIndex: {
					path: './test-dist'
				},
				log: {
					format: verbose ? 'tiny' : 'none'
				}
			}).callback()));

			console.log('Starting local web server on port ' + port + '…');
			server.listen(port);

			tunnel = new BrowserStackTunnel({
				key: process.env.BROWSER_STACK_ACCESS_KEY,
				hosts: [{
					name: 'localhost',
					port: port
				}]
			});

			console.log('Starting BrowserStack tunnel…');
			tunnel.start(function ( err ) {
				if ( err ) {
					reject(err);
					return;
				}

				console.log('Starting WebDriverIO…');
				resolve();
			});

		}).catch(function ( err ) {
			console.log(err);

			console.log('Stopping local web server…');
			server.shutdown();

			process.exit(1);
		});

	},

	onComplete: function () {

		return new Promise(function ( resolve, reject ) {

			console.log('Stopping local web server…');
			server.shutdown();

			console.log('Stopping BrowserStack tunnel…');
			tunnel.stop(function ( err ) {
				if ( err ) {
					reject(err);
					return;
				}

				console.log('Stopping WebDriverIO…');
				resolve();
			});

		}).catch(function ( err ) {
			console.log(err);
			process.exit(1);
		});

	}
};
