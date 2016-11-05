<% if ( automatedTests && browserModule && integrationTests ) { %>var assert = require('assert');

describe('<%= moduleName %>', function () {

	it('test!', function () {

		return browser
			.url('/')
			.getTitle().then(function ( title ) {
				assert.equal(title, 'test');
			});

	});

});<% } %>
