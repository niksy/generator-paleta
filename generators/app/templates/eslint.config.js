<% var files = []; if ( manualTests || integrationTests ) { if ( bundlingTool === 'rollup' ) { files.push("test/manual/rollup.config.js"); } } if ( automatedTests && browserModule && !sassModule ) {
files.push("karma.conf.js"); } if ( integrationTests ) {
files.push("wdio.conf.js"); } if ( transpile && (bundleCjs || (browserModule && !sassModule)) ) {
files.push("rollup.config.js"); } %>import configBase from 'eslint-config-nitpick';<% if ( typescript ) { %>
import configTypescript from 'eslint-config-nitpick/typescript';<% } %><% if ( browserModule ) { %>
import configBrowser from 'eslint-config-nitpick/browser';<% } %><% if ( automatedTests || integrationTests ) { %>
import configTests from 'eslint-config-nitpick/tests';<% } %><% if ( prettier ) { %>
import configPrettier from 'eslint-config-prettier/flat';
import pluginPrettier from 'eslint-plugin-prettier';<% } %><% if ( false ) { %>
import configVue from 'eslint-config-nitpick/vue';<% } %><% if ( browserModule ) { %>
import globals from 'globals';<% } %>

export default [
	configBase<% if ( typescript ) { %>,
	configTypescript<% } %><% if ( browserModule ) { %>,
	configBrowser<% } %><% if ( false ) { %>,
	...configVue<% } %><% if ( prettier ) { %>,
	configPrettier<% } %><% if ( prettier ) { %>,
	{
		plugins: {<% if ( prettier ) { %>
			prettier: pluginPrettier<% } %>
		}<% if ( prettier ) { %>,
		rules: {
			'prettier/prettier': 1
		}<% } %>
	}<% } %><% if ( browserModule || files.length !== 0 ) { %>,
	{
		<% if ( files.length !== 0 ) { %>files: [<% for ( var i = 0, filesLength = files.length; i < filesLength; i++ ) { %>
			"<%= files[i] %>"<% if ( i !== filesLength-1 ) { %>,<% } %><% } %>
		],<% } %>
		languageOptions: {<% if ( browserModule ) { %>
			globals: {
				...globals.node
			},<% } %>
		},
		rules: {
			'no-console': 0
		}
	}<% } %><% if ( automatedTests || integrationTests ) { %>,
	{
		files: ['test/**/*'],
		...configTests<% if ( (automatedTests || manualTests) && browserModule && !sassModule && usesHtmlFixtures ) { %>,
		ignores: [
			'**/fixtures'
		]<% } %>
	}<% } %>
];
