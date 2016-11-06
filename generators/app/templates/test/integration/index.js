'use strict';

<% if ( automatedTests && browserModule && integrationTests ) { %>const assert = require('assert');

describe('<%= moduleName %>', function () {

	it('test!', function () {

		return browser
			.url('/')
			.getTitle().then(( title ) => {
				assert.equal(title, 'test');
			});

	});

});<% } %>
