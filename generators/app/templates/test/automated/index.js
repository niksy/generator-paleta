<% if ( transpile ) { %>'use strict';

<% } %><% if ( automatedTests && browserModule ) { %><% if ( transpile ) { %>const<% } else { %>var<% } %> assert = require('assert');
<% if ( transpile ) { %>const<% } else { %>var<% } %> fn = require('../<% if ( manualTests || integrationTests ) { %>../<% } %><% if ( transpile ) { %><% if ( complexTranspile ) { %>src/<% } %>index<% } %>');

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
