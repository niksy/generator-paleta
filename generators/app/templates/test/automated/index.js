<% if ( automatedTests && browserModule ) { %>describe('foo', function () {

	var html = document.getElementsByTagName('html')[0];

	before(function () {
		var fixture = window.__html__['test/automated/fixtures/index.html'];
		document.body.insertAdjacentHTML('beforeend', '<div id="fixture">' + fixture + '</div>');
	});

	after(function () {
		document.body.removeChild(document.getElementById('fixture'));
	});

	it('bar', function () {

		// ...

	});

});<% } %>
