<% if ( automatedTests ) { %><% if ( !sassModule ) { %>import assert from 'assert';
import fn from '../<% if ( complexTranspile ) { %>src/<% } %>index.js';<% } else { %>import sassTrue from 'sass-true';<% } %>

<% if ( !sassModule ) { %>it('test!', function () {

	// …

});<% } else { %>sassTrue.runSass({
	file: './test/index.scss'
}, describe, it);<% } %><% } %>
