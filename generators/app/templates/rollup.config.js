'use strict';<% if ( transpile ) { %>

const babel = require('rollup-plugin-babel');<% } %>

module.exports = {
	input: '<% if ( complexTranspile ) { %>src/<% } %>index.js',
	output: [
		{
			file: '<% if ( useDistDirectory ) { %>dist/<% } %>index.cjs.js',
			format: 'cjs'
		},
		{
			file: '<% if ( useDistDirectory ) { %>dist/<% } %>index.esm.js',
			format: 'esm'
		}
	]<% if ( transpile ) { %>,
	plugins: [
		babel({
			exclude: 'node_modules/**'
		})
	]<% } %>
};
