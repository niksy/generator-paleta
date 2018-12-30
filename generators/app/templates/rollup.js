'use strict';
<% if ( transpile ) { %>
const babel = require('rollup-plugin-babel');<% } %>

module.exports = {
	input: '<% if ( complexTranspile ) { %>src/<% } %>index.js',
	output: [
		{
			file: '<% if ( transpile && !complexTranspile ) { %>dist/<% } %>index.cjs.js',
			format: 'cjs'
		},
		{
			file: '<% if ( transpile && !complexTranspile ) { %>dist/<% } %>index.esm.js',
			format: 'esm'
		}
	]<% if ( transpile ) { %>,
	plugins: [
		babel({
			exclude: 'node_modules/**'
		})
	]<% } %>
};
