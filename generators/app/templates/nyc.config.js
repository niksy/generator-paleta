export default {
	statements: 80,
	lines: 0<% if (!browserModule) { %>,
	reporter: [
		'html'<% if ( codeCoverageService ) { %>,
		'lcov'<% } %>,
		'text'
	]<% if ( transpile && codeCoverage ) { %>,
	sourceMap: false,
	instrument: false<% } %><% } %>
};
