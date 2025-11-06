export default {
	presets: [<% if ( browserModule ) { %>
		['@babel/preset-env', { modules: false }]<% } else { %>
		['@babel/preset-env', {
			modules: false,
			targets: {
				node: '<%= nodeEngineVersion %>'
			}
		}]<% } %><% if ( typescript && typescriptMode === 'full' ) { %>,
		'@babel/preset-typescript'<% } %>
	]<% if ( automatedTests && codeCoverage && !browserModule ) { %>,
	env: {
		test: {
			plugins: [
				'babel-plugin-istanbul'
			]
		}
	}<% } %><% if ( (automatedTests || manualTests) && browserModule && !sassModule ) { %>,
	env: {
		test: {
			presets: [
				['@babel/preset-env', {
					modules: false,
					useBuiltIns: 'usage',
					corejs: 2
				}]
			],
			plugins: [
				['@babel/plugin-transform-runtime', {
					corejs: false,
					helpers: true,
					regenerator: false,
					useESModules: true
				}]
			]
		}
	}<% } %><% if ( integrationTests ) { %>,
	overrides: [
		{
			test: './test/integration',
			presets: [
				['@babel/preset-env', {
					modules: false,
					targets: {
						node: '<%= nodeEngineVersion %>''
					}
				}]
			]
		}
	]<% } %>
}
