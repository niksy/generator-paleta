'use strict';

<% if ( automatedTests ) { %><% if ( !sassModule ) { %><% if ( esModules ) { %>import assert from 'assert';<% } else { %>const assert = require('assert');<% } %>
<% if ( esModules ) { %>import fn from '../<% if ( complexTranspile ) { %>src/<% } %>index');<% } else { %>const fn = require('../<% if ( transpile ) { %><% if ( complexTranspile ) { %>src/<% } %>index<% } %>');<% } %><% } else { %><% if ( esModules ) { %>import sassTrue from 'sass-true';<% } else { %>const sassTrue = require('sass-true');<% } %><% } %>

<% if ( !sassModule ) { %>describe('<%= moduleName %>', function () {

	it('test!', function () {

		// …

	});

});<% } else { %>sassTrue.runSass({
	file: './test/index.scss'
}, describe, it);<% } %><% } %>
