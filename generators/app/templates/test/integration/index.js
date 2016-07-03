<% if ( automatedTests && browserModule && integrationTests ) { %>describe('foo', function() {

	it('bar', function () {

		return browser
			.url('/')
			.getTitle().then(function ( title ) {
				assert.equal(title, 'foobar');
			});

	});

});<% } %>
