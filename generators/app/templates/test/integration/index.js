<% if ( !esModules ) { %>'use strict';

<% } %><% if ( automatedTests && browserModule && integrationTests ) { %><% if ( esModules ) { %>import assert from 'assert';<% } else { %>const assert = require('assert');<% } %>

it('test!', async function () {

	await browser.url('/');

	const title = await browser.getTitle();

	assert.equal(title, 'test');

});<% } %>
