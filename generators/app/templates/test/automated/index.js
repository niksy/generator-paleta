'use strict';

<% if ( automatedTests && browserModule ) { %>var assert = require('assert');
var fn = require('../<% if ( manualTests || integrationTests ) { %>../<% } %><% if ( transpile ) { %>index<% } %>');

describe('<%= moduleName %>', function () {

	var html = document.getElementsByTagName('html')[0];

	before(function () {
		var fixture = window.__html__['test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>fixtures/index.html'];
		document.body.insertAdjacentHTML('beforeend', '<div id="fixture">' + fixture + '</div>');
	});

	after(function () {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it('test!', function () {

		// …

	});

});<% } %>
