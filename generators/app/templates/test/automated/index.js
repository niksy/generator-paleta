<% if ( transpile ) { %><% } %><% if ( automatedTests && browserModule ) { %>import assert from 'assert';
import fn from '../<% if ( manualTests || integrationTests ) { %>../<% } %><% if ( complexTranspile ) { %>src/<% } %>index.js';<% if ( usesHtmlFixtures ) { %>

before(function () {
	window.fixture.load('/test/<% if ( manualTests || integrationTests ) { %>automated/<% } %>fixtures/index.html');
});

after(function () {
	window.fixture.cleanup();
});<% } %>

it('test!', function () {

	// …

});<% } %>
