<% if ( automatedTests ) { %>var assert = require('assert');<% if ( sassModule ) { %>
var sassTrue = require('sass-true');<% } %>
var fn = require('../');

<% if ( !sassModule ) { %>describe('<%= moduleName %>', function () {

	it('test!', function () {

		// …

	});

});<% } else { %>sassTrue.runSass({
	file: './test/index.scss'
}, describe, it);<% } %><% } %>
