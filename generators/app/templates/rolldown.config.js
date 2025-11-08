import { defineConfig } from 'rolldown';<% if ( typescript ) { %>
import { dts } from 'rolldown-plugin-dts';

<% } %>export default defineConfig([
	{
		input: 'index.<%= extension || 'js' %>',
		output: {
			cleanDir: true,
			dir: 'dist',
			format: 'esm'<% if ( sourceMaps ) { %>,
			sourcemap: true<% } %>
		},
		external: [/^[^./]/],
		transform: {
			target: <% if ( browserModule ) { %>[<%- rolldownBrowserTargets.map((target) => `'${target}'`).join(', ') %>]<% } else { %>['node<%= nodeEngineVersion.min %>']<% } %>
		}<% if ( typescript ) { %>,
		plugins: [dts(<% if ( sourceMaps ) { %>{ sourcemap: true }<% } %>)]<% } %>
	}<% if ( bundleCjs ) { %>,
	{
		input: null,
		output: {
			dir: 'dist',
			format: 'cjs',
			entryFileNames: '[name].cjs',
			format: 'cjs',
			exports: 'auto'<% if ( sourceMaps ) { %>,
			sourcemap: true<% } %>,
		},
		external: [/^[^./]/],
		transform: {
			target: <% if ( browserModule ) { %>[<%- rolldownBrowserTargets.map((target) => `'${target}'`).join(', ') %>]<% } else { %>['node<%= nodeEngineVersion.min %>']<% } %>
		}
	}<% } %>
]);
