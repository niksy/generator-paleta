import { kebabCase as dashCase, uniq, compact, min, fromPairs as fromEntries } from 'lodash';
import isScopedPackage from 'is-scoped';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import { minVersion } from 'semver';

// https://www.browserstack.com/automate/capabilities
export const browserIdMapping = {
	chrome: {
		shortName: 'Chrome',
		longName: 'Chrome',
		karmaServiceProps: (browserVersion) => {
			return {
				browser: 'Chrome',
				'browser_version': browserVersion,
				name: 'Chrome',
				os: 'Windows',
				'os_version': '7'
			};
		},
		wdioServiceProps: (browserVersion) => {
			return {
				browserName: 'Chrome',
				browserVersion: browserVersion,
				'bstack:options': {
					os: 'Windows',
					osVersion: '7'
				}
			};
		}
	},
	firefox: {
		shortName: 'Firefox',
		longName: 'Firefox',
		karmaServiceProps: (browserVersion) => {
			return {
				browser: 'Firefox',
				'browser_version': browserVersion,
				name: 'Firefox',
				os: 'Windows',
				'os_version': '7'
			};
		},
		wdioServiceProps: (browserVersion) => {
			return {
				browserName: 'Firefox',
				browserVersion: browserVersion,
				'bstack:options': {
					os: 'Windows',
					osVersion: '7'
				}
			};
		}
	},
	edge: {
		shortName: 'Edge',
		longName: 'Edge',
		karmaServiceProps: (browserVersion) => {
			return {
				browser: 'Edge',
				'browser_version': browserVersion,
				name: 'Edge',
				os: 'Windows',
				'os_version': '10'
			};
		},
		wdioServiceProps: (browserVersion) => {
			return {
				browserName: 'Edge',
				browserVersion: browserVersion,
				'bstack:options': {
					os: 'Windows',
					osVersion: '10'
				}
			};
		}
	},
	'ios_saf': {
		shortName: 'iPhone',
		longName: 'iOS Safari',
		karmaServiceProps: (browserVersion) => {
			return {
				browser: 'iPhone',
				'os_version': browserVersion,
				name: 'iPhone',
				device: 'iPhone 8',
				'real_mobile': true
			};
		},
		wdioServiceProps: (browserVersion) => {
			return {
				browserName: 'iPhone',
				osVersion: browserVersion,
				'bstack:options': {
					device: 'iPhone 8',
					'real_mobile': true
				}
			};
		}
	}
};

/**
 * @param {string} packageName
 * @param {object} options
 *
 * @returns {string}
 */
