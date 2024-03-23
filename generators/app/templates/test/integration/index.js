<% if ( automatedTests && browserModule && integrationTests ) { %>import assert from 'assert';

it('test!', async function () {

	await browser.url('/');

	const title = await browser.getTitle();

	assert.equal(title, 'test');

});<% } %>
