<% if ( transpile ) { %><% if ( !esModules ) { %>'use strict';

<% } %><% } %><% if ( automatedTests && browserModule ) { %><% if ( esModules ) { %>import assert from 'assert';<% } else { %><% if ( transpile ) { %>const<% } else { %>var<% } %> assert = require('assert');<% } %>
<% if ( esModules ) { %>import fn from '../<% if ( manualTests || integrationTests ) { %>../<% } %><% if ( complexTranspile ) { %>src/<% } %>index';<% } else { %><% if ( transpile ) { %>const<% } else { %>var<% } %> fn = require('../<% if ( manualTests || integrationTests ) { %>../<% } %><% if ( transpile ) { %><% if ( complexTranspile ) { %>src/<% } %>index<% } %>');<% } %>

describe('<%= moduleName %>', function () {

	before(function () {
		<% if ( transpile ) { %>const<% } else { %>var<% } %> fixture = window.__html__['test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>fixtures/index.html'];
		document.body.insertAdjacentHTML('beforeend', <% if ( transpile ) { %>`<div id="fixture">${fixture}</div>`<% } else { %>'<div id="fixture">' + fixture + '</div>'<% } %>);
	});

	after(function () {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it('test!', function () {

		// …

	});

});<% } %>