export function preparePackageName(packageName, options = {}) {
	let preparedPackageName;
	if (isScopedPackage(packageName)) {
		const scopedPackageName = packageName.split('/');
		preparedPackageName = [scopedPackageName[0], dashCase(scopedPackageName[1])].join('/');
	} else {
		preparedPackageName = dashCase(packageName);
	}
	if (options.clean) {
		return preparedPackageName.replace(/^@.+?\//, '');
	}
	return preparedPackageName;
}

export function isSassModule(answers) {
	const browserModuleType = answers.browserModuleType || [];
	return browserModuleType.includes('sassModule');
}

export function commaSeparatedValuesToArray(string) {
	if (typeof string === 'undefined') {
		return [];
	}
	return uniq(
		compact(
			string
				.split(',')
				.map((item) => item.trim())
				.filter((item) => item !== '')
		)
	);
}

export function cloudBrowsersToTestConfiguration(browserIds, browserVersion) {
	if (!Array.isArray(browserIds)) {
		return [];
	}
	const config = browserIds.map((browserId) => {
		const mappedBrowser = browserIdMapping[browserId];
		return {
			shortName: mappedBrowser.shortName,
			longName: mappedBrowser.longName,
			version: browserVersion[browserId],
			karma: mappedBrowser.karmaServiceProps(String(browserVersion[browserId])),
			wdio: mappedBrowser.wdioServiceProps(String(browserVersion[browserId]))
		};
	});
	return config;
}

export function getMinimumSupportedBrowserVersions(browserVersion) {
	let browserSupport = browserslist(browserVersion)
		.map((string) => string.split(' '))
		.reduce((map, [browser, version]) => {
			if (!Array.isArray(map[browser])) {
				map[browser] = [];
			}
			map[browser].push(Number(version));
			return map;
		}, {});
	browserSupport = Object.entries(browserSupport).map(([browser, versions]) => {
		return [browser, min(versions)];
	});
	browserSupport = fromEntries(browserSupport);
	return browserSupport;
}

export function getNodeEngineVersion(nodeEngineVersion) {
	const parsed = minVersion(nodeEngineVersion);
	return {
		raw: nodeEngineVersion,
		major: parsed.major,
		min: parseFloat(parsed.version)
	};
}

export function createBrowserTargets(browserVersion) {
	const targets = browserslist(browserVersion);

	const rolldownTargets = (() => {
		// Supported ESBuild/Rolldown targets
		const browserMap = {
			edge: 'edge',
			firefox: 'firefox',
			chrome: 'chrome',
			safari: 'safari',
			'ios_saf': 'ios',
			node: 'node',
			ie: 'ie',
			opera: 'opera',
			'and_chr': 'chrome',
			'and_ff': 'firefox',
			'android': 'chrome'
		};
		const targetsMap = /** @type {Record<string, string[]>} */ ({});
		targets.forEach((browser) => {
			let [name, version] = browser.split(' ');

			/*
			 * e.g. 13.4-13.7, take the lower range
			 * all => replace with 1
			 */
			version = version.replace(/-[\d.]+$/, '').replace('all', '1');

			const browserName = browserMap[name];
			if (browserName) {
				targetsMap[browserName] ??= [];
				targetsMap[browserName].push(version);
			}
		});
		const targetsSet = /** @type {string[]} */ ([]);
		Object.entries(targetsMap).forEach(([browser, versions]) => {
			// Only get the oldest version
			targetsSet.push(`${browser}${versions.sort()[0]}`);
		});
		return targetsSet;
	})();

	const lightningCssTargets = (() => {
		// Supported LightningCSS targets
		const browserMap = {
			edge: 'edge',
			firefox: 'firefox',
			chrome: 'chrome',
			safari: 'safari',
			'ios_saf': 'ios_saf',
			ie: 'ie',
			'ie_mob': 'ie',
			opera: 'opera',
			'op_mob': 'opera',
			'samsung': 'samsung',
			'and_chr': 'chrome',
			'and_ff': 'firefox',
			'android': 'android'
		};
		const targetsMap = /** @type {Record<string, string[]>} */ ({});
		targets.forEach((browser) => {
			let [name, version] = browser.split(' ');

			/*
			 * e.g. 13.4-13.7, take the lower range
			 * all => replace with 1
			 */
			version = version.replace(/-[\d.]+$/, '').replace('all', '1');

			const browserName = browserMap[name];
			if (browserName) {
				targetsMap[browserName] ??= [];
				targetsMap[browserName].push(version);
			}
		});
		const targetsSet = /** @type {string[]} */ ([]);
		Object.entries(targetsMap).forEach(([browser, versions]) => {
			// Only get the oldest version
			targetsSet.push(`${browser} ${versions.sort()[0]}`);
		});
		return browserslistToTargets(targetsSet);
	})();

	return {
		rolldown: rolldownTargets,
		lightningCss: lightningCssTargets
	};
}

export function createTsConfigTargets(nodeEngineVersion) {
	if (nodeEngineVersion.min >= 24) {
		// https://github.com/tsconfig/bases/blob/main/bases/node24.json
		return {
			target: 'es2024',
			lib: 'ES2024'
		};
	} else if (nodeEngineVersion.min >= 22) {
		// https://github.com/tsconfig/bases/blob/main/bases/node22.json
		return {
			target: 'es2022',
			lib: 'ES2024'
		};
	} else if (nodeEngineVersion.min >= 20) {
		// https://github.com/tsconfig/bases/blob/main/bases/node20.json
		return {
			target: 'es2022',
			lib: 'ES2023'
		};
	} else if (nodeEngineVersion.min >= 18) {
		// https://github.com/tsconfig/bases/blob/main/bases/node18.json
		return {
			target: 'es2022',
			lib: 'ES2023'
		};
	}
	// https://github.com/tsconfig/bases/blob/main/bases/node12.json
	return {
		target: 'es2019',
		lib: 'ES2019'
	};
}
