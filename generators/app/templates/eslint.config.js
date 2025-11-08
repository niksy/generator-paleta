import { defineConfig } from 'eslint/config';
import configBase from 'eslint-config-nitpick';<% if ( typescript ) { %>
import configTypescript from 'eslint-config-nitpick/typescript';<% } %><% if ( browserModule ) { %>
import configBrowser from 'eslint-config-nitpick/browser';<% } %><% if ( automatedTests || integrationTests ) { %>
import configTests from 'eslint-config-nitpick/tests';<% } %><% if ( prettier ) { %>
import configPrettier from 'eslint-config-prettier/flat';
import pluginPrettier from 'eslint-plugin-prettier';<% } %><% if ( false ) { %>
import configVue from 'eslint-config-nitpick/vue';<% } %>

export default defineConfig([
	configBase<% if ( typescript ) { %>,
	configTypescript<% } %><% if ( false ) { %>,
	configVue<% } %><% if ( prettier ) { %>,
	configPrettier<% } %><% if ( prettier ) { %>,
	{
		plugins: {<% if ( prettier ) { %>
			prettier: pluginPrettier<% } %>
		}<% if ( prettier ) { %>,
		rules: {
			'prettier/prettier': 1
		}<% } %>
	}<% } %><% if ( browserModule ) { %>,
	{
		files: [<% if ( !sassModule ) { %>'index.<%= extension || 'js' %>', <% } %>'lib/**/*.<%= extension || 'js' %>'<% if ( automatedTests || manualTests || integrationTests ) { %>, 'test/**/*.<%= extension || 'js' %>'<% } %>],
		extends: [configBrowser]<% if ( (manualTests || integrationTests) && !sassModule ) { %>,
		ignores: ['test/**/vite.config.js']<% } %>
	}<% } %><% if ( automatedTests || integrationTests ) { %>,
	{
		files: ['test/**/*'],
		extends: [configTests]<% if ( (automatedTests || manualTests) && browserModule && !sassModule && usesHtmlFixtures ) { %>,
		ignores: [
			'**/fixtures'
		]<% } %>
	}<% } %>
]);
