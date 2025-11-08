export default {
	'*<% if ( typescript && typescriptMode === 'full' ) { %>.{js<% if (typescript && typescriptMode === 'full') { %>,ts<% } %>}<% } else { %>.js<% } %>': ['eslint --fix'],<% if (browserModule && styles) { %>
	'*<% if (sassModule) { %>.{css,scss}<% } else { %>.css<% } %>': ['stylelint --fix'],<% } %>
	'*.(md|json|yml)': ['prettier --ignore-path .gitignore --write'],
	'.!(npm<% if (browserModule) { %>|browserslist<% } %>)*rc': [
		'prettier --ignore-path .gitignore --parser json --write'
	]
}
