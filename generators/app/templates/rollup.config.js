'use strict';<% if ( transpile ) { %>

const babel = require('rollup-plugin-babel');<% } %>

module.exports = {
	input: '<% if ( complexTranspile ) { %>src/<% } %>index.js',
	output: [
		{
			file: '<% if ( useDistDirectory ) { %>dist/<% } %>index.cjs.js',
			format: 'cjs'<% if ( sourceMaps ) { %>,
			sourcemap: true<% } %>
		},
		{
			file: '<% if ( useDistDirectory ) { %>dist/<% } %>index.esm.js',
			format: 'esm'<% if ( sourceMaps ) { %>,
			sourcemap: true<% } %>
		}
	]<% if ( transpile ) { %>,
	plugins: [
		babel({
			exclude: 'node_modules/**'
		})
	]<% } %>
};
