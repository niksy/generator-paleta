<% if ( transpile ) { %><% if ( !esModules ) { %>'use strict';

<% } %><% } %><% if ( automatedTests && browserModule ) { %><% if ( esModules ) { %>import assert from 'assert';<% } else { %><% if ( transpile ) { %>const<% } else { %>var<% } %> assert = require('assert');<% } %>
<% if ( esModules ) { %>import fn from '../<% if ( manualTests || integrationTests ) { %>../<% } %><% if ( complexTranspile ) { %>src/<% } %>index';<% } else { %><% if ( transpile ) { %>const<% } else { %>var<% } %> fn = require('../<% if ( manualTests || integrationTests ) { %>../<% } %><% if ( transpile ) { %><% if ( complexTranspile ) { %>src/<% } %>index<% } %>');<% } %>

before(function () {
	window.fixture.load('/test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>fixtures/index.html');
});

after(function () {
	window.fixture.cleanup();
});

it('test!', function () {

	// …

});<% } %>
