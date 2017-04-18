'use strict';

<% if ( automatedTests ) { %><% if ( !sassModule ) { %>const assert = require('assert');
const fn = require('../<% if ( transpile ) { %><% if ( complexTranspile ) { %>src/<% } %>index<% } %>');<% } else { %>const sassTrue = require('sass-true');<% } %>

<% if ( !sassModule ) { %>describe('<%= moduleName %>', function () {

	it('test!', function () {

		// …

	});

});<% } else { %>sassTrue.runSass({
	file: './test/index.scss'
}, describe, it);<% } %><% } %>
