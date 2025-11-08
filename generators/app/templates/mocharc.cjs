'use strict';

module.exports = {<% if ( automatedTests && codeCoverage ) { %>
	'node-option': ['experimental-loader=@istanbuljs/esm-loader-hook', 'no-warnings'],<% } %><% if ( transpile || (typescript && typescriptMode === 'full') ) { %>
	require: '@swc-node/register'<% } %><% if ( typescript && typescriptMode === 'full' ) { %>,
	extension: ['ts']<% } %>
};
