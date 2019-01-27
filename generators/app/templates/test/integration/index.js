<% if ( !esModules ) { %>'use strict';

<% } %><% if ( automatedTests && browserModule && integrationTests ) { %><% if ( esModules ) { %>import assert from 'assert';<% } else { %>const assert = require('assert');<% } %>

it('test!', function () {

	return browser
		.url('/')
		.getTitle().then(( title ) => {
			assert.equal(title, 'test');
		});

});<% } %>
