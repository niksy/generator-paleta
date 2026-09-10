<% if ( automatedTests && browserModule && integrationTests ) { %>import assert from 'node:assert/strict';
import { browser, $ } from '@wdio/globals';

it('test!', async function () {

	await browser.url('/');

	const title = await browser.getTitle();

	assert.equal(title, 'test');

});<% } %>
