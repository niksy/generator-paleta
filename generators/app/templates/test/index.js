'use strict';

<% if ( automatedTests ) { %><% if ( !sassModule ) { %>var assert = require('assert');
var fn = require('../<% if ( transpile ) { %>index<% } %>');<% } else { %>var sassTrue = require('sass-true');<% } %>

<% if ( !sassModule ) { %>describe('<%= moduleName %>', function () {

	it('test!', function () {

		// …

	});

});<% } else { %>sassTrue.runSass({
	file: './test/index.scss'
}, describe, it);<% } %><% } %>
