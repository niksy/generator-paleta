/** @type {import('lint-staged').Configuration} */
export default {
	'*<% if ( extensionsToProcess.length > 1 ) { %>.{<%- extensionsToProcess.join(',') %>}<% } else { %>.js<% } %>': ['eslint --fix'],<% if (browserModule && styles) { %>
	'*<% if (sassModule) { %>.{css,scss}<% } else { %>.css<% } %>': ['stylelint --fix'],<% } %>
	'*.(md|json|yml)': ['prettier --ignore-path .gitignore --write'],
	'.!(npm<% if (browserModule) { %>|browserslist<% } %>)*rc': [
		'prettier --ignore-path .gitignore --parser json --write'
	]
}
